import api from "./axios";

export const getTicketQR = (bookingId: string) => {
  return api.get(`/tickets/${bookingId}/qr`);
};

export const downloadTicket = (bookingId: string) => {
  return api.get(`/tickets/${bookingId}/download`, {
    responseType: "blob",
  });
};