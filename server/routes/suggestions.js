const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const OutfitHistory = require("../models/OutfitHistory");
const protect = require("../middleware/auth");

const NEUTRALS = new Set(["black", "white", "grey", "navy", "beige", "brown"]);
const FORMALITY_ORDER = ["casual", "smart-casual", "formal"];
const GOOD_ACCENT_PAIRS = [
  ["red", "blue"],
  ["blue", "yellow"],
  ["green", "yellow"],
  ["purple", "yellow"],
  ["orange", "blue"],
  ["pink", "purple"],
];

// NOTE: these weather values are assumed — verify against your actual
// form field before relying on this. A mismatch here fails silently.
const WEATHER_FABRIC_FIT = {
  hot: { light: 0, medium: -4, heavy: -12 },
  cold: { light: -12, medium: -4, heavy: 0 },
  mild: { light: -2, medium: 0, heavy: -2 },
  rainy: { light: 0, medium: 0, heavy: 0 }, // no rain-specific item data yet — no penalty applied
};

// Labels shown for each categorized slot, in the order they're filled.
const CATEGORY_LABELS = ["Best Match", "Safe Neutral", "Bold Choice"];

// True maximum achievable raw score across all sub-scores, used to
// normalize into a clean 0-100% range instead of clamping (clamping
// silently flattens every strong outfit to the same 100%).
// color(35) + pattern(20) + formality(25) + weather(20) + history(5) = 105
const MAX_RAW_SCORE = 105;

