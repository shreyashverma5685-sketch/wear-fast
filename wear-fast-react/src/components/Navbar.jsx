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
          <div className="w-10 h-10 rounded-xl bg-denim flex items-center justify-center text-linen-card shadow-sm group-hover:bg-denim-light transition-colors p-1">
            <svg width="28" height="28" viewBox="0 0 100 100" fill="none" stroke="#F7F2E9" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 35 28 C 42 37, 58 37, 65 28 L 81 37 L 73 53 L 65 49 L 65 74 C 65 77.5, 62.5 80, 59 80 L 41 80 C 37.5 80, 35 77.5, 35 74 L 35 49 L 27 53 L 19 37 Z" />
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