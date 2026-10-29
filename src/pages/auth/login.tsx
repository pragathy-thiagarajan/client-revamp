import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (error: any) {
      setError(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-65px)] items-center justify-center overflow-hidden bg-slate-50 px-4 py-12">
      <div className="absolute left-[-8rem] top-[-8rem] h-80 w-80 rounded-full bg-violet-200/50 blur-3xl" />
      <div className="absolute bottom-[-8rem] right-[-8rem] h-80 w-80 rounded-full bg-fuchsia-200/40 blur-3xl" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-2xl shadow-slate-200/70 lg:grid-cols-[.9fr_1.1fr]">
        <div className="hidden bg-gradient-to-br from-slate-950 via-violet-950 to-violet-700 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/20">
              EventHub
            </span>
            <h2 className="mt-8 text-4xl font-black tracking-tight">
              Your events. Your tickets. One place.
            </h2>
            <p className="mt-4 max-w-sm leading-7 text-violet-100/80">
              Sign in to manage bookings, access tickets and stay updated with
              every event you care about.
            </p>
          </div>
          <p className="text-sm text-violet-200/70">
            Secure access for attendees, organizers and admins.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-7 sm:p-10 lg:p-12">
          <Link
            to="/"
            className="text-sm font-semibold text-violet-600 hover:text-violet-700"
          >
            ← Back home
          </Link>
          <h1 className="mt-8 text-3xl font-black tracking-tight text-slate-950">
            Welcome back
          </h1>
          <p className="mt-2 text-slate-500">
            Sign in to continue to your account.
          </p>

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}


          <div className="mt-7">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border px-4 py-3.5"
              placeholder="you@gmail.com"
              required
            />
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border px-4 py-3.5"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="primary-btn mt-7 w-full"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div className="mt-6 border-t border-slate-200 pt-6 text-center">
            <p className="text-sm text-slate-500">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-violet-600 hover:text-violet-700"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
