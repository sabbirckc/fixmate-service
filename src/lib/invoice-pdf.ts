import { jsPDF } from "jspdf";
import type { Booking } from "@/types";

/**
 * Generates and directly triggers download of a professional PDF invoice for a booking.
 */
export function downloadInvoicePDF(booking: Booking) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const invoiceNo = `INV-${booking._id.slice(-8).toUpperCase()}`;
  const invoiceDate = new Date(booking.preferredDate || booking.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const amount = Number(booking.finalAmount || booking.basePrice || 0).toFixed(2);

  // Background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 210, 297, "F");

  // Top Accent Bar (FixMate Blue: #2563EB)
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 210, 6, "F");

  // Header: Brand & Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(37, 99, 235);
  doc.text("FixMate", 20, 24);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("Smart Device & Home Appliance Repair Network", 20, 30);
  doc.text("Official Service Repair Invoice", 20, 35);

  // Right Header: Status Badge & Invoice No
  doc.setFillColor(16, 185, 129); // Emerald
  doc.roundedRect(148, 16, 42, 8, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text("PAID IN FULL", 169, 21.5, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text(invoiceNo, 190, 32, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Issued: ${invoiceDate}`, 190, 38, { align: "right" });

  // Divider Line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(20, 45, 190, 45);

  // Two Column Details: Customer & Technician
  const colY = 54;

  // Left Column - Billed To
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("BILLED TO (CUSTOMER)", 20, colY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(booking.customerName || "Customer", 20, colY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(booking.customerEmail || "", 20, colY + 12);
  doc.text(booking.customerPhone ? `Phone: ${booking.customerPhone}` : "", 20, colY + 17);
  doc.text(booking.address ? `Address: ${booking.address}` : "", 20, colY + 22);

  // Right Column - Service Provider (Technician)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("SERVICE PROVIDER (TECHNICIAN)", 115, colY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(booking.technicianName || "FixMate Verified Technician", 115, colY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(booking.technicianEmail || "", 115, colY + 12);
  doc.text(`Service Date: ${invoiceDate}`, 115, colY + 17);
  doc.text("Payment Method: Stripe Card Payment", 115, colY + 22);

  // Table Section
  const tableStartY = 88;

  // Table Header Background
  doc.setFillColor(241, 245, 249);
  doc.rect(20, tableStartY, 170, 9, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text("DESCRIPTION / SERVICE ITEM", 24, tableStartY + 6);
  doc.text("AMOUNT (USD)", 186, tableStartY + 6, { align: "right" });

  // Table Row
  const rowY = tableStartY + 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(booking.serviceTitle || "Repair Service", 24, rowY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Category: ${booking.category || "General Repair"}  |  Status: Completed & Verified`, 24, rowY + 6);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`$${amount}`, 186, rowY, { align: "right" });

  // Table Separator Line
  doc.setDrawColor(226, 232, 240);
  doc.line(20, rowY + 14, 190, rowY + 14);

  // Total Section
  const totalY = rowY + 26;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text("Subtotal:", 140, totalY);
  doc.text(`$${amount}`, 186, totalY, { align: "right" });

  doc.text("Platform & Service Tax:", 140, totalY + 6);
  doc.text("$0.00", 186, totalY + 6, { align: "right" });

  // Total Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(130, totalY + 11, 60, 14, 2, 2, "F");
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(130, totalY + 11, 60, 14, 2, 2, "D");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Total Paid:", 135, totalY + 20);

  doc.setFontSize(13);
  doc.setTextColor(5, 150, 105); // Emerald-600
  doc.text(`$${amount} USD`, 185, totalY + 20, { align: "right" });

  // Problem / Scope of Work Box
  if (booking.problemDescription) {
    const scopeY = totalY + 36;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(20, scopeY, 170, 24, 2, 2, "F");
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(20, scopeY, 170, 24, 2, 2, "D");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text("CLIENT PROBLEM DESCRIPTION & SCOPE OF REPAIR:", 24, scopeY + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const splitDesc = doc.splitTextToSize(booking.problemDescription, 160);
    doc.text(splitDesc.slice(0, 3), 24, scopeY + 12);
  }

  // Footer / Terms
  const footerY = 250;
  doc.setDrawColor(226, 232, 240);
  doc.line(20, footerY, 190, footerY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text("Thank you for choosing FixMate!", 20, footerY + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "All repairs conducted by FixMate verified technicians are covered under our customer satisfaction guarantee.",
    20,
    footerY + 13
  );
  doc.text(
    "This is a computer-generated receipt for your records. For questions or support, contact support@fixmate.com",
    20,
    footerY + 18
  );

  // Trigger browser download directly
  doc.save(`FixMate-Invoice-${invoiceNo}.pdf`);
}
