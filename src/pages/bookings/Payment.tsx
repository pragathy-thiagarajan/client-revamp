import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  processPayment,
} from "../../api/paymentApi";

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;

  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };

  handler: (
    response: RazorpayResponse
  ) => void;

  modal?: {
    ondismiss?: () => void;
  };

  theme?: {
    color?: string;
  };
}

interface RazorpayInstance {
  open: () => void;
  on: (
    event: string,
    callback: (response: any) => void
  ) => void;
}

declare global {
  interface Window {
    Razorpay: new (
      options: RazorpayOptions
    ) => RazorpayInstance;
  }
}

const loadRazorpayScript = () => {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script =
      document.createElement("script");

    script.src =
      "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () =>
      resolve(true);

    script.onerror = () =>
      resolve(false);

    document.body.appendChild(script);
  });
};

const Payment = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handlePayment = async () => {
    if (!id) {
      setError("Booking ID is missing");
      return;
    }

    try {
      setLoading(true);
      setError("");

      /* -----------------------------
         1. Load Razorpay Checkout
      ----------------------------- */

      const loaded =
        await loadRazorpayScript();

      if (!loaded) {
        setError(
          "Unable to load payment gateway"
        );

        setLoading(false);
        return;
      }

      /* -----------------------------
         2. Create Razorpay Order
      ----------------------------- */

      const response =
        await createRazorpayOrder(id);

      const {
        order,
        keyId,
        booking,
      } = response.data;

      if (keyId?.includes("mock") || !window.Razorpay) {
        await processPayment(id, true);
        navigate(`/bookings/${id}/ticket`);
        return;
      }

      /* -----------------------------
         3. Razorpay Options
      ----------------------------- */

      const options: RazorpayOptions = {
        key: keyId,

        amount: order.amount,

        currency: order.currency,

        name: "Event Management",

        description:
          booking.event?.title ||
          "Event Ticket",

        order_id: order.id,

        prefill: {
          name:
            booking.user?.name || "",

          email:
            booking.user?.email || "",
        },

        /* -----------------------------
           4. Payment Success Handler
        ----------------------------- */

        handler: async (
          razorpayResponse:
            RazorpayResponse
        ) => {
          try {
            setLoading(true);

            await verifyRazorpayPayment({
              bookingId: id,

              razorpay_payment_id:
                razorpayResponse
                  .razorpay_payment_id,

              razorpay_order_id:
                razorpayResponse
                  .razorpay_order_id,

              razorpay_signature:
                razorpayResponse
                  .razorpay_signature,
            });

            /*
              Payment has now been
              verified by OUR backend.
            */

            navigate(
              `/bookings/${id}/ticket`
            );
          } catch (error: any) {
            setError(
              error.response?.data
                ?.message ||
                "Payment verification failed"
            );
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      /* -----------------------------
         5. Open Checkout
      ----------------------------- */

      const razorpay =
        new window.Razorpay(options);

      /* -----------------------------
         Optional Gateway Failure
      ----------------------------- */

      razorpay.on(
        "payment.failed",
        (response: any) => {
          setError(
            response.error
              ?.description ||
              "Payment failed"
          );

          setLoading(false);
        }
      );

      /*
        Razorpay recommends opening
        Checkout from the user's button
        action.
      */

      razorpay.open();
    } catch (error: any) {
      console.error(
        "Payment error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to start payment"
      );

      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 px-4 py-10">
      <div className="mx-auto max-w-md">

        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm shadow-slate-200/60">

          <h1 className="mb-2 text-2xl font-bold">
            Payment
          </h1>

          <p className="mb-8 text-slate-500">
            Complete your payment securely to
            confirm the booking.
          </p>

          {error && (
            <div className="mb-5 rounded-lg bg-red-100 p-3 text-red-700">
              {error}
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full rounded-xl bg-violet-600 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Processing..."
              : "Pay Securely"}
          </button>

        </div>

      </div>
    </div>
  );
};

export default Payment;