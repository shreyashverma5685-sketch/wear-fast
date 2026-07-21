const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
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

function isGoodPair(a, b) {
  return GOOD_ACCENT_PAIRS.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

function scoreColors(colors) {
  const distinctAccents = new Set(colors.filter((c) => !NEUTRALS.has(c)));
  const hasNeutral = colors.some((c) => NEUTRALS.has(c));

  if (distinctAccents.size === 0) {
    return { score: 7, reason: null }; // all neutral — safe, a bit plain
  }
  if (distinctAccents.size === 1) {
    if (hasNeutral) {
      return { score: 10, reason: "Balanced neutral tones with a single accent color" };
    }
    return { score: 6, reason: null }; // monochrome accent — fine, unremarkable
  }

  const accentArr = [...distinctAccents];
  const allPairsGood = accentArr.every((c1, i) =>
    accentArr.slice(i + 1).every((c2) => isGoodPair(c1, c2))
  );
  if (allPairsGood) {
    return { score: 7, reason: null };
  }
  return { score: 2, reason: "Multiple accent colors that don't pair well together" };
}

function scorePatterns(items) {
  const patterned = items.filter((i) => i.pattern !== "solid");
  if (patterned.length === 0) {
    return { score: 0, reason: null }; // all solid, color rules alone govern
  }
  if (patterned.length === 1) {
    return { score: 1, reason: "Solid pieces paired with one patterned item — a classic combo" };
  }

  const allNeutralPatterned = patterned.every((i) => NEUTRALS.has(i.color));
  if (allNeutralPatterned) {
    return { score: -1, reason: null }; // minor, not worth flagging
  }
  return { score: -5, reason: "Multiple bold patterns competing with each other" };
}

function scoreFormality(formalities) {
  const indices = formalities.map((f) => FORMALITY_ORDER.indexOf(f));
  const diff = Math.max(...indices) - Math.min(...indices);
  if (diff === 0) {
    return { score: 0, reason: null };
  }
  if (diff === 1) {
    return { score: -6, reason: "Slight formality mismatch between pieces" };
  }
  return { score: -14, reason: "Casual and formal pieces mixed together" };
}

function scoreWeather(items, weather) {
  const fitTable = WEATHER_FABRIC_FIT[weather];
  if (!fitTable) {
    return { score: 0, reason: null }; // unrecognized/missing weather value — don't guess
  }

  let total = 0;
  let worstPenalty = 0;
  for (const item of items) {
    const penalty = fitTable[item.fabricWeight];
    if (typeof penalty === "number") {
      total += penalty;
      if (penalty < worstPenalty) worstPenalty = penalty;
    }
  }

  const reason = worstPenalty <= -8 ? `Fabric weight not ideal for ${weather} weather` : null;
  return { score: total, reason };
}

function scoreCombo(combo, weather) {
  const items = Object.values(combo);

  const color = scoreColors(items.map((i) => i.color));
  const pattern = scorePatterns(items);
  const formality = scoreFormality(items.map((i) => i.formality));
  const weatherResult = scoreWeather(items, weather);

  const totalScore = color.score + pattern.score + formality.score + weatherResult.score;
  const explanation = [color.reason, pattern.reason, formality.reason, weatherResult.reason].filter(
    (r) => r !== null
  );

  return { score: totalScore, explanation };
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

    const scored = combos
      .map((combo) => {
        const { score, explanation } = scoreCombo(combo, weather);
        return { outfit: combo, score, explanation };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    res.json({
      occasion,
      weather,
      timeOfDay,
      suggestions: scored,
      messages: getMissingMessages(buckets),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
