import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-semibold transition ${
    isActive
      ? "bg-violet-50 text-violet-700"
      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
  }`;

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-lg font-black text-white shadow-sm shadow-violet-200">
            E
          </span>
          <div className="hidden sm:block">
            <p className="text-base font-extrabold tracking-tight text-slate-950">
              EforEvent
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Discover · Book · Attend
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Public & Attendee Navigation */}
          {user?.role !== "admin" && (
            <NavLink to="/events" className={navLinkClass}>
              Events
            </NavLink>
          )}

          {/* Attendee Only Links */}
          {user?.role === "user" && (
            <>
              <NavLink to="/bookings" className={navLinkClass}>
                My Bookings
              </NavLink>
              <NavLink to="/support" className={navLinkClass}>
                Support
              </NavLink>
            </>
          )}

          {/* Organizer Only Links */}
          {user?.role === "organizer" && (
            <>
              <NavLink to="/organizer/dashboard" className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/organizer/events" className={navLinkClass}>
                My Events
              </NavLink>
              <NavLink to="/organizer/analytics" className={navLinkClass}>
                Analytics
              </NavLink>
            </>
          )}

          {/* Admin Only Links */}
          {user?.role === "admin" && (
            <>
              <NavLink to="/admin/dashboard" className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/admin/users" className={navLinkClass}>
                Users
              </NavLink>
              <NavLink to="/admin/events" className={navLinkClass}>
                Event Approvals
              </NavLink>
              <NavLink to="/admin/bookings" className={navLinkClass}>
                All Bookings
              </NavLink>
              <NavLink to="/admin/support" className={navLinkClass}>
                Support
              </NavLink>
              <NavLink to="/admin/feedback" className={navLinkClass}>
                Feedback
              </NavLink>
            </>
          )}

          {!user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="ml-1 flex items-center gap-2 border-l border-slate-200 pl-3">
              <div className="hidden text-right md:block">
                <p className="max-w-32 truncate text-sm font-semibold text-slate-900">
                  {user.name}
                </p>
                <p className="text-xs capitalize text-slate-400">{user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
