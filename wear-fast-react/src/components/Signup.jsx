import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to create account.");
        return;
      }

      navigate("/login");
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
          <div className="w-12 h-12 rounded-xl bg-olive text-linen-card flex items-center justify-center mx-auto shadow-md">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </div>
          <h2 className="font-display text-3xl font-extrabold text-ink tracking-tight">Create Account</h2>
          <p className="font-sans text-xs text-muted">Join WEAR FAST to start building your smart wardrobe</p>
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

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="font-mono-tag text-[10px] uppercase text-muted block mb-1">Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full font-sans text-sm border border-linen-border rounded-lg px-3.5 py-2.5 bg-linen text-ink placeholder:text-muted/60 focus:outline-none focus:border-denim"
              required
            />
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

          <div>
            <label className="font-mono-tag text-[10px] uppercase text-muted block mb-1">Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full font-sans text-sm border border-linen-border rounded-lg px-3.5 py-2.5 bg-linen text-ink placeholder:text-muted/60 focus:outline-none focus:border-denim"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-olive hover:bg-olive-light text-linen-card font-display text-sm uppercase tracking-wider py-3 rounded-lg font-semibold shadow-md transition-all disabled:opacity-60 mt-2"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-muted border-t border-linen-border">
          Already have an account?{" "}
          <Link to="/login" className="text-denim hover:underline font-semibold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;