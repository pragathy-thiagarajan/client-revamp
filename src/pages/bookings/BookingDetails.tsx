import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getBooking } from "../../api/bookingApi";
import { transferBooking } from "../../api/bookingApi";

interface Booking {
  _id: string;
  ticketType: string;
  quantity: number;
  totalAmount: number;
  bookingStatus: string;
  paymentStatus: string;
  ticketCode?: string;

  event?: {
    _id: string;
    title: string;
    eventDate: string;
    location: string;
  };
}

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();


  const [transferEmail, setTransferEmail] = useState("");
  const [transferring, setTransferring] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBooking = async () => {
      if (!id) return;

      try {
        const response = await getBooking(id);

        setBooking(response.data.booking || response.data);
      } catch (error: any) {
        setError(error.response?.data?.message || "Failed to load booking");
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading booking...
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-bold">Booking not found</h1>

        <p className="mt-2 text-red-500">{error}</p>
      </div>
    );
  }

  const handleTransfer = async () => {
    if (!id || !transferEmail.trim()) {
      setError("Recipient email is required");
      return;
    }

    try {
      setTransferring(true);
      setError("");
      setSuccessMessage("");

      await transferBooking(id, transferEmail);

      setSuccessMessage("Ticket transferred successfully");

      setTransferEmail("");

      setTimeout(() => {
        navigate("/my-bookings");
      }, 1200);
    } catch (error: any) {
      setError(error.response?.data?.message || "Ticket transfer failed");
    } finally {
      setTransferring(false);
    }
  };

  const paymentCompleted =
    booking.paymentStatus === "paid" ||
    booking.paymentStatus === "success" ||
    booking.paymentStatus === "successful";

  return (
    <div className="min-h-screen bg-slate-50/70 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-3xl font-bold">Booking Details</h1>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/60">
          <div className="mb-6 border-b pb-6">
            <h2 className="text-2xl font-semibold">{booking.event?.title}</h2>

            <p className="mt-2 text-slate-500">{booking.event?.location}</p>

            {booking.event?.eventDate && (
              <p className="mt-1 text-slate-500">
                {new Date(booking.event.eventDate).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-slate-500">Booking ID</span>

              <span className="font-medium">{booking._id}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Ticket</span>

              <span>{booking.ticketType}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Quantity</span>

              <span>{booking.quantity}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Amount</span>

              <span className="font-semibold">₹{booking.totalAmount}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Booking status</span>

              <span className="font-medium">
                {booking.bookingStatus === "confirmed" &&
                  booking.paymentStatus === "paid" && (
                    <div className="mt-8 border-t pt-6">
                      <h2 className="text-lg font-semibold">Transfer Ticket</h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Transfer this booking to another registered user.
                      </p>

                      {successMessage && (
                        <div className="mt-4 rounded-lg bg-green-100 p-3 text-green-700">
                          {successMessage}
                        </div>
                      )}

                      <input
                        type="email"
                        value={transferEmail}
                        onChange={(e) => setTransferEmail(e.target.value)}
                        placeholder="Recipient email"
                        className="mt-4 w-full rounded-lg border px-4 py-3"
                      />

                      <button
                        type="button"
                        onClick={handleTransfer}
                        disabled={transferring}
                        className="mt-3 w-full rounded-lg border border-black py-3 font-medium disabled:opacity-50"
                      >
                        {transferring ? "Transferring..." : "Transfer Ticket"}
                      </button>
                    </div>
                  )}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Payment status</span>
              <span className="font-medium">{booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}</span>
            </div>
          </div>

          {!paymentCompleted && (
            <Link
              to={`/bookings/${booking._id}/payment`}
              className="mt-8 block rounded-xl bg-violet-600 py-3 text-center font-medium text-white"
            >
              Proceed to Payment
            </Link>
          )}

          {paymentCompleted && (
            <Link
              to={`/bookings/${booking._id}/ticket`}
              className="mt-8 block rounded-xl bg-violet-600 py-3 text-center font-medium text-white"
            >
              View Ticket
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
