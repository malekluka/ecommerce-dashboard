import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  // Don't pre-populate email or password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [emailTouched, setEmailTouched] = useState(false);

  const APP_LINK = import.meta.env.VITE_APP_URL || "http://localhost:3000"; 

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCheckingAuth(false);
      return;
    }
    fetch(`${APP_LINK}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok) navigate("/", { replace: true });
        else {
          localStorage.removeItem("token");
          setCheckingAuth(false);
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        setCheckingAuth(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  if (checkingAuth) return null;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailIsTyped = email.length > 0;
  const emailValid = emailRegex.test(email);
  const canSubmit = email.length > 0 && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!canSubmit) {
      setError("Email and password are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${APP_LINK}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Handle API error response format
        setError(data.message || "Login failed");
      } else {
        // API returns { success: true, token, user }
        localStorage.setItem("token", data.token);
        if (rememberMe) localStorage.setItem("rememberedEmail", email);
        else localStorage.removeItem("rememberedEmail");
        setPassword("");
        navigate("/");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#111422] px-4">
      <div className="bg-[#1e293b] border border-[#334155] rounded-xl shadow-xl p-8 w-full max-w-sm flex flex-col gap-6">
        {/* header */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-tr from-[#334155] to-[#64748b] mb-2 shadow">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 24 24" className="text-white">
              <path d="M12 2c-.26 0-.52.07-.74.21l-7 4.2A1.75 1.75 0 0 0 3 7.7v4.77c0 5.05 3.73 9.86 8.28 10.5.15.02.29.03.44.03s.29-.01.44-.03C17.27 22.33 21 17.52 21 12.47V7.7c0-.62-.33-1.2-.87-1.49l-7-4.2A1.75 1.75 0 0 0 12 2zm0 2.15l7 4.2v4.12c0 4.22-3.13 8.36-7 8.98-3.87-.62-7-4.76-7-8.98V8.35l7-4.2zm0 3.35a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zm0 2a.5.5 0 1 1 0 1 .5.5 0 0 1 0-1zm0 3c-2.33 0-7 1.17-7 3.5V17h14v-2.5c0-2.33-4.67-3.5-7-3.5zm-5 4c.08-.32 2.38-1.5 5-1.5s4.92 1.18 5 1.5v.5H7v-.5z"/>
            </svg>
          </div>
          <h2 className="text-white text-2xl font-bold">Admin Login</h2>
          <p className="text-slate-400 text-sm">Sign in to your dashboard</p>
        </div>

        {/* form */}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit} autoComplete="off">
          {/* email */}
          <div>
            <label htmlFor="email" className="block text-slate-300 mb-1">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#64748b]"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)} // 👈 happens when user focuses another field
              required
              autoFocus
            />
            <div className="mt-1 text-xs">
              {emailTouched && emailIsTyped && !emailValid && <span className="text-red-400">Invalid email format</span>}
            </div>
          </div>

          {/* password */}
          <div>
            <label htmlFor="password" className="block text-slate-300 mb-1">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                className="w-full px-4 py-2 pr-10 rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#64748b]"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* remember */}
          <div className="flex items-center gap-2">
            <input id="rememberMe" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="accent-[#64748b]" />
            <label htmlFor="rememberMe" className="text-slate-300 text-sm cursor-pointer">Remember Me</label>
          </div>

          {/* errors */}
          {error && <div className="text-red-400 text-sm text-center">{error}</div>}

          {/* submit */}
          <button
            type="submit"
            disabled={!canSubmit || loading}
            className={`w-full py-2 rounded-lg text-white font-semibold shadow-md transition-all flex items-center justify-center gap-2 ${
              canSubmit ? "bg-gradient-to-r from-[#334155] via-[#64748b] to-[#94a3b8] hover:brightness-110" : "bg-slate-700 opacity-60 cursor-not-allowed"
            }`}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="text-center text-slate-400 text-sm mt-2">
          Don't have an account?{" "}
          <span className="text-blue-400 hover:underline cursor-pointer" onClick={() => navigate("/signup")}>Sign up</span>
        </div>
      </div>
    </div>
  );
}

export default Login;