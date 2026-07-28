import { useState, useEffect } from "react";

const CATEGORY_STYLES = {
  "Best Match": { text: "text-denim", bg: "bg-denim" },
  "Safe Neutral": { text: "text-olive", bg: "bg-olive" },
  "Bold Choice": { text: "text-brick", bg: "bg-brick" },
};
const DEFAULT_STYLE = { text: "text-ink", bg: "bg-ink" };

function OutfitHistory() {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [deletingId, setDeletingId] = useState(null);

  const token = localStorage.getItem("wf_token");

  const fetchHistory = async () => {
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
  };

  useEffect(() => {
    fetchHistory();
  }, [token]);

  const handleDeleteEntry = async (id) => {
    if (!window.confirm("Are you sure you want to remove this outfit from your history?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`http://localhost:5000/history/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setHistoryList((prev) => prev.filter((item) => item._id !== id));
        sessionStorage.removeItem("wf_worn_map");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete history record");
      }
    } catch (e) {
      console.error("Delete history error:", e);
      alert("Error connecting to server to delete record");
    } finally {
      setDeletingId(null);
    }
  };

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const filteredHistory = historyList.filter((entry) => {
    if (filter === "7days") {
      const entryTime = new Date(entry.wornAt).getTime();
      return entryTime >= sevenDaysAgo;
    }
    return true;
  });

  return (
    <div className="w-full space-y-6 py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-linen-border pb-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ink tracking-tight">Outfit History</h1>
          <p className="font-sans text-xs text-muted">Track logged daily worn outfits and maintain your style rotation</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`font-display text-xs font-semibold uppercase tracking-wider px-3.5 py-2 rounded-lg transition-all ${
              filter === "all"
                ? "bg-ink text-linen-card shadow-sm"
                : "border border-linen-border text-muted hover:border-denim hover:text-denim"
            }`}
          >
            All Logged ({historyList.length})
          </button>
          <button
            onClick={() => setFilter("7days")}
            className={`font-display text-xs font-semibold uppercase tracking-wider px-3.5 py-2 rounded-lg transition-all ${
              filter === "7days"
                ? "bg-ink text-linen-card shadow-sm"
                : "border border-linen-border text-muted hover:border-denim hover:text-denim"
            }`}
          >
            Last 7 Days
          </button>
        </div>
      </div>

      {loading && <p className="font-sans text-sm text-muted">Loading your outfit memory...</p>}
      {error && <p className="font-sans text-sm text-brick">{error}</p>}

      {!loading && !error && filteredHistory.length === 0 && (
        <div className="bg-linen-card border border-linen-border rounded-xl p-12 text-center space-y-3 card-shadow">
          <div className="w-12 h-12 rounded-full bg-olive/15 text-olive flex items-center justify-center mx-auto">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 8v4l3 3" />
              <circle cx="12" cy="12" r="9" />
            </svg>
          </div>
          <h3 className="font-display text-xl font-bold text-ink">No Outfits Logged</h3>
          <p className="font-sans text-xs text-muted max-w-sm mx-auto">
            {filter === "7days"
              ? "No outfits were logged in the last 7 days."
              : "Click 'I Wore This Today' on any outfit suggestion to start building your wardrobe history!"}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {filteredHistory.map((entry) => {
          const formattedDate = new Date(entry.wornAt).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
          const style = CATEGORY_STYLES[entry.category] || DEFAULT_STYLE;

          return (
            <div key={entry._id} className="bg-linen-card border border-linen-border rounded-xl p-5 card-shadow space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-linen-border/60">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="font-mono-tag text-xs font-semibold text-muted bg-linen px-2.5 py-1 rounded-md border border-linen-border/60">
                    {formattedDate}
                  </span>
                  <span className={`font-mono-tag text-xs text-linen-card ${style.bg} px-2.5 py-1 rounded-md font-bold uppercase shadow-sm`}>
                    {entry.category || "Best Match"}
                  </span>
                </div>

                <button
                  onClick={() => handleDeleteEntry(entry._id)}
                  disabled={deletingId === entry._id}
                  className="font-display text-xs uppercase tracking-wider text-muted hover:text-brick hover:bg-brick/10 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-brick/30 transition-all flex items-center gap-1"
                  title="Remove from history"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  <span>{deletingId === entry._id ? "Removing..." : "Delete Entry"}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {entry.itemIds &&
                  entry.itemIds.map((item) => {
                    if (!item) return null;
                    return (
                      <div key={item._id} className="bg-linen border border-linen-border rounded-lg p-2.5 flex flex-col justify-between space-y-2 card-hover">
                        <div className="relative w-full aspect-square bg-linen-card rounded-md overflow-hidden flex items-center justify-center border border-linen-border/40">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-muted flex flex-col items-center justify-center p-2 text-center">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M20.38 3.46 16 2a4 4 0 0 0-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
                              </svg>
                            </div>
                          )}
                          <span className="absolute top-1 left-1 font-mono-tag text-[9px] uppercase tracking-wider bg-ink/80 text-linen-card px-1.5 py-0.5 rounded">
                            {item.category}
                          </span>
                        </div>

                        <div>
                          <p className="font-display text-sm font-semibold text-ink truncate leading-tight">{item.name}</p>
                          <p className="font-mono-tag text-[9px] text-muted truncate mt-1">
                            {item.color} {item.pattern && item.pattern !== "solid" ? `· ${item.pattern}` : ""}
                          </p>
                        </div>
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