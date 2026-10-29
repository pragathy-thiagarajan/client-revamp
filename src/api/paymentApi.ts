import api from "./axios";

export const processPayment = (bookingId: string, paymentSuccess: boolean) => {
  return api.post("/payments", {
    bookingId,
    paymentSuccess,
  });
};
export const createRazorpayOrder = (bookingId: string) => {
  return api.post("/payments/create-order", {
    bookingId,
  });
};

export interface RazorpayVerification {
  bookingId: string;
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export const verifyRazorpayPayment = (data: RazorpayVerification) => {
  return api.post("/payments/verify", data);
};
