import api from "./axios";

export const getOrganizerAnalytics =
  () => {
    return api.get(
      "/analytics/organizer"
    );
  };