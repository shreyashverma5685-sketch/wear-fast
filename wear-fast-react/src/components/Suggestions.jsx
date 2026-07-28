import { useState, useEffect } from "react";

const CATEGORY_STYLES = {
  "Best Match": { text: "text-denim", bg: "bg-denim", border: "border-denim/30" },
  "Safe Neutral": { text: "text-olive", bg: "bg-olive", border: "border-olive/30" },
  "Bold Choice": { text: "text-brick", bg: "bg-brick", border: "border-brick/30" },
};
const DEFAULT_STYLE = { text: "text-ink", bg: "bg-ink", border: "border-linen-border" };

function Suggestions() {
  const [occasion, setOccasion] = useState(() => sessionStorage.getItem("wf_quick_occ") || sessionStorage.getItem("wf_sug_occ") || "casual");
  const [weather, setWeather] = useState(() => sessionStorage.getItem("wf_quick_weath") || sessionStorage.getItem("wf_sug_weath") || "hot");
  const [timeOfDay, setTimeOfDay] = useState(() => sessionStorage.getItem("wf_sug_time") || "day");

  const [suggestions, setSuggestions] = useState(() => {
    const saved = sessionStorage.getItem("wf_suggestions");
    return saved ? JSON.parse(saved) : null;
  });
  const [moreSuggestions, setMoreSuggestions] = useState(() => {
    const saved = sessionStorage.getItem("wf_more_suggestions");
    return saved ? JSON.parse(saved) : [];
  });
  const [showMore, setShowMore] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem("wf_sug_messages");
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [wornMap, setWornMap] = useState(() => {
    const saved = sessionStorage.getItem("wf_worn_map");
    return saved ? JSON.parse(saved) : {};
  });
  const [actionLoading, setActionLoading] = useState({});

  const token = localStorage.getItem("wf_token");

  // Save state changes to sessionStorage for tab persistence (Task B)
  useEffect(() => {
    sessionStorage.setItem("wf_sug_occ", occasion);
    sessionStorage.setItem("wf_sug_weath", weather);
    sessionStorage.setItem("wf_sug_time", timeOfDay);
    if (suggestions) {
      sessionStorage.setItem("wf_suggestions", JSON.stringify(suggestions));
    }
    sessionStorage.setItem("wf_more_suggestions", JSON.stringify(moreSuggestions));
    sessionStorage.setItem("wf_sug_messages", JSON.stringify(messages));
    sessionStorage.setItem("wf_worn_map", JSON.stringify(wornMap));
  }, [occasion, weather, timeOfDay, suggestions, moreSuggestions, messages, wornMap]);

  // Sync wornMap with active history records on mount so deleted history items reset immediately
  useEffect(() => {
    if (!token) return;
    async function syncWornMapWithHistory() {
      try {
        const res = await fetch("http://localhost:5000/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const historyData = await res.json();
          const freshWornMap = {};
          historyData.forEach((rec) => {
            if (rec.itemIds && Array.isArray(rec.itemIds)) {
              const key = rec.itemIds
                .map((item) => (typeof item === "object" && item !== null ? item._id : item))
                .filter(Boolean)
                .sort()
                .join("-");
              if (key) {
                freshWornMap[key] = rec._id;
              }
            }
          });
          setWornMap(freshWornMap);
          sessionStorage.setItem("wf_worn_map", JSON.stringify(freshWornMap));
        }
      } catch (e) {
        console.error("Failed to sync worn history map:", e);
      }
    }

    syncWornMapWithHistory();
  }, [token]);

  // Handle auto-fetching if launched from Home page Quick Generator
  useEffect(() => {
    const quickOcc = sessionStorage.getItem("wf_quick_occ");
    const quickWeath = sessionStorage.getItem("wf_quick_weath");
    if (quickOcc && quickWeath && token && !suggestions) {
      sessionStorage.removeItem("wf_quick_occ");
      sessionStorage.removeItem("wf_quick_weath");
      fetchSuggestions(quickOcc, quickWeath, timeOfDay);
    }
  }, [token]);

  async function fetchSuggestions(occ, weath, time) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:5000/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ occasion: occ || occasion, weather: weath || weather, timeOfDay: time || timeOfDay }),
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong fetching suggestions.");
        return;
      }

      setSuggestions(data.suggestions);
      setMoreSuggestions(data.moreSuggestions || []);
      setMessages(data.messages || []);
    } catch (err) {
      console.error("Suggestions fetch failed:", err);
      setError("Could not connect to the server. Please verify backend is running.");
    } finally {
      setLoading(false);
    }
  }

  // Toggle Mark Worn / Undo Worn (Task A)
  async function handleToggleWorn(outfit, category, outfitKey) {
    const isCurrentlyWorn = wornMap[outfitKey];
    const itemIds = Object.values(outfit).map((item) => item._id);

    setActionLoading((prev) => ({ ...prev, [outfitKey]: true }));

    try {
      if (isCurrentlyWorn) {
        // Undo: call backend /history/undo endpoint
        const res = await fetch("http://localhost:5000/history/undo", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ itemIds }),
        });

        if (res.ok) {
          setWornMap((prev) => {
            const next = { ...prev };
            delete next[outfitKey];
            return next;
          });
        } else {
          const data = await res.json();
          alert(data.message || "Failed to undo history entry");
        }
      } else {
        // Mark worn: call POST /history. category falls back to
        // "Suggestion" (not "Best Match") since Load More cards pass
        // category = null and aren't actually Best Match picks.
        const res = await fetch("http://localhost:5000/history", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ itemIds, category: category || "Suggestion" }),
        });

        if (res.ok) {
          setWornMap((prev) => ({ ...prev, [outfitKey]: true }));
        } else {
          const data = await res.json();
          alert(data.message || "Failed to log outfit history");
        }
      }
    } catch (err) {
      console.error("Worn toggle failed:", err);
      alert("Could not reach server to update outfit history");
    } finally {
      setActionLoading((prev) => ({ ...prev, [outfitKey]: false }));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    fetchSuggestions(occasion, weather, timeOfDay);
  }

  // Score badge now uses the outfit's own category color instead of
  // deriving a separate color from the score value — keeps the
  // category-color language (denim/olive/brick) consistent everywhere.
  function getScoreBadge(score, style) {
    return (
      <span className={`font-mono-tag text-xs font-bold px-2.5 py-1 rounded-md ${style.bg} text-linen-card shadow-sm inline-flex items-center gap-1`}>
        <span>{score}%</span>
        <span className="text-[10px] opacity-80 font-normal">Match</span>
      </span>
    );
  }

  function renderOutfitCard({ outfit, score, explanation }, key, category) {
    const itemIdsKey = Object.values(outfit)
      .map((i) => i._id)
      .sort()
      .join("-");
    const isWorn = Boolean(wornMap[itemIdsKey]);
    const isLoadingAction = Boolean(actionLoading[itemIdsKey]);
    const style = CATEGORY_STYLES[category] || DEFAULT_STYLE;

    return (
      <div key={key} className="bg-linen-card border border-linen-border rounded-xl p-5 card-shadow space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-linen-border/60">
          <div className="flex items-center gap-3">
            <h3 className={`font-display text-lg font-bold tracking-wide uppercase ${style.text}`}>
              {category ? category : "Alternative Match"}
            </h3>
            {getScoreBadge(score, style)}
          </div>

          <button
            type="button"
            disabled={isLoadingAction}
            onClick={() => handleToggleWorn(outfit, category, itemIdsKey)}
            className={`font-display text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
              isWorn
                ? "bg-olive text-linen-card hover:bg-brick hover:text-white"
                : "border border-linen-border text-muted hover:border-denim hover:text-denim hover:bg-denim/5"
            }`}
            title={isWorn ? "Click to undo worn history" : "Click to mark worn today"}
          >
            {isLoadingAction ? (
              <span>Updating...</span>
            ) : isWorn ? (
              <>
                <span>Worn Today ✓</span>
                <span className="text-[10px] opacity-75 font-normal">(Click to Undo)</span>
              </>
            ) : (
              <>
                <span>I Wore This Today</span>
              </>
            )}
          </button>
        </div>

        {explanation && explanation.length > 0 && (
          <div className="bg-linen/60 border border-linen-border/60 rounded-lg p-3">
            <ul className="stylist-note text-xs sm:text-sm text-ink space-y-1">
              {explanation.map((line, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-denim font-bold">•</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Item row — flex instead of grid so pieces always share one
            row regardless of count or screen width, never wrapping */}
        <div className="flex gap-3">
          {Object.entries(outfit).map(([slot, item]) => (
            <div key={item._id} className="flex-1 min-w-0 bg-linen border border-linen-border rounded-lg p-2.5 flex flex-col justify-between space-y-2 card-hover">
              <div className="relative w-full aspect-square bg-linen-card rounded-md overflow-hidden flex items-center justify-center border border-linen-border/40">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-muted flex flex-col items-center justify-center p-2 text-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M20.38 3.46 16 2a4 4 0 0 0-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
                    </svg>
                    <span className="font-mono-tag text-[9px] uppercase mt-1">{slot}</span>
                  </div>
                )}
                <span className="absolute top-1 left-1 font-mono-tag text-[9px] uppercase tracking-wider bg-ink/80 text-linen-card px-1.5 py-0.5 rounded">
                  {slot}
                </span>
              </div>

              <div>
                <p className="font-display text-sm font-semibold text-ink truncate leading-tight">{item.name}</p>
                <div className="flex flex-wrap items-center gap-1 mt-1">
                  <span className="font-mono-tag text-[9px] text-muted uppercase bg-linen-card px-1.5 py-0.5 rounded border border-linen-border/60">
                    {item.color}
                  </span>
                  {item.pattern && item.pattern !== "solid" && (
                    <span className="font-mono-tag text-[9px] text-brick uppercase bg-brick/10 px-1.5 py-0.5 rounded">
                      {item.pattern}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-linen-border pb-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ink tracking-tight">Outfit Generator</h1>
          <p className="font-sans text-xs text-muted">Get outfit combinations scored 0-100% based on color, pattern, weather & occasion</p>
        </div>
      </div>

      {/* Generator Form */}
      <form onSubmit={handleSubmit} className="bg-linen-card border border-linen-border rounded-xl p-5 card-shadow">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="font-mono-tag text-[10px] uppercase text-muted block mb-1.5">Occasion</label>
            <select
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className="w-full font-sans text-sm border border-linen-border rounded-lg px-3 py-2.5 bg-linen text-ink focus:outline-none focus:border-denim"
            >
              <option value="casual">Casual Outing</option>
              <option value="formal">Formal / Meeting</option>
              <option value="party">Party / Event</option>
              <option value="work">Workplace</option>
              <option value="sport">Sport / Fitness</option>
            </select>
          </div>

          <div>
            <label className="font-mono-tag text-[10px] uppercase text-muted block mb-1.5">Weather</label>
            <select
              value={weather}
              onChange={(e) => setWeather(e.target.value)}
              className="w-full font-sans text-sm border border-linen-border rounded-lg px-3 py-2.5 bg-linen text-ink focus:outline-none focus:border-denim"
            >
              <option value="hot">Sunny & Hot ☀️</option>
              <option value="cold">Cool & Cold ❄️</option>
              <option value="rainy">Rainy / Overcast 🌧️</option>
            </select>
          </div>

          <div>
            <label className="font-mono-tag text-[10px] uppercase text-muted block mb-1.5">Time of Day</label>
            <select
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value)}
              className="w-full font-sans text-sm border border-linen-border rounded-lg px-3 py-2.5 bg-linen text-ink focus:outline-none focus:border-denim"
            >
              <option value="day">Daytime ☀️</option>
              <option value="night">Nighttime 🌙</option>
            </select>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-denim hover:bg-denim-light text-linen-card font-display text-sm font-semibold uppercase tracking-wider py-2.5 rounded-lg shadow-sm transition-all disabled:opacity-60"
            >
              {loading ? "Calculating..." : "Find Outfits →"}
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="p-4 rounded-xl bg-brick/10 border border-brick/30 text-brick text-sm font-medium">
          {error}
        </div>
      )}

      {messages.length > 0 && (
        <div className="bg-linen-card border border-linen-border rounded-xl p-4 space-y-1">
          <span className="font-mono-tag text-[10px] text-muted uppercase font-bold">Wardrobe Tips:</span>
          {messages.map((msg, i) => (
            <p key={i} className="font-sans text-xs text-muted flex items-center gap-1.5">
              <span>💡</span>
              <span>{msg}</span>
            </p>
          ))}
        </div>
      )}

      {/* Categorized Outfit Cards */}
      {suggestions && suggestions.length > 0 ? (
        <div className="space-y-6">
          {suggestions.map((entry, i) => renderOutfitCard(entry, i, entry.category))}
        </div>
      ) : (
        !loading && !error && (
          <div className="bg-linen-card border border-linen-border rounded-xl p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-denim/10 text-denim flex items-center justify-center mx-auto">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.38 3.46 16 2a4 4 0 0 0-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
              </svg>
            </div>
            <h3 className="font-display text-xl font-bold text-ink">Ready to Find Your Outfit</h3>
            <p className="font-sans text-xs text-muted max-w-md mx-auto">
              Select your context above and click <strong>Find Outfits</strong> to calculate high-score combinations from your wardrobe.
            </p>
          </div>
        )
      )}

      {/* More Suggestions */}
      {moreSuggestions.length > 0 && (
        <div className="pt-4 border-t border-linen-border">
          <button
            type="button"
            onClick={() => setShowMore((prev) => !prev)}
            className="w-full bg-linen-card hover:bg-linen-border/30 border border-linen-border py-3 px-4 rounded-xl font-display text-xs uppercase tracking-wider text-denim font-bold transition-all flex items-center justify-center gap-2"
          >
            <span>{showMore ? "Hide Additional Options" : `Load ${moreSuggestions.length} More Outfit Combos`}</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`transform transition-transform ${showMore ? "rotate-180" : ""}`}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {showMore && (
            <div className="space-y-6 mt-6">
              {moreSuggestions.map((entry, i) => renderOutfitCard(entry, `more-${i}`, null))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Suggestions;