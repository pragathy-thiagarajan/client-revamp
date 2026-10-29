import { jsPDF } from "jspdf";

export interface TicketPdfData {
  ticketCode: string;
  bookingId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  attendeeName: string;
  attendeeEmail: string;
  ticketType: string;
  quantity: number;
  totalAmount: number;
  status: string;
}

export const generateTicketPdf = (data: TicketPdfData): jsPDF => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Background canvas
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, 210, 297, "F");

  // Main Ticket Card Container (White)
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(15, 20, 180, 222, 6, 6, "F");
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.roundedRect(15, 20, 180, 222, 6, 6, "S");

  // Top Header Banner (Deep Violet)
  doc.setFillColor(76, 29, 149); // #4c1d95
  doc.roundedRect(15, 20, 180, 48, 6, 6, "F");
  doc.rect(15, 56, 180, 12, "F"); // Flatten bottom corners of banner

  // Brand Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("EforEvent", 25, 34);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(221, 214, 254);
  doc.text("OFFICIAL ADMISSION PASS · VERIFIED ENTRY", 25, 41);

  // Status Badge in header
  doc.setFillColor(16, 185, 129); // emerald
  doc.roundedRect(145, 28, 40, 8, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("CONFIRMED", 154, 33.5);

  // Event Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  const splitTitle = doc.splitTextToSize(data.eventTitle, 160);
  doc.text(splitTitle, 25, 53);

  // Content Details Section
  let y = 80;

  // Grid row 1: Date & Time
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text("EVENT DATE", 25, y);
  doc.text("EVENT TIME", 110, y);

  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text(data.eventDate || "-", 25, y);
  doc.text(data.eventTime || "Full Day", 110, y);

  // Grid row 2: Venue / Location
  y += 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text("LOCATION / VENUE", 25, y);

  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  const splitLocation = doc.splitTextToSize(data.eventLocation || "Venue to be announced", 160);
  doc.text(splitLocation, 25, y);
  y += (splitLocation.length - 1) * 5;

  // Grid row 3: Attendee details
  y += 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text("ATTENDEE NAME", 25, y);
  doc.text("REGISTERED EMAIL", 110, y);

  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(data.attendeeName || "Attendee", 25, y);
  doc.text(data.attendeeEmail || "-", 110, y);

  // Grid row 4: Ticket Details
  y += 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text("TICKET TYPE", 25, y);
  doc.text("QUANTITY", 90, y);
  doc.text("AMOUNT PAID", 140, y);

  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(data.ticketType || "General Admission", 25, y);
  doc.text(`${data.quantity}`, 90, y);
  doc.setTextColor(109, 40, 217); // Violet 700
  doc.text(`INR ${data.totalAmount.toLocaleString("en-IN")}`, 140, y);

  // Perforated line effect
  y += 15;
  doc.setDrawColor(203, 213, 225);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(15, y, 195, y);
  doc.setLineDashPattern([], 0); // reset

  // Ticket Code Section
  y += 10;
  doc.setFillColor(245, 243, 255); // brand-50
  doc.roundedRect(25, y, 160, 26, 4, 4, "F");
  doc.setDrawColor(221, 214, 254);
  doc.roundedRect(25, y, 160, 26, 4, 4, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(124, 58, 237);
  doc.text("UNIQUE TICKET REFERENCE CODE", 105, y + 8, { align: "center" });

  doc.setFont("courier", "bold");
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(data.ticketCode || data.bookingId, 105, y + 18, { align: "center" });

  // Barcode lines
  y += 33;
  doc.setFillColor(15, 23, 42);
  let barX = 42;
  const barPattern = [3, 1, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 4, 1, 2, 3];
  for (const barWidth of barPattern) {
    doc.rect(barX, y, barWidth * 0.9, 10, "F");
    barX += barWidth * 0.9 + 2;
  }

  // Footer terms
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text("Please present this PDF ticket pass at the registration desk.", 105, y, { align: "center" });
  doc.text("Valid photo identification matching attendee name may be requested.", 105, y + 4.5, { align: "center" });
  doc.text("Generated by EforEvent Platform · Booking ID: " + data.bookingId, 105, y + 9, { align: "center" });

  return doc;
};
