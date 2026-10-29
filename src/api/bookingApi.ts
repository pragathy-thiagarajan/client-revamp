import api from "./axios";

export const createBooking = (data: {
  eventId: string;
  ticketType: string;
  quantity: number;
}) => {
  return api.post("/bookings", data);
};

export const getMyBookings = () => {
  return api.get("/bookings/my-bookings");
};

export const getBooking = (id: string) => {
  return api.get(`/bookings/${id}`);
};

export const cancelBooking = (id: string) => {
  return api.patch(`/bookings/${id}/cancel`);
};

export const getEventAttendees = (eventId: string) => {
  return api.get(`/bookings/event/${eventId}/attendees`);
};

export const transferBooking = (
  bookingId: string,
  email: string
) => {
  return api.patch(
    `/bookings/${bookingId}/transfer`,
    {
      email,
    }
  );
};

export const checkInAttendee = (
  bookingId: string
) => {
  return api.patch(
    `/bookings/${bookingId}/check-in`
  );
};