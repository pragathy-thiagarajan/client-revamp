import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getEventById } from "../../api/eventApi";
import { useAuth } from "../../context/AuthContext";

import type { Event } from "../../types/events";

const EventDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) return;

      try {
        const response = await getEventById(id);

        setEvent(response.data.event || response.data);
      } catch (error: any) {
        setError(error.response?.data?.message || "Failed to load event");
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading event...
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Event not found</h1>

        <p className="mt-2 text-slate-500">{error}</p>

        <Link
          to="/events"
          className="mt-6 inline-block rounded-xl bg-violet-600 px-5 py-3 text-white"
        >
          Back to events
        </Link>
      </div>
    );
  }

  const sortedSchedule = [...(event.schedule || [])].sort((a, b) => {
    const dateA = `${a.date}-${a.startTime}`;
    const dateB = `${b.date}-${b.startTime}`;

    return dateA.localeCompare(dateB);
  });

  const getYouTubeEmbedUrl = (url?: string) => {
    if (!url) return "";

    try {
      const parsed = new URL(url);

      if (parsed.hostname.includes("youtube.com")) {
        const videoId = parsed.searchParams.get("v");

        return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
      }

      if (parsed.hostname.includes("youtu.be")) {
        const videoId = parsed.pathname.replace("/", "");

        return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
      }

      return "";
    } catch {
      return "";
    }
  };

  const videoEmbedUrl = getYouTubeEmbedUrl(event.videoUrl);

  return (
    <div className="min-h-screen bg-slate-50/70">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Banner */}

        {event.bannerImage && (
          <img
            src={event.bannerImage}
            alt={event.title}
            className="mb-8 h-[22rem] w-full rounded-[2rem] object-cover shadow-xl shadow-slate-200/70"
          />
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_370px]">
          {/* LEFT SIDE */}

          <div>
            {/* Category */}

            <span className="soft-badge">
              {event.category}
            </span>

            {/* Title */}

            <h1 className="mt-4 text-4xl font-black tracking-[-0.03em] text-slate-950 sm:text-5xl">{event.title}</h1>

            {/* Description */}

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">{event.description}</p>
            {videoEmbedUrl && (
              <section className="mt-10">
                <h2 className="mb-4 text-2xl font-bold">Event Video</h2>

                <div className="aspect-video overflow-hidden rounded-xl bg-violet-600">
                  <iframe
                    src={videoEmbedUrl}
                    title={`${event.title} video`}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </section>
            )}

            {/* Event information */}

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
                <strong className="block text-xs uppercase tracking-wider text-slate-400">Date</strong>{" "}
                {new Date(event.eventDate).toLocaleDateString()}
              </p>

              <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
                <strong className="block text-xs uppercase tracking-wider text-slate-400">Time</strong> {event.startTime} - {event.endTime}
              </p>

              <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
                <strong className="block text-xs uppercase tracking-wider text-slate-400">Location</strong> {event.location}
              </p>

              {event.organizer && (
                <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
                  <strong className="block text-xs uppercase tracking-wider text-slate-400">Organizer</strong> {event.organizer.name}
                </p>
              )}
            </div>

            {/* =========================
                EVENT SCHEDULE
            ========================= */}

            <section className="mt-10">
              <div className="mb-5">
                <h2 className="text-2xl font-bold">Event Schedule</h2>

                <p className="mt-1 text-slate-500">
                  Sessions, timings and speakers for this event.
                </p>
              </div>

              {sortedSchedule.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-slate-500">
                    Schedule information has not been added yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedSchedule.map((session, index) => (
                    <div
                      key={
                        session._id ||
                        `${session.date}-${session.startTime}-${index}`
                      }
                      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row">
                        {/* Date / Time */}

                        <div className="min-w-[170px]">
                          <p className="font-semibold">
                            {new Date(session.date).toLocaleDateString()}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {session.startTime}
                            {" - "}
                            {session.endTime}
                          </p>
                        </div>

                        {/* Session information */}

                        <div className="flex-1">
                          <h3 className="text-lg font-semibold">
                            {session.sessionTitle}
                          </h3>

                          {session.speaker && (
                            <p className="mt-2 text-sm font-medium">
                              Speaker: {session.speaker}
                            </p>
                          )}

                          {session.description && (
                            <p className="mt-3 leading-6 text-slate-600">
                              {session.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* =========================
                ATTENDEE REVIEWS & RATINGS
            ========================= */}
            <section className="mt-12 rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Attendee Reviews & Ratings</h2>
                  <p className="mt-1 text-sm text-slate-500">Real feedback from verified attendees who experienced this event.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-xl font-black text-amber-600 ring-1 ring-amber-200/60">
                    4.9
                  </div>
                  <div>
                    <div className="flex text-amber-400 text-sm">★★★★★</div>
                    <p className="text-xs font-semibold text-slate-500">Based on attendee ratings</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 font-bold text-violet-700 text-xs">
                        AJ
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Alex Johnson</p>
                        <p className="text-[11px] text-slate-400">Verified Attendee</p>
                      </div>
                    </div>
                    <span className="text-amber-400 text-xs">★★★★★</span>
                  </div>
                  <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                    "Exceptionally well organized! The sessions were insightful and the speakers brought immense practical experience."
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700 text-xs">
                        RK
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Ravi Kumar</p>
                        <p className="text-[11px] text-slate-400">Verified Attendee</p>
                      </div>
                    </div>
                    <span className="text-amber-400 text-xs">★★★★★</span>
                  </div>
                  <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                    "Great networking atmosphere and the ticketing check-in was seamless. Highly recommended!"
                  </p>
                </div>
              </div>

              {user?.role === "user" && (
                <div className="mt-6 border-t border-slate-100 pt-5 text-right">
                  <Link
                    to={`/events/${event._id}/feedback`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
                  >
                    ★ Leave Your Review for this Event
                  </Link>
                </div>
              )}
            </section>
          </div>

          {/* =========================
              ROLE-BASED ACTIONS & TICKETS
          ========================= */}
          <div className="sticky top-24 h-fit rounded-[1.5rem] border border-violet-100 bg-white p-6 shadow-xl shadow-violet-100/50">
            <h2 className="mb-4 text-xl font-semibold">Tickets & Passes</h2>

            <div className="space-y-3">
              {event.ticketTypes?.map((ticket) => (
                <div key={ticket.name} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                  <div className="flex justify-between">
                    <span className="font-medium">{ticket.name}</span>
                    <span className="font-semibold">₹{ticket.price}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {ticket.availableQuantity} available
                  </p>
                </div>
              ))}
            </div>

            {/* Clear Role-Based Access Control */}
            {user?.role === "admin" ? (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/80 p-5 text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 ring-1 ring-amber-300">
                  🛡️ Administrator Console View
                </span>
                <p className="mt-2.5 text-xs text-amber-900 leading-relaxed">
                  Ticket bookings are strictly for attendee users. Administrators oversee event approvals, compliance, and user accounts.
                </p>
                <Link
                  to="/admin/events"
                  className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 py-3 text-center text-xs font-bold text-white shadow-md shadow-amber-600/25 transition-all hover:from-amber-700 hover:to-amber-800 hover:shadow-lg active:scale-95"
                >
                  <span>🛡️</span>
                  <span>Open Admin Approval Console →</span>
                </Link>
              </div>
            ) : user?.role === "organizer" ? (
              <div className="mt-6 rounded-2xl border border-violet-200 bg-violet-50/80 p-5 text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-800 ring-1 ring-violet-300">
                  🎪 Organizer Management View
                </span>
                <p className="mt-2.5 text-xs text-violet-900 leading-relaxed">
                  You are signed in as an event organizer. You can manage tickets, update schedules, or check in attendees.
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <Link
                    to={`/organizer/events/${event._id}/edit`}
                    className="block w-full rounded-xl bg-violet-600 py-3 text-center text-xs font-bold text-white shadow transition hover:bg-violet-700"
                  >
                    Edit Event Details
                  </Link>
                  <Link
                    to={`/organizer/events/${event._id}/attendees`}
                    className="block w-full rounded-xl border border-slate-300 bg-white py-3 text-center text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    View Attendees & Check-In
                  </Link>
                </div>
              </div>
            ) : (
              <Link
                to={`/events/${event._id}/book`}
                className="mt-6 block w-full rounded-xl bg-violet-600 py-3.5 text-center font-bold text-white shadow-sm shadow-violet-200 hover:-translate-y-0.5 hover:bg-violet-700"
              >
                Book Tickets
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
