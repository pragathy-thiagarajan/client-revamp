import {
  useEffect,
  useState,
} from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import {
  getOrganizerAnalytics,
} from "../../api/analyticsApi";

interface EventAnalytics {
  eventId: string;
  title: string;
  ticketsSold: number;
  revenue: number;
  attendanceRate: number;
  bookings: number;
}

interface Summary {
  totalEvents: number;
  totalBookings: number;
  ticketsSold: number;
  revenue: number;
  checkedIn: number;
  attendanceRate: number;
}

const OrganizerAnalytics = () => {
  const [summary, setSummary] =
    useState<Summary | null>(null);

  const [events, setEvents] =
    useState<EventAnalytics[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadAnalytics =
      async () => {
        try {
          setLoading(true);

          const response =
            await getOrganizerAnalytics();

          setSummary(
            response.data.summary
          );

          setEvents(
            response.data.events || []
          );
        } catch (error: any) {
          setError(
            error.response?.data
              ?.message ||
              "Failed to load analytics"
          );
        } finally {
          setLoading(false);
        }
      };

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading analytics...
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="p-10 text-center">
        {error ||
          "Analytics unavailable"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 px-4 py-10">

      <div className="mx-auto max-w-7xl">

        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Event Analytics
          </h1>

          <p className="mt-2 text-slate-500">
            Track ticket sales,
            attendance and revenue.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            title="Events"
            value={summary.totalEvents}
          />

          <StatCard
            title="Tickets Sold"
            value={summary.ticketsSold}
          />

          <StatCard
            title="Revenue"
            value={`₹${summary.revenue.toLocaleString(
              "en-IN"
            )}`}
          />

          <StatCard
            title="Attendance Rate"
            value={`${summary.attendanceRate}%`}
          />

        </div>

        {/* Ticket Sales */}

        <ChartCard title="Ticket Sales by Event">

          <ResponsiveContainer
            width="100%"
            height={320}
          >
            <BarChart data={events}>

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="title"
                tick={{
                  fontSize: 12,
                }}
              />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="ticketsSold"
                fill="#111827"
                name="Tickets Sold"
              />

            </BarChart>
          </ResponsiveContainer>

        </ChartCard>

        {/* Revenue */}

        <ChartCard title="Revenue by Event">

          <ResponsiveContainer
            width="100%"
            height={320}
          >
            <BarChart data={events}>

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="title"
                tick={{
                  fontSize: 12,
                }}
              />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="revenue"
                fill="#111827"
                name="Revenue"
              />

            </BarChart>
          </ResponsiveContainer>

        </ChartCard>

        {/* Attendance */}

        <ChartCard title="Attendance Rate by Event">

          <ResponsiveContainer
            width="100%"
            height={320}
          >
            <BarChart data={events}>

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="title"
                tick={{
                  fontSize: 12,
                }}
              />

              <YAxis
                domain={[0, 100]}
              />

              <Tooltip />

              <Bar
                dataKey="attendanceRate"
                fill="#111827"
                name="Attendance %"
              />

            </BarChart>
          </ResponsiveContainer>

        </ChartCard>

      </div>
    </div>
  );
};

const StatCard = ({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) => {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/60">

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>

    </div>
  );
};

const ChartCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <section className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/60">

      <h2 className="mb-6 text-xl font-semibold">
        {title}
      </h2>

      {children}

    </section>
  );
};

export default OrganizerAnalytics;