import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Already logged in? Bounce straight to the wardrobe instead of
  // showing the login form again.
  useEffect(() => {
    if (localStorage.getItem("wf_token")) {
      navigate("/wardrobe");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid credentials");
        return;
      }

      localStorage.setItem("wf_token", data.token);
      window.dispatchEvent(new Event("storage"));
      navigate("/wardrobe");
    } catch {
      setError("Unable to connect to the server. Please verify backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md bg-linen-card border border-linen-border rounded-2xl p-8 card-shadow space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-denim text-linen-card flex items-center justify-center mx-auto shadow-md">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
          </div>
          <h2 className="font-display text-3xl font-extrabold text-ink tracking-tight">Welcome Back</h2>
          <p className="font-sans text-xs text-muted">Sign in to access your wardrobe and outfit suggestions</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-brick/10 border border-brick/30 text-brick text-xs font-medium flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="font-mono-tag text-[10px] uppercase text-muted block mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full font-sans text-sm border border-linen-border rounded-lg px-3.5 py-2.5 bg-linen text-ink placeholder:text-muted/60 focus:outline-none focus:border-denim"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-mono-tag text-[10px] uppercase text-muted block mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full font-sans text-sm border border-linen-border rounded-lg px-3.5 py-2.5 bg-linen text-ink placeholder:text-muted/60 focus:outline-none focus:border-denim pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink text-xs"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-denim hover:bg-denim-light text-linen-card font-display text-sm uppercase tracking-wider py-3 rounded-lg font-semibold shadow-md transition-all disabled:opacity-60 mt-2"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-muted border-t border-linen-border">
          Don't have an account?{" "}
          <Link to="/signup" className="text-denim hover:underline font-semibold">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;