function isGoodPair(a, b) {
  return GOOD_ACCENT_PAIRS.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

function scoreColors(colors) {
  const distinctAccents = new Set(colors.filter((c) => !NEUTRALS.has(c.toLowerCase())));
  const hasNeutral = colors.some((c) => NEUTRALS.has(c.toLowerCase()));

  if (distinctAccents.size === 0) {
    return { score: 30, reason: "Classic, versatile neutral color palette" };
  }
  if (distinctAccents.size === 1) {
    if (hasNeutral) {
      return { score: 35, reason: "Balanced neutral base with a single pop accent color" };
    }
    return { score: 28, reason: "Monochromatic accent palette" };
  }

  const accentArr = [...distinctAccents];
  const allPairsGood = accentArr.every((c1, i) =>
    accentArr.slice(i + 1).every((c2) => isGoodPair(c1.toLowerCase(), c2.toLowerCase()))
  );
  if (allPairsGood) {
    return { score: 30, reason: "Harmonious accent colors pairing well together" };
  }
  return { score: 15, reason: "Multiple accent colors that may compete for attention" };
}

function scorePatterns(items) {
  const patterned = items.filter((i) => i.pattern && i.pattern.toLowerCase() !== "solid");
  if (patterned.length === 0) {
    return { score: 20, reason: null }; // all solid - clean & cohesive
  }
  if (patterned.length === 1) {
    return { score: 20, reason: "Solid pieces paired with one statement patterned item" };
  }

  const allNeutralPatterned = patterned.every((i) => NEUTRALS.has(i.color.toLowerCase()));
  if (allNeutralPatterned) {
    return { score: 15, reason: "Subtle pattern mix in neutral tones" };
  }
  return { score: 8, reason: "Multiple bold patterns competing with each other" };
}

function scoreFormality(formalities) {
  const indices = formalities.map((f) => FORMALITY_ORDER.indexOf(f.toLowerCase()));
  const validIndices = indices.filter(idx => idx !== -1);
  if (validIndices.length === 0) return { score: 20, reason: null };

  const diff = Math.max(...validIndices) - Math.min(...validIndices);
  if (diff === 0) {
    return { score: 25, reason: "Perfect formality matching across all pieces" };
  }
  if (diff === 1) {
    return { score: 18, reason: "Slight formality transition between pieces" };
  }
  return { score: 8, reason: "Noticeable contrast between casual and formal elements" };
}

function scoreWeather(items, weather) {
  const fitTable = WEATHER_FABRIC_FIT[weather];
  if (!fitTable) {
    return { score: 20, reason: null };
  }

  let penalty = 0;
  let worstPenalty = 0;
  for (const item of items) {
    const itemPenalty = fitTable[item.fabricWeight] || 0;
    penalty += itemPenalty;
    if (itemPenalty < worstPenalty) worstPenalty = itemPenalty;
  }

  const score = Math.max(5, 20 + penalty);
  const reason = worstPenalty <= -8 ? `Fabric weight not ideal for ${weather} weather` : null;
  return { score, reason };
}

function scoreHistoryPenalty(items, recentWornItemIds) {
  if (!recentWornItemIds || recentWornItemIds.size === 0) {
    return { score: 5, reason: null };
  }

  const hasRecentItem = items.some((item) => recentWornItemIds.has(item._id.toString()));
  if (hasRecentItem) {
    return {
      score: -5,
      reason: "Includes items worn in the last 7 days — score adjusted for outfit variety",
    };
  }

  return { score: 5, reason: "Fresh combination (no items worn in the last 7 days)" };
}

function scoreCombo(combo, weather, recentWornItemIds) {
  const items = Object.values(combo);

  const color = scoreColors(items.map((i) => i.color || ""));
  const pattern = scorePatterns(items);
  const formality = scoreFormality(items.map((i) => i.formality || "casual"));
  const weatherResult = scoreWeather(items, weather);
  const historyResult = scoreHistoryPenalty(items, recentWornItemIds);

  const rawScore =
    color.score +
    pattern.score +
    formality.score +
    weatherResult.score +
    historyResult.score;

  // Normalize against the true achievable maximum instead of clamping,
  // so distinct strong outfits don't all flatten to the same 100%.
  const normalizedScore = (rawScore / MAX_RAW_SCORE) * 100;
  const finalScore = Math.max(0, Math.min(100, Math.round(normalizedScore)));

  const explanation = [
    color.reason,
    pattern.reason,
    formality.reason,
    weatherResult.reason,
    historyResult.reason,
  ].filter((r) => r !== null);

  return { score: finalScore, explanation };
}

function cartesian(arraysWithLabels) {
  return arraysWithLabels.reduce(
    (acc, { label, items }) => {
      const next = [];
      for (const combo of acc) {
        for (const item of items) {
          next.push({ ...combo, [label]: item });
        }
      }
      return next;
    },
    [{}]
  );
}

function getMissingMessages(buckets) {
  const messages = [];
  const hasDress = buckets.dress.length > 0;
  const hasTop = buckets.top.length > 0;
  const hasBottom = buckets.bottom.length > 0;
  const hasShoes = buckets.shoes.length > 0;

  if (!hasDress && !hasTop) {
    messages.push("You don't have any tops logged yet — add some for more outfit options.");
  }
  if (!hasDress && !hasBottom) {
    messages.push("You don't have any bottoms logged yet — add some for more outfit options.");
  }
  if (!hasShoes) {
    messages.push("You don't have any shoes logged yet — add some to complete this look.");
  }
  return messages;
}

// --- 5h additions below ---

// Stable identity for a combo, built from the underlying item ids —
// used to detect when two categories would pick the same outfit.
function comboKey(combo) {
  return Object.keys(combo)
    .sort()
    .map((label) => `${label}:${combo[label]._id}`)
    .join("|");
}

function isAllNeutral(items) {
  return items.every((item) => NEUTRALS.has(item.color));
}

function hasAccentOrPattern(items) {
  return items.some((item) => !NEUTRALS.has(item.color) || item.pattern !== "solid");
}

// scoredAll must already be sorted by score, descending.
// Returns { categorized, remaining } — categorized is up to 3 labeled
// picks (Best Match / Safe Neutral / Bold Choice), remaining is
// everything else still sorted by score for "load more".
function pickCategorizedSuggestions(scoredAll) {
  const chosenKeys = new Set();
  const chosen = [];

  function takeNextMatching(predicate) {
    return scoredAll.find((entry) => !chosenKeys.has(entry.key) && predicate(entry));
  }

  function takeNextAny() {
    return scoredAll.find((entry) => !chosenKeys.has(entry.key));
  }

  function claim(entry) {
    if (!entry) return;
    chosenKeys.add(entry.key);
    chosen.push(entry);
  }

  // Best Match — highest score, no restriction.
  claim(takeNextAny());

  // Safe Neutral — falls back to next-best overall if no all-neutral
  // outfit exists in the wardrobe, so the slot is never just empty.
  claim(takeNextMatching((e) => isAllNeutral(Object.values(e.outfit))) || takeNextAny());

  // Bold Choice — same fallback behavior.
  claim(takeNextMatching((e) => hasAccentOrPattern(Object.values(e.outfit))) || takeNextAny());

  const categorized = chosen.map((entry, i) => ({
    category: CATEGORY_LABELS[i],
    outfit: entry.outfit,
    score: entry.score,
    explanation: entry.explanation,
  }));

  const remaining = scoredAll
    .filter((entry) => !chosenKeys.has(entry.key))
    .map(({ outfit, score, explanation }) => ({ outfit, score, explanation }));

  return { categorized, remaining };
}

router.post("/", protect, async (req, res) => {
  try {
    const { occasion, weather, timeOfDay } = req.body;

    const allItems = await Item.find({ userId: req.userId });
    const matching = allItems.filter((item) => item.occasion === occasion);

    const buckets = {
      top: matching.filter((item) => item.category === "top"),
      bottom: matching.filter((item) => item.category === "bottom"),
      dress: matching.filter((item) => item.category === "dress"),
      shoes: matching.filter((item) => item.category === "shoes"),
      accessory: matching.filter((item) => item.category === "accessory"),
    };

    const dressAvailable = buckets.dress.length > 0;
    const topAvailable = buckets.top.length > 0;
    const bottomAvailable = buckets.bottom.length > 0;
    const shoesAvailable = buckets.shoes.length > 0;
    const accessoryAvailable = buckets.accessory.length > 0;

    let combos = [];

    if (dressAvailable) {
      const arrays = [{ label: "dress", items: buckets.dress }];
      if (shoesAvailable) arrays.push({ label: "shoes", items: buckets.shoes });
      if (accessoryAvailable) arrays.push({ label: "accessory", items: buckets.accessory });
      combos = combos.concat(cartesian(arrays));
    }

    if (topAvailable || bottomAvailable) {
      const arrays = [];
      if (topAvailable) arrays.push({ label: "top", items: buckets.top });
      if (bottomAvailable) arrays.push({ label: "bottom", items: buckets.bottom });
      if (shoesAvailable) arrays.push({ label: "shoes", items: buckets.shoes });
      if (accessoryAvailable) arrays.push({ label: "accessory", items: buckets.accessory });
      combos = combos.concat(cartesian(arrays));
    }

    if (combos.length === 0) {
      return res.status(404).json({ message: "No matching items found for this occasion" });
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentHistory = await OutfitHistory.find({
      userId: req.userId,
      wornAt: { $gte: sevenDaysAgo },
    });

    const recentWornItemIds = new Set();
    recentHistory.forEach((record) => {
      record.itemIds.forEach((itemId) => {
        if (itemId) recentWornItemIds.add(itemId.toString());
      });
    });

    const scoredAll = combos
      .map((combo) => {
        const { score, explanation } = scoreCombo(combo, weather, recentWornItemIds);
        return { key: comboKey(combo), outfit: combo, score, explanation };
      })
      .sort((a, b) => b.score - a.score);

    const { categorized, remaining } = pickCategorizedSuggestions(scoredAll);

    res.json({
      occasion,
      weather,
      timeOfDay,
      suggestions: categorized,
      moreSuggestions: remaining,
      messages: getMissingMessages(buckets),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;