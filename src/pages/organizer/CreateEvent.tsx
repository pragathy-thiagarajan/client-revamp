import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createEvent } from "../../api/eventApi";
import { ImageUpload } from "../../components/events/ImageUpload";

interface TicketType {
  name: string;
  price: number;
  availableQuantity: number;
}

interface ScheduleItem {
  date: string;
  startTime: string;
  endTime: string;
  sessionTitle: string;
  description: string;
  speaker: string;
}

const CreateEvent = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    bannerImage: "",
    videoUrl: "",
  });

  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
    {
      name: "",
      price: 0,
      availableQuantity: 0,
    },
  ]);

  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // TICKET HANDLERS
  // =========================

  const handleTicketChange = (
    index: number,
    field: keyof TicketType,
    value: string,
  ) => {
    setTicketTypes((previous) =>
      previous.map((ticket, ticketIndex) => {
        if (ticketIndex !== index) {
          return ticket;
        }

        return {
          ...ticket,
          [field]: field === "name" ? value : Number(value),
        };
      }),
    );
  };

  const addTicketType = () => {
    setTicketTypes((previous) => [
      ...previous,
      {
        name: "",
        price: 0,
        availableQuantity: 0,
      },
    ]);
  };

  const removeTicketType = (index: number) => {
    if (ticketTypes.length === 1) return;

    setTicketTypes((previous) =>
      previous.filter((_, ticketIndex) => ticketIndex !== index),
    );
  };

  // =========================
  // SCHEDULE HANDLERS
  // =========================

  const addScheduleItem = () => {
    setSchedule((previous) => [
      ...previous,
      {
        date: form.eventDate || "",
        startTime: "",
        endTime: "",
        sessionTitle: "",
        description: "",
        speaker: "",
      },
    ]);
  };

  const handleScheduleChange = (
    index: number,
    field: keyof ScheduleItem,
    value: string,
  ) => {
    setSchedule((previous) =>
      previous.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        return {
          ...item,
          [field]: value,
        };
      }),
    );
  };

  const removeScheduleItem = (index: number) => {
    setSchedule((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    if (!form.title.trim()) {
      setError("Event title is required");
      return;
    }

    if (!form.description.trim()) {
      setError("Event description is required");
      return;
    }

    if (!form.category) {
      setError("Please select a category");
      return;
    }

    if (!form.location.trim()) {
      setError("Event location is required");
      return;
    }

    if (!form.eventDate) {
      setError("Event date is required");
      return;
    }

    if (!form.startTime || !form.endTime) {
      setError("Event start and end time are required");
      return;
    }

    if (
      ticketTypes.some(
        (ticket) =>
          !ticket.name.trim() ||
          ticket.price < 0 ||
          ticket.availableQuantity <= 0,
      )
    ) {
      setError("Please provide valid details for all ticket types");
      return;
    }

    // Validate schedule
    const invalidSchedule = schedule.some(
      (item) =>
        !item.date ||
        !item.startTime ||
        !item.endTime ||
        !item.sessionTitle.trim(),
    );

    if (invalidSchedule) {
      setError(
        "Please provide date, time and session title for all schedule items",
      );
      return;
    }

    try {
      setLoading(true);
      const ticketPayload = ticketTypes.map((ticket) => ({
        name: ticket.name,
        price: Number(ticket.price) || 0,
        quantity: Number(ticket.availableQuantity) || 50,
        availableQuantity: Number(ticket.availableQuantity) || 50,
      }));

      await createEvent({
        ...form,
        ticketTypes: ticketPayload,
        schedule,
      });

      navigate("/organizer/events");
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        {/* =========================
            HEADER
        ========================= */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create Event</h1>

          <p className="mt-2 text-slate-500">
            Create a new event for admin approval.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ERROR */}

          {error && (
            <div className="rounded-lg bg-red-100 p-4 text-red-700">
              {error}
            </div>
          )}

          {/* =========================
              EVENT INFORMATION
          ========================= */}

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/60">
            <h2 className="mb-5 text-xl font-semibold">Event Information</h2>

            <div className="space-y-5">
              {/* Title */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Event Title
                </label>

                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Enter event title"
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:border-violet-500"
                />
              </div>

              {/* Description */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Describe your event"
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:border-violet-500"
                />
              </div>

              {/* Category */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Category
                </label>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full rounded-lg border px-4 py-3"
                >
                  <option value="">Select category</option>
                  <option value="conference">Conference</option>
                  <option value="workshop">Workshop</option>
                  <option value="concert">Concert</option>
                  <option value="sports">Sports</option>
                  <option value="festival">Festival</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Location
                </label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Event venue / location"
                  className="w-full rounded-lg border px-4 py-3"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Event Video URL
                </label>

                <input
                  type="url"
                  name="videoUrl"
                  value={form.videoUrl}
                  onChange={handleChange}
                  placeholder="YouTube video URL"
                  className="w-full rounded-lg border px-4 py-3"
                />

                <p className="mt-1 text-xs text-slate-500">
                  Optional promotional video for the event.
                </p>
              </div>
              <div>
                <ImageUpload
                  value={form.bannerImage}
                  onChange={(bannerUrl) =>
                    setForm((prev) => ({ ...prev, bannerImage: bannerUrl }))
                  }
                />
              </div>
              {/* Date and time */}
              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Event Date
                  </label>
                  <input
                    type="date"
                    name="eventDate"
                    value={form.eventDate}
                    onChange={handleChange}
                    className="w-full rounded-lg border px-4 py-3"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={form.startTime}
                    onChange={handleChange}
                    className="w-full rounded-lg border px-4 py-3"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    End Time
                  </label>

                  <input
                    type="time"
                    name="endTime"
                    value={form.endTime}
                    onChange={handleChange}
                    className="w-full rounded-lg border px-4 py-3"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* =========================
              EVENT SCHEDULE
          ========================= */}

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/60">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">Event Schedule</h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add sessions, timings and speakers for your event.
                </p>
              </div>

              <button
                type="button"
                onClick={addScheduleItem}
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-slate-50/70"
              >
                + Add Session
              </button>
            </div>

            {schedule.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-slate-500">No sessions added yet.</p>

                <button
                  type="button"
                  onClick={addScheduleItem}
                  className="mt-3 text-sm font-medium underline"
                >
                  Add your first session
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {schedule.map((item, index) => (
                  <div key={index} className="rounded-xl border p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-semibold">Session {index + 1}</h3>

                      <button
                        type="button"
                        onClick={() => removeScheduleItem(index)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Date / Time */}

                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            Date
                          </label>

                          <input
                            type="date"
                            value={item.date}
                            onChange={(e) =>
                              handleScheduleChange(
                                index,
                                "date",
                                e.target.value,
                              )
                            }
                            className="w-full rounded-lg border px-4 py-3"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            Start Time
                          </label>

                          <input
                            type="time"
                            value={item.startTime}
                            onChange={(e) =>
                              handleScheduleChange(
                                index,
                                "startTime",
                                e.target.value,
                              )
                            }
                            className="w-full rounded-lg border px-4 py-3"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            End Time
                          </label>

                          <input
                            type="time"
                            value={item.endTime}
                            onChange={(e) =>
                              handleScheduleChange(
                                index,
                                "endTime",
                                e.target.value,
                              )
                            }
                            className="w-full rounded-lg border px-4 py-3"
                          />
                        </div>
                      </div>

                      {/* Session title */}

                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          Session Title
                        </label>

                        <input
                          value={item.sessionTitle}
                          onChange={(e) =>
                            handleScheduleChange(
                              index,
                              "sessionTitle",
                              e.target.value,
                            )
                          }
                          placeholder="e.g. Opening Keynote"
                          className="w-full rounded-lg border px-4 py-3"
                        />
                      </div>

                      {/* Speaker */}

                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          Speaker
                        </label>

                        <input
                          value={item.speaker}
                          onChange={(e) =>
                            handleScheduleChange(
                              index,
                              "speaker",
                              e.target.value,
                            )
                          }
                          placeholder="Speaker name"
                          className="w-full rounded-lg border px-4 py-3"
                        />
                      </div>

                      {/* Description */}

                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          Session Description
                        </label>

                        <textarea
                          value={item.description}
                          onChange={(e) =>
                            handleScheduleChange(
                              index,
                              "description",
                              e.target.value,
                            )
                          }
                          rows={3}
                          placeholder="Describe this session"
                          className="w-full rounded-lg border px-4 py-3"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* =========================
              TICKET TYPES
          ========================= */}

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/60">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Ticket Types</h2>

              <button
                type="button"
                onClick={addTicketType}
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-slate-50/70"
              >
                + Add Ticket
              </button>
            </div>

            <div className="space-y-4">
              {ticketTypes.map((ticket, index) => (
                <div key={index} className="rounded-lg border p-4">
                  <div className="grid gap-4 md:grid-cols-[1fr_150px_180px_auto]">
                    <input
                      value={ticket.name}
                      onChange={(e) =>
                        handleTicketChange(index, "name", e.target.value)
                      }
                      placeholder="Ticket name"
                      className="rounded-lg border px-4 py-3"
                    />

                    <input
                      type="number"
                      min="0"
                      value={ticket.price}
                      onChange={(e) =>
                        handleTicketChange(index, "price", e.target.value)
                      }
                      placeholder="Price"
                      className="rounded-lg border px-4 py-3"
                    />

                    <input
                      type="number"
                      min="1"
                      value={ticket.availableQuantity}
                      onChange={(e) =>
                        handleTicketChange(
                          index,
                          "availableQuantity",
                          e.target.value,
                        )
                      }
                      placeholder="Quantity"
                      className="rounded-lg border px-4 py-3"
                    />

                    <button
                      type="button"
                      onClick={() => removeTicketType(index)}
                      disabled={ticketTypes.length === 1}
                      className="rounded-lg border border-red-200 px-4 py-2 text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* =========================
              SUBMIT
          ========================= */}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/organizer/events")}
              className="rounded-lg border px-6 py-3 font-medium"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-violet-600 px-6 py-3 font-medium text-white disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
