import api from "./axios";

export interface EventFilters {
  search?: string;
  category?: string;
  location?: string;
  date?: string;
  minPrice?: number;
  maxPrice?: number;
}

export const getEvents = (params?: EventFilters) => {
  return api.get("/events", {
    params,
  });
};

export const getEventById = (id: string) => {
  return api.get(`/events/${id}`);
};

export const createEvent = (data: unknown) => {
  return api.post("/events", data);
};

export const updateEvent = (id: string, data: unknown) => {
  return api.put(`/events/${id}`, data);
};

export const deleteEvent = (id: string) => {
  return api.delete(`/events/${id}`);
};

export const getMyEvents = () => {
  return api.get("/events/my-events");
};