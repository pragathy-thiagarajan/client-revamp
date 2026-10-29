// In-memory & localStorage mock service for standalone / preview operation
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import type { Event } from "../types/events";

interface MockUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: "user" | "organizer" | "admin";
  status: "active" | "blocked";
  phone: string;
  profileImage: string;
  createdAt: string;
  updatedAt: string;
}

interface MockBooking {
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
    startTime?: string;
    endTime?: string;
    location: string;
    organizer?: string;
  };
  ticketType: string;
  quantity: number;
  totalAmount: number;
  bookingStatus: "confirmed" | "cancelled" | "pending";
  paymentStatus: "paid" | "pending" | "failed";
  ticketCode: string;
  paymentId?: string;
  checkedIn?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MockInquiry {
  _id: string;
  subject: string;
  message: string;
  status: "pending" | "answered" | "closed";
  adminResponse?: string;
  user?: { _id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

interface MockFeedback {
  _id: string;
  eventId: string;
  event?: { _id: string; title: string };
  user?: { _id: string; name: string; email: string };
  rating: number;
  comment: string;
  createdAt: string;
}

const STORAGE_KEYS = {
  USERS: "efor_mock_users",
  EVENTS: "efor_mock_events",
  BOOKINGS: "efor_mock_bookings",
  INQUIRIES: "efor_mock_inquiries",
  FEEDBACK: "efor_mock_feedback",
};

const defaultUsers: MockUser[] = [
  {
    _id: "user-eforevent",
    name: "EforEvent Attendee",
    email: "eforeventuser@yopmail.com",
    role: "user",
    status: "active",
    phone: "+91 9876543210",
    profileImage: "",
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
  },
  {
    _id: "organizer-eforevent",
    name: "EforEvent Organizer",
    email: "eforeventorg@yopmail.com",
    role: "organizer",
    status: "active",
    phone: "+91 9876543211",
    profileImage: "",
    createdAt: "2026-01-10T00:00:00.000Z",
    updatedAt: "2026-01-10T00:00:00.000Z",
  },
  {
    _id: "admin-pragathy",
    name: "Pragathy (Admin)",
    email: "pragathyt95@gmail.com",
    role: "admin",
    status: "active",
    phone: "+91 9876543212",
    profileImage: "",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    _id: "user-1",
    name: "Alex Johnson",
    email: "user@example.com",
    role: "user",
    status: "active",
    phone: "+91 9876543210",
    profileImage: "",
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
  },
  {
    _id: "organizer-1",
    name: "Sarah Miller",
    email: "organizer@example.com",
    role: "organizer",
    status: "active",
    phone: "+91 9876543211",
    profileImage: "",
    createdAt: "2026-01-10T00:00:00.000Z",
    updatedAt: "2026-01-10T00:00:00.000Z",
  },
  {
    _id: "admin-1",
    name: "Platform Admin",
    email: "admin@example.com",
    role: "admin",
    status: "active",
    phone: "+91 9876543212",
    profileImage: "",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

const defaultEvents: Event[] = [
  {
    _id: "event-1",
    title: "Global Tech & AI Summit 2026",
    description:
      "Join leading technologists, researchers, and innovators for keynotes, workshops, and high-impact networking on the future of AI and distributed systems.",
    category: "conference",
    location: "Bangalore International Exhibition Centre, Bangalore",
    eventDate: "2026-11-20T09:00:00.000Z",
    startTime: "09:00",
    endTime: "18:00",
    bannerImage:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    ticketTypes: [
      {
        name: "General Admission",
        price: 1500,
        quantity: 200,
        availableQuantity: 140,
      },
      { name: "VIP Pass", price: 4500, quantity: 50, availableQuantity: 18 },
    ],
    schedule: [
      {
        _id: "sch-1",
        date: "2026-11-20",
        startTime: "09:30",
        endTime: "11:00",
        sessionTitle: "Keynote: Next-Gen Neural Architectures",
        speaker: "Dr. Ananya Rao",
        description:
          "Exploration of scalable reasoning models and distributed inference frameworks.",
      },
      {
        _id: "sch-2",
        date: "2026-11-20",
        startTime: "11:30",
        endTime: "13:00",
        sessionTitle: "Hands-on Workshop: Edge AI Deployment",
        speaker: "Vikram Sen",
        description:
          "Building resilient microservices for edge device inference and optimization.",
      },
    ],
    status: "approved",
    organizer: {
      _id: "organizer-1",
      name: "Sarah Miller",
    },
    createdAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-02-01T00:00:00.000Z",
  },
  {
    _id: "event-2",
    title: "Indie Music & Arts Fest",
    description:
      "Two days of live indie bands, art installations, local food trucks, and unforgettable musical vibes.",
    category: "festival",
    location: "Open Air Amphitheatre, Chennai",
    eventDate: "2026-12-05T16:00:00.000Z",
    startTime: "16:00",
    endTime: "23:00",
    bannerImage:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80",
    videoUrl: "",
    ticketTypes: [
      {
        name: "Early Bird Single Day",
        price: 899,
        quantity: 300,
        availableQuantity: 210,
      },
      {
        name: "Weekend Festival Pass",
        price: 1599,
        quantity: 150,
        availableQuantity: 75,
      },
    ],
    schedule: [
      {
        _id: "sch-3",
        date: "2026-12-05",
        startTime: "16:30",
        endTime: "19:00",
        sessionTitle: "Acoustic Stage & Art Walks",
        speaker: "The Coastal Band",
        description:
          "Mellow acoustic melodies accompanied by artisan craft demonstrations.",
      },
    ],
    status: "approved",
    organizer: {
      _id: "organizer-1",
      name: "Sarah Miller",
    },
    createdAt: "2026-02-10T00:00:00.000Z",
    updatedAt: "2026-02-10T00:00:00.000Z",
  },
  {
    _id: "event-3",
    title: "Design Systems & UI Engineering Workshop",
    description:
      "Deep dive into building consistent, scalable design systems with Tailwind CSS, React, and modern UI tokens.",
    category: "workshop",
    location: "Innovate Hub, Hyderabad",
    eventDate: "2026-11-28T10:00:00.000Z",
    startTime: "10:00",
    endTime: "16:00",
    bannerImage:
      "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1200&auto=format&fit=crop&q=80",
    videoUrl: "",
    ticketTypes: [
      {
        name: "Standard Workshop Seat",
        price: 2499,
        quantity: 60,
        availableQuantity: 32,
      },
    ],
    schedule: [
      {
        _id: "sch-4",
        date: "2026-11-28",
        startTime: "10:30",
        endTime: "13:00",
        sessionTitle: "Component Architecture & Tokens",
        speaker: "Priya Nair",
        description:
          "Translating brand design tokens into systematic component libraries.",
      },
    ],
    status: "approved",
    organizer: {
      _id: "organizer-1",
      name: "Sarah Miller",
    },
    createdAt: "2026-02-15T00:00:00.000Z",
    updatedAt: "2026-02-15T00:00:00.000Z",
  },
  {
    _id: "event-4",
    title: "National City Marathon 2026",
    description:
      "Annual urban marathon with 5K, 10K, and 21K half-marathon categories for athletes of all skill levels.",
    category: "sports",
    location: "Marina Promenade, Chennai",
    eventDate: "2026-12-15T05:30:00.000Z",
    startTime: "05:30",
    endTime: "11:00",
    bannerImage:
      "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1200&auto=format&fit=crop&q=80",
    videoUrl: "",
    ticketTypes: [
      {
        name: "10K Run Entry",
        price: 750,
        quantity: 500,
        availableQuantity: 320,
      },
      {
        name: "21K Half Marathon Entry",
        price: 1200,
        quantity: 300,
        availableQuantity: 180,
      },
    ],
    schedule: [
      {
        _id: "sch-5",
        date: "2026-12-15",
        startTime: "05:30",
        endTime: "08:30",
        sessionTitle: "Flag Off & Race Time",
        speaker: "Race Director",
        description:
          "Official chip-timed run along the scenic coastal route.",
      },
    ],
    status: "approved",
    organizer: {
      _id: "organizer-1",
      name: "Sarah Miller",
    },
    createdAt: "2026-02-18T00:00:00.000Z",
    updatedAt: "2026-02-18T00:00:00.000Z",
  },
  {
    _id: "event-5",
    title: "Product Builders Unconference",
    description:
      "An open space gathering for founders, designers, and engineers discussing early-stage validation and PMF.",
    category: "conference",
    location: "Co-Work Central, Mumbai",
    eventDate: "2026-12-20T14:00:00.000Z",
    startTime: "14:00",
    endTime: "19:00",
    bannerImage:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80",
    videoUrl: "",
    ticketTypes: [
      {
        name: "Community Pass",
        price: 500,
        quantity: 80,
        availableQuantity: 45,
      },
    ],
    schedule: [],
    status: "pending",
    organizer: {
      _id: "organizer-1",
      name: "Sarah Miller",
    },
    createdAt: "2026-02-20T00:00:00.000Z",
    updatedAt: "2026-02-20T00:00:00.000Z",
  },
];

const defaultBookings: MockBooking[] = [
  {
    _id: "booking-1",
    user: {
      _id: "user-1",
      name: "Alex Johnson",
      email: "user@example.com",
    },
    event: {
      _id: "event-1",
      title: "Global Tech & AI Summit 2026",
      eventDate: "2026-11-20T09:00:00.000Z",
      startTime: "09:00",
      endTime: "18:00",
      location: "Bangalore International Exhibition Centre, Bangalore",
      organizer: "organizer-1",
    },
    ticketType: "VIP Pass",
    quantity: 1,
    totalAmount: 4500,
    bookingStatus: "confirmed",
    paymentStatus: "paid",
    ticketCode: "TECHAI-2026-VIP-84920",
    paymentId: "pay_demo_992144",
    checkedIn: true,
    createdAt: "2026-02-05T12:00:00.000Z",
    updatedAt: "2026-02-05T12:05:00.000Z",
  },
  {
    _id: "booking-2",
    user: {
      _id: "user-1",
      name: "Alex Johnson",
      email: "user@example.com",
    },
    event: {
      _id: "event-2",
      title: "Indie Music & Arts Fest",
      eventDate: "2026-12-05T16:00:00.000Z",
      startTime: "16:00",
      endTime: "23:00",
      location: "Open Air Amphitheatre, Chennai",
      organizer: "organizer-1",
    },
    ticketType: "Early Bird Single Day",
    quantity: 2,
    totalAmount: 1798,
    bookingStatus: "confirmed",
    paymentStatus: "paid",
    ticketCode: "INDIE-2026-EB-12093",
    paymentId: "pay_demo_118942",
    checkedIn: false,
    createdAt: "2026-02-12T14:30:00.000Z",
    updatedAt: "2026-02-12T14:35:00.000Z",
  },
];

const defaultInquiries: MockInquiry[] = [
  {
    _id: "sup-1",
    subject: "Ticket transfer inquiry",
    message:
      "Can I transfer my conference ticket to a colleague if I cannot attend?",
    status: "answered",
    adminResponse:
      "Yes, you can transfer your ticket directly from your Booking Details page using your colleague's registered email.",
    user: { _id: "user-1", name: "Alex Johnson", email: "user@example.com" },
    createdAt: "2026-02-06T10:00:00.000Z",
    updatedAt: "2026-02-06T14:30:00.000Z",
  },
];

const defaultFeedback: MockFeedback[] = [
  {
    _id: "fb-1",
    eventId: "event-1",
    event: { _id: "event-1", title: "Global Tech & AI Summit 2026" },
    user: { _id: "user-1", name: "Alex Johnson", email: "user@example.com" },
    rating: 5,
    comment:
      "Incredible lineup of keynote speakers and smooth check-in process!",
    createdAt: "2026-02-21T18:00:00.000Z",
  },
];

function loadItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveItem<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // ignore
  }
}

function getOrSyncUsers(): MockUser[] {
  const users = loadItem<MockUser[]>(STORAGE_KEYS.USERS, defaultUsers);
  let changed = false;
  for (const def of defaultUsers) {
    const idx = users.findIndex(
      (u) => u.email.toLowerCase() === def.email.toLowerCase()
    );
    if (idx === -1) {
      users.push(def);
      changed = true;
    } else {
      if (users[idx].role !== def.role || users[idx].status !== def.status) {
        users[idx].role = def.role;
        users[idx].status = def.status;
        changed = true;
      }
    }
  }
  if (changed) {
    saveItem(STORAGE_KEYS.USERS, users);
  }
  return users;
}

function getCurrentUser(): MockUser | null {
  const token = localStorage.getItem("token");
  if (!token) return null;
  const users = getOrSyncUsers();
  return (
    users.find((u) => u._id === token || u.email.toLowerCase() === token.toLowerCase()) ||
    users[0] ||
    null
  );
}

function makeResponse<T>(data: T, status = 200): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: status === 200 ? "OK" : "Error",
    headers: {},
    config: {} as any,
  };
}

export async function handleMockRequest(
  config: AxiosRequestConfig
): Promise<AxiosResponse<any>> {
  const method = (config.method || "get").toLowerCase();
  const rawUrl = config.url || "";
  // Strip baseURL or leading host/api prefix
  const path = rawUrl
    .replace(/^https?:\/\/[^/]+/, "")
    .replace(/^\/api/, "")
    .split("?")[0];
  const params = config.params || {};

  let body: any = {};
  if (config.data) {
    try {
      body =
        typeof config.data === "string" ? JSON.parse(config.data) : config.data;
    } catch {
      body = config.data;
    }
  }

  // Artificial slight network latency for realistic feel
  await new Promise((resolve) => setTimeout(resolve, 80));

  const users = getOrSyncUsers();
  const rawEvents = loadItem<Event[]>(STORAGE_KEYS.EVENTS, defaultEvents);
  const events = rawEvents.map((ev) => ({
    ...ev,
    ticketTypes: (ev.ticketTypes || []).map((t) => {
      const q = Number(t.quantity || t.availableQuantity || 50);
      const av =
        t.availableQuantity !== undefined && t.availableQuantity !== null
          ? Number(t.availableQuantity)
          : q;
      return {
        ...t,
        price: Number(t.price || 0),
        quantity: q,
        availableQuantity: av,
      };
    }),
  }));
  const bookings = loadItem<MockBooking[]>(
    STORAGE_KEYS.BOOKINGS,
    defaultBookings
  );
  const inquiries = loadItem<MockInquiry[]>(
    STORAGE_KEYS.INQUIRIES,
    defaultInquiries
  );
  const feedback = loadItem<MockFeedback[]>(
    STORAGE_KEYS.FEEDBACK,
    defaultFeedback
  );

  const currentUser = getCurrentUser();

  /* ---------------- AUTH ROUTES ---------------- */
  if (path === "/auth/login" && method === "post") {
    const { email } = body;
    const cleanEmail = (email || "").trim().toLowerCase();
    const found = users.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    let assignedRole: "user" | "organizer" | "admin" = "user";
    if (cleanEmail.includes("admin") || cleanEmail === "pragathyt95@gmail.com") {
      assignedRole = "admin";
    } else if (cleanEmail.includes("org") || cleanEmail === "eforeventorg@yopmail.com") {
      assignedRole = "organizer";
    }

    const userToUse =
      found || {
        _id: "user-" + Date.now(),
        name: (email || "user").split("@")[0] || "User",
        email: email || cleanEmail,
        role: assignedRole,
        status: "active" as const,
        phone: "",
        profileImage: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

    if (!found) {
      users.push(userToUse);
      saveItem(STORAGE_KEYS.USERS, users);
    }

    return makeResponse({
      token: userToUse._id,
      user: userToUse,
    });
  }

  if (path === "/auth/register" && method === "post") {
    const { name, email, role } = body;
    const existing = users.find(
      (u) => u.email.toLowerCase() === (email || "").toLowerCase()
    );
    if (existing) {
      const err: any = new Error("User already exists with this email");
      err.response = { data: { message: "User already exists with this email" }, status: 400 };
      throw err;
    }
    const newUser: MockUser = {
      _id: "user-" + Date.now(),
      name: name || "New User",
      email,
      role: role || "user",
      status: "active",
      phone: "",
      profileImage: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveItem(STORAGE_KEYS.USERS, users);

    return makeResponse({
      token: newUser._id,
      user: newUser,
    });
  }

  if (path === "/auth/profile" && method === "get") {
    if (!currentUser) {
      const err: any = new Error("Unauthorized");
      err.response = { data: { message: "Unauthorized" }, status: 401 };
      throw err;
    }
    return makeResponse({ user: currentUser });
  }

  /* ---------------- EVENT ROUTES ---------------- */
  if (path === "/events/my-events" && method === "get") {
    const orgEvents = events.filter(
      (e) => !e.organizer || e.organizer._id === (currentUser?._id || "organizer-1")
    );
    return makeResponse({ events: orgEvents });
  }

  if (path === "/events" && method === "get") {
    let list = events.filter((e) => e.status === "approved" || currentUser?.role === "admin");
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q)
      );
    }
    if (params.category) {
      list = list.filter((e) => e.category.toLowerCase() === params.category.toLowerCase());
    }
    if (params.location) {
      const loc = params.location.toLowerCase();
      list = list.filter((e) => e.location.toLowerCase().includes(loc));
    }
    if (params.date) {
      list = list.filter((e) => e.eventDate.startsWith(params.date));
    }
    if (params.minPrice !== undefined) {
      list = list.filter((e) =>
        e.ticketTypes.some((t) => t.price >= Number(params.minPrice))
      );
    }
    if (params.maxPrice !== undefined) {
      list = list.filter((e) =>
        e.ticketTypes.some((t) => t.price <= Number(params.maxPrice))
      );
    }
    return makeResponse({ events: list });
  }

  const eventMatch = path.match(/^\/events\/([^/]+)$/);
  if (eventMatch && method === "get") {
    const id = eventMatch[1];
    const ev = events.find((e) => e._id === id);
    if (!ev) {
      const err: any = new Error("Event not found");
      err.response = { data: { message: "Event not found" }, status: 404 };
      throw err;
    }
    return makeResponse({ event: ev });
  }

  if (path === "/events" && method === "post") {
    const newEvent: Event = {
      _id: "event-" + Date.now(),
      title: body.title || "Untitled Event",
      description: body.description || "",
      category: body.category || "conference",
      location: body.location || "Online",
      eventDate: body.eventDate || new Date().toISOString(),
      startTime: body.startTime || "09:00",
      endTime: body.endTime || "17:00",
      bannerImage:
        body.bannerImage ||
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80",
      videoUrl: body.videoUrl || "",
      ticketTypes: (body.ticketTypes || [
        { name: "General Admission", price: 500, quantity: 100, availableQuantity: 100 },
      ]).map((t: any) => {
        const q = Number(t.quantity || t.availableQuantity || 100);
        const av =
          t.availableQuantity !== undefined && t.availableQuantity !== null
            ? Number(t.availableQuantity)
            : q;
        return {
          name: t.name || "General Admission",
          price: Number(t.price || 0),
          quantity: q,
          availableQuantity: av,
        };
      }),
      schedule: body.schedule || [],
      status: "approved",
      organizer: {
        _id: currentUser?._id || "organizer-1",
        name: currentUser?.name || "Organizer",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    events.unshift(newEvent);
    saveItem(STORAGE_KEYS.EVENTS, events);
    return makeResponse({ event: newEvent });
  }

  if (eventMatch && method === "put") {
    const id = eventMatch[1];
    const idx = events.findIndex((e) => e._id === id);
    if (idx !== -1) {
      const updateData = { ...body };
      if (updateData.ticketTypes) {
        updateData.ticketTypes = updateData.ticketTypes.map((t: any) => {
          const q = Number(t.quantity || t.availableQuantity || 100);
          const av =
            t.availableQuantity !== undefined && t.availableQuantity !== null
              ? Number(t.availableQuantity)
              : q;
          return {
            name: t.name || "General Admission",
            price: Number(t.price || 0),
            quantity: q,
            availableQuantity: av,
          };
        });
      }
      events[idx] = { ...events[idx], ...updateData, updatedAt: new Date().toISOString() };
      saveItem(STORAGE_KEYS.EVENTS, events);
      return makeResponse({ event: events[idx] });
    }
    const err: any = new Error("Event not found");
    err.response = { data: { message: "Event not found" }, status: 404 };
    throw err;
  }

  if (eventMatch && method === "delete") {
    const id = eventMatch[1];
    const filtered = events.filter((e) => e._id !== id);
    saveItem(STORAGE_KEYS.EVENTS, filtered);
    return makeResponse({ message: "Event deleted successfully" });
  }

  /* ---------------- BOOKING ROUTES ---------------- */
  if (path === "/bookings/my-bookings" && method === "get") {
    const userBookings = bookings.filter(
      (b) => !currentUser || b.user._id === currentUser._id || currentUser.role === "organizer"
    );
    return makeResponse({ bookings: userBookings });
  }

  if (path === "/bookings" && method === "post") {
    const { eventId, ticketType, quantity } = body;
    const targetEvent = events.find((e) => e._id === eventId);
    if (!targetEvent) {
      const err: any = new Error("Event not found");
      err.response = { data: { message: "Event not found" }, status: 404 };
      throw err;
    }
    const ticket = targetEvent.ticketTypes.find((t) => t.name === ticketType) || targetEvent.ticketTypes[0];
    const qty = Number(quantity || 1);
    const amount = (ticket?.price || 0) * qty;

    const newBooking: MockBooking = {
      _id: "book-" + Date.now(),
      user: {
        _id: currentUser?._id || "user-1",
        name: currentUser?.name || "Guest User",
        email: currentUser?.email || "guest@example.com",
      },
      event: {
        _id: targetEvent._id,
        title: targetEvent.title,
        eventDate: targetEvent.eventDate,
        startTime: targetEvent.startTime,
        endTime: targetEvent.endTime,
        location: targetEvent.location,
        organizer: targetEvent.organizer?._id,
      },
      ticketType: ticket ? ticket.name : "General",
      quantity: qty,
      totalAmount: amount,
      bookingStatus: "confirmed",
      paymentStatus: "paid",
      ticketCode: `${targetEvent.title.substring(0, 4).toUpperCase()}-${Date.now().toString().slice(-6)}`,
      paymentId: `pay_sim_${Date.now()}`,
      checkedIn: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update available ticket count
    if (ticket && ticket.availableQuantity >= qty) {
      ticket.availableQuantity -= qty;
      saveItem(STORAGE_KEYS.EVENTS, events);
    }

    bookings.unshift(newBooking);
    saveItem(STORAGE_KEYS.BOOKINGS, bookings);
    return makeResponse({ booking: newBooking });
  }

  const bookingMatch = path.match(/^\/bookings\/([^/]+)$/);
  if (bookingMatch && method === "get") {
    const id = bookingMatch[1];
    const b = bookings.find((item) => item._id === id);
    if (!b) {
      const err: any = new Error("Booking not found");
      err.response = { data: { message: "Booking not found" }, status: 404 };
      throw err;
    }
    return makeResponse({ booking: b });
  }

  if (path.match(/^\/bookings\/([^/]+)\/cancel$/) && method === "patch") {
    const id = path.match(/^\/bookings\/([^/]+)\/cancel$/)![1];
    const b = bookings.find((item) => item._id === id);
    if (b) {
      b.bookingStatus = "cancelled";
      saveItem(STORAGE_KEYS.BOOKINGS, bookings);
      return makeResponse({ booking: b });
    }
  }

  if (path.match(/^\/bookings\/([^/]+)\/transfer$/) && method === "patch") {
    const id = path.match(/^\/bookings\/([^/]+)\/transfer$/)![1];
    const b = bookings.find((item) => item._id === id);
    if (b) {
      b.user.email = body.email || b.user.email;
      saveItem(STORAGE_KEYS.BOOKINGS, bookings);
      return makeResponse({ message: "Transferred successfully", booking: b });
    }
  }

  if (path.match(/^\/bookings\/([^/]+)\/check-in$/) && method === "patch") {
    const id = path.match(/^\/bookings\/([^/]+)\/check-in$/)![1];
    const b = bookings.find((item) => item._id === id);
    if (b) {
      b.checkedIn = true;
      saveItem(STORAGE_KEYS.BOOKINGS, bookings);
      return makeResponse({ message: "Checked in successfully", booking: b });
    }
  }

  const attendeesMatch = path.match(/^\/bookings\/event\/([^/]+)\/attendees$/);
  if (attendeesMatch && method === "get") {
    const eventId = attendeesMatch[1];
    const eventBookings = bookings.filter((b) => b.event._id === eventId);
    return makeResponse({ attendees: eventBookings });
  }

  /* ---------------- PAYMENT ROUTES ---------------- */
  if (path === "/payments/create-order" && method === "post") {
    const { bookingId } = body;
    const b = bookings.find((item) => item._id === bookingId);
    return makeResponse({
      order: {
        id: "order_mock_" + Date.now(),
        amount: (b?.totalAmount || 100) * 100,
        currency: "INR",
      },
      keyId: "rzp_test_mock_mode",
      booking: b || defaultBookings[0],
    });
  }

  if (path === "/payments/verify" && method === "post") {
    const { bookingId } = body;
    const b = bookings.find((item) => item._id === bookingId);
    if (b) {
      b.paymentStatus = "paid";
      b.bookingStatus = "confirmed";
      saveItem(STORAGE_KEYS.BOOKINGS, bookings);
    }
    return makeResponse({ message: "Payment verified successfully", booking: b });
  }

  if (path === "/payments" && method === "post") {
    const { bookingId, paymentSuccess } = body;
    const b = bookings.find((item) => item._id === bookingId);
    if (b && paymentSuccess) {
      b.paymentStatus = "paid";
      b.bookingStatus = "confirmed";
      saveItem(STORAGE_KEYS.BOOKINGS, bookings);
    }
    return makeResponse({ message: "Payment processed", booking: b });
  }

  /* ---------------- TICKETS ROUTES ---------------- */
  const qrMatch = path.match(/^\/tickets\/([^/]+)\/qr$/);
  if (qrMatch && method === "get") {
    const bookingId = qrMatch[1];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="160" height="160"><rect width="100" height="100" fill="#ffffff"/><rect x="10" y="10" width="30" height="30" fill="#7c3aed"/><rect x="60" y="10" width="30" height="30" fill="#7c3aed"/><rect x="10" y="60" width="30" height="30" fill="#7c3aed"/><rect x="18" y="18" width="14" height="14" fill="#ffffff"/><rect x="68" y="18" width="14" height="14" fill="#ffffff"/><rect x="18" y="68" width="14" height="14" fill="#ffffff"/><rect x="45" y="10" width="10" height="35" fill="#0f172a"/><rect x="45" y="55" width="45" height="10" fill="#0f172a"/><rect x="55" y="75" width="35" height="15" fill="#0f172a"/></svg>`;
    const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    return makeResponse({ qrCode: dataUri, bookingId });
  }

  const downloadMatch = path.match(/^\/tickets\/([^/]+)\/download$/);
  if (downloadMatch && method === "get") {
    const bookingId = downloadMatch[1];
    const b = bookings.find((item) => item._id === bookingId) || defaultBookings[0];
    const textTicket = `----------------------------------------
EVENT TICKET: ${b.event?.title || "Event"}
----------------------------------------
Booking ID : ${b._id}
Ticket Code: ${b.ticketCode}
Ticket Type: ${b.ticketType}
Quantity   : ${b.quantity}
Total Paid : INR ${b.totalAmount}
Date       : ${b.event?.eventDate || "-"}
Location   : ${b.event?.location || "-"}
Attendee   : ${b.user?.name || "-"} (${b.user?.email || "-"})
Status     : ${b.bookingStatus.toUpperCase()} - ${b.paymentStatus.toUpperCase()}
----------------------------------------
Please present this ticket at check-in.
----------------------------------------`;
    const blob = new Blob([textTicket], { type: "text/plain" });
    return makeResponse(blob);
  }

  /* ---------------- ORGANIZER ANALYTICS ---------------- */
  if (path === "/analytics/organizer" && method === "get") {
    const orgEvents = events.filter(
      (e) => !e.organizer || e.organizer._id === (currentUser?._id || "organizer-1")
    );
    const eventStats = orgEvents.map((ev) => {
      const bList = bookings.filter((b) => b.event._id === ev._id && b.bookingStatus !== "cancelled");
      const rev = bList.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
      const sold = bList.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
      const checkedIn = bList.filter((b) => b.checkedIn).length;
      return {
        eventId: ev._id,
        title: ev.title.length > 20 ? ev.title.substring(0, 18) + "..." : ev.title,
        ticketsSold: sold || 24,
        revenue: rev || (ev.ticketTypes[0]?.price || 500) * 24,
        attendanceRate: sold > 0 ? Math.round((checkedIn / sold) * 100) : 85,
        bookings: bList.length || 15,
      };
    });

    const totalRevenue = eventStats.reduce((acc, curr) => acc + curr.revenue, 0);
    const totalTicketsSold = eventStats.reduce((acc, curr) => acc + curr.ticketsSold, 0);
    const totalBookings = eventStats.reduce((acc, curr) => acc + curr.bookings, 0);

    return makeResponse({
      summary: {
        totalEvents: orgEvents.length,
        totalBookings: totalBookings || 35,
        ticketsSold: totalTicketsSold || 65,
        revenue: totalRevenue || 74500,
        checkedIn: Math.round(totalTicketsSold * 0.8),
        attendanceRate: 85,
      },
      events: eventStats,
    });
  }

  /* ---------------- ADMIN ROUTES ---------------- */
  if (path === "/admin/users" && method === "get") {
    return makeResponse({ users });
  }

  const userRoleMatch = path.match(/^\/admin\/users\/([^/]+)\/role$/);
  if (userRoleMatch && method === "patch") {
    const uId = userRoleMatch[1];
    const u = users.find((item) => item._id === uId);
    if (u) {
      u.role = body.role || u.role;
      saveItem(STORAGE_KEYS.USERS, users);
      return makeResponse({ user: u });
    }
  }

  const userStatusMatch = path.match(/^\/admin\/users\/([^/]+)\/status$/);
  if (userStatusMatch && method === "patch") {
    const uId = userStatusMatch[1];
    const u = users.find((item) => item._id === uId);
    if (u) {
      u.status = body.status || u.status;
      saveItem(STORAGE_KEYS.USERS, users);
      return makeResponse({ user: u });
    }
  }

  const userDeleteMatch = path.match(/^\/admin\/users\/([^/]+)$/);
  if (userDeleteMatch && method === "delete") {
    const uId = userDeleteMatch[1];
    const filtered = users.filter((u) => u._id !== uId);
    saveItem(STORAGE_KEYS.USERS, filtered);
    return makeResponse({ message: "User deleted successfully" });
  }

  if (path === "/admin/bookings" && method === "get") {
    return makeResponse({ bookings });
  }

  if (path === "/admin/events/pending" && method === "get") {
    const pendingEvents = events.filter((e) => e.status === "pending");
    return makeResponse({ events: pendingEvents });
  }

  const eventStatusMatch = path.match(/^\/admin\/events\/([^/]+)\/status$/);
  if (eventStatusMatch && method === "patch") {
    const eId = eventStatusMatch[1];
    const ev = events.find((item) => item._id === eId);
    if (ev) {
      ev.status = body.status || ev.status;
      saveItem(STORAGE_KEYS.EVENTS, events);
      return makeResponse({ event: ev });
    }
  }

  /* ---------------- SUPPORT INQUIRIES ---------------- */
  if (path === "/support/my" && method === "get") {
    const myInquiries = inquiries.filter(
      (inq) => !currentUser || inq.user?._id === currentUser._id
    );
    return makeResponse({ inquiries: myInquiries });
  }

  if (path === "/support/admin" && method === "get") {
    return makeResponse({ inquiries });
  }

  if (path === "/support" && method === "post") {
    const newInquiry: MockInquiry = {
      _id: "inq-" + Date.now(),
      subject: body.subject || "Support Request",
      message: body.message || "",
      status: "pending",
      user: {
        _id: currentUser?._id || "user-1",
        name: currentUser?.name || "Attendee",
        email: currentUser?.email || "attendee@example.com",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inquiries.unshift(newInquiry);
    saveItem(STORAGE_KEYS.INQUIRIES, inquiries);
    return makeResponse({ inquiry: newInquiry });
  }

  const supportAdminMatch = path.match(/^\/support\/admin\/([^/]+)$/);
  if (supportAdminMatch && method === "patch") {
    const inqId = supportAdminMatch[1];
    const inq = inquiries.find((item) => item._id === inqId);
    if (inq) {
      if (body.status) inq.status = body.status;
      if (body.adminResponse) inq.adminResponse = body.adminResponse;
      inq.updatedAt = new Date().toISOString();
      saveItem(STORAGE_KEYS.INQUIRIES, inquiries);
      return makeResponse({ inquiry: inq });
    }
  }

  /* ---------------- FEEDBACK ---------------- */
  if (path === "/feedback/admin" && method === "get") {
    const avg =
      feedback.length > 0
        ? Number(
            (
              feedback.reduce((acc, curr) => acc + curr.rating, 0) /
              feedback.length
            ).toFixed(1)
          )
        : 4.8;
    return makeResponse({ feedback, averageRating: avg });
  }

  if (path === "/feedback" && method === "post") {
    const targetEvent = events.find((e) => e._id === body.eventId);
    const newFb: MockFeedback = {
      _id: "fb-" + Date.now(),
      eventId: body.eventId,
      event: targetEvent ? { _id: targetEvent._id, title: targetEvent.title } : undefined,
      user: {
        _id: currentUser?._id || "user-1",
        name: currentUser?.name || "Attendee",
        email: currentUser?.email || "attendee@example.com",
      },
      rating: body.rating || 5,
      comment: body.comment || "",
      createdAt: new Date().toISOString(),
    };
    feedback.unshift(newFb);
    saveItem(STORAGE_KEYS.FEEDBACK, feedback);
    return makeResponse({ feedback: newFb });
  }

  // Fallback for unhandled endpoints
  return makeResponse({ message: "OK" });
}
