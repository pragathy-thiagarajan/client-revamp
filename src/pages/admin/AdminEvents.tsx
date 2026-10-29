import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getPendingEvents, updateEventStatus } from "../../api/adminApi";

interface TicketType {
  name: string;
  price: number;
  quantity: number;
  availableQuantity: number;
}

interface AdminEvent {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  organizer?: {
    _id: string;
    name: string;
    email: string;
  };
  status: string;
  ticketTypes?: TicketType[];
  createdAt?: string;
}

const getInitials = (name?: string) => {
  if (!name) return "O";
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

const getCategoryColor = (category?: string) => {
  const c = (category || "").toLowerCase();
  if (c.includes("tech") || c.includes("coding")) {
    return "bg-cyan-50 text-cyan-800 border-cyan-200";
  }
  if (c.includes("music") || c.includes("concert")) {
    return "bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200";
  }
  if (c.includes("workshop") || c.includes("edu")) {
    return "bg-amber-50 text-amber-800 border-amber-200";
  }
  if (c.includes("business") || c.includes("startup")) {
    return "bg-blue-50 text-blue-800 border-blue-200";
  }
  if (c.includes("sport") || c.includes("fitness")) {
    return "bg-emerald-50 text-emerald-800 border-emerald-200";
  }
  return "bg-violet-50 text-violet-800 border-violet-200";
};

const AdminEvents = () => {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters & Search & View controls
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date-asc");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Modals
  const [inspectEvent, setInspectEvent] = useState<AdminEvent | null>(null);
  const [eventToReject, setEventToReject] = useState<AdminEvent | null>(null);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchActionRunning, setBatchActionRunning] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getPendingEvents();
      const data =
        response.data.events || response.data.data || response.data;
      setEvents(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to load pending events"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleStatusUpdate = async (
    eventId: string,
    status: "approved" | "rejected",
    eventTitle?: string
  ) => {
    try {
      setProcessingId(eventId);
      setError("");
      await updateEventStatus(eventId, status);
      setEvents((previous) => previous.filter((e) => e._id !== eventId));

      if (inspectEvent && inspectEvent._id === eventId) {
        setInspectEvent(null);
      }
      if (eventToReject && eventToReject._id === eventId) {
        setEventToReject(null);
      }

      showToast(
        status === "approved"
          ? `Event "${eventTitle || "Event"}" is now live and approved!`
          : `Event "${eventTitle || "Event"}" was rejected.`
      );
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${status} event`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleBatchApproveAll = async () => {
    try {
      setBatchActionRunning(true);
      setError("");
      for (const ev of events) {
        await updateEventStatus(ev._id, "approved");
      }
      showToast(`Successfully approved all ${events.length} pending events!`);
      setEvents([]);
      setShowBatchModal(false);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Error processing batch approval"
      );
      loadEvents();
    } finally {
      setBatchActionRunning(false);
    }
  };

  // Distinct categories in the pending queue
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => {
      if (e.category) set.add(e.category);
    });
    return Array.from(set);
  }, [events]);

  // Aggregate stats
  const totalCapacity = useMemo(() => {
    return events.reduce((acc, ev) => {
      const eventCaps =
        ev.ticketTypes?.reduce((sum, t) => sum + (Number(t.quantity) || 0), 0) || 0;
      return acc + eventCaps;
    }, 0);
  }, [events]);

  const totalPotentialValue = useMemo(() => {
    return events.reduce((acc, ev) => {
      const eventVal =
        ev.ticketTypes?.reduce(
          (sum, t) =>
            sum + (Number(t.price) || 0) * (Number(t.quantity) || 0),
          0
        ) || 0;
      return acc + eventVal;
    }, 0);
  }, [events]);

  const uniqueOrganizersCount = useMemo(() => {
    const orgs = new Set<string>();
    events.forEach((e) => {
      if (e.organizer?.name) orgs.add(e.organizer.name);
      else if (e.organizer?._id) orgs.add(e.organizer._id);
    });
    return orgs.size;
  }, [events]);

  // Filtered & Sorted Events
  const filteredEvents = useMemo(() => {
    let list = [...events];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((e) => {
        const title = e.title?.toLowerCase() || "";
        const desc = e.description?.toLowerCase() || "";
        const loc = e.location?.toLowerCase() || "";
        const cat = e.category?.toLowerCase() || "";
        const orgName = e.organizer?.name?.toLowerCase() || "";
        const orgEmail = e.organizer?.email?.toLowerCase() || "";

        return (
          title.includes(q) ||
          desc.includes(q) ||
          loc.includes(q) ||
          cat.includes(q) ||
          orgName.includes(q) ||
          orgEmail.includes(q)
        );
      });
    }

    // Category filter
    if (categoryFilter !== "all") {
      list = list.filter(
        (e) => (e.category || "").toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === "date-asc") {
        return (
          new Date(a.eventDate || 0).getTime() -
          new Date(b.eventDate || 0).getTime()
        );
      }
      if (sortBy === "date-desc") {
        return (
          new Date(b.eventDate || 0).getTime() -
          new Date(a.eventDate || 0).getTime()
        );
      }
      if (sortBy === "title-asc") {
        return (a.title || "").localeCompare(b.title || "");
      }
      if (sortBy === "capacity-high") {
        const capA =
          a.ticketTypes?.reduce((s, t) => s + (t.quantity || 0), 0) || 0;
        const capB =
          b.ticketTypes?.reduce((s, t) => s + (t.quantity || 0), 0) || 0;
        return capB - capA;
      }
      return 0;
    });

    return list;
  }, [events, searchQuery, categoryFilter, sortBy]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-slate-50/60 px-4">
        <div className="relative flex items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />
          <span className="absolute text-xl">⏳</span>
        </div>
        <p className="mt-4 font-semibold text-slate-800">
          Loading Event Review Queue...
        </p>
        <p className="text-xs text-slate-400">
          Checking submitted organizer listings and ticket structures
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
          <span className="text-slate-700">Event Approvals</span>
        </div>

        {/* Executive Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                Event Moderation & Approvals
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                {events.length} Awaiting Verification
              </span>
            </div>
            <p className="mt-1.5 text-sm text-slate-500">
              Audit submitted event details, verify pricing and venue logistics,
              and authorize publication to the public catalog.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {events.length > 1 && (
              <button
                type="button"
                onClick={() => setShowBatchModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-emerald-600/20 transition hover:from-emerald-500 hover:to-teal-500 active:scale-95"
              >
                <span>⚡</span>
                <span>Batch Approve All ({events.length})</span>
              </button>
            )}
            <button
              type="button"
              onClick={loadEvents}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 active:scale-95"
            >
              <span className="text-sm">🔄</span>
              <span>Refresh Queue</span>
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

        {/* KPI Metrics Ribbon */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Pending Events */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Pending Verification
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-base text-amber-600">
                ⏳
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                {events.length}
              </span>
              <span className="text-xs font-semibold text-amber-600">
                in review queue
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Needs admin authorization to show publicly
            </p>
          </div>

          {/* Unique Organizers */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Waiting Organizers
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-base text-violet-600">
                🎪
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                {uniqueOrganizersCount}
              </span>
              <span className="text-xs font-semibold text-violet-600">
                creators
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Organizers with submissions awaiting review
            </p>
          </div>

          {/* Total Proposed Capacity */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Proposed Capacity
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-base text-blue-600">
                🎟️
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                {totalCapacity.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-blue-600">
                total tickets
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Across all pending event tiers
            </p>
          </div>

          {/* Potential Gross Value */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Potential Inventory Value
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-base text-emerald-600">
                💰
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                ₹{totalPotentialValue.toLocaleString("en-IN")}
              </span>
              <span className="text-xs font-semibold text-emerald-600">
                GMV potential
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Gross inventory value if completely sold out
            </p>
          </div>
        </div>

        {/* Filter and Command Strip */}
        <div className="mb-6 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm shadow-slate-200/50">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by event title, description, location, organizer name or email..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-9 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto rounded-xl bg-slate-100/80 p-1">
              <button
                type="button"
                onClick={() => setCategoryFilter("all")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  categoryFilter === "all"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Categories ({events.length})
              </button>
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition-all ${
                    categoryFilter.toLowerCase() === cat.toLowerCase()
                      ? "bg-white text-amber-800 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sorter & View Switcher */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="date-asc">Event Date: Earliest First</option>
                <option value="date-desc">Event Date: Latest First</option>
                <option value="title-asc">Event Title (A-Z)</option>
                <option value="capacity-high">Capacity (High to Low)</option>
              </select>

              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode("cards")}
                  title="Card Moderation View"
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                    viewMode === "cards"
                      ? "bg-white text-amber-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  🗂️ Cards
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  title="Table Queue View"
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                    viewMode === "table"
                      ? "bg-white text-amber-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  📋 Ledger
                </button>
              </div>
            </div>
          </div>

          {/* Sub summary indicator */}
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
            <div>
              Showing{" "}
              <strong className="text-slate-900">{filteredEvents.length}</strong>{" "}
              events awaiting moderation
              {filteredEvents.length !== events.length && (
                <span className="ml-1 text-slate-400">
                  (filtered from {events.length} total)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Tip:</span>
              <span>
                Click <strong>Inspect</strong> to audit full ticket structures
              </span>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {events.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-16 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-4xl shadow-inner">
              ✨
            </div>
            <h3 className="mt-4 text-2xl font-black text-slate-900">
              All Caught Up!
            </h3>
            <p className="mt-2 max-w-md mx-auto text-sm text-slate-500 leading-relaxed">
              There are no pending events waiting for admin approval. All
              submitted organizer events have been evaluated and published.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/admin/dashboard"
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Return to Dashboard
              </Link>
              <Link
                to="/events"
                className="rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-violet-700"
              >
                Browse Public Events Catalog
              </Link>
            </div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <span className="text-4xl">🔍</span>
            <h3 className="mt-3 text-lg font-bold text-slate-900">
              No pending events matched your filters
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Try clearing your search query or switching categories.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("all");
              }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-800 transition hover:bg-amber-100"
            >
              Clear Filters
            </button>
          </div>
        ) : viewMode === "cards" ? (
          /* Cards View */
          <div className="space-y-5">
            {filteredEvents.map((event) => {
              const isProcessing = processingId === event._id;
              const eventCapacity =
                event.ticketTypes?.reduce(
                  (sum, t) => sum + (Number(t.quantity) || 0),
                  0
                ) || 0;
              const minPrice =
                event.ticketTypes && event.ticketTypes.length > 0
                  ? Math.min(...event.ticketTypes.map((t) => t.price))
                  : 0;

              return (
                <div
                  key={event._id}
                  className="group relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all hover:border-amber-300 hover:shadow-md"
                >
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    {/* Left: Main details */}
                    <div className="flex-1">
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-3 py-1 text-[11px] font-bold ${getCategoryColor(
                            event.category
                          )}`}
                        >
                          🏷️ {event.category || "General"}
                        </span>

                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-800">
                          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                          Pending Admin Review
                        </span>

                        {eventCapacity > 0 && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                            🎟️ {eventCapacity} Total Capacity
                          </span>
                        )}
                      </div>

                      {/* Title & Preview Link */}
                      <div className="mt-3 flex items-baseline gap-3">
                        <h2 className="text-xl font-extrabold text-slate-900 group-hover:text-amber-900 transition-colors sm:text-2xl">
                          {event.title}
                        </h2>
                      </div>

                      {/* Description */}
                      <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-3">
                        {event.description}
                      </p>

                      {/* Logistics & Organizer Grid */}
                      <div className="mt-4 grid gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 text-xs sm:grid-cols-2">
                        <div className="flex items-center gap-2 text-slate-700">
                          <span className="text-base">📅</span>
                          <div>
                            <span className="font-bold">Date: </span>
                            <span>
                              {new Date(event.eventDate).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-slate-700">
                          <span className="text-base">⏰</span>
                          <div>
                            <span className="font-bold">Time Window: </span>
                            <span>
                              {event.startTime || "TBD"} –{" "}
                              {event.endTime || "TBD"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-slate-700">
                          <span className="text-base">📍</span>
                          <div className="truncate">
                            <span className="font-bold">Venue: </span>
                            <span className="truncate">{event.location}</span>
                          </div>
                        </div>

                        {/* Organizer identity */}
                        <div className="flex items-center gap-2.5 text-slate-700">
                          <div
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${getAvatarBg(
                              event.organizer?.name
                            )} text-[10px] font-black text-white`}
                          >
                            {getInitials(event.organizer?.name)}
                          </div>
                          <div className="truncate">
                            <span className="font-bold">Organizer: </span>
                            <span className="font-medium text-slate-900">
                              {event.organizer?.name || "Organizer"}
                            </span>
                            {event.organizer?.email && (
                              <span className="ml-1 text-[11px] text-slate-400">
                                ({event.organizer.email})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Ticket Types Strip */}
                      {event.ticketTypes && event.ticketTypes.length > 0 && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                              Ticket Tiers & Pricing ({event.ticketTypes.length})
                            </span>
                            <span className="text-[11px] text-slate-500">
                              Starts at{" "}
                              <strong className="text-slate-900">
                                ₹{minPrice}
                              </strong>
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2.5">
                            {event.ticketTypes.map((ticket) => (
                              <div
                                key={ticket.name}
                                className="flex items-center gap-2.5 rounded-xl border border-slate-200/90 bg-white px-3.5 py-2 text-xs shadow-sm"
                              >
                                <div>
                                  <p className="font-bold text-slate-800">
                                    {ticket.name}
                                  </p>
                                  <p className="text-[11px] text-slate-400">
                                    {ticket.quantity} seats allocated
                                  </p>
                                </div>
                                <div className="text-right border-l border-slate-100 pl-2.5">
                                  <span className="font-black text-emerald-700">
                                    ₹{ticket.price}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Moderation Action Panel */}
                    <div className="flex min-w-[220px] flex-col justify-center gap-2.5 border-t border-slate-100 pt-4 lg:border-t-0 lg:border-l lg:border-slate-100 lg:pl-6 lg:pt-0">
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() =>
                          handleStatusUpdate(
                            event._id,
                            "approved",
                            event.title
                          )
                        }
                        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-emerald-600/25 transition-all duration-200 hover:from-emerald-500 hover:to-teal-500 hover:shadow-lg hover:shadow-emerald-600/35 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <>
                            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs font-black">
                              ✓
                            </span>
                            <span>Approve & Publish</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => setEventToReject(event)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-5 py-2.5 text-xs font-bold text-rose-700 shadow-sm transition hover:border-rose-300 hover:bg-rose-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-200 text-[10px] font-black text-rose-800">
                          ✕
                        </span>
                        <span>Reject Submission</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setInspectEvent(event)}
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        <span>🔍 Full Audit Inspection</span>
                      </button>

                      <Link
                        to={`/events/${event._id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-transparent px-4 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                      >
                        <span>Preview Public Page ↗</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 pl-6 pr-4">Event & Category</th>
                    <th className="px-4 py-3.5">Organizer</th>
                    <th className="px-4 py-3.5">Date & Venue</th>
                    <th className="px-4 py-3.5">Ticket Capacity</th>
                    <th className="px-4 py-3.5">Starting Price</th>
                    <th className="py-3.5 pl-4 pr-6 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredEvents.map((event) => {
                    const isProcessing = processingId === event._id;
                    const eventCapacity =
                      event.ticketTypes?.reduce(
                        (sum, t) => sum + (Number(t.quantity) || 0),
                        0
                      ) || 0;
                    const minPrice =
                      event.ticketTypes && event.ticketTypes.length > 0
                        ? Math.min(...event.ticketTypes.map((t) => t.price))
                        : 0;

                    return (
                      <tr
                        key={event._id}
                        className="transition-colors hover:bg-slate-50/80"
                      >
                        {/* Event Title & Category */}
                        <td className="py-4 pl-6 pr-4">
                          <p className="font-bold text-slate-900 max-w-[260px] truncate">
                            {event.title}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${getCategoryColor(
                                event.category
                              )}`}
                            >
                              {event.category || "General"}
                            </span>
                            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                              Pending
                            </span>
                          </div>
                        </td>

                        {/* Organizer */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${getAvatarBg(
                                event.organizer?.name
                              )} text-[10px] font-black text-white`}
                            >
                              {getInitials(event.organizer?.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate">
                                {event.organizer?.name || "Organizer"}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate">
                                {event.organizer?.email || ""}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Date & Venue */}
                        <td className="px-4 py-4">
                          <p className="font-medium text-slate-800">
                            {new Date(event.eventDate).toLocaleDateString()}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate max-w-[180px]">
                            📍 {event.location}
                          </p>
                        </td>

                        {/* Capacity */}
                        <td className="px-4 py-4">
                          <span className="font-bold text-slate-900">
                            {eventCapacity} tickets
                          </span>
                          <p className="text-[10px] text-slate-400">
                            {event.ticketTypes?.length || 0} tier(s)
                          </p>
                        </td>

                        {/* Starting Price */}
                        <td className="px-4 py-4">
                          <span className="font-bold text-emerald-700">
                            ₹{minPrice}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 pl-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setInspectEvent(event)}
                              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              Inspect
                            </button>
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() =>
                                handleStatusUpdate(
                                  event._id,
                                  "approved",
                                  event.title
                                )
                              }
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                            >
                              ✓ Approve
                            </button>
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => setEventToReject(event)}
                              className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                            >
                              ✕ Reject
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
        )}
      </div>

      {/* Comprehensive Event Audit Modal */}
      {inspectEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">📋</span>
                <div>
                  <h3 className="font-black text-slate-900">
                    Event Review Audit Dossier
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Event ID: {inspectEvent._id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectEvent(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="max-h-[75vh] overflow-y-auto p-6 space-y-5">
              {/* Event Header Banner */}
              <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/50 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getCategoryColor(
                      inspectEvent.category
                    )}`}
                  >
                    {inspectEvent.category || "General"}
                  </span>
                  <span className="rounded-full bg-amber-100 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                    Awaiting Approval
                  </span>
                </div>
                <h2 className="mt-2 text-2xl font-black text-slate-900">
                  {inspectEvent.title}
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  <span>📍 {inspectEvent.location}</span>
                  <span>•</span>
                  <span>
                    📅 {new Date(inspectEvent.eventDate).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span>
                    ⏰ {inspectEvent.startTime} – {inspectEvent.endTime}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Event Description & Copy
                </h4>
                <div className="mt-2 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 text-xs leading-relaxed text-slate-700 whitespace-pre-wrap">
                  {inspectEvent.description}
                </div>
              </div>

              {/* Organizer Card */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Host & Organizer Information
                </h4>
                <div className="mt-2 flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/60 p-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${getAvatarBg(
                        inspectEvent.organizer?.name
                      )} text-xs font-black text-white shadow-sm`}
                    >
                      {getInitials(inspectEvent.organizer?.name)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">
                        {inspectEvent.organizer?.name || "Not provided"}
                      </p>
                      <p className="text-slate-500">
                        {inspectEvent.organizer?.email || "No email"}
                      </p>
                    </div>
                  </div>
                  {inspectEvent.organizer?._id && (
                    <span className="font-mono text-[10px] text-slate-400">
                      ID: {inspectEvent.organizer._id.slice(-6)}
                    </span>
                  )}
                </div>
              </div>

              {/* Ticket Breakdown */}
              {inspectEvent.ticketTypes && inspectEvent.ticketTypes.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Ticketing Structure & Capacities
                  </h4>
                  <div className="mt-2 overflow-hidden rounded-2xl border border-slate-200/90 bg-white">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 font-bold text-slate-500">
                          <th className="py-2.5 px-4">Tier Name</th>
                          <th className="py-2.5 px-4">Capacity</th>
                          <th className="py-2.5 px-4">Unit Price</th>
                          <th className="py-2.5 px-4 text-right">Potential Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {inspectEvent.ticketTypes.map((t) => (
                          <tr key={t.name}>
                            <td className="py-2.5 px-4 font-bold text-slate-800">
                              {t.name}
                            </td>
                            <td className="py-2.5 px-4 text-slate-600">
                              {t.quantity} tickets
                            </td>
                            <td className="py-2.5 px-4 font-semibold text-slate-900">
                              ₹{t.price}
                            </td>
                            <td className="py-2.5 px-4 text-right font-black text-emerald-700">
                              ₹{(t.price * t.quantity).toLocaleString("en-IN")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
              <Link
                to={`/events/${inspectEvent._id}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:underline"
              >
                Open preview in new tab ↗
              </Link>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const ev = inspectEvent;
                    setInspectEvent(null);
                    setEventToReject(ev);
                  }}
                  className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100"
                >
                  ✕ Reject Event
                </button>
                <button
                  type="button"
                  disabled={processingId === inspectEvent._id}
                  onClick={() =>
                    handleStatusUpdate(
                      inspectEvent._id,
                      "approved",
                      inspectEvent.title
                    )
                  }
                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50"
                >
                  ✓ Approve & Publish Live
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {eventToReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-rose-100 bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-2xl text-rose-600">
              ⚠️
            </div>
            <h3 className="mt-4 text-lg font-black text-slate-900">
              Confirm Event Rejection
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Are you sure you want to reject the event submission for{" "}
              <strong className="text-slate-800">"{eventToReject.title}"</strong>{" "}
              by {eventToReject.organizer?.name || "the organizer"}? This event
              will not be published to users.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEventToReject(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processingId === eventToReject._id}
                onClick={() =>
                  handleStatusUpdate(
                    eventToReject._id,
                    "rejected",
                    eventToReject.title
                  )
                }
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 disabled:opacity-50"
              >
                Yes, Reject Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Approve Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-emerald-100 bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-2xl text-emerald-600">
              ⚡
            </div>
            <h3 className="mt-4 text-lg font-black text-slate-900">
              Batch Approve All Submissions?
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              You are about to approve and publish all{" "}
              <strong className="text-slate-900">{events.length}</strong> pending
              event listings simultaneously. All of them will become
              immediately available for ticket booking in the catalog.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={batchActionRunning}
                onClick={() => setShowBatchModal(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={batchActionRunning}
                onClick={handleBatchApproveAll}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50"
              >
                {batchActionRunning ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Approving All...</span>
                  </>
                ) : (
                  <span>Yes, Approve All Events</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEvents;