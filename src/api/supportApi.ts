import api from "./axios";

export const createSupportInquiry = (
  data: {
    subject: string;
    message: string;
  }
) => {
  return api.post("/support", data);
};

export const getMySupportInquiries =
  () => {
    return api.get("/support/my");
  };

export const getAdminSupportInquiries =
  () => {
    return api.get(
      "/support/admin"
    );
  };

export const updateSupportInquiry = (
  inquiryId: string,
  data: {
    status?: string;
    adminResponse?: string;
  }
) => {
  return api.patch(
    `/support/admin/${inquiryId}`,
    data
  );
};