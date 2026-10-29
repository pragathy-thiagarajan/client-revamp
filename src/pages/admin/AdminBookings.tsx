import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getAdminBookings } from "../../api/adminApi";

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

const StatusBadge = ({
  status,
}: {
  status?: string;
  type?: "booking" | "payment";
}) => {
  if (!status) {
    return <span className="text-slate-400">-</span>;
  }
  const s = status.toLowerCase();

  let bg = "bg-slate-100 text-slate-700 border-slate-200";
  let dot = "bg-slate-400";

  if (s === "confirmed" || s === "paid" || s === "approved" || s === "success") {
    bg = "bg-emerald-50 text-emerald-700 border-emerald-200";
    dot = "bg-emerald-500";
  } else if (s === "pending" || s === "processing") {
    bg = "bg-amber-50 text-amber-700 border-amber-200";
    dot = "bg-amber-500";
  } else if (s === "cancelled" || s === "failed" || s === "rejected") {
    bg = "bg-rose-50 text-rose-700 border-rose-200";
    dot = "bg-rose-500";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${bg}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      <span className="capitalize">{status}</span>
    </span>
  );
};

const AdminBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters & Search & View controls
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [bookingFilter, setBookingFilter] = useState<string>("all");
  const [ticketTypeFilter, setTicketTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [displayLimit, setDisplayLimit] = useState<number>(20);

  // Modal & Clipboard
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    showToast(`Copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAdminBookings();
      setBookings(response.data.bookings || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  // Distinct ticket types in dataset
  const availableTicketTypes = useMemo(() => {
    const set = new Set<string>();
    bookings.forEach((b) => {
      if (b.ticketType) set.add(b.ticketType);
    });
    return Array.from(set);
  }, [bookings]);

  // Overall Financial & Volume metrics
  const totalBookingsCount = bookings.length;
  const paidBookings = useMemo(
    () => bookings.filter((b) => b.paymentStatus?.toLowerCase() === "paid"),
    [bookings]
  );
  const pendingBookings = useMemo(
    () => bookings.filter((b) => b.paymentStatus?.toLowerCase() === "pending"),
    [bookings]
  );
  const failedBookings = useMemo(
    () => bookings.filter((b) => b.paymentStatus?.toLowerCase() === "failed"),
    [bookings]
  );
  const confirmedBookings = useMemo(
    () => bookings.filter((b) => b.bookingStatus?.toLowerCase() === "confirmed"),
    [bookings]
  );
  const cancelledBookings = useMemo(
    () => bookings.filter((b) => b.bookingStatus?.toLowerCase() === "cancelled"),
    [bookings]
  );

  const totalTicketsIssued = useMemo(() => {
    return bookings.reduce((sum, b) => sum + Number(b.quantity || 0), 0);
  }, [bookings]);

  const totalGrossRevenue = useMemo(() => {
    return paidBookings.reduce(
      (sum, b) => sum + Number(b.totalAmount || 0),
      0
    );
  }, [paidBookings]);

  const avgOrderValue = paidBookings.length
    ? Math.round(totalGrossRevenue / paidBookings.length)
    : 0;

  const paymentSuccessRate = totalBookingsCount
    ? Math.round((paidBookings.length / totalBookingsCount) * 100)
    : 0;

  // Filtering & Sorting
  const filteredBookings = useMemo(() => {
    let list = [...bookings];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((b) => {
        const userName = b.user?.name?.toLowerCase() || "";
        const userEmail = b.user?.email?.toLowerCase() || "";
        const eventTitle = b.event?.title?.toLowerCase() || "";
        const eventLoc = b.event?.location?.toLowerCase() || "";
        const ticketCode = b.ticketCode?.toLowerCase() || "";
        const paymentId = b.paymentId?.toLowerCase() || "";
        const id = b._id?.toLowerCase() || "";

        return (
          userName.includes(q) ||
          userEmail.includes(q) ||
          eventTitle.includes(q) ||
          eventLoc.includes(q) ||
          ticketCode.includes(q) ||
          paymentId.includes(q) ||
          id.includes(q)
        );
      });
    }

    // Payment Filter
    if (paymentFilter !== "all") {
      list = list.filter(
        (b) => (b.paymentStatus || "").toLowerCase() === paymentFilter
      );
    }

    // Booking Status Filter
    if (bookingFilter !== "all") {
      list = list.filter(
        (b) => (b.bookingStatus || "").toLowerCase() === bookingFilter
      );
    }

    // Ticket Type Filter
    if (ticketTypeFilter !== "all") {
      list = list.filter((b) => b.ticketType === ticketTypeFilter);
    }

    // Sorting
    list.sort((a, b) => {
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
      if (sortBy === "amount-high") {
        return Number(b.totalAmount || 0) - Number(a.totalAmount || 0);
      }
      if (sortBy === "amount-low") {
        return Number(a.totalAmount || 0) - Number(b.totalAmount || 0);
      }
      if (sortBy === "quantity") {
        return Number(b.quantity || 0) - Number(a.quantity || 0);
      }
      return 0;
    });

    return list;
  }, [
    bookings,
    searchQuery,
    paymentFilter,
    bookingFilter,
    ticketTypeFilter,
    sortBy,
  ]);

  const displayedBookings = useMemo(() => {
    if (displayLimit === 0) return filteredBookings;
    return filteredBookings.slice(0, displayLimit);
  }, [filteredBookings, displayLimit]);

  // Filtered Financials
  const filteredFinancials = useMemo(() => {
    const totalAmount = filteredBookings.reduce(
      (sum, b) => sum + Number(b.totalAmount || 0),
      0
    );
    const totalQty = filteredBookings.reduce(
      (sum, b) => sum + Number(b.quantity || 0),
      0
    );
    return { totalAmount, totalQty };
  }, [filteredBookings]);

  // CSV Export
  const exportCSV = () => {
    if (!bookings.length) return;
    const headers = [
      "BookingID",
      "AttendeeName",
      "AttendeeEmail",
      "EventTitle",
      "EventLocation",
      "TicketType",
      "Quantity",
      "TotalAmount",
      "BookingStatus",
      "PaymentStatus",
      "TicketCode",
      "PaymentID",
      "Date",
    ];

    const rows = filteredBookings.map((b) => [
      `"${b._id}"`,
      `"${(b.user?.name || "").replace(/"/g, '""')}"`,
      `"${b.user?.email || ""}"`,
      `"${(b.event?.title || "").replace(/"/g, '""')}"`,
      `"${(b.event?.location || "").replace(/"/g, '""')}"`,
      `"${b.ticketType || ""}"`,
      b.quantity || 1,
      b.totalAmount || 0,
      `"${b.bookingStatus || ""}"`,
      `"${b.paymentStatus || ""}"`,
      `"${b.ticketCode || ""}"`,
      `"${b.paymentId || ""}"`,
      `"${new Date(b.createdAt).toISOString()}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `all-bookings-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredBookings.length} booking records to CSV`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-slate-50/60 px-4">
        <div className="relative flex items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
          <span className="absolute text-xl">🎫</span>
        </div>
        <p className="mt-4 font-semibold text-slate-800">
          Loading All Bookings Ledger...
        </p>
        <p className="text-xs text-slate-400">
          Syncing transactions, ticket codes, and payment status
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
          <span className="text-slate-700">All Bookings</span>
        </div>

        {/* Executive Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                All Bookings & Transactions
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-violet-600 animate-pulse" />
                {bookings.length} Total Ledger Orders
              </span>
            </div>
            <p className="mt-1.5 text-sm text-slate-500">
              Audit ticket allocations, monitor payment settlement IDs, and
              verify customer admissions across all platform events.
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
              onClick={loadBookings}
              className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-xs font-bold text-violet-700 shadow-sm transition hover:bg-violet-100 active:scale-95"
            >
              <span className="text-sm">🔄</span>
              <span>Refresh Ledger</span>
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

        {/* Financial & Booking Executive KPI Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Gross Revenue */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Gross Revenue
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-base text-emerald-600">
                💳
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                ₹{totalGrossRevenue.toLocaleString("en-IN")}
              </span>
              <span className="text-xs font-semibold text-emerald-600">
                Settled
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>Avg Order: ₹{avgOrderValue.toLocaleString("en-IN")}</span>
              <span className="font-bold text-slate-700">
                {paidBookings.length} paid orders
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                style={{ width: `${paymentSuccessRate}%` }}
              />
            </div>
          </div>

          {/* Total Passes / Quantity */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Tickets
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-base text-violet-600">
                🎟️
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                {totalTicketsIssued}
              </span>
              <span className="text-xs font-semibold text-violet-600">
                Passes Issued
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>{totalBookingsCount} transactions</span>
              <span className="font-bold text-violet-600">
                {(totalTicketsIssued / (totalBookingsCount || 1)).toFixed(1)}{" "}
                tickets/order
              </span>
            </div>
          </div>

          {/* Payment Success Rate */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Payment Success Rate
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-base text-blue-600">
                ⚡
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                {paymentSuccessRate}%
              </span>
              <span className="text-xs font-semibold text-blue-600">
                Conversion
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              {confirmedBookings.length} confirmed · {cancelledBookings.length}{" "}
              cancelled
            </p>
          </div>

          {/* Pending & Failed Attention */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Attention Required
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-base text-amber-600">
                ⚠️
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                {pendingBookings.length + failedBookings.length}
              </span>
              <span className="text-xs font-semibold text-amber-600">
                Issues / Pending
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              {pendingBookings.length} pending · {failedBookings.length} failed
              payments
            </p>
          </div>
        </div>

        {/* Master Control & Deep Filter Strip */}
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
                placeholder="Search attendee, email, event, ticket code (TKT-...), or payment ID..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-9 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
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

            {/* Payment Filter Quick Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto rounded-xl bg-slate-100/80 p-1">
              <button
                type="button"
                onClick={() => setPaymentFilter("all")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  paymentFilter === "all"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({bookings.length})
              </button>
              <button
                type="button"
                onClick={() => setPaymentFilter("paid")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  paymentFilter === "paid"
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Paid ({paidBookings.length})
              </button>
              <button
                type="button"
                onClick={() => setPaymentFilter("pending")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  paymentFilter === "pending"
                    ? "bg-white text-amber-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Pending ({pendingBookings.length})
              </button>
              <button
                type="button"
                onClick={() => setPaymentFilter("failed")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  paymentFilter === "failed"
                    ? "bg-white text-rose-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Failed ({failedBookings.length})
              </button>
            </div>

            {/* Booking Status & Ticket Type Dropdowns & Sorter */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={bookingFilter}
                onChange={(e) => setBookingFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              >
                <option value="all">All Bookings</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {availableTicketTypes.length > 0 && (
                <select
                  value={ticketTypeFilter}
                  onChange={(e) => setTicketTypeFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                >
                  <option value="all">All Ticket Types</option>
                  {availableTicketTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              )}

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              >
                <option value="newest">Newest Date</option>
                <option value="oldest">Oldest Date</option>
                <option value="amount-high">Amount (High to Low)</option>
                <option value="amount-low">Amount (Low to High)</option>
                <option value="quantity">Ticket Quantity</option>
              </select>

              {/* View mode switcher */}
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  title="Ledger Table"
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
                  title="Ticket Passes"
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                    viewMode === "cards"
                      ? "bg-white text-violet-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  🎫
                </button>
              </div>
            </div>
          </div>

          {/* Results and Live Financial Totals Sub-bar */}
          <div className="mt-3 flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
            <div className="flex flex-wrap items-center gap-3">
              <span>
                Showing{" "}
                <span className="font-bold text-slate-900">
                  {displayedBookings.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-slate-900">
                  {filteredBookings.length}
                </span>{" "}
                bookings
              </span>
              <span className="hidden sm:inline text-slate-300">|</span>
              <span className="hidden sm:inline">
                Filtered Volume:{" "}
                <strong className="text-slate-800">
                  {filteredFinancials.totalQty} tickets
                </strong>
              </span>
              <span className="hidden sm:inline text-slate-300">|</span>
              <span className="hidden sm:inline">
                Filtered Total:{" "}
                <strong className="text-emerald-700">
                  ₹{filteredFinancials.totalAmount.toLocaleString("en-IN")}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Per page:</span>
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
                onClick={() => setDisplayLimit(20)}
                className={`rounded px-1.5 py-0.5 font-bold ${
                  displayLimit === 20
                    ? "bg-violet-100 text-violet-700"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                20
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

        {/* Empty State */}
        {filteredBookings.length === 0 ? (
          <div className="rounded-2xl border border-slate-200/90 bg-white p-12 text-center shadow-sm">
            <span className="text-4xl">🎫</span>
            <h3 className="mt-3 text-lg font-bold text-slate-900">
              No bookings found
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              No transaction matches the current filters or search terms.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setPaymentFilter("all");
                setBookingFilter("all");
                setTicketTypeFilter("all");
              }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-bold text-violet-700 transition hover:bg-violet-100"
            >
              Clear All Filters
            </button>
          </div>
        ) : viewMode === "table" ? (
          /* High-Density Master Ledger Table */
          <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm shadow-slate-200/60">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1250px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 pl-6 pr-4">Attendee</th>
                    <th className="px-4 py-3.5">Event & Venue</th>
                    <th className="px-4 py-3.5">Ticket & Qty</th>
                    <th className="px-4 py-3.5">Total Amount</th>
                    <th className="px-4 py-3.5">Booking Status</th>
                    <th className="px-4 py-3.5">Payment Status</th>
                    <th className="px-4 py-3.5">Ticket Code</th>
                    <th className="px-4 py-3.5">Payment Reference</th>
                    <th className="px-4 py-3.5">Booked At</th>
                    <th className="py-3.5 pl-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {displayedBookings.map((booking) => {
                    const ticketCode =
                      booking.ticketCode || `TKT-${booking._id.slice(-6).toUpperCase()}`;
                    return (
                      <tr
                        key={booking._id}
                        className="transition-colors hover:bg-slate-50/80"
                      >
                        {/* Attendee Info */}
                        <td className="py-4 pl-6 pr-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${getAvatarBg(
                                booking.user?.name
                              )} text-xs font-black text-white shadow-sm`}
                            >
                              {getInitials(booking.user?.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900">
                                {booking.user?.name || "Guest Attendee"}
                              </p>
                              <p className="truncate text-[11px] text-slate-500">
                                {booking.user?.email || "No email"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Event & Venue */}
                        <td className="px-4 py-4">
                          <p className="max-w-[200px] truncate font-bold text-slate-900">
                            {booking.event?.title || "Untitled Event"}
                          </p>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500">
                            <span>📍</span>
                            <span className="truncate max-w-[170px]">
                              {booking.event?.location || "TBA"}
                            </span>
                          </div>
                          {booking.event?.eventDate && (
                            <p className="text-[10px] text-slate-400">
                              📅{" "}
                              {new Date(
                                booking.event.eventDate
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </td>

                        {/* Ticket & Qty */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className="rounded-lg bg-slate-100 px-2 py-0.5 font-bold text-slate-700">
                              {booking.ticketType || "General"}
                            </span>
                            <span className="rounded-lg bg-violet-50 px-2 py-0.5 font-black text-violet-700">
                              ×{booking.quantity || 1}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[10px] text-slate-400">
                            ₹
                            {Math.round(
                              Number(booking.totalAmount || 0) /
                                (Number(booking.quantity) || 1)
                            )}{" "}
                            each
                          </p>
                        </td>

                        {/* Total Amount */}
                        <td className="px-4 py-4">
                          <span className="text-sm font-black text-slate-900">
                            ₹{Number(booking.totalAmount || 0).toLocaleString("en-IN")}
                          </span>
                        </td>

                        {/* Booking Status */}
                        <td className="px-4 py-4">
                          <StatusBadge
                            status={booking.bookingStatus}
                            type="booking"
                          />
                        </td>

                        {/* Payment Status */}
                        <td className="px-4 py-4">
                          <StatusBadge
                            status={booking.paymentStatus}
                            type="payment"
                          />
                        </td>

                        {/* Ticket Code with Copy */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[11px] font-bold text-slate-700">
                              {ticketCode}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                copyToClipboard(ticketCode, `code-${booking._id}`)
                              }
                              className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 transition hover:bg-slate-200"
                              title="Copy Ticket Code"
                            >
                              {copiedCode === `code-${booking._id}`
                                ? "✓"
                                : "Copy"}
                            </button>
                          </div>
                        </td>

                        {/* Payment Reference */}
                        <td className="px-4 py-4">
                          {booking.paymentId ? (
                            <div className="flex items-center gap-1 font-mono text-[11px] text-slate-600">
                              <span className="truncate max-w-[100px]">
                                {booking.paymentId}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  copyToClipboard(
                                    booking.paymentId,
                                    `pay-${booking._id}`
                                  )
                                }
                                className="text-violet-600 hover:underline"
                              >
                                {copiedCode === `pay-${booking._id}`
                                  ? "✓"
                                  : "Copy"}
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        {/* Booked At */}
                        <td className="px-4 py-4">
                          <p className="font-medium text-slate-700">
                            {new Date(booking.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {new Date(booking.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </td>

                        {/* Action: Inspect */}
                        <td className="py-4 pl-4 pr-6 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedBooking(booking)}
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 active:scale-95"
                          >
                            <span>Inspect</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Cards View: Digital Admission Passes */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayedBookings.map((booking) => {
              const ticketCode =
                booking.ticketCode || `TKT-${booking._id.slice(-6).toUpperCase()}`;
              return (
                <div
                  key={booking._id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition hover:border-violet-300 hover:shadow-md"
                >
                  {/* Top card accent line */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-600" />

                  <div className="p-5">
                    {/* Event & Status Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-violet-600">
                          {booking.ticketType || "General Admission"}
                        </span>
                        <h4 className="truncate font-extrabold text-slate-900 group-hover:text-violet-700">
                          {booking.event?.title || "Event Pass"}
                        </h4>
                      </div>
                      <StatusBadge
                        status={booking.bookingStatus}
                        type="booking"
                      />
                    </div>

                    {/* Event date & location */}
                    <div className="mt-2.5 flex items-center gap-3 text-xs text-slate-500">
                      <span className="truncate">
                        📍 {booking.event?.location || "Venue TBA"}
                      </span>
                      <span>•</span>
                      <span className="shrink-0 font-medium">
                        {booking.event?.eventDate
                          ? new Date(
                              booking.event.eventDate
                            ).toLocaleDateString()
                          : "Date TBA"}
                      </span>
                    </div>

                    {/* Perforated ticket notch separator */}
                    <div className="relative my-4 flex items-center">
                      <div className="h-px w-full border-t border-dashed border-slate-200" />
                      <div className="absolute -left-7 h-4 w-4 rounded-full border border-slate-200/90 bg-slate-50/70" />
                      <div className="absolute -right-7 h-4 w-4 rounded-full border border-slate-200/90 bg-slate-50/70" />
                    </div>

                    {/* Attendee row */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${getAvatarBg(
                            booking.user?.name
                          )} text-xs font-black text-white shadow-sm`}
                        >
                          {getInitials(booking.user?.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-slate-900">
                            {booking.user?.name || "Attendee"}
                          </p>
                          <p className="truncate text-[11px] text-slate-400">
                            {booking.user?.email || "No email"}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-black text-slate-900">
                          ₹
                          {Number(booking.totalAmount || 0).toLocaleString(
                            "en-IN"
                          )}
                        </span>
                        <p className="text-[10px] font-bold text-slate-500">
                          {booking.quantity || 1} pass
                          {(booking.quantity || 1) > 1 ? "es" : ""}
                        </p>
                      </div>
                    </div>

                    {/* Ticket Code Bar */}
                    <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-2.5">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-700">
                        <span>🎟️</span>
                        <span>{ticketCode}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(ticketCode, `card-${booking._id}`)
                        }
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                      >
                        {copiedCode === `card-${booking._id}`
                          ? "✓ Copied"
                          : "Copy"}
                      </button>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400">Payment:</span>
                      <StatusBadge
                        status={booking.paymentStatus}
                        type="payment"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedBooking(booking)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
                    >
                      Audit Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Comprehensive Booking Audit Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">🧾</span>
                <div>
                  <h3 className="font-black text-slate-900">
                    Booking Transaction Audit
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Transaction ID: {selectedBooking._id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="max-h-[75vh] overflow-y-auto p-6 space-y-5">
              {/* Event Card */}
              <div className="rounded-2xl border border-violet-100 bg-violet-50/50 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600">
                  Target Event
                </span>
                <h4 className="mt-1 text-lg font-black text-slate-900">
                  {selectedBooking.event?.title || "Untitled Event"}
                </h4>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                  <span>📍 {selectedBooking.event?.location || "TBA"}</span>
                  <span>•</span>
                  <span>
                    📅{" "}
                    {selectedBooking.event?.eventDate
                      ? new Date(
                          selectedBooking.event.eventDate
                        ).toLocaleDateString()
                      : "TBA"}
                  </span>
                  {selectedBooking.event?.organizer && (
                    <>
                      <span>•</span>
                      <span>Organizer: {selectedBooking.event.organizer}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Attendee Information */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Customer / Attendee Profile
                </span>
                <div className="mt-2 flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${getAvatarBg(
                      selectedBooking.user?.name
                    )} text-sm font-black text-white shadow-sm`}
                  >
                    {getInitials(selectedBooking.user?.name)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">
                      {selectedBooking.user?.name || "Guest Attendee"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {selectedBooking.user?.email || "No email"}
                    </p>
                    <p className="font-mono text-[10px] text-slate-400">
                      User ID: {selectedBooking.user?._id || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ticket Code and Verification Box */}
              <div className="rounded-2xl border border-dashed border-violet-300 bg-violet-50/30 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700">
                    Admission Pass Code
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        selectedBooking.ticketCode || selectedBooking._id,
                        "modal-tkt"
                      )
                    }
                    className="rounded-lg bg-violet-100 px-2.5 py-1 text-xs font-bold text-violet-700 hover:bg-violet-200"
                  >
                    {copiedCode === "modal-tkt" ? "✓ Copied!" : "Copy Code"}
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-mono text-xl font-black tracking-widest text-slate-900">
                    {selectedBooking.ticketCode ||
                      `TKT-${selectedBooking._id.slice(-8).toUpperCase()}`}
                  </span>
                  <span className="rounded-lg bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                    Verified Format
                  </span>
                </div>
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="space-y-2.5 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Ticket Category:</span>
                  <span className="font-bold text-slate-800">
                    {selectedBooking.ticketType || "General Admission"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Purchased Quantity:</span>
                  <span className="font-bold text-slate-800">
                    {selectedBooking.quantity || 1} pass
                    {(selectedBooking.quantity || 1) > 1 ? "es" : ""}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Booking Status:</span>
                  <StatusBadge
                    status={selectedBooking.bookingStatus}
                    type="booking"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Payment Status:</span>
                  <StatusBadge
                    status={selectedBooking.paymentStatus}
                    type="payment"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Payment Gateway ID:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-slate-700">
                    <span>{selectedBooking.paymentId || "None"}</span>
                    {selectedBooking.paymentId && (
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            selectedBooking.paymentId,
                            "modal-pay"
                          )
                        }
                        className="text-violet-600 hover:underline"
                      >
                        {copiedCode === "modal-pay" ? "✓" : "Copy"}
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200/80 pt-2 text-sm font-black">
                  <span className="text-slate-800">Total Settled Amount:</span>
                  <span className="text-lg text-emerald-600">
                    ₹
                    {Number(selectedBooking.totalAmount || 0).toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>
              </div>

              {/* Timestamps */}
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  Created: {new Date(selectedBooking.createdAt).toLocaleString()}
                </span>
                {selectedBooking.updatedAt && (
                  <span>
                    Updated:{" "}
                    {new Date(selectedBooking.updatedAt).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-3.5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  copyToClipboard(
                    JSON.stringify(selectedBooking, null, 2),
                    "audit-json"
                  );
                }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                {copiedCode === "audit-json" ? "✓ JSON Copied" : "Copy JSON Audit"}
              </button>

              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="rounded-xl bg-violet-600 px-5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-violet-700"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;