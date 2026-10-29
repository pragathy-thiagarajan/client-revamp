import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { registerUser } from "../../api/authApi";

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role") === "organizer" ? "organizer" : "user";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: initialRole,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }

    if (!form.email.trim()) {
      setError("Email is required");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must contain at least 6 characters");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role as "user" | "organizer",
      });

      setSuccess("Account created successfully. Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error: any) {
      setError(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 px-4 py-12">
      <div className="mx-auto flex max-w-6xl items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/60">
          <div className="mb-7">
            <p className="text-sm font-semibold text-violet-600">
              Create your account
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              Join EforEvent
            </h1>

            <p className="mt-2 text-slate-500">
              Join as an attendee to discover and book events, or register as an
              organizer to create and manage your own events.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Full Name
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Choose Account Type
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, role: "user" }))}
                  className={`flex flex-col rounded-xl border p-4 text-left transition ${
                    form.role === "user"
                      ? "border-violet-600 bg-violet-50/70 ring-2 ring-violet-200"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-base">
                      🎟️
                    </span>
                    <span
                      className={`h-4 w-4 rounded-full border-2 ${
                        form.role === "user"
                          ? "border-violet-600 bg-violet-600"
                          : "border-slate-300"
                      }`}
                    />
                  </div>
                  <p className="mt-3 text-sm font-bold text-slate-900">
                    Attendee
                  </p>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    Discover events, book tickets, download passes, and leave reviews.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, role: "organizer" }))}
                  className={`flex flex-col rounded-xl border p-4 text-left transition ${
                    form.role === "organizer"
                      ? "border-violet-600 bg-violet-50/70 ring-2 ring-violet-200"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-base">
                      🎪
                    </span>
                    <span
                      className={`h-4 w-4 rounded-full border-2 ${
                        form.role === "organizer"
                          ? "border-violet-600 bg-violet-600"
                          : "border-slate-300"
                      }`}
                    />
                  </div>
                  <p className="mt-3 text-sm font-bold text-slate-900">
                    Event Organizer
                  </p>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    Host events, publish tickets & schedules, and track sales analytics.
                  </p>
                </button>
              </div>

              <p className="mt-2 text-xs text-slate-400">
                You are registering as:{" "}
                <span className="font-semibold text-violet-700">
                  {form.role === "organizer" ? "Event Organizer" : "Event Attendee"}
                </span>
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Confirm Password
              </label>

              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-violet-600 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-violet-600 hover:text-violet-700"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
