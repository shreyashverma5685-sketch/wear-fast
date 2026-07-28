import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const linkClass = ({ isActive }) =>
  `font-display text-sm uppercase tracking-wider px-3.5 py-2 rounded-md transition-all duration-200 font-medium ${
    isActive
      ? "bg-ink text-linen-card shadow-sm"
      : "text-muted hover:text-ink hover:bg-linen-border/40"
  }`;

function Navbar() {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("wf_token"));

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("wf_token"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("wf_token");
    setToken(null);
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-linen-card/95 backdrop-blur-md border-b border-linen-border card-shadow transition-all">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 flex-wrap gap-3">
        <NavLink to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-denim flex items-center justify-center text-linen-card shadow-sm group-hover:bg-denim-light transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.38 3.46 16 2a4 4 0 0 0-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xl font-bold tracking-tight text-ink leading-none">
              WEAR <span className="text-denim">FAST</span>
            </span>
            <span className="font-mono-tag text-[9px] uppercase text-muted tracking-widest leading-none mt-0.5">
              Smart Wardrobe
            </span>
          </div>
        </NavLink>

        <nav className="flex items-center gap-1 sm:gap-2 flex-wrap">
          <NavLink to="/" end className={linkClass}>Home</NavLink>
          <NavLink to="/wardrobe" className={linkClass}>Wardrobe</NavLink>
          <NavLink to="/suggestions" className={linkClass}>Suggestions</NavLink>
          <NavLink to="/history" className={linkClass}>History</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          {token ? (
            <button
              onClick={handleLogout}
              className="font-display text-xs uppercase tracking-wider px-3.5 py-2 rounded-md border border-linen-border text-muted hover:text-brick hover:border-brick hover:bg-brick/5 transition-all duration-200"
            >
              Sign Out
            </button>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>Login</NavLink>
              <NavLink
                to="/signup"
                className="font-display text-xs uppercase tracking-wider px-4 py-2 rounded-md bg-denim hover:bg-denim-light text-linen-card shadow-sm transition-all duration-200"
              >
                Sign Up
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;