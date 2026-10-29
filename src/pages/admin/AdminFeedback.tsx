import { useEffect, useState } from "react";

import { getAdminFeedbackReport } from "../../api/feedbackApi";

interface FeedbackItem {
  _id: string;

  user: {
    name: string;
    email: string;
  };

  event: {
    title: string;
  };

  rating: number;
  comment: string;
  createdAt: string;
}

interface Summary {
  totalFeedback: number;
  averageRating: number;

  ratingBreakdown: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

const StarRating = ({
  rating,
  size = "text-lg",
}: {
  rating: number;
  size?: string;
}) => {
  return (
    <div
      className={`flex gap-0.5 ${size}`}
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={
            star <= Math.round(rating) ? "text-amber-400" : "text-slate-200"
          }
        >
          ★
        </span>
      ))}
    </div>
  );
};

const AdminFeedback = () => {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);

  const [summary, setSummary] = useState<Summary | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        const response = await getAdminFeedbackReport();

        setSummary(response.data.summary);

        setFeedback(response.data.feedback || []);
      } catch (error: any) {
        setError(error.response?.data?.message || "Failed to load feedback");
      } finally {
        setLoading(false);
      }
    };

    loadFeedback();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading attendee feedback...
          </p>
        </div>
      </div>
    );
  }

  const totalRatings = summary?.totalFeedback || 0;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}

        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-violet-600">
            Feedback Report
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            Attendee Feedback
          </h1>

          <p className="mt-2 text-slate-500">
            Review attendee ratings and comments across events.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Summary */}

        {summary && (
          <div className="mt-8 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
            {/* Overall rating */}

            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">
                Overall Rating
              </p>

              <div className="mt-3 flex items-end gap-2">
                <span className="text-5xl font-black tracking-tight text-slate-950">
                  {Number(summary.averageRating).toFixed(1)}
                </span>

                <span className="mb-1 text-lg font-semibold text-slate-400">
                  / 5
                </span>
              </div>

              <div className="mt-3">
                <StarRating rating={summary.averageRating} size="text-2xl" />
              </div>

              <p className="mt-4 text-sm text-slate-500">
                Based on{" "}
                <span className="font-bold text-slate-800">
                  {summary.totalFeedback}
                </span>{" "}
                attendee {summary.totalFeedback === 1 ? "review" : "reviews"}
              </p>
            </div>

            {/* Breakdown */}

            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Rating Breakdown</p>

                  <p className="mt-1 text-sm text-slate-500">
                    Distribution of attendee ratings
                  </p>
                </div>

                <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
                  {summary.totalFeedback} Total
                </span>
              </div>

              <div className="mt-6 space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count =
                    summary.ratingBreakdown[
                      rating as keyof typeof summary.ratingBreakdown
                    ] || 0;

                  const percentage =
                    totalRatings > 0 ? (count / totalRatings) * 100 : 0;

                  return (
                    <div
                      key={rating}
                      className="grid grid-cols-[45px_1fr_35px] items-center gap-3"
                    >
                      <span className="text-sm font-semibold text-slate-600">
                        {rating} ★
                      </span>

                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-amber-400 transition-all"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>

                      <span className="text-right text-sm font-semibold text-slate-500">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Reviews */}

        <div className="mt-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Recent Reviews
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Feedback submitted by attendees.
              </p>
            </div>
          </div>

          {feedback.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-violet-50 text-xl">
                ★
              </div>

              <h3 className="mt-4 font-bold text-slate-900">No feedback yet</h3>

              <p className="mt-1 text-sm text-slate-500">
                Attendee reviews will appear here once they are submitted.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              {feedback.map((item) => (
                <article
                  key={item._id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* Event + rating */}

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-flex rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
                        {item.event.title}
                      </span>

                      <div className="mt-3">
                        <StarRating rating={item.rating} />
                      </div>
                    </div>

                    <span className="rounded-xl bg-amber-50 px-3 py-2 text-sm font-black text-amber-700">
                      {item.rating}/5
                    </span>
                  </div>

                  {/* Comment */}

                  {item.comment ? (
                    <p className="mt-5 leading-7 text-slate-600">
                      “{item.comment}”
                    </p>
                  ) : (
                    <p className="mt-5 italic text-slate-400">
                      No written comment provided.
                    </p>
                  )}

                  {/* Reviewer */}

                  <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 font-bold uppercase text-violet-700">
                        {item.user.name?.charAt(0) || "U"}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {item.user.name}
                        </p>

                        <p className="truncate text-xs text-slate-500">
                          {item.user.email}
                        </p>
                      </div>
                    </div>

                    <time className="shrink-0 text-xs text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </time>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminFeedback;
