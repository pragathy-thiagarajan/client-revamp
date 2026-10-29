import api from "./axios";

export const submitFeedback = (data: {
  eventId: string;
  rating: number;
  comment: string;
}) => {
  return api.post("/feedback", data);
};

export const getAdminFeedbackReport = () => {
  return api.get("/feedback/admin");
};
