import { Link } from "react-router-dom";
import type { Event } from "../../types/events";

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  const lowestPrice =
    event.ticketTypes?.length > 0
      ? Math.min(...event.ticketTypes.map((ticket) => ticket.price))
      : 0;

  const date = new Date(event.eventDate);
  const month = date.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const day = date.toLocaleDateString("en-US", { day: "2-digit" });

  return (
    <Link
      to={`/events/${event._id}`}
      className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/60 transition duration-300 hover:-translate-y-1.5 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-100/70"
    >
      <div className="relative h-52 overflow-hidden bg-gradient-to-br from-violet-100 via-slate-100 to-fuchsia-100">
        {event.bannerImage ? (
          <img
            src={event.bannerImage}
            alt={event.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 text-2xl shadow-sm">✦</div>
              <p className="mt-3 text-sm font-semibold text-slate-500">Event preview</p>
            </div>
          </div>
        )}

        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-violet-700 shadow-sm backdrop-blur">
          {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
        </span>

        <div className="absolute bottom-4 left-4 flex h-16 w-14 flex-col items-center justify-center rounded-2xl bg-white text-center shadow-lg shadow-slate-900/10">
          <span className="text-[10px] font-black tracking-wider text-violet-600">{month}</span>
          <span className="text-xl font-black text-slate-950">{day}</span>
        </div>
      </div>

      <div className="p-5">
        <h2 className="line-clamp-2 text-xl font-extrabold tracking-tight text-slate-950 transition group-hover:text-violet-700">
          {event.title}
        </h2>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
          {event.description}
        </p>

        <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">⌖</span>
          <span className="truncate">{event.location}</span>
        </div>

        <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Starting from</p>
            <p className="mt-1 text-lg font-black text-slate-950">₹{lowestPrice.toLocaleString("en-IN")}</p>
          </div>
          <span className="rounded-xl bg-violet-50 px-3 py-2 text-sm font-bold text-violet-700 transition group-hover:bg-violet-600 group-hover:text-white">
            View event →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
