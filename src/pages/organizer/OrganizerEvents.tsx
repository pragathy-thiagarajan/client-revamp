import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getMyEvents, deleteEvent } from "../../api/eventApi";

interface Event {
  _id: string;
  title: string;
  category: string;
  location: string;
  eventDate: string;
  status: string;
}

const OrganizerEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyEvents();

      const data = response.data.events || response.data.data || response.data;

      setEvents(data);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event?",
    );

    if (!confirmed) return;

    try {
      await deleteEvent(id);

      setEvents((previousEvents) =>
        previousEvents.filter((event) => event._id !== id),
      );
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to delete event");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading events...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Events</h1>

            <p className="mt-2 text-slate-500">Create and manage your events.</p>
          </div>

          <Link
            to="/organizer/events/create"
            className="rounded-xl bg-violet-600 px-5 py-3 text-center font-medium text-white"
          >
            + Create Event
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        {events.length === 0 ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-10 text-center shadow-sm shadow-slate-200/60">
            <h2 className="text-xl font-semibold">No events yet</h2>

            <p className="mt-2 text-slate-500">
              Create your first event to get started.
            </p>

            <Link
              to="/organizer/events/create"
              className="mt-5 inline-block rounded-xl bg-violet-600 px-5 py-3 text-white"
            >
              Create Event
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event._id}
                className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/60"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{event.title}</h2>

                    <div className="mt-2 space-y-1 text-sm text-slate-500">
                      <p>Category: {event.category.charAt(0).toUpperCase() + event.category.slice(1)}</p>

                      <p>Location: {event.location}</p>

                      <p>
                        Date:{" "}
                        {event.eventDate
                          ? new Date(event.eventDate).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <StatusBadge status={event.status} />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/organizer/events/${event._id}/attendees`}
                      className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-slate-50/70 bg-yellow-200"
                    >
                      Attendees
                    </Link>
                    <Link
                      to={`/organizer/events/${event._id}/edit`}
                      className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-slate-50/70"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => handleDelete(event._id)}
                      className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const statusText = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-medium">
      {statusText}
    </span>
  );
};

export default OrganizerEvents;
