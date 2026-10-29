import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  getEventAttendees,
  checkInAttendee,
} from "../../api/bookingApi";

interface Attendee {
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
  };

  ticketType: string;
  quantity: number;
  totalAmount: number;

  bookingStatus: string;
  paymentStatus: string;

  ticketCode: string;
  paymentId: string;

  checkedIn: boolean;

  createdAt: string;
  updatedAt: string;
}

const Attendees = () => {
  const { eventId } = useParams();

  const [attendeeCount, setAttendeeCount] = useState(0);
  const [attendees, setAttendees] = useState<Attendee[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load attendees
  useEffect(() => {
    const loadAttendees = async () => {
      if (!eventId) {
        setError("Event ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await getEventAttendees(eventId);

        console.log(
          "Attendees response:",
          response.data
        );

        const data =
          response.data.attendees || [];

        setAttendees(
          Array.isArray(data) ? data : []
        );

        setAttendeeCount(
          response.data.count ??
            (Array.isArray(data)
              ? data.length
              : 0)
        );
      } catch (error: any) {
        console.error(
          "Failed to load attendees:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Failed to load attendees"
        );
      } finally {
        setLoading(false);
      }
    };

    loadAttendees();
  }, [eventId]);

  // Check in attendee
  const handleCheckIn = async (
    bookingId: string
  ) => {
    try {
      setError("");

      await checkInAttendee(bookingId);

      setAttendees((previous) =>
        previous.map((attendee) =>
          attendee._id === bookingId
            ? {
                ...attendee,
                checkedIn: true,
              }
            : attendee
        )
      );
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Check-in failed"
      );
    }
  };

  // Export attendees as CSV
  const exportAttendees = () => {
    if (attendees.length === 0) {
      return;
    }

    const headers = [
      "Name",
      "Email",
      "Event",
      "Ticket Type",
      "Quantity",
      "Total Amount",
      "Booking Status",
      "Payment Status",
      "Attendance",
      "Ticket Code",
      "Payment ID",
      "Booking Date",
    ];

    const rows = attendees.map(
      (attendee) => [
        attendee.user.name,
        attendee.user.email,
        attendee.event.title,
        attendee.ticketType,
        attendee.quantity,
        attendee.totalAmount,
        attendee.bookingStatus,
        attendee.paymentStatus,
        attendee.checkedIn
          ? "Checked In"
          : "Not Checked In",
        attendee.ticketCode,
        attendee.paymentId,
        new Date(
          attendee.createdAt
        ).toLocaleString(),
      ]
    );

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(
                value ?? ""
              ).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csvContent],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      "event-attendees.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const checkedInCount =
    attendees.filter(
      (attendee) =>
        attendee.checkedIn
    ).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading attendees...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 px-4 py-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="text-3xl font-bold">
              Event Attendees
            </h1>

            <p className="mt-2 text-slate-500">
              Manage attendees registered
              for this event.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">

            <button
              onClick={exportAttendees}
              disabled={
                attendees.length === 0
              }
              className="rounded-xl bg-violet-600 px-5 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Export CSV
            </button>

            <Link
              to="/organizer/events"
              className="rounded-lg border bg-white px-5 py-3 text-center font-medium hover:bg-slate-50/70"
            >
              Back to Events
            </Link>

          </div>
        </div>

        {/* Error */}

        {error && (
          <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Summary */}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/60">
            <p className="text-sm text-slate-500">
              Total Attendees
            </p>

            <p className="mt-2 text-3xl font-bold">
              {attendeeCount}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/60">
            <p className="text-sm text-slate-500">
              Confirmed
            </p>

            <p className="mt-2 text-3xl font-bold">
              {
                attendees.filter(
                  (attendee) =>
                    attendee.bookingStatus ===
                    "confirmed"
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/60">
            <p className="text-sm text-slate-500">
              Paid
            </p>

            <p className="mt-2 text-3xl font-bold">
              {
                attendees.filter(
                  (attendee) =>
                    attendee.paymentStatus ===
                    "paid"
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/60">
            <p className="text-sm text-slate-500">
              Checked In
            </p>

            <p className="mt-2 text-3xl font-bold">
              {checkedInCount}
            </p>
          </div>

        </div>

        {/* Attendee Table */}

        {attendees.length === 0 ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-10 text-center shadow-sm shadow-slate-200/60">

            <h2 className="text-xl font-semibold">
              No attendees yet
            </h2>

            <p className="mt-2 text-slate-500">
              No bookings have been made
              for this event.
            </p>

          </div>
        ) : (
          <div className="overflow-hidden rounded-xl bg-white shadow-sm">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1100px]">

                <thead className="border-b bg-slate-50/70">
                  <tr>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Attendee
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Ticket
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Quantity
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Ticket Code
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Booking
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Payment
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Attendance
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {attendees.map(
                    (attendee) => (

                      <tr
                        key={attendee._id}
                        className="border-b last:border-b-0"
                      >

                        <td className="px-6 py-4">

                          <p className="font-medium">
                            {
                              attendee.user
                                .name
                            }
                          </p>

                          <p className="text-sm text-slate-500">
                            {
                              attendee.user
                                .email
                            }
                          </p>

                        </td>

                        <td className="px-6 py-4">
                          {
                            attendee.ticketType
                          }
                        </td>

                        <td className="px-6 py-4">
                          {attendee.quantity}
                        </td>

                        <td className="px-6 py-4">
                          ₹
                          {
                            attendee.totalAmount
                          }
                        </td>

                        <td className="px-6 py-4">

                          <span className="font-mono text-sm">
                            {
                              attendee.ticketCode
                            }
                          </span>

                        </td>

                        <td className="px-6 py-4">

                          <StatusBadge
                            status={
                              attendee.bookingStatus
                            }
                          />

                        </td>

                        <td className="px-6 py-4">

                          <StatusBadge
                            status={
                              attendee.paymentStatus
                            }
                          />

                        </td>

                        <td className="px-6 py-4">

                          {attendee.checkedIn ? (

                            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium">
                              Checked In
                            </span>

                          ) : (

                            <button
                              type="button"
                              onClick={() =>
                                handleCheckIn(
                                  attendee._id
                                )
                              }
                              className="rounded-xl bg-violet-600 px-4 py-2 text-sm text-white"
                            >
                              Check In
                            </button>

                          )}

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

interface StatusBadgeProps {
  status?: string;
}

const StatusBadge = ({
  status,
}: StatusBadgeProps) => {
  if (!status) {
    return (
      <span className="text-slate-400">
        -
      </span>
    );
  }

  const formattedStatus =
    status.charAt(0).toUpperCase() +
    status.slice(1);

  return (
    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">
      {formattedStatus}
    </span>
  );
};

export default Attendees;