import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getEvents } from "../../api/eventApi";
import { getMyBookings } from "../../api/bookingApi";

interface Event {
  _id: string;
  title: string;
  status: string;
}

interface Booking {
  _id: string;
  totalAmount: number;
  bookingStatus: string;
}

const OrganizerDashboard = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [eventsResponse, bookingsResponse] = await Promise.all([
          getEvents(),
          getMyBookings(),
        ]);

        const eventData =
          eventsResponse.data.events ||
          eventsResponse.data.data ||
          eventsResponse.data;

        const bookingData =
          bookingsResponse.data.bookings ||
          bookingsResponse.data.data ||
          bookingsResponse.data;

        setEvents(Array.isArray(eventData) ? eventData : []);

        setBookings(Array.isArray(bookingData) ? bookingData : []);
      } catch (error: any) {
        console.error("Failed to load organizer dashboard", error);

        setError(error.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  /* -----------------------------
     Event Statistics
  ----------------------------- */

  const approvedEvents = useMemo(
    () => events.filter((event) => event.status === "approved"),
    [events],
  );

  /* -----------------------------
     Booking Statistics
  ----------------------------- */

  const confirmedBookings = useMemo(
    () => bookings.filter((booking) => booking.bookingStatus === "confirmed"),
    [bookings],
  );

  const cancelledBookings = useMemo(
    () => bookings.filter((booking) => booking.bookingStatus === "cancelled"),
    [bookings],
  );

  /* -----------------------------
     Revenue
  ----------------------------- */

  const totalRevenue = useMemo(
    () =>
      bookings.reduce((total, booking) => {
        if (booking.bookingStatus === "cancelled") {
          return total;
        }

        return total + Number(booking.totalAmount || 0);
      }, 0),
    [bookings],
  );

  /* -----------------------------
     Average Booking Value
  ----------------------------- */

  const averageBookingValue =
    confirmedBookings.length > 0 ? totalRevenue / confirmedBookings.length : 0;

  /* -----------------------------
     Loading
  ----------------------------- */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 px-4 py-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left */}
          <div>
            <h1 className="text-3xl font-bold">Organizer Dashboard</h1>

            <p className="mt-2 text-slate-500">
              Manage your events and track performance.
            </p>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <Link
              to="/organizer/events/create"
              className="rounded-xl bg-violet-600 px-5 py-3 text-center font-medium text-white hover:bg-violet-700"
            >
              + Create Event
            </Link>

            <Link
              to="/organizer/analytics"
              className="rounded-xl bg-amber-400 px-5 py-3 text-center font-medium text-white hover:bg-violet-700"
            >
              Analytics
            </Link>
          </div>
        </div>

        {/* Error */}

        {error && (
          <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Main Statistics */}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Events" value={events.length} />

          <StatCard title="Approved Events" value={approvedEvents.length} />

          <StatCard title="Total Bookings" value={bookings.length} />

          <StatCard
            title="Total Revenue"
            value={`₹${totalRevenue.toLocaleString("en-IN")}`}
          />
        </div>

        {/* Booking Analytics */}

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Confirmed Bookings"
            value={confirmedBookings.length}
          />

          <StatCard
            title="Cancelled Bookings"
            value={cancelledBookings.length}
          />

          <StatCard
            title="Average Booking Value"
            value={`₹${Math.round(averageBookingValue).toLocaleString(
              "en-IN",
            )}`}
          />
        </div>

        {/* Performance Overview */}

        <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/60">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Performance Overview</h2>

              <p className="mt-1 text-sm text-slate-500">
                Overview of your events and booking activity.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Event Overview */}

            <div className="rounded-lg border p-5">
              <h3 className="font-semibold">Event Overview</h3>

              <div className="mt-5 space-y-4">
                <ProgressRow
                  label="Total Events"
                  value={events.length}
                  total={Math.max(events.length, 1)}
                />

                <ProgressRow
                  label="Approved Events"
                  value={approvedEvents.length}
                  total={Math.max(events.length, 1)}
                />
              </div>
            </div>

            {/* Booking Overview */}

            <div className="rounded-lg border p-5">
              <h3 className="font-semibold">Booking Overview</h3>

              <div className="mt-5 space-y-4">
                <ProgressRow
                  label="Confirmed"
                  value={confirmedBookings.length}
                  total={Math.max(bookings.length, 1)}
                />

                <ProgressRow
                  label="Cancelled"
                  value={cancelledBookings.length}
                  total={Math.max(bookings.length, 1)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Events List */}

        <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/60">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Your Events</h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage and monitor your events.
              </p>
            </div>

            <Link
              to="/organizer/events"
              className="text-sm font-medium underline"
            >
              View All
            </Link>
          </div>

          {events.length === 0 ? (
            <div className="rounded-lg border p-8 text-center">
              <p className="text-slate-500">
                You haven't created any events yet.
              </p>

              <Link
                to="/organizer/events/create"
                className="mt-4 inline-block rounded-xl bg-violet-600 px-5 py-3 text-sm font-medium text-white"
              >
                Create Your First Event
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {events.slice(0, 5).map((event) => (
                <div
                  key={event._id}
                  className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h3 className="font-semibold">{event.title}</h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Status:{" "}
                      <span className="font-medium">{event.status}</span>
                    </p>
                  </div>

                  <Link
                    to={`/organizer/events/${event._id}/attendees`}
                    className="rounded-lg border px-4 py-2 text-center text-sm font-medium hover:bg-slate-50/70"
                  >
                    View Attendees
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}

        <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/60">
          <h2 className="mb-5 text-xl font-semibold">Quick Actions</h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              to="/organizer/events"
              className="bg-sky-100 rounded-lg border p-5 transition hover:bg-slate-50/70"
            >
              <h3 className="font-semibold">Manage Events</h3>

              <p className="mt-1 text-sm text-slate-500">
                Create, edit and manage your events.
              </p>
            </Link>

            <Link
              to="/organizer/events/create"
              className="bg-emerald-100 rounded-lg border p-5 transition hover:bg-slate-50/70"
            >
              <h3 className="font-semibold">Create Event</h3>

              <p className="mt-1 text-sm text-slate-500">
                Publish a new event for attendees.
              </p>
            </Link>

            <Link
              to="/organizer/events"
              className="bg-amber-100 rounded-lg border p-5 transition hover:bg-slate-50/70"
            >
              <h3 className="font-semibold">Attendees</h3>

              <p className="mt-1 text-sm text-slate-500">
                Select an event to view and manage attendees.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

/* --------------------------------
   Stat Card
-------------------------------- */

interface StatCardProps {
  title: string;
  value: string | number;
}

const StatCard = ({ title, value }: StatCardProps) => {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/60">
      <p className="text-sm text-slate-500">{title}</p>

      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
};

/* --------------------------------
   Progress Row
-------------------------------- */

interface ProgressRowProps {
  label: string;
  value: number;
  total: number;
}

const ProgressRow = ({ label, value, total }: ProgressRowProps) => {
  const percentage = Math.min(Math.round((value / total) * 100), 100);

  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-slate-600">{label}</span>

        <span className="font-medium">{value}</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-violet-600"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
};

export default OrganizerDashboard;