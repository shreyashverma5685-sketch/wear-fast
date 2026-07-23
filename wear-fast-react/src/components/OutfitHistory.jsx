import { useState, useEffect } from "react";

function OutfitHistory() {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // 'all' | '7days'

  const token = localStorage.getItem("wf_token");

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch("http://localhost:5000/history", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Failed to load history");
        } else {
          setHistoryList(data);
        }
      } catch (err) {
        console.error("Fetch history failed:", err);
        setError("Could not connect to the server");
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [token]);

  const filteredHistory = historyList.filter((entry) => {
    if (filter === "7days") {
      const entryTime = new Date(entry.wornAt).getTime();
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return entryTime >= sevenDaysAgo;
    }
    return true;
  });

  return (
    <div className="suggestions-page">
      <div className="history-header">
        <h2>Outfit History</h2>
        <p className="tagline">Your logged looks and style memory</p>
      </div>

      <div className="filter-bar">
        <button
          className={`filter-pill ${filter === "all" ? "filter-pill--active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All History ({historyList.length})
        </button>
        <button
          className={`filter-pill ${filter === "7days" ? "filter-pill--active" : ""}`}
          onClick={() => setFilter("7days")}
        >
          Last 7 Days
        </button>
      </div>

      {loading && <p>Loading your outfit history...</p>}
      {error && <p className="suggestions-error">{error}</p>}

      {!loading && !error && filteredHistory.length === 0 && (
        <p className="tagline">
          {filter === "7days"
            ? "No outfits logged in the last 7 days."
            : "No outfits logged yet! Click 'I Wore This Today' on any suggestion to start building history."}
        </p>
      )}

      <div className="outfit-results">
        {filteredHistory.map((entry) => {
          const formattedDate = new Date(entry.wornAt).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div key={entry._id} className="history-card">
              <div className="history-card__meta">
                <span className="history-card__date">{formattedDate}</span>
                <span className="history-card__category">{entry.category}</span>
              </div>
              <div className="outfit-result__grid">
                {entry.itemIds &&
                  entry.itemIds.map((item) => {
                    if (!item) return null;
                    return (
                      <div key={item._id} className="outfit-result__item">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="outfit-result__image" />
                        )}
                        <p className="outfit-result__slot">{item.category}</p>
                        <p>{item.name}</p>
                        <p>{item.color} · {item.pattern}</p>
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OutfitHistory;
