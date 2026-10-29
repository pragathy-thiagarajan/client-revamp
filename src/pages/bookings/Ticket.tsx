import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getBooking } from "../../api/bookingApi";
import { getTicketQR } from "../../api/ticketApi";
import { generateTicketPdf } from "../../utils/ticketPdf";

interface Booking {
  _id: string;
  ticketType: string;
  quantity: number;
  totalAmount: number;
  bookingStatus: string;
  paymentStatus: string;
  ticketCode?: string;
  user?: {
    name?: string;
    email?: string;
  };
  event?: {
    _id?: string;
    title: string;
    eventDate: string;
    startTime?: string;
    endTime?: string;
    location: string;
    bannerImage?: string;
    category?: string;
  };
}

const Ticket = () => {
  const { id } = useParams();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [qrCode, setQrCode] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadTicket = async () => {
      if (!id) return;

      try {
        setLoading(true);

        const [bookingResponse, qrResponse] = await Promise.all([
          getBooking(id),
          getTicketQR(id).catch(() => ({ data: { qrCode: "" } })),
        ]);

        const bookingData =
          bookingResponse.data.booking || bookingResponse.data;
        setBooking(bookingData);

        if (qrResponse?.data?.qrCode) {
          setQrCode(qrResponse.data.qrCode);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load ticket");
      } finally {
        setLoading(false);
      }
    };

    loadTicket();
  }, [id]);

  const handleDownload = async () => {
    if (!id || !booking) return;

    try {
      setDownloading(true);
      setError("");

      await generateTicketPdf({
        eventTitle: booking.event?.title || "Event Experience",
        category: booking.event?.category,
        eventDate: booking.event?.eventDate || "",
        startTime: booking.event?.startTime,
        endTime: booking.event?.endTime,
        location: booking.event?.location || "Venue announced soon",
        ticketType: booking.ticketType || "General Admission",
        quantity: booking.quantity || 1,
        totalAmount: booking.totalAmount || 0,
        ticketCode: booking.ticketCode || booking._id,
        bookingId: booking._id,
        bookingStatus: booking.bookingStatus || "confirmed",
        paymentStatus: booking.paymentStatus || "paid",
        attendeeName: booking.user?.name || "Verified Attendee",
        attendeeEmail: booking.user?.email || "",
        qrCodeUrl: qrCode,
      });
    } catch (err: any) {
      setError(err?.message || "Failed to download PDF ticket");
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyCode = () => {
    if (booking?.ticketCode) {
      navigator.clipboard.writeText(booking.ticketCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (date?: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDay = (date?: string) => {
    if (!date) return "--";
    return new Date(date).toLocaleDateString("en-IN", { day: "2-digit" });
  };

  const formatMonth = (date?: string) => {
    if (!date) return "---";
    return new Date(date).toLocaleDateString("en-IN", { month: "short" }).toUpperCase();
  };

  const formatTime = (time?: string) => {
    if (!time) return "-";
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(Number(hours));
    date.setMinutes(Number(minutes));
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
          <p className="mt-4 text-sm font-semibold text-slate-600">
            Generating your admission pass...
          </p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl font-bold text-red-600">
            !
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            Ticket not found
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {error || "We couldn't locate this ticket pass in your bookings."}
          </p>
          <Link
            to="/bookings"
            className="mt-6 inline-block rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700"
          >
            Back to My Bookings
          </Link>
        </div>
      </div>
    );
  }

  const isConfirmed = booking.bookingStatus === "confirmed";
  const isPaid = booking.paymentStatus === "paid";

  return (
    <div className="min-h-screen bg-slate-50/80 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        {/* Navigation & Toolbar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link
            to="/bookings"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-violet-600 transition hover:text-violet-800"
          >
            ← My Bookings
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              🖨️ Print Ticket
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-violet-700 disabled:opacity-50"
            >
              📥 {downloading ? "Generating PDF..." : "Download PDF"}
            </button>
          </div>
        </div>

        {/* Master Ticket Card */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70">
          {/* Header Banner */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-violet-950 to-violet-800 px-6 py-8 text-white sm:px-10 sm:py-10">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl" />
            <div className="absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-fuchsia-500/20 blur-3xl" />

            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-xs font-black ring-1 ring-white/20">
                    E
                  </span>
                  <span className="font-bold tracking-wider text-xs uppercase text-violet-200">
                    EforEvent Official Pass
                  </span>
                </div>

                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
                  Admit One · {booking.ticketType}
                </p>

                <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl text-white">
                  {booking.event?.title || "Event Experience"}
                </h1>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-200 ring-1 ring-emerald-400/30">
                    ✓ {isConfirmed ? "Confirmed Entry" : booking.bookingStatus}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-violet-100 ring-1 ring-white/20">
                    ● {isPaid ? "Payment Verified" : booking.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Date Box */}
              <div className="flex sm:flex-col items-center justify-center rounded-2xl bg-white/10 px-5 py-3.5 backdrop-blur ring-1 ring-white/20 text-center min-w-[90px]">
                <p className="text-xs font-bold uppercase tracking-wider text-violet-200">
                  {formatMonth(booking.event?.eventDate)}
                </p>
                <p className="text-3xl font-black text-white leading-tight">
                  {formatDay(booking.event?.eventDate)}
                </p>
                <p className="text-[10px] font-semibold text-violet-200">
                  {new Date(booking.event?.eventDate || "").getFullYear() || "2026"}
                </p>
              </div>
            </div>
          </div>

          {/* Ticket Information Section */}
          <div className="p-6 sm:p-10">
            {/* Primary Details Grid */}
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Date
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {formatDate(booking.event?.eventDate)}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Schedule
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {booking.event?.startTime
                    ? `${formatTime(booking.event.startTime)} - ${formatTime(booking.event.endTime)}`
                    : "Full Day"}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Quantity
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {booking.quantity} {booking.quantity === 1 ? "Ticket" : "Tickets"}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Total Paid
                </p>
                <p className="mt-1 text-sm font-black text-violet-700">
                  ₹{Number(booking.totalAmount).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Venue Location
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                📍 {booking.event?.location || "Venue details to be announced"}
              </p>
            </div>

            {/* Perforated Tear-off line with notches */}
            <div className="relative my-8 -mx-6 sm:-mx-10">
              <div className="border-t-2 border-dashed border-slate-300" />
              <div className="absolute -left-4 -top-3.5 h-7 w-7 rounded-full bg-slate-50 border-r border-slate-300" />
              <div className="absolute -right-4 -top-3.5 h-7 w-7 rounded-full bg-slate-50 border-l border-slate-300" />
            </div>

            {/* Scanner / QR & Barcode Section */}
            <div className="grid gap-6 sm:grid-cols-[160px_1fr] items-center">
              {/* QR Box */}
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-violet-100 bg-violet-50/50 p-4 text-center">
                {qrCode ? (
                  <img
                    src={qrCode}
                    alt="Ticket QR Code"
                    className="h-28 w-28 rounded-lg object-contain shadow-sm"
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-lg bg-white p-2 shadow-sm border border-slate-200">
                    <svg viewBox="0 0 100 100" className="h-full w-full">
                      <rect width="100" height="100" fill="#ffffff" />
                      <rect x="5" y="5" width="30" height="30" fill="#7c3aed" />
                      <rect x="65" y="5" width="30" height="30" fill="#7c3aed" />
                      <rect x="5" y="65" width="30" height="30" fill="#7c3aed" />
                      <rect x="12" y="12" width="16" height="16" fill="#ffffff" />
                      <rect x="72" y="12" width="16" height="16" fill="#ffffff" />
                      <rect x="12" y="72" width="16" height="16" fill="#ffffff" />
                      <rect x="42" y="10" width="16" height="35" fill="#0f172a" />
                      <rect x="42" y="55" width="45" height="12" fill="#0f172a" />
                      <rect x="55" y="75" width="35" height="15" fill="#0f172a" />
                    </svg>
                  </div>
                )}
                <span className="mt-2 text-[10px] font-bold uppercase tracking-wider text-violet-600">
                  Scan at Entrance
                </span>
              </div>

              {/* Barcode & Code Details */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Ticket Reference Code
                  </span>
                  <button
                    onClick={handleCopyCode}
                    type="button"
                    className="text-xs font-semibold text-violet-600 hover:text-violet-800"
                  >
                    {copied ? "✓ Copied" : "Copy Code"}
                  </button>
                </div>

                <p className="mt-1 font-mono text-xl font-black tracking-widest text-slate-900 sm:text-2xl">
                  {booking.ticketCode || booking._id}
                </p>

                {/* Stylized Barcode SVG */}
                <div className="mt-3 h-10 w-full overflow-hidden rounded bg-slate-50 p-1.5 border border-slate-200 flex items-center justify-between gap-1">
                  {[4, 2, 5, 1, 3, 6, 2, 4, 1, 5, 2, 3, 6, 1, 4, 2, 5, 3, 1, 6, 2, 4, 5, 1, 3].map(
                    (w, i) => (
                      <div
                        key={i}
                        className="h-full bg-slate-900"
                        style={{ width: `${w * 1.5}px` }}
                      />
                    )
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-slate-500">
                  <span>Attendee: {booking.user?.name || "Verified Attendee"}</span>
                  <span>Booking ID: {booking._id}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100 print:hidden">
              {booking.event?._id && (
                <Link
                  to={`/events/${booking.event._id}/feedback`}
                  className="flex-1 rounded-xl border border-violet-200 bg-violet-50/70 px-4 py-3 text-center text-xs font-bold text-violet-700 transition hover:bg-violet-100"
                >
                  ★ Rate & Review This Event
                </Link>
              )}
              <Link
                to={`/bookings/${booking._id}`}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-center text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Booking Details & Transfer
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400 print:hidden">
          Please present this digital ticket or printout at the event registration counter. Powered by EforEvent.
        </p>
      </div>
    </div>
  );
};

export default Ticket;
