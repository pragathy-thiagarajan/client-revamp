import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { user } = useAuth();

  return (
    <main className="overflow-hidden bg-slate-50/70">
      <section className="relative isolate">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,0.16),transparent_25rem),radial-gradient(circle_at_85%_25%,rgba(217,70,239,0.10),transparent_22rem)]" />

        <div className="mx-auto grid min-h-[78vh] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.08fr_.92fr] lg:px-8 lg:py-20">
          <div>
            <span className="soft-badge">Your next experience starts here</span>
            <h1 className="mt-6 max-w-3xl text-5xl font-black tracking-[-0.04em] text-slate-950 sm:text-6xl lg:text-7xl">
              Find events worth <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">showing up for.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Discover conferences, workshops, festivals and live experiences. Book securely, keep your tickets in one place, and never miss an update.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/events" className="primary-btn">Explore events <span className="ml-2">→</span></Link>
              {user?.role === "user" && <Link to="/bookings" className="secondary-btn">My Bookings</Link>}
              {user?.role === "organizer" && <Link to="/organizer" className="secondary-btn">Organizer Dashboard</Link>}
              {user?.role === "admin" && <Link to="/admin" className="secondary-btn">Open admin dashboard</Link>}
            </div>

            {user && (
              <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-violet-100 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 font-bold text-violet-700">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Welcome back, {user.name}</p>
                  <p className="text-xs capitalize text-slate-500">Signed in as {user.role}</p>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-violet-200/60 to-fuchsia-100/60 blur-2xl" />
            <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-white p-4 shadow-2xl shadow-violet-200/40">
              <div className="rounded-[1.5rem] bg-gradient-to-br from-slate-950 via-violet-950 to-violet-700 p-7 text-white">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/20">Featured experience</span>
                  <span className="text-sm text-violet-200">This season</span>
                </div>
                <div className="mt-24">
                  <p className="text-sm font-medium text-violet-200">Technology · Community · Ideas</p>
                  <h2 className="mt-2 text-3xl font-bold tracking-tight">Ideas become memorable when people meet.</h2>
                  <p className="mt-3 max-w-md text-sm leading-6 text-violet-100/80">A complete event experience from discovery to check-in.</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-4">
                {[
                  ["01", "Discover"],
                  ["02", "Book securely"],
                  ["03", "Attend easily"],
                ].map(([number, label]) => (
                  <div key={number} className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-bold text-violet-600">{number}</p>
                    <p className="mt-2 text-sm font-semibold text-slate-800">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* <section className="border-y border-slate-200/70 bg-white/70">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            ["Curated discovery", "Search and filter events by what matters to you."],
            ["Secure booking", "Complete payments confidently and access tickets instantly."],
            ["Always informed", "Schedules, updates and ticket details stay within reach."],
          ].map(([title, description]) => (
            <div key={title} className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-100">
              <div className="mb-4 h-1 w-10 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500" />
              <h3 className="font-bold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
            </div>
          ))}
        </div>
      </section> */}
    </main>
  );
};

export default Home;
