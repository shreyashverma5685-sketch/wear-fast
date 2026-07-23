import { useState } from "react";

function Suggestions() {
  const [occasion, setOccasion] = useState("casual");
  const [weather, setWeather] = useState("hot");
  const [timeOfDay, setTimeOfDay] = useState("day");

  const [suggestions, setSuggestions] = useState(null);
  const [moreSuggestions, setMoreSuggestions] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [wornMap, setWornMap] = useState({});

  const token = localStorage.getItem("wf_token");

  async function handleMarkWorn(outfit, category, outfitKey) {
    if (wornMap[outfitKey]) return;

    const itemIds = Object.values(outfit).map((item) => item._id);

    try {
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
    } catch (err) {
      console.error("Mark worn failed:", err);
      alert("Could not reach server to save outfit history");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuggestions(null);
    setMoreSuggestions([]);
    setShowMore(false);
    setMessages([]);

    try {
      const res = await fetch("http://localhost:5000/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ occasion, weather, timeOfDay }),
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong");
        return;
      }

      setSuggestions(data.suggestions);
      setMoreSuggestions(data.moreSuggestions || []);
      setMessages(data.messages || []);
    } catch (err) {
      console.error("Suggestions fetch failed:", err);
      setError("Could not reach the server");
    } finally {
      setLoading(false);
    }
  }

  function renderOutfitCard({ outfit, score, explanation }, key, category) {
    const itemIdsKey = Object.values(outfit)
      .map((i) => i._id)
      .sort()
      .join("-");
    const isWorn = wornMap[itemIdsKey];

    return (
      <div key={key} className="outfit-result">
        <div className="outfit-result__header">
          <h3>
            {category ? category : "More like this"}{" "}
            <span className="outfit-result__score">score: {score}</span>
          </h3>
          <button
            type="button"
            className={`outfit-result__worn-btn ${isWorn ? "worn" : ""}`}
            disabled={isWorn}
            onClick={() => handleMarkWorn(outfit, category, itemIdsKey)}
          >
            {isWorn ? "Worn Today ✓" : "I Wore This Today"}
          </button>
        </div>
        {explanation && explanation.length > 0 && (
          <ul className="outfit-result__explanation">
            {explanation.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        )}
        <div className="outfit-result__grid">
          {Object.entries(outfit).map(([slot, item]) => (
            <div key={item._id} className="outfit-result__item">
              {item.image && (
                <img src={item.image} alt={item.name} className="outfit-result__image" />
              )}
              <p className="outfit-result__slot">{slot}</p>
              <p>{item.name}</p>
              <p>{item.color} · {item.pattern}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="suggestions-page">
      <h2>Get an Outfit Suggestion</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Occasion
          <select value={occasion} onChange={(e) => setOccasion(e.target.value)}>
            <option value="casual">Casual</option>
            <option value="formal">Formal</option>
            <option value="party">Party</option>
            <option value="work">Work</option>
            <option value="sport">Sport</option>
          </select>
        </label>

        <label>
          Weather
          <select value={weather} onChange={(e) => setWeather(e.target.value)}>
            <option value="hot">Hot</option>
            <option value="cold">Cold</option>
            <option value="rainy">Rainy</option>
          </select>
        </label>

        <label>
          Time of Day
          <select value={timeOfDay} onChange={(e) => setTimeOfDay(e.target.value)}>
            <option value="day">Day</option>
            <option value="night">Night</option>
          </select>
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Finding an outfit..." : "Get Suggestion"}
        </button>
      </form>

      {error && <p className="suggestions-error">{error}</p>}

      {messages.length > 0 && (
        <div className="suggestions-messages">
          {messages.map((msg, i) => (
            <p key={i} className="suggestions-message">{msg}</p>
          ))}
        </div>
      )}

      {suggestions && suggestions.length > 0 && (
        <div className="outfit-results">
          {suggestions.map((entry, i) => renderOutfitCard(entry, i, entry.category))}
        </div>
      )}

      {moreSuggestions.length > 0 && (
        <div className="outfit-results__more">
          <button type="button" onClick={() => setShowMore((prev) => !prev)}>
            {showMore ? "Hide more options" : `Load more (${moreSuggestions.length})`}
          </button>

          {showMore && (
            <div className="outfit-results">
              {moreSuggestions.map((entry, i) => renderOutfitCard(entry, `more-${i}`, null))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Suggestions;