import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  getAdminUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} from "../../api/adminApi";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "organizer" | "admin";
  status: "active" | "blocked";
  phone?: string;
  createdAt: string;
}

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
    "from-violet-500 to-indigo-600",
    "from-blue-500 to-cyan-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-rose-500 to-pink-600",
    "from-fuchsia-500 to-purple-600",
  ];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters & Search & View Mode
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [displayLimit, setDisplayLimit] = useState<number>(20);

  // Modals & Inspection
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast(`Copied ID to clipboard!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAdminUsers();
      setUsers(response.data.users || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (
    userId: string,
    role: "user" | "organizer" | "admin"
  ) => {
    try {
      setActionInProgress(userId);
      await updateUserRole(userId, role);
      setUsers((previous) =>
        previous.map((user) =>
          user._id === userId
            ? {
                ...user,
                role,
              }
            : user
        )
      );
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser((prev) => (prev ? { ...prev, role } : null));
      }
      showToast(`User role updated to ${role.toUpperCase()}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update role");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleStatusChange = async (
    userId: string,
    status: "active" | "blocked"
  ) => {
    try {
      setActionInProgress(userId);
      await updateUserStatus(userId, status);
      setUsers((previous) =>
        previous.map((user) =>
          user._id === userId
            ? {
                ...user,
                status,
              }
            : user
        )
      );
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser((prev) => (prev ? { ...prev, status } : null));
      }
      showToast(
        status === "blocked"
          ? "Account has been suspended/blocked"
          : "Account has been activated"
      );
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update user status");
    } finally {
      setActionInProgress(null);
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      setActionInProgress(userToDelete._id);
      await deleteUser(userToDelete._id);
      setUsers((previous) =>
        previous.filter((user) => user._id !== userToDelete._id)
      );
      if (selectedUser && selectedUser._id === userToDelete._id) {
        setSelectedUser(null);
      }
      showToast(`User "${userToDelete.name}" was permanently removed`);
      setUserToDelete(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete user");
    } finally {
      setActionInProgress(null);
    }
  };

  // KPI Calculations
  const totalCount = users.length;
  const activeCount = users.filter((u) => u.status === "active").length;
  const blockedCount = users.filter((u) => u.status === "blocked").length;
  const organizerCount = users.filter((u) => u.role === "organizer").length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const attendeeCount = users.filter((u) => u.role === "user").length;

  // Filtered & Sorted Users
  const filteredUsers = useMemo(() => {
    let result = [...users];

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.phone && u.phone.toLowerCase().includes(q)) ||
          u._id.toLowerCase().includes(q)
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      result = result.filter((u) => u.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((u) => u.status === statusFilter);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "newest") {
        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      }
      if (sortBy === "oldest") {
        return (
          new Date(a.createdAt || 0).getTime() -
          new Date(b.createdAt || 0).getTime()
        );
      }
      if (sortBy === "name-asc") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "name-desc") {
        return b.name.localeCompare(a.name);
      }
      return 0;
    });

    return result;
  }, [users, searchTerm, roleFilter, statusFilter, sortBy]);

  const displayedUsers = useMemo(() => {
    if (displayLimit === 0) return filteredUsers;
    return filteredUsers.slice(0, displayLimit);
  }, [filteredUsers, displayLimit]);

  // CSV Export
  const exportCSV = () => {
    if (!users.length) return;
    const headers = ["ID", "Name", "Email", "Phone", "Role", "Status", "JoinedDate"];
    const rows = filteredUsers.map((u) => [
      `"${u._id}"`,
      `"${u.name.replace(/"/g, '""')}"`,
      `"${u.email}"`,
      `"${u.phone || ""}"`,
      `"${u.role}"`,
      `"${u.status}"`,
      `"${new Date(u.createdAt).toISOString()}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `users-export-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredUsers.length} user records to CSV`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-slate-50/60 px-4">
        <div className="relative flex items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
          <span className="absolute text-xl">👥</span>
        </div>
        <p className="mt-4 font-semibold text-slate-800">
          Loading User Management Directory...
        </p>
        <p className="text-xs text-slate-400">
          Fetching permissions, account roles, and status
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16 pt-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-slate-800/10 bg-slate-900/95 px-5 py-3 text-sm font-medium text-white shadow-2xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-4">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-xs text-emerald-400">
            ✓
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Link
            to="/admin/dashboard"
            className="transition hover:text-violet-600"
          >
            Admin
          </Link>
          <span>/</span>
          <span className="text-slate-700">User Management</span>
        </div>

        {/* Executive Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                User Management
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-violet-600 animate-pulse" />
                {users.length} Registered Accounts
              </span>
            </div>
            <p className="mt-1.5 text-sm text-slate-500">
              Control access privileges, switch roles (Attendee, Organizer,
              Admin), and manage active/blocked account states.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={exportCSV}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 active:scale-95"
            >
              <span>📥</span>
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={loadUsers}
              className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-xs font-bold text-violet-700 shadow-sm transition hover:bg-violet-100 active:scale-95"
            >
              <span className="text-sm">🔄</span>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-lg p-1 text-red-500 hover:bg-red-100"
            >
              ✕
            </button>
          </div>
        )}

        {/* Modern KPI Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Accounts
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-base text-violet-600">
                👥
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                {totalCount}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                registered
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <span className="font-bold text-emerald-600">
                {totalCount ? Math.round((activeCount / totalCount) * 100) : 0}%
              </span>
              <span>account active health</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-500"
                style={{
                  width: `${
                    totalCount ? (activeCount / totalCount) * 100 : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Attendees
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-base text-blue-600">
                🎟️
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                {attendeeCount}
              </span>
              <span className="text-xs font-semibold text-blue-600">
                Standard Users
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Event discoverers and ticket buyers
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Organizers & Admins
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-base text-amber-600">
                ⚡
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                {organizerCount + adminCount}
              </span>
              <span className="text-xs font-semibold text-amber-600">
                Privileged
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              {organizerCount} Organizers · {adminCount} Administrators
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Restricted / Blocked
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-base text-rose-600">
                🔒
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                {blockedCount}
              </span>
              <span className="text-xs font-semibold text-rose-600">
                Suspended
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Access temporarily or permanently revoked
            </p>
          </div>
        </div>

        {/* Filter and Control Command Center */}
        <div className="mb-6 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm shadow-slate-200/50">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by user name, email, phone, or account ID..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-9 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Role Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto rounded-xl bg-slate-100/80 p-1">
              <button
                type="button"
                onClick={() => setRoleFilter("all")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  roleFilter === "all"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({users.length})
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter("user")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  roleFilter === "user"
                    ? "bg-white text-violet-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Attendees ({attendeeCount})
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter("organizer")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  roleFilter === "organizer"
                    ? "bg-white text-amber-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Organizers ({organizerCount})
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter("admin")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  roleFilter === "admin"
                    ? "bg-white text-rose-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Admins ({adminCount})
              </button>
            </div>

            {/* Quick Status Dropdown & Sorting & View Mode Switcher */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="blocked">Blocked Only</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
              </select>

              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  title="Table Ledger"
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                    viewMode === "table"
                      ? "bg-white text-violet-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  📋
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("cards")}
                  title="Directory Cards"
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                    viewMode === "cards"
                      ? "bg-white text-violet-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  🪪
                </button>
              </div>
            </div>
          </div>

          {/* Result summary indicator */}
          <div className="mt-3 flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
            <div>
              Showing{" "}
              <span className="font-bold text-slate-900">
                {displayedUsers.length}
              </span>{" "}
              of{" "}
              <span className="font-bold text-slate-900">
                {filteredUsers.length}
              </span>{" "}
              filtered accounts
              {filteredUsers.length !== users.length && (
                <span className="ml-1 text-slate-400">
                  (out of {users.length} total)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Show per page:</span>
              <button
                type="button"
                onClick={() => setDisplayLimit(10)}
                className={`rounded px-1.5 py-0.5 font-bold ${
                  displayLimit === 10
                    ? "bg-violet-100 text-violet-700"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                10
              </button>
              <button
                type="button"
                onClick={() => setDisplayLimit(25)}
                className={`rounded px-1.5 py-0.5 font-bold ${
                  displayLimit === 25
                    ? "bg-violet-100 text-violet-700"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                25
              </button>
              <button
                type="button"
                onClick={() => setDisplayLimit(50)}
                className={`rounded px-1.5 py-0.5 font-bold ${
                  displayLimit === 50
                    ? "bg-violet-100 text-violet-700"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                50
              </button>
              <button
                type="button"
                onClick={() => setDisplayLimit(0)}
                className={`rounded px-1.5 py-0.5 font-bold ${
                  displayLimit === 0
                    ? "bg-violet-100 text-violet-700"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                All
              </button>
            </div>
          </div>
        </div>

        {/* Empty States */}
        {filteredUsers.length === 0 ? (
          <div className="rounded-2xl border border-slate-200/90 bg-white p-12 text-center shadow-sm">
            <span className="text-4xl">🔍</span>
            <h3 className="mt-3 text-lg font-bold text-slate-900">
              No users matching your criteria
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Try adjusting your search terms, role filters, or status selections.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setRoleFilter("all");
                setStatusFilter("all");
              }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-bold text-violet-700 transition hover:bg-violet-100"
            >
              Reset All Filters
            </button>
          </div>
        ) : viewMode === "table" ? (
          /* Table View */
          <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm shadow-slate-200/60">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 pl-6 pr-4">User Profile</th>
                    <th className="px-4 py-3.5">Assigned Role</th>
                    <th className="px-4 py-3.5">Account Status</th>
                    <th className="px-4 py-3.5">Contact / Phone</th>
                    <th className="px-4 py-3.5">Registration Date</th>
                    <th className="py-3.5 pl-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {displayedUsers.map((user) => {
                    const isProcessing = actionInProgress === user._id;
                    return (
                      <tr
                        key={user._id}
                        className="transition-colors hover:bg-slate-50/70"
                      >
                        {/* Profile Info */}
                        <td className="py-4 pl-6 pr-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${getAvatarBg(
                                user.name
                              )} text-xs font-black text-white shadow-sm`}
                            >
                              {getInitials(user.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900">
                                {user.name}
                              </p>
                              <p className="truncate text-[11px] text-slate-500">
                                {user.email}
                              </p>
                              <div className="mt-0.5 flex items-center gap-1.5">
                                <span className="font-mono text-[10px] text-slate-400">
                                  ID: {user._id.slice(-6)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    copyToClipboard(user._id, user._id)
                                  }
                                  className="text-[10px] text-violet-600 hover:underline"
                                >
                                  {copiedId === user._id ? "✓ Copied" : "Copy"}
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role Select Dropdown */}
                        <td className="px-4 py-4">
                          <div className="inline-flex items-center gap-2">
                            <select
                              value={user.role}
                              disabled={isProcessing}
                              onChange={(e) =>
                                handleRoleChange(
                                  user._id,
                                  e.target.value as "user" | "organizer" | "admin"
                                )
                              }
                              className={`rounded-xl border px-3 py-1.5 text-xs font-bold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50 ${
                                user.role === "admin"
                                  ? "border-rose-200 bg-rose-50/80 text-rose-800"
                                  : user.role === "organizer"
                                  ? "border-amber-200 bg-amber-50/80 text-amber-800"
                                  : "border-slate-200 bg-white text-slate-700"
                              }`}
                            >
                              <option value="user">👤 Attendee (User)</option>
                              <option value="organizer">
                                🎪 Event Organizer
                              </option>
                              <option value="admin">
                                👑 Administrator
                              </option>
                            </select>
                          </div>
                        </td>

                        {/* Status Chip */}
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                              user.status === "active"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                user.status === "active"
                                  ? "bg-emerald-500"
                                  : "bg-rose-500"
                              }`}
                            />
                            {user.status === "active" ? "Active" : "Blocked"}
                          </span>
                        </td>

                        {/* Phone */}
                        <td className="px-4 py-4 text-slate-600">
                          {user.phone ? (
                            <span className="font-mono text-[11px]">
                              📞 {user.phone}
                            </span>
                          ) : (
                            <span className="text-slate-400">Not provided</span>
                          )}
                        </td>

                        {/* Created Date */}
                        <td className="px-4 py-4">
                          <p className="font-medium text-slate-700">
                            {new Date(user.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {new Date(user.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </td>

                        {/* Actions */}
                        <td className="py-4 pl-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedUser(user)}
                              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                              title="Inspect Details"
                            >
                              Inspect
                            </button>

                            {user.status === "active" ? (
                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() =>
                                  handleStatusChange(user._id, "blocked")
                                }
                                className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-800 shadow-sm transition hover:bg-amber-100 disabled:opacity-50"
                              >
                                <span>🔒</span>
                                <span>Block</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() =>
                                  handleStatusChange(user._id, "active")
                                }
                                className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-800 shadow-sm transition hover:bg-emerald-100 disabled:opacity-50"
                              >
                                <span>🔓</span>
                                <span>Activate</span>
                              </button>
                            )}

                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => setUserToDelete(user)}
                              className="rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-rose-700 shadow-sm transition hover:bg-rose-100 disabled:opacity-50"
                              title="Delete user"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Card View (Directory Grid) */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayedUsers.map((user) => {
              const isProcessing = actionInProgress === user._id;
              return (
                <div
                  key={user._id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:border-violet-300 hover:shadow-md"
                >
                  <div>
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${getAvatarBg(
                            user.name
                          )} text-sm font-black text-white shadow-sm`}
                        >
                          {getInitials(user.name)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="truncate font-extrabold text-slate-900">
                            {user.name}
                          </h4>
                          <p className="truncate text-xs text-slate-500">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          user.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            user.status === "active"
                              ? "bg-emerald-500"
                              : "bg-rose-500"
                          }`}
                        />
                        {user.status === "active" ? "Active" : "Blocked"}
                      </span>
                    </div>

                    {/* Metadata items */}
                    <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Role:</span>
                        <select
                          value={user.role}
                          disabled={isProcessing}
                          onChange={(e) =>
                            handleRoleChange(
                              user._id,
                              e.target.value as "user" | "organizer" | "admin"
                            )
                          }
                          className={`rounded-lg border px-2.5 py-1 text-xs font-bold shadow-sm focus:outline-none ${
                            user.role === "admin"
                              ? "border-rose-200 bg-rose-50 text-rose-800"
                              : user.role === "organizer"
                              ? "border-amber-200 bg-amber-50 text-amber-800"
                              : "border-slate-200 bg-slate-50 text-slate-700"
                          }`}
                        >
                          <option value="user">Attendee</option>
                          <option value="organizer">Organizer</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Phone:</span>
                        <span className="font-medium text-slate-800">
                          {user.phone || "None"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Joined:</span>
                        <span className="font-medium text-slate-800">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">User ID:</span>
                        <div className="flex items-center gap-1 font-mono text-[10px]">
                          <span>{user._id.slice(0, 10)}...</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(user._id, user._id)}
                            className="text-violet-600 hover:underline"
                          >
                            {copiedId === user._id ? "✓" : "Copy"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      onClick={() => setSelectedUser(user)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
                    >
                      Audit Details
                    </button>

                    <div className="flex items-center gap-1.5">
                      {user.status === "active" ? (
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleStatusChange(user._id, "blocked")}
                          className="rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-800 transition hover:bg-amber-100"
                        >
                          🔒 Block
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleStatusChange(user._id, "active")}
                          className="rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100"
                        >
                          🔓 Unblock
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => setUserToDelete(user)}
                        className="rounded-xl border border-rose-200 bg-rose-50 p-1.5 text-rose-700 transition hover:bg-rose-100"
                        title="Delete user"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* User Inspection Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">🪪</span>
                <h3 className="font-black text-slate-900">
                  User Account Profile
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${getAvatarBg(
                    selectedUser.name
                  )} text-xl font-black text-white shadow-md`}
                >
                  {getInitials(selectedUser.name)}
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900">
                    {selectedUser.name}
                  </h4>
                  <p className="text-xs text-slate-500">{selectedUser.email}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        selectedUser.status === "active"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          selectedUser.status === "active"
                            ? "bg-emerald-500"
                            : "bg-rose-500"
                        }`}
                      />
                      {selectedUser.status.toUpperCase()}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700">
                      {selectedUser.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detail Items */}
              <div className="mt-6 space-y-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Account ID:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-slate-800">
                      {selectedUser._id}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(selectedUser._id, "modal-id")
                      }
                      className="rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-bold text-violet-700 hover:bg-violet-200"
                    >
                      {copiedId === "modal-id" ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Phone Number:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedUser.phone || "Not recorded"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Created At:</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(selectedUser.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Role Privilege:</span>
                  <select
                    value={selectedUser.role}
                    onChange={(e) =>
                      handleRoleChange(
                        selectedUser._id,
                        e.target.value as "user" | "organizer" | "admin"
                      )
                    }
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1 font-bold text-slate-800 shadow-sm"
                  >
                    <option value="user">Attendee (User)</option>
                    <option value="organizer">Event Organizer</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              {/* Status toggles */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                {selectedUser.status === "active" ? (
                  <button
                    type="button"
                    onClick={() =>
                      handleStatusChange(selectedUser._id, "blocked")
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-800 transition hover:bg-amber-100"
                  >
                    <span>🔒</span>
                    <span>Suspend / Block Account</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      handleStatusChange(selectedUser._id, "active")
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100"
                  >
                    <span>🔓</span>
                    <span>Re-activate Account</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setUserToDelete(selectedUser);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
                >
                  <span>🗑️</span>
                  <span>Delete User</span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-3 text-right">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-rose-100 bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-2xl text-rose-600">
              ⚠️
            </div>
            <h3 className="mt-4 text-lg font-black text-slate-900">
              Confirm Permanent Deletion
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Are you sure you want to delete user{" "}
              <strong className="text-slate-800">{userToDelete.name}</strong> (
              {userToDelete.email})? This action cannot be undone and will
              revoke all authorizations associated with this user.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-600 bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700"
              >
                <span>Yes, Delete User</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;