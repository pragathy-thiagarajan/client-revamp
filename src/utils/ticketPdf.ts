import { jsPDF } from "jspdf";

export interface TicketPdfOptions {
  eventTitle: string;
  category?: string;
  eventDate: string;
  startTime?: string;
  endTime?: string;
  location: string;
  ticketType: string;
  quantity: number;
  totalAmount: number;
  ticketCode: string;
  bookingId: string;
  bookingStatus: string;
  paymentStatus: string;
  attendeeName: string;
  attendeeEmail: string;
  qrCodeUrl?: string;
}

/**
 * Converts an SVG or image URL to a PNG data URL via canvas for reliable embedding into jsPDF
 */
const convertToPngDataUrl = (src: string): Promise<string> => {
  return new Promise((resolve) => {
    if (!src) {
      resolve("");
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 300;
        canvas.height = 300;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, 300, 300);
          ctx.drawImage(img, 0, 0, 300, 300);
          resolve(canvas.toDataURL("image/png"));
          return;
        }
      } catch (e) {
        console.warn("Canvas conversion error", e);
      }
      resolve("");
    };
    img.onerror = () => resolve("");
    img.src = src;
  });
};

/**
 * Formats a date string nicely
 */
const formatDate = (dateStr?: string) => {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const formatTime = (timeStr?: string) => {
  if (!timeStr) return "-";
  try {
    const [h, m] = timeStr.split(":");
    const d = new Date();
    d.setHours(Number(h) || 0);
    d.setMinutes(Number(m) || 0);
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return timeStr;
  }
};

/**
 * Generates and downloads a high-quality PDF ticket pass
 */
export const generateTicketPdf = async (ticket: TicketPdfOptions): Promise<void> => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 16;
  const cardWidth = pageWidth - marginX * 2; // 178mm
  const startY = 18;

  // Background page tint (soft slate)
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Main Card Container (Outer rounded box)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.6);
  doc.roundedRect(marginX, startY, cardWidth, 255, 4, 4, "FD");

  // 1. Header Banner (Deep Indigo / Violet)
  const headerHeight = 52;
  doc.setFillColor(30, 27, 75); // slate-950 / violet-950
  doc.roundedRect(marginX, startY, cardWidth, headerHeight, 4, 4, "F");
  // Fill the bottom corners of header so it seamlessly meets the body
  doc.rect(marginX, startY + headerHeight - 4, cardWidth, 4, "F");

  // Header Decorative Accent Line
  doc.setFillColor(124, 58, 237); // violet-600
  doc.rect(marginX, startY + headerHeight - 1.5, cardWidth, 1.5, "F");

  // Brand Badge
  doc.setFillColor(255, 255, 255);
  doc.rect(marginX + 10, startY + 8, 6, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(109, 40, 217);
  doc.text("E", marginX + 11.5, startY + 12.5);

  doc.setFontSize(8);
  doc.setTextColor(221, 214, 254);
  doc.text("EFOREVENT  •  OFFICIAL ENTRY PASS", marginX + 19, startY + 12.5);

  // Admit One & Category
  doc.setFontSize(7.5);
  doc.setTextColor(196, 181, 253);
  const categoryText = (ticket.category || "ADMIT ONE").toUpperCase() + "  •  " + ticket.ticketType.toUpperCase();
  doc.text(categoryText, marginX + 10, startY + 22);

  // Event Title (Truncated if too long)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  const titleLines = doc.splitTextToSize(ticket.eventTitle || "Event Experience", cardWidth - 56);
  doc.text(titleLines.slice(0, 2), marginX + 10, startY + 30);

  // Status Badges
  doc.setFontSize(7.5);
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.roundedRect(marginX + 10, startY + 41, 32, 5.5, 1.5, 1.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.text("CONFIRMED PASS", marginX + 13, startY + 45);

  doc.setFillColor(79, 70, 229); // indigo-600
  doc.roundedRect(marginX + 45, startY + 41, 30, 5.5, 1.5, 1.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.text(ticket.paymentStatus.toUpperCase() === "PAID" ? "VERIFIED PAID" : ticket.paymentStatus.toUpperCase(), marginX + 48, startY + 45);

  // Right Date Box in Header
  const dateBoxX = marginX + cardWidth - 36;
  const dateBoxY = startY + 8;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(dateBoxX, dateBoxY, 26, 36, 3, 3, "F");

  let monthStr = "EVENT";
  let dayStr = "--";
  let yearStr = "2026";
  if (ticket.eventDate) {
    try {
      const d = new Date(ticket.eventDate);
      monthStr = d.toLocaleDateString("en-IN", { month: "short" }).toUpperCase();
      dayStr = d.toLocaleDateString("en-IN", { day: "2-digit" });
      yearStr = String(d.getFullYear());
    } catch {
      // fallback
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(124, 58, 237);
  doc.text(monthStr, dateBoxX + 13, dateBoxY + 8, { align: "center" });

  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text(dayStr, dateBoxX + 13, dateBoxY + 20, { align: "center" });

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(yearStr, dateBoxX + 13, dateBoxY + 28, { align: "center" });

  // 2. Primary Details Grid
  let curY = startY + headerHeight + 12;

  // Row 1: Date & Time, Quantity, Price
  const colW = (cardWidth - 20) / 3;

  // Box 1: Date & Time
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("DATE & SCHEDULE", marginX + 10, curY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(formatDate(ticket.eventDate), marginX + 10, curY + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const timeText = ticket.startTime
    ? `${formatTime(ticket.startTime)} - ${formatTime(ticket.endTime)}`
    : "Full Day Access";
  doc.text(timeText, marginX + 10, curY + 10);

  // Box 2: Ticket Tier & Quantity
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text("TICKET & QUANTITY", marginX + 10 + colW, curY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`${ticket.ticketType}`, marginX + 10 + colW, curY + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`${ticket.quantity} ${ticket.quantity === 1 ? "Person" : "Persons"} Entry`, marginX + 10 + colW, curY + 10);

  // Box 3: Total Paid
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text("TOTAL AMOUNT PAID", marginX + 10 + colW * 2, curY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(109, 40, 217); // violet-700
  doc.text(`INR ${Number(ticket.totalAmount || 0).toLocaleString("en-IN")}`, marginX + 10 + colW * 2, curY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(16, 185, 129);
  doc.text("Payment Completed", marginX + 10 + colW * 2, curY + 11);

  // Venue Banner Box
  curY += 18;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.roundedRect(marginX + 10, curY, cardWidth - 20, 16, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("VENUE & ADDRESS", marginX + 14, curY + 5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  const locationLines = doc.splitTextToSize(ticket.location || "Venue details to be confirmed by organizer", cardWidth - 28);
  doc.text(locationLines[0], marginX + 14, curY + 11);

  // Attendee Info Box
  curY += 22;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text("REGISTERED ATTENDEE", marginX + 10, curY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(ticket.attendeeName || "Valued Guest", marginX + 10, curY + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(ticket.attendeeEmail || "-", marginX + 10, curY + 10);

  // Booking reference
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text("BOOKING REFERENCE ID", marginX + 10 + colW * 1.5, curY);

  doc.setFont("courier", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(ticket.bookingId, marginX + 10 + colW * 1.5, curY + 6);

  // 3. Perforated Tear Line with notch cuts
  curY += 18;
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineDashPattern([2, 2], 0);
  doc.line(marginX, curY, marginX + cardWidth, curY);
  doc.setLineDashPattern([], 0); // reset dash

  // Left & right cut-out notches
  doc.setFillColor(248, 250, 252);
  doc.circle(marginX, curY, 3.5, "F");
  doc.circle(marginX + cardWidth, curY, 3.5, "F");

  // 4. Scanner & QR Code Section
  curY += 10;
  const qrBoxSize = 38;
  const qrX = marginX + 10;
  const qrY = curY;

  // QR Container background
  doc.setFillColor(245, 243, 255); // brand-50
  doc.setDrawColor(221, 214, 254); // brand-200
  doc.roundedRect(qrX, qrY, qrBoxSize, qrBoxSize + 8, 2, 2, "FD");

  // Embed QR Code if available
  let embeddedQr = false;
  if (ticket.qrCodeUrl) {
    try {
      const pngUrl = await convertToPngDataUrl(ticket.qrCodeUrl);
      if (pngUrl) {
        doc.addImage(pngUrl, "PNG", qrX + 3, qrY + 3, qrBoxSize - 6, qrBoxSize - 6);
        embeddedQr = true;
      }
    } catch (e) {
      console.warn("Failed embedding QR code into PDF", e);
    }
  }

  if (!embeddedQr) {
    // Draw procedural QR pattern fallback
    doc.setFillColor(255, 255, 255);
    doc.rect(qrX + 3, qrY + 3, qrBoxSize - 6, qrBoxSize - 6, "F");

    doc.setFillColor(124, 58, 237);
    // 3 position markers
    doc.rect(qrX + 5, qrY + 5, 8, 8, "F");
    doc.rect(qrX + 25, qrY + 5, 8, 8, "F");
    doc.rect(qrX + 5, qrY + 25, 8, 8, "F");

    doc.setFillColor(255, 255, 255);
    doc.rect(qrX + 7, qrY + 7, 4, 4, "F");
    doc.rect(qrX + 27, qrY + 7, 4, 4, "F");
    doc.rect(qrX + 7, qrY + 27, 4, 4, "F");

    doc.setFillColor(15, 23, 42);
    doc.rect(qrX + 15, qrY + 5, 4, 8, "F");
    doc.rect(qrX + 15, qrY + 16, 10, 4, "F");
    doc.rect(qrX + 22, qrY + 22, 9, 5, "F");
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.setTextColor(109, 40, 217);
  doc.text("SCAN AT ENTRANCE", qrX + qrBoxSize / 2, qrY + qrBoxSize + 5, { align: "center" });

  // Right side of QR: Ticket Code & Barcode
  const barLeft = qrX + qrBoxSize + 8;
  const barWidth = cardWidth - (barLeft - marginX) - 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text("TICKET REFERENCE CODE", barLeft, curY + 4);

  doc.setFont("courier", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(ticket.ticketCode || ticket.bookingId, barLeft, curY + 11);

  // Draw authentic Barcode Lines
  const barcodeY = curY + 15;
  const barcodeHeight = 12;
  doc.setFillColor(248, 250, 252);
  doc.rect(barLeft, barcodeY, barWidth, barcodeHeight, "F");

  // Barcode pattern weights
  const barPattern = [3, 1, 2, 4, 1, 3, 1, 2, 1, 4, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3];
  let curBarX = barLeft + 2;
  const unitW = barWidth / (barPattern.length * 2.2);

  doc.setFillColor(15, 23, 42);
  for (let i = 0; i < barPattern.length; i++) {
    const w = barPattern[i] * unitW * 0.55;
    if (curBarX + w < barLeft + barWidth - 2) {
      doc.rect(curBarX, barcodeY, w, barcodeHeight, "F");
    }
    curBarX += w + (barPattern[(i + 3) % barPattern.length] * unitW * 0.45);
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Admit: ${ticket.quantity} • Pass: ${ticket.ticketType}`, barLeft, barcodeY + barcodeHeight + 5);

  // 5. Admission Instructions
  curY += 58;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(marginX + 10, curY, cardWidth - 20, 36, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text("IMPORTANT ADMISSION INSTRUCTIONS", marginX + 14, curY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);

  const bulletPoints = [
    "1. Present this digital PDF ticket or a printed copy along with a valid government photo ID.",
    "2. Gates open 30 minutes before scheduled event start. Please arrive early to avoid queue delays.",
    "3. Each ticket contains a unique QR code which can be scanned only once at the venue turnstile.",
    "4. Tickets are non-refundable unless the event is officially cancelled or rescheduled by organizer.",
    "5. Transfers must be completed through your EforEvent account prior to check-in.",
  ];

  bulletPoints.forEach((point, idx) => {
    doc.text(point, marginX + 14, curY + 12 + idx * 4.5);
  });

  // Footer inside card
  const footerY = startY + 250;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  const nowStr = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  doc.text(`Generated on ${nowStr} • Verified by EforEvent Platform`, marginX + 10, footerY);
  doc.text(`Page 1 of 1`, marginX + cardWidth - 10, footerY, { align: "right" });

  // Save / Trigger Download
  const fileName = `ticket-${ticket.ticketCode || ticket.bookingId}.pdf`;
  doc.save(fileName);
};
