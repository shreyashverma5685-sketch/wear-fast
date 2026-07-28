import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function Home() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, tops: 0, bottoms: 0, shoes: 0, accessories: 0 });
  const [quickOccasion, setQuickOccasion] = useState("casual");
  const [quickWeather, setQuickWeather] = useState("hot");

  const token = localStorage.getItem("wf_token");

  useEffect(() => {
    if (!token) return;
    async function fetchStats() {
      try {
        const res = await fetch("http://localhost:5000/items", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const items = await res.json();
          setStats({
            total: items.length,
            tops: items.filter((i) => i.category === "top").length,
            bottoms: items.filter((i) => i.category === "bottom").length,
            shoes: items.filter((i) => i.category === "shoes").length,
            accessories: items.filter((i) => i.category === "accessories" || i.category === "accessory").length,
          });
        }
      } catch (e) {
        console.error("Error fetching wardrobe stats:", e);
      }
    }
    fetchStats();
  }, [token]);

  const handleQuickSuggest = (e) => {
    e.preventDefault();
    sessionStorage.setItem("wf_quick_occ", quickOccasion);
    sessionStorage.setItem("wf_quick_weath", quickWeather);
    navigate("/suggestions");
  };

  return (
    <div className="w-full space-y-10 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linen-card border border-linen-border rounded-2xl p-8 sm:p-12 card-shadow">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-denim/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-olive/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-denim/10 border border-denim/20">
            <span className="w-2 h-2 rounded-full bg-denim animate-pulse"></span>
            <span className="font-mono-tag text-xs font-semibold uppercase tracking-wider text-denim">
              Smart Wardrobe Assistant v2.0
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink leading-none">
            Your Wardrobe Organized. <br />
            <span className="text-denim">Your Perfect Outfit Decided.</span>
          </h1>

          <p className="font-sans text-base sm:text-lg text-muted max-w-2xl leading-relaxed">
            Catalog your clothing collection, eliminate morning dress stress, and let WEAR FAST calculate high-harmony outfit combinations tailored to your weather, occasion, and style history.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => navigate("/suggestions")}
              className="bg-denim hover:bg-denim-light text-linen-card font-display text-sm font-semibold uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-md card-hover flex items-center gap-2 transition-all"
            >
              <span>Get Outfit Recommendation</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>

            <button
              onClick={() => navigate("/wardrobe")}
              className="bg-linen-card hover:bg-linen-border/40 border border-linen-border text-ink font-display text-sm font-semibold uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all"
            >
              Manage Wardrobe
            </button>
          </div>
        </div>
      </section>

      {/* Wardrobe Quick Stats Overview */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink">Wardrobe Overview</h2>
          <span className="font-mono-tag text-xs text-muted uppercase">Real-Time Inventory</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-linen-card border border-linen-border p-5 rounded-xl card-hover flex flex-col justify-between">
            <span className="font-mono-tag text-xs text-muted uppercase">Total Items</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="font-display text-3xl font-extrabold text-ink">{stats.total}</span>
              <span className="text-denim text-xs font-medium">Pieces</span>
            </div>
          </div>

          <div className="bg-linen-card border border-linen-border p-5 rounded-xl card-hover flex flex-col justify-between">
            <span className="font-mono-tag text-xs text-muted uppercase">Tops & Shirts</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="font-display text-3xl font-extrabold text-denim">{stats.tops}</span>
              <span className="text-muted text-xs font-medium">Tops</span>
            </div>
          </div>

          <div className="bg-linen-card border border-linen-border p-5 rounded-xl card-hover flex flex-col justify-between">
            <span className="font-mono-tag text-xs text-muted uppercase">Bottoms & Pants</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="font-display text-3xl font-extrabold text-olive">{stats.bottoms}</span>
              <span className="text-muted text-xs font-medium">Bottoms</span>
            </div>
          </div>

          <div className="bg-linen-card border border-linen-border p-5 rounded-xl card-hover flex flex-col justify-between">
            <span className="font-mono-tag text-xs text-muted uppercase">Footwear</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="font-display text-3xl font-extrabold text-brick">{stats.shoes}</span>
              <span className="text-muted text-xs font-medium">Pairs</span>
            </div>
          </div>

          <div className="bg-linen-card border border-linen-border p-5 rounded-xl card-hover flex flex-col justify-between col-span-2 sm:col-span-1">
            <span className="font-mono-tag text-xs text-muted uppercase">Accessories</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="font-display text-3xl font-extrabold text-ink">{stats.accessories}</span>
              <span className="text-muted text-xs font-medium">Items</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Quick Generator & Smart Features */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Launcher Card */}
        <div className="lg:col-span-1 bg-linen-card border border-linen-border rounded-xl p-6 flex flex-col justify-between space-y-4 card-shadow">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-lg bg-denim/10 text-denim">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              </span>
              <h3 className="font-display text-xl font-bold text-ink">Quick Outfit Generator</h3>
            </div>
            <p className="font-sans text-xs text-muted leading-relaxed">
              Select your current context to jump straight into tailored outfit recommendations.
            </p>
          </div>

          <form onSubmit={handleQuickSuggest} className="space-y-3.5">
            <div>
              <label className="font-mono-tag text-[10px] uppercase text-muted block mb-1">Occasion</label>
              <select
                value={quickOccasion}
                onChange={(e) => setQuickOccasion(e.target.value)}
                className="w-full font-sans text-sm border border-linen-border rounded-lg px-3 py-2 bg-linen text-ink focus:outline-none focus:border-denim"
              >
                <option value="casual">Casual Day out</option>
                <option value="formal">Formal / Meeting</option>
                <option value="party">Party / Event</option>
                <option value="work">Workplace</option>
                <option value="sport">Sport / Fitness</option>
              </select>
            </div>

            <div>
              <label className="font-mono-tag text-[10px] uppercase text-muted block mb-1">Weather Conditions</label>
              <select
                value={quickWeather}
                onChange={(e) => setQuickWeather(e.target.value)}
                className="w-full font-sans text-sm border border-linen-border rounded-lg px-3 py-2 bg-linen text-ink focus:outline-none focus:border-denim"
              >
                <option value="hot">Sunny & Hot ☀️</option>
                <option value="cold">Cool & Cold ❄️</option>
                <option value="rainy">Rainy / Overcast 🌧️</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-denim hover:bg-denim-light text-linen-card font-display text-xs uppercase tracking-wider py-3 rounded-lg font-semibold transition-all shadow-sm"
            >
              Generate Recommendations →
            </button>
          </form>
        </div>

        {/* Feature Highlights Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-linen-card border border-linen-border p-6 rounded-xl space-y-2 card-hover">
            <div className="w-10 h-10 rounded-lg bg-olive/15 text-olive flex items-center justify-center mb-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              </svg>
            </div>
            <h4 className="font-display text-lg font-bold text-ink">0% - 100% Harmony Score</h4>
            <p className="font-sans text-xs text-muted leading-relaxed">
              Every outfit combination undergoes color theory, pattern matching, and formality alignment to produce an accurate match rating.
            </p>
          </div>

          <div className="bg-linen-card border border-linen-border p-6 rounded-xl space-y-2 card-hover">
            <div className="w-10 h-10 rounded-lg bg-brick/15 text-brick flex items-center justify-center mb-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              </svg>
            </div>
            <h4 className="font-display text-lg font-bold text-ink">Smart Outfit History & Undo</h4>
            <p className="font-sans text-xs text-muted leading-relaxed">
              Log outfits you wear each day to maintain high style variety. Clicked by mistake? Easily undo or remove any worn entry anytime.
            </p>
          </div>

          <div className="bg-linen-card border border-linen-border p-6 rounded-xl space-y-2 card-hover">
            <div className="w-10 h-10 rounded-lg bg-denim/15 text-denim flex items-center justify-center mb-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                <path d="M12 12v9" />
                <path d="m8 17 4 4 4-4" />
              </svg>
            </div>
            <h4 className="font-display text-lg font-bold text-ink">Weather-Smart Fabric Fit</h4>
            <p className="font-sans text-xs text-muted leading-relaxed">
              Automatic fabric weight checks prevent heavy sweaters on hot summer days or light linen shirts during freezing winters.
            </p>
          </div>

          <div className="bg-linen-card border border-linen-border p-6 rounded-xl space-y-2 card-hover">
            <div className="w-10 h-10 rounded-lg bg-ink/15 text-ink flex items-center justify-center mb-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 8H3" />
                <path d="M21 16H3" />
                <path d="M17 12H7" />
              </svg>
            </div>
            <h4 className="font-display text-lg font-bold text-ink">Fluid Responsive Display</h4>
            <p className="font-sans text-xs text-muted leading-relaxed">
              Seamlessly auto-expands and resizes across mobile phones, tablets, and desktop windows with zero empty whitespace gaps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;