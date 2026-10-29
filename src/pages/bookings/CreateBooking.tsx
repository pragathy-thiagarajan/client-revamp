import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getEventById } from "../../api/eventApi";
import { createBooking } from "../../api/bookingApi";
import { useAuth } from "../../context/AuthContext";

import type { Event, TicketType } from "../../types/events";

const CreateBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [selectedTicket, setSelectedTicket] =
    useState<TicketType | null>(null);
  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] =
    useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) return;

      try {
        const response = await getEventById(id);

        const data = response.data.event || response.data;

        setEvent(data);

        if (data.ticketTypes?.length > 0) {
          setSelectedTicket(data.ticketTypes[0]);
        }
      } catch (error: any) {
        setError(
          error.response?.data?.message ||
            "Failed to load event"
        );
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id]);

  const handleBooking = async () => {
    if (!event || !selectedTicket) {
      setError("Please select a ticket");
      return;
    }

    const avail = Number(
      selectedTicket.availableQuantity !== undefined && selectedTicket.availableQuantity !== null
        ? selectedTicket.availableQuantity
        : selectedTicket.quantity || 10
    );

    if (quantity > avail) {
      setError(`Only ${avail} tickets available for this ticket category`);
      return;
    }

    try {
      setBookingLoading(true);
      setError("");

      const response = await createBooking({
        eventId: event._id,
        ticketType: selectedTicket.name,
        quantity,
      });

      const booking =
        response.data.booking || response.data;

      navigate(`/bookings/${booking._id}`);
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Booking failed"
      );
    } finally {
      setBookingLoading(false);
    }
  };

  const { user } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (user && user.role !== "user") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-slate-50/70 px-4 py-16">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-3xl">
            🛡️
          </div>
          <h2 className="mt-5 text-2xl font-black text-slate-900">
            Booking Restricted
          </h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            You are signed in as an <strong>{user.role}</strong> ({user.name}). Under application role-based access control, ticket bookings are reserved exclusively for Attendee accounts.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <Link
              to={user.role === "admin" ? "/admin" : "/organizer"}
              className="rounded-xl bg-violet-600 py-3 text-sm font-bold text-white transition hover:bg-violet-700"
            >
              Return to {user.role === "admin" ? "Admin" : "Organizer"} Dashboard
            </Link>
            <Link
              to="/events"
              className="rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Browse Public Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-10 text-center">
        Event not found
      </div>
    );
  }

  const total =
    (selectedTicket?.price || 0) * quantity;

  return (
    <div className="min-h-screen bg-slate-50/70 px-4 py-10">
      <div className="mx-auto max-w-5xl">

        <h1 className="mb-2 text-3xl font-bold">
          Book Tickets
        </h1>

        <p className="mb-8 text-slate-500">
          {event.title}
        </p>

        {error && (
          <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_350px]">

          {/* Ticket selection */}

          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/60">

            <h2 className="mb-5 text-xl font-semibold">
              Select Ticket
            </h2>

            <div className="space-y-3">
              {event.ticketTypes?.map((ticket) => {
                const isSelected = selectedTicket?.name === ticket.name;
                const available = Number(
                  ticket.availableQuantity !== undefined && ticket.availableQuantity !== null
                    ? ticket.availableQuantity
                    : ticket.quantity || 50
                );
                const isSoldOut = available <= 0;

                return (
                  <button
                    key={ticket.name}
                    type="button"
                    disabled={isSoldOut}
                    onClick={() => {
                      setSelectedTicket(ticket);
                      const maxForThis = Math.max(1, Math.min(available, 10));
                      setQuantity((prev) => Math.min(prev, maxForThis) || 1);
                      setError("");
                    }}
                    className={`relative w-full rounded-2xl border p-5 text-left transition-all ${
                      isSelected
                        ? "border-violet-600 bg-violet-50/50 shadow-md shadow-violet-100 ring-2 ring-violet-500/30"
                        : isSoldOut
                        ? "border-slate-200 bg-slate-50/60 opacity-60 cursor-not-allowed"
                        : "border-slate-200 bg-white hover:border-violet-300 hover:bg-slate-50/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition ${
                            isSelected
                              ? "border-violet-600 bg-violet-600"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected && (
                            <div className="h-2 w-2 rounded-full bg-white" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">
                            {ticket.name}
                          </h3>
                          <div className="mt-1 flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${
                                isSoldOut
                                  ? "bg-rose-100 text-rose-700"
                                  : available < 10
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              {isSoldOut ? "Sold Out" : `✓ ${available} tickets available`}
                            </span>
                            <span className="text-xs text-slate-400">· Max 10 per order</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-2xl font-black text-slate-950">
                          ₹{Number(ticket.price).toLocaleString("en-IN")}
                        </span>
                        <p className="text-[11px] font-medium text-slate-400">per ticket</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedTicket && (() => {
              const available = Math.max(
                1,
                Number(
                  selectedTicket.availableQuantity !== undefined && selectedTicket.availableQuantity !== null
                    ? selectedTicket.availableQuantity
                    : selectedTicket.quantity || 10
                )
              );
              const maxAllowed = Math.max(1, Math.min(available, 10));
              const quickOptions = [1, 2, 3, 4, 5, 10].filter(
                (num, idx, arr) => num <= maxAllowed || (num === 10 && maxAllowed >= 6 && arr.indexOf(num) === idx)
              );
              if (!quickOptions.includes(maxAllowed) && maxAllowed > 1) {
                quickOptions.push(maxAllowed);
                quickOptions.sort((a, b) => a - b);
              }

              return (
                <div className="mt-8 border-t border-slate-100 pt-7">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                    <div>
                      <label className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <span>Select Ticket Quantity</span>
                        <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
                          {quantity} {quantity === 1 ? "ticket" : "tickets"}
                        </span>
                      </label>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Adjust using +/- buttons, quick chips, or enter any quantity up to {maxAllowed}
                      </p>
                    </div>

                    <div className="text-right text-xs font-semibold text-slate-600">
                      Subtotal: <span className="text-sm font-bold text-violet-700">₹{(Number(selectedTicket.price || 0) * quantity).toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  {/* Stepper + Input */}
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="inline-flex items-center rounded-2xl border-2 border-slate-200 bg-slate-50 p-1.5 shadow-inner">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-lg font-bold text-slate-700 shadow-sm transition hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        −
                      </button>

                      <div className="relative mx-1">
                        <input
                          type="number"
                          min={1}
                          max={maxAllowed}
                          value={quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (isNaN(val)) {
                              setQuantity(1);
                            } else {
                              setQuantity(Math.max(1, Math.min(val, maxAllowed)));
                            }
                            setError("");
                          }}
                          className="h-11 w-16 rounded-xl border border-transparent bg-transparent text-center text-lg font-black text-slate-900 focus:border-violet-500 focus:bg-white focus:outline-none"
                        />
                      </div>

                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => setQuantity((q) => Math.min(maxAllowed, q + 1))}
                        disabled={quantity >= maxAllowed}
                        className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-lg font-bold text-slate-700 shadow-sm transition hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>

                    {/* Quick Select Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-400 mr-1">Quick:</span>
                      {quickOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setQuantity(opt);
                            setError("");
                          }}
                          className={`h-9 min-w-[38px] rounded-xl px-2.5 text-xs font-bold transition ${
                            quantity === opt
                              ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                              : "border border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50/40"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>

                    {/* Alternative Dropdown Select for accessibility & flexibility */}
                    <div className="ml-auto flex items-center gap-2">
                      <label htmlFor="quantity-select" className="text-xs font-medium text-slate-500">
                        Dropdown:
                      </label>
                      <select
                        id="quantity-select"
                        value={quantity}
                        onChange={(e) => {
                          setQuantity(Number(e.target.value));
                          setError("");
                        }}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-sm focus:border-violet-500 focus:outline-none"
                      >
                        {Array.from({ length: maxAllowed }, (_, index) => index + 1).map((number) => (
                          <option key={number} value={number}>
                            {number} {number === 1 ? "Ticket" : "Tickets"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-500">
                    💡 You are purchasing <strong className="text-slate-800">{quantity} × {selectedTicket.name}</strong> pass for <strong className="text-slate-800">{event.title}</strong>.
                  </p>
                </div>
              );
            })()}
          </div>

          {/* Summary */}

          <div className="h-fit rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/60">

            <h2 className="mb-5 text-xl font-semibold">
              Booking Summary
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-500">
                  Event
                </span>

                <span className="max-w-[180px] text-right font-medium">
                  {event.title}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">
                  Ticket
                </span>

                <span>
                  {selectedTicket?.name || "-"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">
                  Quantity
                </span>

                <span>{quantity}</span>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleBooking}
              disabled={
                bookingLoading ||
                !selectedTicket ||
                (Number(selectedTicket.availableQuantity ?? selectedTicket.quantity ?? 10) <= 0)
              }
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 font-bold text-white shadow-lg shadow-violet-500/25 transition-all hover:from-violet-700 hover:to-indigo-700 hover:shadow-xl active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {bookingLoading
                ? "Creating booking..."
                : `Continue to Payment · ₹${total.toLocaleString("en-IN")}`}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBooking;