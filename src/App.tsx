import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import Home from "./pages/home";
import Login from "./pages/auth/login";
import EventList from "./pages/events/EventList";
import EventDetails from "./pages/events/EventDetails";
import Navbar from "./components/layouts/Navbar";
import ProtectedRoute from "./routes/ProtectedRoute";
import CreateBooking from "./pages/bookings/CreateBooking";
import BookingDetails from "./pages/bookings/BookingDetails";
import Payment from "./pages/bookings/Payment";
import Ticket from "./pages/bookings/Ticket";
import MyBookings from "./pages/bookings/MyBookings";
import OrganizerDashboard from "./pages/organizer/OrganizerDashboard";
import RoleRoute from "./routes/RoleRoute";
import OrganizerEvents from "./pages/organizer/OrganizerEvents";
import CreateEvent from "./pages/organizer/CreateEvent";
import EditEvent from "./pages/organizer/EditEvent";
import Attendees from "./pages/organizer/Attendees";
import AdminDashboard from "./pages/admin/AdminDashboard";
import OrganizerAnalytics from "./pages/organizer/OrganizerAnalytics";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminBookings from "./pages/admin/AdminBookings";
import Support from "./pages/user/Support";
import AdminSupport from "./pages/admin/AdminSupport";
import Feedback from "./pages/user/Feedback";
import AdminFeedback from "./pages/admin/AdminFeedback";
import Register from "./pages/auth/register";
import { useAuth } from "./context/AuthContext";

// Smart dashboard routing based on authenticated user's role
const DashboardRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
          <p className="mt-3 text-sm text-slate-500">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user.role === "organizer") {
    return <Navigate to="/organizer/dashboard" replace />;
  }

  return <Navigate to="/bookings" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/events" element={<EventList />} />
        <Route path="/events/:id" element={<EventDetails />} />

        {/* Global /dashboard entry that routes per role */}
        <Route path="/dashboard" element={<DashboardRedirect />} />

        {/* Attendee Booking & User Protected Routes */}
        <Route element={<ProtectedRoute />}>
          {/* Booking routes: /bookings, /my-bookings, /events/:id/book, /booking/:id */}
          <Route path="/bookings" element={<MyBookings />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/events/:id/book" element={<CreateBooking />} />
          <Route path="/booking/:id" element={<CreateBooking />} />
          <Route path="/bookings/:id" element={<BookingDetails />} />
          <Route path="/bookings/:id/payment" element={<Payment />} />
          <Route path="/bookings/:id/ticket" element={<Ticket />} />

          {/* User support & feedback */}
          <Route path="/support" element={<Support />} />
          <Route path="/events/:eventId/feedback" element={<Feedback />} />
        </Route>

        {/* Organizer Protected Routes */}
        <Route element={<RoleRoute allowedRoles={["organizer"]} />}>
          <Route path="/organizer" element={<OrganizerDashboard />} />
          <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
          <Route path="/organizer/analytics" element={<OrganizerAnalytics />} />
          <Route path="/organizer/events" element={<OrganizerEvents />} />
          <Route path="/organizer/events/create" element={<CreateEvent />} />
          <Route path="/organizer/events/:id/edit" element={<EditEvent />} />
          <Route
            path="/organizer/events/:eventId/attendees"
            element={<Attendees />}
          />
        </Route>

        {/* Admin Protected Routes */}
        <Route element={<RoleRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/events" element={<AdminEvents />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />
          <Route path="/admin/support" element={<AdminSupport />} />
          <Route path="/admin/feedback" element={<AdminFeedback />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
