import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getAdminUsers, getAdminBookings } from "../../api/adminApi";

interface User {
  _id: string;
  name: string;
  email: string;
  status: "active" | "blocked";
  phone: string;
  role: "user" | "organizer" | "admin";
  profileImage: string;
  createdAt: string;
  updatedAt: string;
}

interface Booking {
  _id: string;

  user: {
    _id: string;
    name: string;
    email: string;
  };

  event: {
    _id: string;
    title: string;
    eventDate: string;
    location: string;
    organizer: string;
  };

  ticketType: string;
  quantity: number;
  totalAmount: number;

  bookingStatus: string;
  paymentStatus: string;

  ticketCode: string;
  paymentId: string;

  createdAt: string;
  updatedAt: string;
}

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* Recent Bookings Interactive Controls */
  const [recentFilter, setRecentFilter] = useState<"all" | "confirmed" | "cancelled" | "paid" | "pending">("all");
  const [recentViewMode, setRecentViewMode] = useState<"cards" | "table">("cards");
  const [recentSearch, setRecentSearch] = useState("");
  const [recentLimit, setRecentLimit] = useState<number>(6);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    if (!code) return;
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [usersResponse, bookingsResponse] = await Promise.all([
          getAdminUsers(),
          getAdminBookings(),
        ]);

        console.log("Admin users:", usersResponse.data);

        console.log("Admin bookings:", bookingsResponse.data);

        const userData = usersResponse.data.users || [];

        const bookingData = bookingsResponse.data.bookings || [];

        setUsers(Array.isArray(userData) ? userData : []);

        setBookings(Array.isArray(bookingData) ? bookingData : []);
      } catch (error: any) {
        console.error("Failed to load admin dashboard:", error);

        setError(
          error.response?.data?.message || "Failed to load admin dashboard",
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  /* =========================
     USER STATISTICS & METRICS
  ========================= */

  const totalUsersCount = users.length;
  const userCount = users.filter((user) => user.role === "user").length;
  const organizerCount = users.filter(
    (user) => user.role === "organizer",
  ).length;
  const adminCount = users.filter((user) => user.role === "admin").length;
  const activeUsers = users.filter((user) => user.status === "active").length;
  const blockedUsers = users.filter((user) => user.status === "blocked").length;

  const userPct = totalUsersCount
    ? Math.round((userCount / totalUsersCount) * 100)
    : 0;
  const organizerPct = totalUsersCount
    ? Math.round((organizerCount / totalUsersCount) * 100)
    : 0;
  const adminPct = totalUsersCount
    ? Math.round((adminCount / totalUsersCount) * 100)
    : 0;
  const activePct = totalUsersCount
    ? Math.round((activeUsers / totalUsersCount) * 100)
    : 0;
  const blockedPct = totalUsersCount
    ? Math.round((blockedUsers / totalUsersCount) * 100)
    : 0;

  const recentUsers = useMemo(() => {
    return [...users]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime(),
      )
      .slice(0, 4);
  }, [users]);

  /* =========================
     BOOKING STATISTICS & METRICS
  ========================= */

  const totalBookingsCount = bookings.length;
  const confirmedBookings = bookings.filter(
    (booking) => booking.bookingStatus === "confirmed",
  ).length;

  const cancelledBookings = bookings.filter(
    (booking) => booking.bookingStatus === "cancelled",
  ).length;

  const paidBookings = bookings.filter(
    (booking) => booking.paymentStatus === "paid",
  ).length;

  const totalTickets = bookings.reduce(
    (total, booking) => total + Number(booking.quantity || 0),
    0,
  );

  const confirmedRate = totalBookingsCount
    ? Math.round((confirmedBookings / totalBookingsCount) * 100)
    : 0;

  const paidRate = totalBookingsCount
    ? Math.round((paidBookings / totalBookingsCount) * 100)
    : 0;

  const cancelledRate = totalBookingsCount
    ? Math.round((cancelledBookings / totalBookingsCount) * 100)
    : 0;

  /* =========================
     REVENUE & FINANCIALS
  ========================= */

  const totalRevenue = useMemo(() => {
    return bookings.reduce((total, booking) => {
      if (booking.bookingStatus === "cancelled") {
        return total;
      }

      if (booking.paymentStatus !== "paid") {
        return total;
      }

      return total + Number(booking.totalAmount || 0);
    }, 0);
  }, [bookings]);

  const avgOrderValue = paidBookings
    ? Math.round(totalRevenue / paidBookings)
    : 0;

  const avgTicketPrice = totalTickets
    ? Math.round(totalRevenue / totalTickets)
    : 0;

  const recentBookingsList = useMemo(() => {
    return [...bookings]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime(),
      )
      .slice(0, 4);
  }, [bookings]);

  /* Filtered and sorted bookings for dedicated Recent Bookings section */
  const sortedAllBookings = useMemo(() => {
    return [...bookings].sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime(),
    );
  }, [bookings]);

  const filteredRecentBookings = useMemo(() => {
    let list = sortedAllBookings;

    if (recentFilter === "confirmed") {
      list = list.filter(
        (b) => (b.bookingStatus || "").toLowerCase() === "confirmed",
      );
    } else if (recentFilter === "cancelled") {
      list = list.filter(
        (b) => (b.bookingStatus || "").toLowerCase() === "cancelled",
      );
    } else if (recentFilter === "paid") {
      list = list.filter(
        (b) => (b.paymentStatus || "").toLowerCase() === "paid",
      );
    } else if (recentFilter === "pending") {
      list = list.filter(
        (b) => (b.paymentStatus || "").toLowerCase() === "pending",
      );
    }

    if (recentSearch.trim()) {
      const q = recentSearch.toLowerCase().trim();
      list = list.filter((b) => {
        const uName = b.user?.name?.toLowerCase() || "";
        const uEmail = b.user?.email?.toLowerCase() || "";
        const eTitle = b.event?.title?.toLowerCase() || "";
        const tCode = b.ticketCode?.toLowerCase() || "";
        const bId = b._id?.toLowerCase() || "";
        return (
          uName.includes(q) ||
          uEmail.includes(q) ||
          eTitle.includes(q) ||
          tCode.includes(q) ||
          bId.includes(q)
        );
      });
    }

    return list;
  }, [sortedAllBookings, recentFilter, recentSearch]);

  const displayedRecentBookings = useMemo(() => {
    if (recentLimit === 0) return filteredRecentBookings;
    return filteredRecentBookings.slice(0, recentLimit);
  }, [filteredRecentBookings, recentLimit]);

  const recentCounts = useMemo(() => {
    return {
      all: bookings.length,
      confirmed: bookings.filter(
        (b) => (b.bookingStatus || "").toLowerCase() === "confirmed",
      ).length,
      cancelled: bookings.filter(
        (b) => (b.bookingStatus || "").toLowerCase() === "cancelled",
      ).length,
      paid: bookings.filter(
        (b) => (b.paymentStatus || "").toLowerCase() === "paid",
      ).length,
      pending: bookings.filter(
        (b) => (b.paymentStatus || "").toLowerCase() === "pending",
      ).length,
    };
  }, [bookings]);

  const recentFilteredFinancials = useMemo(() => {
    const sum = displayedRecentBookings.reduce(
      (acc, b) => acc + (Number(b.totalAmount) || 0),
      0,
    );
    const tickets = displayedRecentBookings.reduce(
      (acc, b) => acc + (Number(b.quantity) || 0),
      0,
    );
    return { sum, tickets };
  }, [displayedRecentBookings]);

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 px-4 py-10">
      <div className="mx-auto max-w-7xl">
        {/* =========================
            HEADER
        ========================= */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>

          <p className="mt-2 text-slate-500">
            Monitor users, events, bookings and transactions.
          </p>
        </div>

        {/* =========================
            ERROR
        ========================= */}

        {error && (
          <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* =========================
            EXECUTIVE KPI SNAPSHOT
        ========================= */}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-white p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                Total Users
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-lg text-indigo-700">
                👥
              </span>
            </div>
            <p className="mt-3 text-3xl font-black text-slate-900">
              {totalUsersCount}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {activeUsers} active · {blockedUsers} blocked
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/50 via-white to-white p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                Total Bookings
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-lg text-emerald-700">
                🎟️
              </span>
            </div>
            <p className="mt-3 text-3xl font-black text-slate-900">
              {totalBookingsCount}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {confirmedBookings} confirmed · {cancelledBookings} cancelled
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/50 via-white to-white p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                Tickets Sold
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-lg text-amber-700">
                🏷️
              </span>
            </div>
            <p className="mt-3 text-3xl font-black text-slate-900">
              {totalTickets}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Avg ₹{avgTicketPrice.toLocaleString("en-IN")} per ticket
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/50 via-white to-white p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-violet-600">
                Total Revenue
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-lg text-violet-700">
                💰
              </span>
            </div>
            <p className="mt-3 text-3xl font-black text-slate-900">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {paidBookings} paid orders · AOV ₹{avgOrderValue.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* =========================
            USER OVERVIEW
        ========================= */}

        <div className="mt-8 rounded-3xl border border-slate-200/90 bg-white p-7 shadow-lg shadow-slate-200/50">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  User Intelligence
                </span>
              </div>
              <h2 className="mt-1 text-2xl font-black text-slate-900">User Overview</h2>
              <p className="text-xs text-slate-500">
                Account distribution, role governance, system access health, and registration activity.
              </p>
            </div>

            <Link
              to="/admin/users"
              className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800"
            >
              <span>Manage User Directory</span>
              <span>→</span>
            </Link>
          </div>

          {/* 5 User Overview KPI Cards */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-4 transition hover:bg-indigo-50/60">
              <div className="flex items-center justify-between text-indigo-600">
                <span className="text-xs font-bold uppercase tracking-wider">Attendees</span>
                <span className="text-lg">🎟️</span>
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900">{userCount}</p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>{userPct}% of users</span>
                <span className="font-semibold text-indigo-700">Role: User</span>
              </div>
            </div>

            <div className="rounded-2xl border border-purple-100 bg-purple-50/30 p-4 transition hover:bg-purple-50/60">
              <div className="flex items-center justify-between text-purple-600">
                <span className="text-xs font-bold uppercase tracking-wider">Organizers</span>
                <span className="text-lg">🎪</span>
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900">{organizerCount}</p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>{organizerPct}% of users</span>
                <span className="font-semibold text-purple-700">Event Hosts</span>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-4 transition hover:bg-amber-50/60">
              <div className="flex items-center justify-between text-amber-600">
                <span className="text-xs font-bold uppercase tracking-wider">Administrators</span>
                <span className="text-lg">👑</span>
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900">{adminCount}</p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>{adminPct}% of users</span>
                <span className="font-semibold text-amber-700">Root Access</span>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4 transition hover:bg-emerald-50/60">
              <div className="flex items-center justify-between text-emerald-600">
                <span className="text-xs font-bold uppercase tracking-wider">Active</span>
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900">{activeUsers}</p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>{activePct}% health rate</span>
                <span className="font-semibold text-emerald-700">Operational</span>
              </div>
            </div>

            <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-4 transition hover:bg-rose-50/60">
              <div className="flex items-center justify-between text-rose-600">
                <span className="text-xs font-bold uppercase tracking-wider">Blocked</span>
                <span className="text-lg">🚫</span>
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900">{blockedUsers}</p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>{blockedPct}% restricted</span>
                <span className="font-semibold text-rose-700">{blockedUsers > 0 ? "Requires Review" : "Clear"}</span>
              </div>
            </div>
          </div>

          {/* User Overview Analytics: Demographics Breakdown + Recent Registrations */}
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* Visual Breakdown Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Demographics & Account Access Ratio</h3>
                  <p className="text-xs text-slate-500">Proportional representation of roles and account standing</p>
                </div>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                  {totalUsersCount} Total Accounts
                </span>
              </div>

              {/* Roles Multi-segment Bar */}
              <div className="space-y-2 mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600">Role Composition</span>
                  <span className="text-slate-400">Attendees · Organizers · Admins</span>
                </div>
                <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    style={{ width: `${userPct}%` }}
                    className="bg-indigo-600 transition-all duration-500"
                    title={`Attendees: ${userCount} (${userPct}%)`}
                  />
                  <div
                    style={{ width: `${organizerPct}%` }}
                    className="bg-purple-500 transition-all duration-500"
                    title={`Organizers: ${organizerCount} (${organizerPct}%)`}
                  />
                  <div
                    style={{ width: `${adminPct}%` }}
                    className="bg-amber-500 transition-all duration-500"
                    title={`Admins: ${adminCount} (${adminPct}%)`}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-indigo-600" />
                    <span className="text-slate-600">Users: <strong className="text-slate-900">{userCount}</strong> ({userPct}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-purple-500" />
                    <span className="text-slate-600">Hosts: <strong className="text-slate-900">{organizerCount}</strong> ({organizerPct}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="text-slate-600">Admins: <strong className="text-slate-900">{adminCount}</strong> ({adminPct}%)</span>
                  </div>
                </div>
              </div>

              {/* Status Multi-segment Bar */}
              <div className="space-y-2 mt-6 pt-5 border-t border-slate-200/70">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600">Account Access Health</span>
                  <span className="text-slate-400">{activePct}% operational standing</span>
                </div>
                <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    style={{ width: `${activePct}%` }}
                    className="bg-emerald-500 transition-all duration-500"
                    title={`Active: ${activeUsers} (${activePct}%)`}
                  />
                  <div
                    style={{ width: `${blockedPct}%` }}
                    className="bg-rose-500 transition-all duration-500"
                    title={`Blocked: ${blockedUsers} (${blockedPct}%)`}
                  />
                </div>
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-slate-600">Active: <strong className="text-slate-900">{activeUsers}</strong> accounts ({activePct}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    <span className="text-slate-600">Blocked: <strong className="text-slate-900">{blockedUsers}</strong> accounts ({blockedPct}%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Registrations Roster */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Recent Registrations</h3>
                    <p className="text-xs text-slate-500">Newly joined accounts on the platform</p>
                  </div>
                  <Link
                    to="/admin/users"
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    View Roster →
                  </Link>
                </div>

                <div className="space-y-2.5">
                  {recentUsers.map((user) => {
                    const initials = user.name
                      ? user.name.slice(0, 2).toUpperCase()
                      : "U";
                    const roleBadgeColor =
                      user.role === "admin"
                        ? "bg-amber-100 text-amber-800 border-amber-200"
                        : user.role === "organizer"
                        ? "bg-purple-100 text-purple-800 border-purple-200"
                        : "bg-indigo-100 text-indigo-800 border-indigo-200";

                    return (
                      <div
                        key={user._id}
                        className="flex items-center justify-between rounded-xl bg-white p-3 border border-slate-200/70 shadow-xs transition hover:border-slate-300"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white shadow-xs">
                            {initials}
                          </div>
                          <div className="min-w-0 truncate">
                            <p className="truncate text-xs font-bold text-slate-900">{user.name}</p>
                            <p className="truncate text-[11px] text-slate-500">{user.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`rounded-lg border px-2 py-0.5 text-[10px] font-bold capitalize ${roleBadgeColor}`}>
                            {user.role}
                          </span>
                          <span
                            className={`flex h-2 w-2 rounded-full ${
                              user.status === "active" ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                            title={user.status}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/70 text-center">
                <Link
                  to="/admin/users"
                  className="text-xs font-bold text-slate-700 hover:text-indigo-600 transition"
                >
                  Manage All {totalUsersCount} Users & Update Roles →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* =========================
            BOOKING OVERVIEW
        ========================= */}

        <div className="mt-8 rounded-3xl border border-slate-200/90 bg-white p-7 shadow-lg shadow-slate-200/50">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Financial & Ticket Analytics
                </span>
              </div>
              <h2 className="mt-1 text-2xl font-black text-slate-900">Booking Overview</h2>
              <p className="text-xs text-slate-500">
                Order fulfillment rates, payment settlements, gross volume, and transaction velocity.
              </p>
            </div>

            <Link
              to="/admin/bookings"
              className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800"
            >
              <span>View Full Ledger</span>
              <span>→</span>
            </Link>
          </div>

          {/* 5 Booking Overview KPI Cards */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4 transition hover:bg-emerald-50/60">
              <div className="flex items-center justify-between text-emerald-600">
                <span className="text-xs font-bold uppercase tracking-wider">Confirmed</span>
                <span className="text-lg">✅</span>
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900">{confirmedBookings}</p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>{confirmedRate}% fulfillment</span>
                <span className="font-semibold text-emerald-700">Secured</span>
              </div>
            </div>

            <div className="rounded-2xl border border-sky-100 bg-sky-50/30 p-4 transition hover:bg-sky-50/60">
              <div className="flex items-center justify-between text-sky-600">
                <span className="text-xs font-bold uppercase tracking-wider">Paid Orders</span>
                <span className="text-lg">💳</span>
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900">{paidBookings}</p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>{paidRate}% collection</span>
                <span className="font-semibold text-sky-700">Cleared</span>
              </div>
            </div>

            <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-4 transition hover:bg-rose-50/60">
              <div className="flex items-center justify-between text-rose-600">
                <span className="text-xs font-bold uppercase tracking-wider">Cancelled</span>
                <span className="text-lg">↩️</span>
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900">{cancelledBookings}</p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>{cancelledRate}% drop rate</span>
                <span className="font-semibold text-rose-700">{cancelledBookings > 0 ? "Refunded" : "Zero"}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-4 transition hover:bg-amber-50/60">
              <div className="flex items-center justify-between text-amber-600">
                <span className="text-xs font-bold uppercase tracking-wider">Passes Sold</span>
                <span className="text-lg">🎟️</span>
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900">{totalTickets}</p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>Tickets booked</span>
                <span className="font-semibold text-amber-700">Avg ₹{avgTicketPrice}/pass</span>
              </div>
            </div>

            <div className="rounded-2xl border border-violet-100 bg-violet-50/30 p-4 transition hover:bg-violet-50/60">
              <div className="flex items-center justify-between text-violet-600">
                <span className="text-xs font-bold uppercase tracking-wider">Net Revenue</span>
                <span className="text-lg">💰</span>
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900">₹{totalRevenue.toLocaleString("en-IN")}</p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>AOV ₹{avgOrderValue.toLocaleString("en-IN")}</span>
                <span className="font-semibold text-violet-700">Gross</span>
              </div>
            </div>
          </div>

          {/* Booking Overview Analytics: Ratios & Conversion + Recent Booking Stream */}
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* Fulfillment & Payment Metrics Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Order Fulfillment & Payment Status</h3>
                  <p className="text-xs text-slate-500">Conversion and delivery accuracy</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  {totalBookingsCount} Total Bookings
                </span>
              </div>

              {/* Fulfillment Multi-segment Bar */}
              <div className="space-y-2 mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600">Order Fulfillment Rate</span>
                  <span className="text-slate-400">{confirmedRate}% confirmed</span>
                </div>
                <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    style={{ width: `${confirmedRate}%` }}
                    className="bg-emerald-500 transition-all duration-500"
                    title={`Confirmed: ${confirmedBookings} (${confirmedRate}%)`}
                  />
                  <div
                    style={{ width: `${cancelledRate}%` }}
                    className="bg-rose-500 transition-all duration-500"
                    title={`Cancelled: ${cancelledBookings} (${cancelledRate}%)`}
                  />
                </div>
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-slate-600">Confirmed: <strong className="text-slate-900">{confirmedBookings}</strong> orders ({confirmedRate}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    <span className="text-slate-600">Cancelled: <strong className="text-slate-900">{cancelledBookings}</strong> orders ({cancelledRate}%)</span>
                  </div>
                </div>
              </div>

              {/* Payment Status Bar */}
              <div className="space-y-2 mt-6 pt-5 border-t border-slate-200/70">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600">Payment Collection Rate</span>
                  <span className="text-slate-400">{paidRate}% cleared</span>
                </div>
                <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    style={{ width: `${paidRate}%` }}
                    className="bg-sky-500 transition-all duration-500"
                    title={`Paid: ${paidBookings} (${paidRate}%)`}
                  />
                  <div
                    style={{ width: `${100 - paidRate}%` }}
                    className="bg-amber-400 transition-all duration-500"
                    title={`Pending/Unpaid: ${totalBookingsCount - paidBookings}`}
                  />
                </div>
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-sky-500" />
                    <span className="text-slate-600">Paid: <strong className="text-slate-900">{paidBookings}</strong> transactions ({paidRate}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    <span className="text-slate-600">Pending/Refunded: <strong className="text-slate-900">{totalBookingsCount - paidBookings}</strong> ({100 - paidRate}%)</span>
                  </div>
                </div>
              </div>

              {/* Economic stats strip */}
              <div className="mt-6 pt-4 border-t border-slate-200/70 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-white p-2.5 border border-slate-200/60">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Avg Order Value</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">₹{avgOrderValue.toLocaleString("en-IN")}</p>
                </div>
                <div className="rounded-xl bg-white p-2.5 border border-slate-200/60">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Passes / Order</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">
                    {totalBookingsCount ? (totalTickets / totalBookingsCount).toFixed(1) : 0}
                  </p>
                </div>
                <div className="rounded-xl bg-white p-2.5 border border-slate-200/60">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Revenue / Pass</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">₹{avgTicketPrice.toLocaleString("en-IN")}</p>
                </div>
              </div>
            </div>

            {/* Recent Booking Activity Mini-Stream */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Recent Booking Transactions</h3>
                    <p className="text-xs text-slate-500">Live transaction stream across all events</p>
                  </div>
                  <Link
                    to="/admin/bookings"
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-800"
                  >
                    View All →
                  </Link>
                </div>

                <div className="space-y-2.5">
                  {recentBookingsList.map((booking) => {
                    const isPaid = booking.paymentStatus === "paid";

                    return (
                      <div
                        key={booking._id}
                        className="flex items-center justify-between rounded-xl bg-white p-3 border border-slate-200/70 shadow-xs transition hover:border-slate-300"
                      >
                        <div className="min-w-0 pr-3">
                          <p className="truncate text-xs font-bold text-slate-900">
                            {booking.user?.name || "Customer"} · <span className="font-normal text-slate-500">{booking.event?.title || "Event"}</span>
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {booking.quantity} {booking.quantity === 1 ? "ticket" : "tickets"} · {booking.ticketType} · {new Date(booking.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-black text-slate-900">
                            ₹{Number(booking.totalAmount || 0).toLocaleString("en-IN")}
                          </span>
                          <span
                            className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              isPaid
                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                                : "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20"
                            }`}
                          >
                            {booking.paymentStatus}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/70 text-center">
                <Link
                  to="/admin/bookings"
                  className="text-xs font-bold text-slate-700 hover:text-emerald-600 transition"
                >
                  Audit All {totalBookingsCount} Bookings in Ledger →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* =========================
            QUICK ACTIONS
        ========================= */}

        {/* =========================
            ADMIN ACTIONS COMMAND CENTER
        ========================= */}

        <div className="mt-8 rounded-3xl border border-slate-200/90 bg-white p-7 shadow-lg shadow-slate-200/50">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-violet-600">
                  Control Deck
                </span>
              </div>
              <h2 className="mt-1 text-2xl font-black text-slate-900">Admin Actions Hub</h2>
              <p className="text-xs text-slate-500">
                Execute platform management actions, review queues, audit ledgers, and manage accounts.
              </p>
            </div>

            {/* Quick Action Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/admin/events"
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/10 px-3.5 py-2 text-xs font-bold text-amber-900 ring-1 ring-amber-500/30 transition-all hover:bg-amber-500 hover:text-white"
              >
                <span>🛡️ Review Queue</span>
              </Link>
              <Link
                to="/admin/users"
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-500/10 px-3.5 py-2 text-xs font-bold text-indigo-900 ring-1 ring-indigo-500/30 transition-all hover:bg-indigo-600 hover:text-white"
              >
                <span>👥 User Directory</span>
              </Link>
              <Link
                to="/admin/bookings"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 px-3.5 py-2 text-xs font-bold text-emerald-900 ring-1 ring-emerald-500/30 transition-all hover:bg-emerald-600 hover:text-white"
              >
                <span>💳 Audit Ledger</span>
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Events Approval */}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50/60 via-white to-amber-50/30 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/10">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-2xl text-white shadow-md shadow-amber-500/25">
                    🛡️
                  </div>
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800 ring-1 ring-amber-300">
                    High Priority
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-bold text-slate-900 group-hover:text-amber-900 transition">
                  Event Approval Queue
                </h3>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                  Screen, verify, and approve organizer events before publishing to public discovery.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-amber-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Live Queue</span>
                <Link
                  to="/admin/events"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-amber-500/20 transition-all hover:from-amber-600 hover:to-amber-700 active:scale-95"
                >
                  <span>Review Events</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>

            {/* Users Management */}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-indigo-200/70 bg-gradient-to-br from-indigo-50/60 via-white to-indigo-50/30 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/10">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl text-white shadow-md shadow-indigo-500/25">
                    👥
                  </div>
                  <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-bold text-indigo-800 ring-1 ring-indigo-300">
                    {users.length} Registered
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-bold text-slate-900 group-hover:text-indigo-900 transition">
                  User & Role Governance
                </h3>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                  Promote roles (Attendee, Organizer, Admin), audit user permissions, and block abusive accounts.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-indigo-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">RBAC Controls</span>
                <Link
                  to="/admin/users"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:from-indigo-700 hover:to-violet-700 active:scale-95"
                >
                  <span>Manage Directory</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>

            {/* Bookings & Ledger */}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50/60 via-white to-emerald-50/30 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-500/10">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-2xl text-white shadow-md shadow-emerald-500/25">
                    💳
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800 ring-1 ring-emerald-300">
                    ₹{totalRevenue.toLocaleString("en-IN")} Total
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-bold text-slate-900 group-hover:text-emerald-900 transition">
                  Financial & Booking Ledger
                </h3>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                  Inspect ticket orders, payment status, transaction codes, and audit gross revenues.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-emerald-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{bookings.length} Bookings</span>
                <Link
                  to="/admin/bookings"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/20 transition-all hover:from-emerald-700 hover:to-teal-700 active:scale-95"
                >
                  <span>Audit Ledger</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>

            {/* Support Desk */}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-purple-200/70 bg-gradient-to-br from-purple-50/60 via-white to-purple-50/30 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-400 hover:shadow-xl hover:shadow-purple-500/10">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 text-2xl text-white shadow-md shadow-purple-500/25">
                    💬
                  </div>
                  <span className="rounded-full bg-purple-100 px-2.5 py-1 text-[11px] font-bold text-purple-800 ring-1 ring-purple-300">
                    Helpdesk
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-bold text-slate-900 group-hover:text-purple-900 transition">
                  Support Inquiries
                </h3>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                  Review attendee and organizer support tickets, send administrative resolutions.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-purple-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Tickets</span>
                <Link
                  to="/admin/support"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-purple-500/20 transition-all hover:from-purple-700 hover:to-fuchsia-700 active:scale-95"
                >
                  <span>Open Helpdesk</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>

            {/* Attendee Feedback */}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-rose-200/70 bg-gradient-to-br from-rose-50/60 via-white to-rose-50/30 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-rose-400 hover:shadow-xl hover:shadow-rose-500/10">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-2xl text-white shadow-md shadow-rose-500/25">
                    ⭐
                  </div>
                  <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-bold text-rose-800 ring-1 ring-rose-300">
                    Ratings & NPS
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-bold text-slate-900 group-hover:text-rose-900 transition">
                  Attendee Feedback Analytics
                </h3>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                  Analyze attendee reviews, ratings distributions, and user sentiment across hosted events.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-rose-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Verified Reviews</span>
                <Link
                  to="/admin/feedback"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-rose-500/20 transition-all hover:from-rose-700 hover:to-pink-700 active:scale-95"
                >
                  <span>View Feedback</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>

            {/* Live Events Portal Link */}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-sky-200/70 bg-gradient-to-br from-sky-50/60 via-white to-sky-50/30 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-400 hover:shadow-xl hover:shadow-sky-500/10">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-2xl text-white shadow-md shadow-sky-500/25">
                    🎪
                  </div>
                  <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-bold text-sky-800 ring-1 ring-sky-300">
                    Public Discovery
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-bold text-slate-900 group-hover:text-sky-900 transition">
                  Live Public Events
                </h3>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                  Browse the public events catalogue from an administrative auditor perspective.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-sky-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Live Events</span>
                <Link
                  to="/events"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-sky-500/20 transition-all hover:from-sky-700 hover:to-blue-700 active:scale-95"
                >
                  <span>Browse Catalogue</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* =========================
            RECENT BOOKINGS COMMAND CENTER
        ========================= */}

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-lg shadow-slate-200/40">
          {/* Executive Header */}
          <div className="border-b border-slate-200/80 bg-gradient-to-r from-slate-50 via-white to-indigo-50/20 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-600/25">
                    Live Stream Feed
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                    {filteredRecentBookings.length} {filteredRecentBookings.length === 1 ? "transaction" : "transactions"}
                  </span>
                </div>

                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                  Recent Bookings
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Real-time activity ledger showing seat reservations, pass issuances, and payment clearances across all events.
                </p>
              </div>

              {/* View switchers and Full Ledger Link */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setRecentViewMode("cards")}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                      recentViewMode === "cards"
                        ? "bg-white text-indigo-700 shadow-sm shadow-slate-200"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span>🎫</span>
                    <span>Ticket Passes</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRecentViewMode("table")}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                      recentViewMode === "table"
                        ? "bg-white text-indigo-700 shadow-sm shadow-slate-200"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span>📋</span>
                    <span>Data Ledger</span>
                  </button>
                </div>

                <Link
                  to="/admin/bookings"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 px-4 py-2 text-xs font-bold text-white shadow-md shadow-slate-900/10 transition-all hover:from-slate-800 hover:to-indigo-900 active:scale-95"
                >
                  <span>Audit Master Ledger</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* Filter and Search Controls */}
            <div className="mt-5 flex flex-col gap-3 pt-5 border-t border-slate-200/70 sm:flex-row sm:items-center sm:justify-between">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[220px] max-w-md">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 text-xs">
                  🔍
                </span>
                <input
                  type="text"
                  value={recentSearch}
                  onChange={(e) => setRecentSearch(e.target.value)}
                  placeholder="Search attendee, email, event, or ticket code..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-7 text-xs font-medium text-slate-800 placeholder-slate-400 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                {recentSearch && (
                  <button
                    type="button"
                    onClick={() => setRecentSearch("")}
                    className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: "all", label: "All", count: recentCounts.all },
                  { id: "confirmed", label: "Confirmed", count: recentCounts.confirmed },
                  { id: "paid", label: "Paid", count: recentCounts.paid },
                  { id: "pending", label: "Pending", count: recentCounts.pending },
                  { id: "cancelled", label: "Cancelled", count: recentCounts.cancelled },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setRecentFilter(tab.id as any)}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all shrink-0 ${
                      recentFilter === tab.id
                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                        recentFilter === tab.id
                          ? "bg-white/20 text-white"
                          : "bg-white text-slate-700"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Quick Summary Pill */}
              <div className="hidden lg:flex items-center gap-2 rounded-xl bg-slate-100/80 border border-slate-200/80 px-3 py-1.5 text-xs text-slate-600">
                <span className="text-[11px] font-semibold text-slate-500">Volume:</span>
                <span className="font-bold text-slate-900">
                  ₹{recentFilteredFinancials.sum.toLocaleString("en-IN")}
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-bold text-slate-900">
                  {recentFilteredFinancials.tickets}
                </span>
                <span className="text-[11px] text-slate-500">passes</span>
              </div>
            </div>
          </div>

          {/* Bookings Content */}
          <div className="p-6">
            {bookings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                  🎟️
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-900">No bookings recorded yet</h3>
                <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                  Platform booking transactions will stream here in real-time as users register for events.
                </p>
              </div>
            ) : filteredRecentBookings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-10 text-center">
                <p className="text-xs font-semibold text-slate-600">
                  No bookings found matching &quot;{recentSearch}&quot; in the &quot;{recentFilter}&quot; filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setRecentSearch("");
                    setRecentFilter("all");
                  }}
                  className="mt-3 inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800"
                >
                  Reset Filters
                </button>
              </div>
            ) : recentViewMode === "cards" ? (
              /* =========================
                 CARD / TICKET PASSES VIEW
              ========================= */
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {displayedRecentBookings.map((booking) => {
                  const attendeeName = booking.user?.name || "Attendee";
                  const attendeeEmail = booking.user?.email || "No email";
                  const eventTitle = booking.event?.title || "Event";
                  const eventDate = booking.event?.eventDate;
                  const eventLocation = booking.event?.location || "Venue TBA";
                  const total = Number(booking.totalAmount || 0);
                  const isCopied = copiedCode === (booking.ticketCode || booking._id);

                  return (
                    <div
                      key={booking._id}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10"
                    >
                      {/* Card Header: Event and Price */}
                      <div className="p-5 pb-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                              {booking.ticketType || "General Admission"}
                            </span>

                            <h4 className="mt-2 text-base font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                              {eventTitle}
                            </h4>

                            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                              {eventDate && (
                                <span className="flex items-center gap-1">
                                  <span>📅</span>
                                  {new Date(eventDate).toLocaleDateString("en-IN", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                              )}
                              <span className="flex items-center gap-1 truncate max-w-[130px]">
                                <span>📍</span>
                                {eventLocation}
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <p className="text-lg font-black text-slate-900">
                              ₹{total.toLocaleString("en-IN")}
                            </p>
                            <p className="text-[11px] font-semibold text-slate-400">
                              {booking.quantity} {booking.quantity === 1 ? "ticket" : "tickets"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Ticket Perforation Notch Styling */}
                      <div className="relative flex items-center py-0.5">
                        <div className="absolute -left-3 h-5 w-5 rounded-full bg-slate-100/80 border border-slate-200" />
                        <div className="w-full border-t border-dashed border-slate-200/90" />
                        <div className="absolute -right-3 h-5 w-5 rounded-full bg-slate-100/80 border border-slate-200" />
                      </div>

                      {/* Card Middle: Attendee & Ticket Code */}
                      <div className="p-5 pt-3.5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${getAvatarBg(
                                attendeeName,
                              )} font-bold text-white shadow-xs text-xs`}
                            >
                              {getInitials(attendeeName)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {attendeeName}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate">
                                {attendeeEmail}
                              </p>
                            </div>
                          </div>

                          {/* Ticket Code copy button */}
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyCode(booking.ticketCode || booking._id)
                            }
                            className="group/btn relative shrink-0 flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-mono font-medium text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition"
                            title="Click to copy ticket code"
                          >
                            <span>🎟️</span>
                            <span className="max-w-[70px] truncate">
                              {booking.ticketCode
                                ? booking.ticketCode.slice(-8)
                                : booking._id.slice(-6).toUpperCase()}
                            </span>
                            {isCopied ? (
                              <span className="text-[10px] text-emerald-600 font-bold">✓</span>
                            ) : (
                              <span className="text-[10px] text-slate-400 group-hover/btn:text-slate-600">📋</span>
                            )}
                          </button>
                        </div>

                        {/* Status Badges & Quick Inspect trigger */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <StatusBadge status={booking.bookingStatus || "confirmed"} />
                            <StatusBadge status={booking.paymentStatus || "paid"} />
                          </div>

                          <button
                            type="button"
                            onClick={() => setSelectedBooking(booking)}
                            className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 hover:bg-indigo-100 active:scale-95 transition"
                          >
                            <span>Inspect</span>
                            <span>→</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* =========================
                 DATA LEDGER TABLE VIEW
              ========================= */
              <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                <table className="w-full min-w-[850px] border-collapse text-left">
                  <thead className="border-b border-slate-200 bg-slate-50/80">
                    <tr>
                      <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Attendee
                      </th>
                      <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Event & Date
                      </th>
                      <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Ticket Code
                      </th>
                      <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Tickets
                      </th>
                      <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 bg-white">
                    {displayedRecentBookings.map((booking) => {
                      const attendeeName = booking.user?.name || "Attendee";
                      const attendeeEmail = booking.user?.email || "No email";
                      const eventTitle = booking.event?.title || "Event";
                      const eventDate = booking.event?.eventDate;
                      const isCopied = copiedCode === (booking.ticketCode || booking._id);

                      return (
                        <tr
                          key={booking._id}
                          className="transition-colors hover:bg-slate-50/60"
                        >
                          {/* Attendee */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${getAvatarBg(
                                  attendeeName,
                                )} text-xs font-bold text-white shadow-xs`}
                              >
                                {getInitials(attendeeName)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate">
                                  {attendeeName}
                                </p>
                                <p className="text-[11px] text-slate-400 truncate">
                                  {attendeeEmail}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Event */}
                          <td className="px-4 py-3.5">
                            <p className="text-xs font-bold text-slate-900 truncate max-w-[200px]">
                              {eventTitle}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {eventDate
                                ? new Date(eventDate).toLocaleDateString("en-IN", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "Scheduled"}
                            </p>
                          </td>

                          {/* Ticket Code */}
                          <td className="px-4 py-3.5">
                            <button
                              type="button"
                              onClick={() =>
                                handleCopyCode(booking.ticketCode || booking._id)
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[11px] text-slate-700 hover:bg-slate-100 transition"
                              title="Click to copy ticket code"
                            >
                              <span>🎟️</span>
                              <span>
                                {booking.ticketCode
                                  ? booking.ticketCode.slice(-8)
                                  : booking._id.slice(-6).toUpperCase()}
                              </span>
                              {isCopied && (
                                <span className="text-[10px] text-emerald-600 font-bold">✓</span>
                              )}
                            </button>
                          </td>

                          {/* Tickets */}
                          <td className="px-4 py-3.5">
                            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                              <strong>{booking.quantity}</strong> × {booking.ticketType || "Pass"}
                            </span>
                          </td>

                          {/* Amount */}
                          <td className="px-4 py-3.5">
                            <p className="text-xs font-black text-slate-900">
                              ₹{Number(booking.totalAmount || 0).toLocaleString("en-IN")}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              ₹{booking.quantity ? Math.round(Number(booking.totalAmount || 0) / booking.quantity) : 0} each
                            </p>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <StatusBadge status={booking.bookingStatus || "confirmed"} />
                              <StatusBadge status={booking.paymentStatus || "paid"} />
                            </div>
                          </td>

                          {/* Action */}
                          <td className="px-4 py-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedBooking(booking)}
                              className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition active:scale-95"
                            >
                              <span>Inspect</span>
                              <span>→</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination / Limit Footer */}
            {filteredRecentBookings.length > 6 && (
              <div className="mt-6 flex flex-col gap-3 pt-4 border-t border-slate-200/70 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500">
                <p>
                  Showing <strong className="text-slate-800">{displayedRecentBookings.length}</strong> of{" "}
                  <strong className="text-slate-800">{filteredRecentBookings.length}</strong> filtered bookings
                </p>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-500">Show:</span>
                  {[6, 12, 0].map((limitVal) => (
                    <button
                      key={limitVal}
                      type="button"
                      onClick={() => setRecentLimit(limitVal)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                        recentLimit === limitVal
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {limitVal === 0 ? "All" : limitVal}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* =========================
            BOOKING DETAILS MODAL
        ========================= */}
        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
            <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-base">
                    🎟️
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Booking Audit Details
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      #{selectedBooking._id}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                {/* Event Overview */}
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                        {selectedBooking.ticketType || "Admission Pass"}
                      </span>
                      <h4 className="mt-1.5 text-base font-bold text-slate-900">
                        {selectedBooking.event?.title || "Event Title"}
                      </h4>
                      <p className="mt-1 text-xs text-slate-600">
                        📍 {selectedBooking.event?.location || "Venue TBA"}
                      </p>
                      {selectedBooking.event?.eventDate && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          📅 {new Date(selectedBooking.event.eventDate).toLocaleDateString("en-IN", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Attendee & Ticket Info */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Attendee</p>
                    <p className="mt-1 font-bold text-slate-900">{selectedBooking.user?.name || "Attendee"}</p>
                    <p className="text-[11px] text-slate-500 truncate">{selectedBooking.user?.email || "No email"}</p>
                  </div>

                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Ticket Code</p>
                    <div className="mt-1 flex items-center justify-between">
                      <p className="font-mono font-bold text-slate-900 text-xs truncate">
                        {selectedBooking.ticketCode || selectedBooking._id.slice(-8).toUpperCase()}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(selectedBooking.ticketCode || selectedBooking._id)}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                      >
                        {copiedCode === (selectedBooking.ticketCode || selectedBooking._id) ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Financial Breakdown */}
                <div className="rounded-xl border border-slate-200/80 p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Passes Allocated:</span>
                    <span className="font-bold text-slate-900">{selectedBooking.quantity} tickets</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Unit Price:</span>
                    <span className="font-medium text-slate-700">
                      ₹{selectedBooking.quantity ? Math.round(Number(selectedBooking.totalAmount || 0) / selectedBooking.quantity) : 0}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Total Settlement:</span>
                    <span className="text-base font-black text-slate-900">
                      ₹{Number(selectedBooking.totalAmount || 0).toLocaleString("en-IN")}
                    </span>
                  </div>

                  {selectedBooking.paymentId && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Payment ID:</span>
                      <span className="font-mono text-slate-600">{selectedBooking.paymentId}</span>
                    </div>
                  )}
                </div>

                {/* Status Badges */}
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Statuses</p>
                    <div className="mt-1 flex items-center gap-2">
                      <StatusBadge status={selectedBooking.bookingStatus || "confirmed"} />
                      <StatusBadge status={selectedBooking.paymentStatus || "paid"} />
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-slate-400">
                    <p>Reserved on:</p>
                    <p className="font-medium text-slate-600">
                      {new Date(selectedBooking.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-slate-100 bg-slate-50 px-6 py-3.5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  Close
                </button>

                <Link
                  to="/admin/bookings"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition"
                >
                  <span>Open Master Bookings Ledger</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


/* =========================
   HELPERS & BADGES
========================= */

const getInitials = (name?: string) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const getAvatarBg = (name?: string) => {
  const colors = [
    "from-indigo-500 to-purple-600",
    "from-blue-500 to-cyan-600",
    "from-emerald-500 to-teal-600",
    "from-rose-500 to-pink-600",
    "from-amber-500 to-orange-600",
    "from-violet-500 to-fuchsia-600",
  ];
  if (!name) return colors[0];
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return colors[sum % colors.length];
};

const StatusBadge = ({ status }: { status?: string }) => {
  if (!status) {
    return <span className="text-slate-400">-</span>;
  }

  const s = status.toLowerCase();
  let color = "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
  let dotColor = "bg-slate-400";

  if (s === "paid" || s === "confirmed" || s === "active") {
    color = "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/25";
    dotColor = "bg-emerald-500";
  } else if (s === "cancelled" || s === "blocked") {
    color = "bg-rose-50 text-rose-700 ring-1 ring-rose-600/25";
    dotColor = "bg-rose-500";
  } else if (s === "pending") {
    color = "bg-amber-50 text-amber-700 ring-1 ring-amber-600/25";
    dotColor = "bg-amber-500";
  }

  const formattedLabel = s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold ${color}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      <span>{formattedLabel}</span>
    </span>
  );
};

export default AdminDashboard;
