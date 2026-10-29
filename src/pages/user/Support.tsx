import { useEffect, useState } from "react";

import {
  createSupportInquiry,
  getMySupportInquiries,
} from "../../api/supportApi";

interface Inquiry {
  _id: string;
  subject: string;
  message: string;
  status: string;
  adminResponse: string;
  createdAt: string;
}

const Support = () => {
  const [subject, setSubject] = useState("");

  const [message, setMessage] = useState("");

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const loadInquiries = async () => {
    try {
      const response = await getMySupportInquiries();

      setInquiries(response.data.inquiries || []);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to load inquiries");
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError("");
      setSuccess("");

      await createSupportInquiry({
        subject,
        message,
      });

      setSubject("");
      setMessage("");

      setSuccess("Support inquiry submitted");

      loadInquiries();
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to submit inquiry");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold">Support</h1>

        <p className="mt-2 text-slate-500">
          Contact support and track your inquiries.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/60"
        >
          {error && (
            <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-lg bg-green-100 p-3 text-green-700">
              {success}
            </div>
          )}

          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            required
            className="w-full rounded-lg border px-4 py-3"
          />

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your issue"
            rows={5}
            required
            className="mt-4 w-full rounded-lg border px-4 py-3"
          />

          <button
            type="submit"
            className="mt-4 rounded-xl bg-violet-600 px-5 py-3 text-white"
          >
            Submit Inquiry
          </button>
        </form>

        <h2 className="mt-10 text-xl font-semibold">My Inquiries</h2>

        <div className="mt-4 space-y-4">
          {inquiries.map((inquiry) => (
            <div
              key={inquiry._id}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/60"
            >
              <div className="flex justify-between">
                <h3 className="font-semibold">{inquiry.subject}</h3>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">
                  {inquiry.status}
                </span>
              </div>

              <p className="mt-3 text-slate-600">{inquiry.message}</p>

              {inquiry.adminResponse && (
                <div className="mt-4 rounded-lg bg-slate-50/70 p-4">
                  <strong>Admin Response</strong>

                  <p className="mt-1 text-slate-600">{inquiry.adminResponse}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Support;
