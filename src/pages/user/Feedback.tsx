import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { submitFeedback } from "../../api/feedbackApi";
import { getEventById } from "../../api/eventApi";
import type { Event } from "../../types/events";

const ratingLabels: Record<number, { text: string; emoji: string; desc: string }> = {
  1: { text: "Poor", emoji: "😞", desc: "Did not meet expectations" },
  2: { text: "Fair", emoji: "😐", desc: "Several areas could improve" },
  3: { text: "Good", emoji: "🙂", desc: "Met expectations overall" },
  4: { text: "Very Good", emoji: "😊", desc: "Well organized and enjoyable" },
  5: { text: "Exceptional", emoji: "🤩", desc: "Outstanding experience!" },
};

const ASPECT_TAGS = [
  "Inspiring Keynotes",
  "Flawless Organization",
  "Great Networking",
  "Punctual Schedule",
  "Venue & Sound Quality",
  "Valuable Takeaways",
  "Friendly Staff",
  "Worth Every Rupee",
];

const Feedback = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedAspects, setSelectedAspects] = useState<string[]>([
    "Inspiring Keynotes",
    "Flawless Organization",
  ]);
  const [recommend, setRecommend] = useState<boolean>(true);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (eventId) {
      getEventById(eventId)
        .then((res) => {
          setEvent(res.data.event || res.data);
        })
        .catch(() => {
          // fallback silently
        });
    }
  }, [eventId]);

  const toggleAspect = (aspect: string) => {
    setSelectedAspects((prev) =>
      prev.includes(aspect)
        ? prev.filter((a) => a !== aspect)
        : [...prev, aspect]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!eventId) {
      setError("Event ID is missing");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const aspectSummary =
        selectedAspects.length > 0
          ? ` [Highlights: ${selectedAspects.join(", ")}]`
          : "";
      const recommendationText = recommend
        ? " (Recommends this event)"
        : " (Does not recommend)";
      const fullComment = `${comment.trim()}${aspectSummary}${recommendationText}`;

      await submitFeedback({
        eventId,
        rating,
        comment: fullComment,
      });

      setSubmitted(true);
      setTimeout(() => {
        navigate("/bookings");
      }, 1800);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  const displayedRating = hoverRating || rating;
  const currentFeedback = ratingLabels[displayedRating] || ratingLabels[5];

  if (submitted) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-3xl">
            🎉
          </div>
          <h2 className="mt-5 text-2xl font-black text-slate-900">
            Thank You for Your Feedback!
          </h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Your review helps organizers elevate future events and empowers fellow attendees to discover top experiences.
          </p>
          <div className="mt-6 flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-bold text-emerald-800">
              ✓ Review Recorded Successfully
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/bookings"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-violet-600 transition hover:text-violet-800"
        >
          ← Back to My Bookings
        </Link>

        <div className="mt-5 overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-violet-950 to-violet-800 px-6 py-8 text-white sm:px-10 sm:py-10">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

            <div className="relative">
              <span className="inline-flex rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider ring-1 ring-white/20">
                EforEvent Attendee Review
              </span>

              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                How was your experience?
              </h1>

              {event && (
                <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/10 p-3.5 backdrop-blur ring-1 ring-white/15">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 text-lg">
                    📅
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">
                      {event.title}
                    </p>
                    <p className="text-xs text-violet-200">
                      {event.location} · {new Date(event.eventDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            {/* Star Rating Section */}
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Overall Rating
              </p>
              <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/70 p-6 text-center">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      aria-label={`${star} stars`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="text-4xl sm:text-5xl leading-none transition hover:scale-125 focus:outline-none"
                    >
                      <span
                        className={
                          star <= displayedRating
                            ? "text-amber-400 drop-shadow-sm"
                            : "text-slate-200"
                        }
                      >
                        ★
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <span className="text-2xl">{currentFeedback.emoji}</span>
                  <p className="text-base font-black text-slate-900">
                    {currentFeedback.text}
                  </p>
                  <span className="text-xs text-slate-500">
                    ({displayedRating} of 5 stars)
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {currentFeedback.desc}
                </p>
              </div>
            </div>

            {/* Highlights Aspect Pills */}
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-slate-400">
                What stood out the most?
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Click tags to highlight key positives of the event:
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {ASPECT_TAGS.map((aspect) => {
                  const isSelected = selectedAspects.includes(aspect);
                  return (
                    <button
                      key={aspect}
                      type="button"
                      onClick={() => toggleAspect(aspect)}
                      className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                        isSelected
                          ? "bg-violet-600 text-white shadow-sm shadow-violet-200"
                          : "border border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:bg-slate-50"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "}
                      {aspect}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recommendation Toggle */}
            <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Would you recommend this event to peers?
                </p>
                <p className="text-xs text-slate-500">
                  Helps calculate the event's attendee recommendation index.
                </p>
              </div>
              <div className="flex rounded-xl border border-slate-200 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setRecommend(true)}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                    recommend
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Yes 👍
                </button>
                <button
                  type="button"
                  onClick={() => setRecommend(false)}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                    !recommend
                      ? "bg-slate-700 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  No 👎
                </button>
              </div>
            </div>

            {/* Comment Section */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="feedback-comment"
                  className="text-sm font-bold uppercase tracking-wider text-slate-400"
                >
                  Your Review
                </label>
                <span className="text-xs text-slate-400">
                  {comment.length}/500 characters
                </span>
              </div>

              <textarea
                id="feedback-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, 500))}
                rows={5}
                maxLength={500}
                required
                className="mt-3 w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                placeholder="Share key highlights, sessions you loved, or areas where the event could improve..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
              <Link
                to="/bookings"
                className="flex-1 rounded-xl border border-slate-200 py-3.5 text-center text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl bg-violet-600 py-3.5 text-center text-sm font-bold text-white shadow-md shadow-violet-200 transition hover:bg-violet-700 disabled:opacity-50"
              >
                {loading ? "Publishing Review..." : "Submit Review"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
