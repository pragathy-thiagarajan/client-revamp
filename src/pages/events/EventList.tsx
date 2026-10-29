import { useEffect, useState } from "react";

import EventCard from "../../components/events/EventCard";
import { getEvents } from "../../api/eventApi";
import type { Event } from "../../types/events";

const EventList = () => {
  const [events, setEvents] = useState<Event[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    location: "",
    date: "",
    minPrice: "",
    maxPrice: "",
  });

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getEvents({
        search: filters.search || undefined,
        category: filters.category || undefined,
        location: filters.location || undefined,
        date: filters.date || undefined,

        minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,

        maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
      });

      setEvents(response.data.events || []);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleApplyFilters = () => {
    loadEvents();
  };

  const handleClearFilters = async () => {
    const clearedFilters = {
      search: "",
      category: "",
      location: "",
      date: "",
      minPrice: "",
      maxPrice: "",
    };

    setFilters(clearedFilters);

    try {
      setLoading(true);
      setError("");

      const response = await getEvents();

      setEvents(response.data.events || []);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const activeFilterCount = [
    filters.search,
    filters.category,
    filters.location,
    filters.date,
    filters.minPrice,
    filters.maxPrice,
  ].filter(Boolean).length;

  return (
    <main className="min-h-screen bg-slate-50/70">
      {/* Header */}
      <section className="border-b border-slate-200/70 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <span className="soft-badge">Explore what’s happening</span>

          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-[-0.03em] text-slate-950 sm:text-5xl">
                Discover events
              </h1>

              <p className="mt-3 max-w-2xl text-lg text-slate-500">
                Find experiences that match your interests, schedule and
                location.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {!loading && !error && (
                <p className="text-sm font-semibold text-slate-500">
                  <span className="text-violet-700">{events.length}</span> event
                  {events.length === 1 ? "" : "s"} found
                </p>
              )}

              {/* Filter toggle button with filter icon */}
              <button
                type="button"
                onClick={() => setIsFilterOpen((prev) => !prev)}
                aria-expanded={isFilterOpen}
                className={`inline-flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition shadow-sm ${
                  isFilterOpen
                    ? "bg-violet-600 text-white hover:bg-violet-700"
                    : activeFilterCount > 0
                    ? "border-2 border-violet-500 bg-violet-50 text-violet-800 hover:bg-violet-100"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {/* Filter funnel icon */}
                <svg
                  className={`h-4 w-4 ${isFilterOpen ? "text-white" : activeFilterCount > 0 ? "text-violet-700" : "text-slate-500"}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>

                <span>{isFilterOpen ? "Hide Filters" : "Filter Events"}</span>

                {activeFilterCount > 0 && (
                  <span
                    className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold ${
                      isFilterOpen
                        ? "bg-white text-violet-700"
                        : "bg-violet-600 text-white"
                    }`}
                  >
                    {activeFilterCount}
                  </span>
                )}

                {/* Chevron icon */}
                <svg
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isFilterOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Active filter summary pill list (shows when filters are applied) */}
          {activeFilterCount > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Active filters:
              </span>
              {filters.search && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-800">
                  Search: "{filters.search}"
                  <button
                    type="button"
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, search: "" }));
                      setTimeout(() => loadEvents(), 0);
                    }}
                    className="hover:text-violet-950"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.category && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-800">
                  Category: {filters.category}
                  <button
                    type="button"
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, category: "" }));
                      setTimeout(() => loadEvents(), 0);
                    }}
                    className="hover:text-violet-950"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.location && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-800">
                  Location: {filters.location}
                  <button
                    type="button"
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, location: "" }));
                      setTimeout(() => loadEvents(), 0);
                    }}
                    className="hover:text-violet-950"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.date && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-800">
                  Date: {filters.date}
                  <button
                    type="button"
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, date: "" }));
                      setTimeout(() => loadEvents(), 0);
                    }}
                    className="hover:text-violet-950"
                  >
                    ×
                  </button>
                </span>
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-800">
                  Price: ₹{filters.minPrice || "0"} - ₹{filters.maxPrice || "Any"}
                  <button
                    type="button"
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, minPrice: "", maxPrice: "" }));
                      setTimeout(() => loadEvents(), 0);
                    }}
                    className="hover:text-violet-950"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs font-semibold text-rose-600 underline hover:text-rose-700"
              >
                Reset all
              </button>
            </div>
          )}

          {/* Collapsible Filters section: opens only when isFilterOpen is true */}
          {isFilterOpen && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition-all duration-200">
              <div className="mb-4 flex items-center justify-between border-b border-slate-200/80 pb-3">
                <div className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-violet-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                    Filter Options
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                  title="Close filters"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Search */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Search Keyword
                  </label>
                  <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleApplyFilters();
                    }}
                    placeholder="Search event title or summary..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={filters.location}
                    onChange={handleFilterChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleApplyFilters();
                    }}
                    placeholder="e.g. Chennai, Bangalore"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Category
                  </label>
                  <select
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                  >
                    <option value="">All Categories</option>
                    <option value="conference">Conference</option>
                    <option value="workshop">Workshop</option>
                    <option value="concert">Concert</option>
                    <option value="sports">Sports</option>
                    <option value="festival">Festival</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={filters.date}
                    onChange={handleFilterChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                  />
                </div>

                {/* Min Price */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Minimum Price (₹)
                  </label>
                  <input
                    type="number"
                    name="minPrice"
                    min="0"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleApplyFilters();
                    }}
                    placeholder="₹0"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                  />
                </div>

                {/* Max Price */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Maximum Price (₹)
                  </label>
                  <input
                    type="number"
                    name="maxPrice"
                    min="0"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleApplyFilters();
                    }}
                    placeholder="₹5000"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                  />
                </div>
              </div>

              {/* Filter buttons */}
              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-200/80 pt-4">
                <button
                  type="button"
                  onClick={handleApplyFilters}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-50"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Apply Filters
                </button>

                <button
                  type="button"
                  onClick={handleClearFilters}
                  disabled={loading}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  Clear Filters
                </button>

                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  className="ml-auto text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Close panel
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Events */}

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <div className="h-52 bg-slate-200" />

                <div className="space-y-3 p-5">
                  <div className="h-5 w-3/4 rounded bg-slate-200" />

                  <div className="h-4 w-full rounded bg-slate-100" />

                  <div className="h-4 w-2/3 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="surface-card py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-2xl">
              ⌕
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              No events found
            </h2>

            <p className="mt-2 text-slate-500">
              Try changing your search, category, location, date or price range.
            </p>

            <button
              type="button"
              onClick={handleClearFilters}
              className="mt-5 rounded-xl bg-violet-600 px-5 py-3 font-medium text-white hover:bg-violet-700"
            >
              Clear Filters
            </button>
          </div>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default EventList;
