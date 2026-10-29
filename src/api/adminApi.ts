import api from "./axios";

export const getAdminUsers = () => {
  return api.get("/admin/users");
};

export const updateUserRole = (
  userId: string,
  role: "user" | "organizer" | "admin"
) => {
  return api.patch(`/admin/users/${userId}/role`, {
    role,
  });
};

export const updateUserStatus = (
  userId: string,
  status: "active" | "blocked"
) => {
  return api.patch(`/admin/users/${userId}/status`, {
    status,
  });
};

export const deleteUser = (userId: string) => {
  return api.delete(`/admin/users/${userId}`);
};

export const getAdminBookings = () => {
  return api.get("/admin/bookings");
};

export const getAdminBooking = (bookingId: string) => {
  return api.get(`/admin/bookings/${bookingId}`);
};

export const getPendingEvents = () => {
  return api.get("/admin/events/pending");
};

export const updateEventStatus = (
  eventId: string,
  status: "approved" | "rejected"
) => {
  return api.patch(
    `/admin/events/${eventId}/status`,
    { status }
  );
};