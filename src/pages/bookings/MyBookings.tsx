import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getMyBookings } from "../../api/bookingApi";

interface Booking {
  _id: string;
  ticketType: string;
  quantity: number;
  totalAmount: number;
  bookingStatus: string;
  paymentStatus: string;

  event?: {
    _id: string;
    title: string;
    eventDate: string;
    location: string;
  };
}

const MyBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const response = await getMyBookings();

        const data =
          response.data.bookings || response.data.data || response.data;

        setBookings(Array.isArray(data) ? data : []);
      } catch (error: any) {
        setError(error.response?.data?.message || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  const getEventDate = (date?: string) => {
    if (!date) return null;

    return new Date(date);
  };

  const upcomingBookings = bookings.filter((booking) => {
    const date = getEventDate(booking.event?.eventDate);

    return date && date >= new Date() && booking.bookingStatus !== "cancelled";
  });

  const pastBookings = bookings.filter((booking) => {
    const date = getEventDate(booking.event?.eventDate);

    return date && date < new Date() && booking.bookingStatus !== "cancelled";
  });

  const cancelledBookings = bookings.filter(
    (booking) => booking.bookingStatus === "cancelled",
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading bookings...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Bookings</h1>

          <p className="mt-2 text-slate-500">
            Manage your event registrations and tickets.
          </p>
        </div>

        {/* Error */}

        {error && (
          <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Upcoming */}

        <BookingSection
          title="Upcoming Events"
          bookings={upcomingBookings}
          emptyMessage="You don't have any upcoming events."
        />

        {/* Past */}

        <BookingSection
          title="Past Events"
          bookings={pastBookings}
          emptyMessage="You don't have any past events."
        />

        {/* Cancelled */}

        <BookingSection
          title="Cancelled"
          bookings={cancelledBookings}
          emptyMessage="You don't have any cancelled bookings."
        />
      </div>
    </div>
  );
};

interface BookingSectionProps {
  title: string;
  bookings: Booking[];
  emptyMessage: string;
}

const BookingSection = ({
  title,
  bookings,
  emptyMessage,
}: BookingSectionProps) => {
  return (
    <section className="mb-10">
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>

      {bookings.length === 0 ? (
        <div className="rounded-xl bg-white p-6 text-slate-500 shadow-sm">
          {emptyMessage}
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/60"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                {/* Event */}

                <div>
                  <h3 className="text-lg font-semibold">
                    {booking.event?.title || "Event"}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {booking.event?.location || "-"}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {booking.event?.eventDate
                      ? new Date(booking.event.eventDate).toLocaleDateString()
                      : "-"}
                  </p>
                </div>

                {/* Booking information */}

                <div className="space-y-1 text-sm">
                  <p>
                    Ticket: <strong>{booking.ticketType}</strong>
                  </p>

                  <p>
                    Quantity: <strong>{booking.quantity}</strong>
                  </p>

                  <p>
                    Amount: <strong>₹{booking.totalAmount}</strong>
                  </p>

                  <p>
                    Booking: <strong>{booking.bookingStatus}</strong>
                  </p>

                  <p>
                    Payment: <strong>{booking.paymentStatus}</strong>
                  </p>
                </div>

                {/* Actions */}

                <div className="flex flex-wrap gap-2">
                  {/* Details */}

                  <Link
                    to={`/bookings/${booking._id}`}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50"
                  >
                    Details
                  </Link>

                  {/* Ticket */}

                  {booking.paymentStatus === "paid" &&
                    booking.bookingStatus !== "cancelled" && (
                      <Link
                        to={`/bookings/${booking._id}/ticket`}
                        className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700"
                      >
                        View Ticket
                      </Link>
                    )}

                  {/* Feedback / Review */}
                  {booking.bookingStatus === "confirmed" &&
                    booking.paymentStatus === "paid" &&
                    booking.event?._id && (
                      <Link
                        to={`/events/${booking.event._id}/feedback`}
                        className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
                      >
                        ★ Review Event
                      </Link>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default MyBookings;
