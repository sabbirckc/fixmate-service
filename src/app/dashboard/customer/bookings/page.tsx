"use client";

import { useState, useEffect, Fragment } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import type { Booking, JobStatus } from "@/types";
import { toast } from "sonner";
import StatusTimeline from "@/components/StatusTimeline";
import { downloadInvoicePDF } from "@/lib/invoice-pdf";
import {
  Calendar,
  CreditCard,
  XCircle,
  AlertTriangle,
  Loader2,
  Wrench,
  CheckCircle,
  ExternalLink,
  Info,
  ChevronDown,
  ChevronUp,
  Star,
  Download,
  FileCheck,
} from "lucide-react";

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Cancellation Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [targetBooking, setTargetBooking] = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Stripe Payment Loading State
  const [payingBookingId, setPayingBookingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Optional Feature: Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [ratingInput, setRatingInput] = useState(5);
  const [reviewTextInput, setReviewTextInput] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Optional Feature: Printable Invoice Modal State
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [invoiceBooking, setInvoiceBooking] = useState<Booking | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/api/bookings/my");
      if (res.success) {
        setBookings(res.bookings || []);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const openCancelModal = (booking: Booking) => {
    setTargetBooking(booking);
    setCancelModalOpen(true);
  };

  const handleCancelBooking = async () => {
    if (!targetBooking) return;

    setCancelling(true);
    try {
      const res = await apiFetch(`/api/bookings/${targetBooking._id}/cancel`, {
        method: "PATCH",
      });

      if (res.success) {
        toast.success("Booking cancelled successfully");
        setCancelModalOpen(false);
        setTargetBooking(null);
        fetchBookings();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel booking");
    } finally {
      setCancelling(false);
    }
  };

  const handlePayNow = async (booking: Booking) => {
    setPayingBookingId(booking._id);
    try {
      // 1. Call Next.js API Route (User clicks Pay -> Next.js API Route -> Stripe creates Session)
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking._id,
          amount: booking.finalAmount || booking.basePrice,
          serviceTitle: booking.serviceTitle,
          technicianName: booking.technicianName,
          category: booking.category,
          serviceImage: booking.serviceImage,
          customerEmail: booking.customerEmail,
        }),
      }).then((r) => r.json());

      if (res.success && res.url) {
        toast.info("Redirecting to secure Stripe Checkout...", { duration: 2000 });
        window.location.href = res.url; // 2. Redirect to Stripe Hosted UI
      } else {
        throw new Error(res.message || "Could not initialize Stripe session");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to initiate payment");
      setPayingBookingId(null);
    }
  };

  const openReviewModal = (b: Booking) => {
    setReviewBooking(b);
    setRatingInput(b.rating || 5);
    setReviewTextInput(b.review || "");
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBooking) return;

    setSubmittingReview(true);
    try {
      const res = await apiFetch(`/api/bookings/${reviewBooking._id}/review`, {
        method: "POST",
        body: JSON.stringify({ rating: ratingInput, review: reviewTextInput }),
      });

      if (res.success) {
        toast.success("Thank you! Review and rating submitted successfully.");
        setReviewModalOpen(false);
        fetchBookings();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const openInvoice = (b: Booking) => {
    setInvoiceBooking(b);
    setInvoiceModalOpen(true);
  };

  const renderStatusBadge = (status: JobStatus) => {
    const map: Record<JobStatus, { label: string; bg: string }> = {
      requested: { label: "Requested", bg: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200" },
      accepted: { label: "Accepted", bg: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200" },
      "in-progress": { label: "In Progress", bg: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200" },
      completed: { label: "Completed", bg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200" },
      rejected: { label: "Rejected", bg: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-200" },
      cancelled: { label: "Cancelled", bg: "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 border-slate-200" },
    };
    const s = map[status] || { label: status, bg: "bg-slate-100 text-slate-700" };
    return (
      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border capitalize ${s.bg}`}>
        {s.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">My Repair Bookings</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track service statuses, request cancellations, and pay completed repairs via Stripe
          </p>
        </div>
        <Link
          href="/services"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <span>Find Another Service</span>
        </Link>
      </div>

      {/* Bookings Table / Cards */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
            <p className="text-xs font-semibold">Loading bookings...</p>
          </div>
        ) : bookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-4 px-5">Service & Category</th>
                  <th className="py-4 px-4">Technician</th>
                  <th className="py-4 px-4">Preferred Date</th>
                  <th className="py-4 px-4">Amount</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Payment</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {bookings.map((b) => {
                  const isCompleted = b.status === "completed";
                  const isUnpaid = b.paymentStatus === "unpaid";
                  const isRequested = b.status === "requested";

                  return (
                    <Fragment key={b._id}>
                      <tr className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      {/* Service info */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={b.serviceImage}
                            alt={b.serviceTitle}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white line-clamp-1 max-w-[200px]">
                              {b.serviceTitle}
                            </p>
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                              {b.category}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Technician */}
                      <td className="py-4 px-4">
                        <p className="font-semibold text-slate-800 dark:text-zinc-200">{b.technicianName}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{b.technicianEmail}</p>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-slate-600 dark:text-zinc-400 font-medium">
                        {new Date(b.preferredDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4">
                        <p className="font-black text-slate-900 dark:text-white text-sm">
                          ${b.finalAmount || b.basePrice}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          {isCompleted ? "Final Amount" : "Starting Price"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {renderStatusBadge(b.status)}
                      </td>

                      {/* Payment Badge */}
                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                          b.paymentStatus === "paid"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300"
                        }`}>
                          {b.paymentStatus}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setExpandedId(expandedId === b._id ? null : b._id)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-500 hover:text-blue-600 text-xs cursor-pointer"
                            title="Toggle Step Tracker"
                          >
                            {expandedId === b._id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                          {/* Cancel button: ONLY when requested */}
                          {isRequested && (
                            <button
                              type="button"
                              onClick={() => openCancelModal(b)}
                              className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-950/40 text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}

                          {/* Pay Now Button: ONLY when status === 'completed' and paymentStatus === 'unpaid' */}
                          {isCompleted && isUnpaid && (
                            <button
                              type="button"
                              disabled={payingBookingId === b._id}
                              onClick={() => handlePayNow(b)}
                              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              {payingBookingId === b._id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <CreditCard className="w-3.5 h-3.5" />
                              )}
                              <span>Pay Now (${b.finalAmount})</span>
                            </button>
                          )}

                          {/* Paid State Actions: Invoice & Review */}
                          {b.paymentStatus === "paid" && (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => openInvoice(b)}
                                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                                title="View & Download Invoice"
                              >
                                <Download className="w-3 h-3 text-blue-600" />
                                <span>Invoice</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => openReviewModal(b)}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 text-amber-700 dark:text-amber-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                                title="Review this technician"
                              >
                                <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                                <span>{b.rating ? `${b.rating}★ Reviewed` : "Review"}</span>
                              </button>
                            </div>
                          )}

                          {!isRequested && !(isCompleted && isUnpaid) && b.paymentStatus !== "paid" && (
                            <span className="text-[11px] text-slate-400">In Progress</span>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedId === b._id && (
                      <tr className="bg-slate-50/70 dark:bg-zinc-800/40 border-b border-slate-100 dark:border-zinc-800">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="max-w-xl mx-auto space-y-3">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
                              Live Job Status Step Tracker
                            </p>
                            <StatusTimeline status={b.status} paymentStatus={b.paymentStatus} />
                            <div className="pt-2 text-[11px] text-slate-500 text-center">
                              Problem: <span className="text-slate-800 dark:text-zinc-200">{b.problemDescription}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center px-4">
            <Wrench className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No bookings found</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              You haven't requested any repairs yet. Find a service to get started.
            </p>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelModalOpen && targetBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 p-5 sm:p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Cancel Repair Request?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to cancel the request for <strong>"{targetBooking.serviceTitle}"</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-3">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="w-full sm:flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer text-center"
              >
                No, Keep Booking
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancelBooking}
                className="w-full sm:flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 cursor-pointer text-center"
              >
                {cancelling ? "Cancelling..." : "Yes, Cancel Booking"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review & Rating Modal (Optional Feature 2) */}
      {reviewModalOpen && reviewBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 p-5 sm:p-6 space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto mb-2">
                <Star className="w-6 h-6 fill-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Rate & Review Technician</h3>
              <p className="text-xs text-slate-500 mt-1">
                How was your repair experience for <strong>"{reviewBooking.serviceTitle}"</strong>?
              </p>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 pt-1">
              {/* Star Selector */}
              <div className="flex justify-center items-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingInput(star)}
                    className="p-1 cursor-pointer transition-transform hover:scale-125"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= ratingInput
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300 dark:text-zinc-700"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-center text-xs font-semibold text-slate-700 dark:text-zinc-300">
                {ratingInput === 5
                  ? "⭐⭐⭐⭐⭐ Outstanding"
                  : ratingInput === 4
                  ? "⭐⭐⭐⭐ Very Good"
                  : ratingInput === 3
                  ? "⭐⭐⭐ Good"
                  : ratingInput === 2
                  ? "⭐⭐ Fair"
                  : "⭐ Needs Improvement"}
              </p>

              {/* Review Comment */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Your Feedback (Optional)
                </label>
                <textarea
                  rows={3}
                  value={reviewTextInput}
                  onChange={(e) => setReviewTextInput(e.target.value)}
                  placeholder="Share details about the technician's punctuality, repair quality, and problem resolution..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-500/20 text-center"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable / Downloadable PDF Invoice Modal (Optional Feature 5) */}
      {invoiceModalOpen && invoiceBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 p-5 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Invoice Printable View */}
            <div id="invoice-printable" className="p-4 sm:p-6 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 space-y-5 text-slate-900 dark:text-white">
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-zinc-700 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <span className="font-black text-lg text-blue-600">FixMate</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Official Repair Service Invoice</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                    PAID IN FULL
                  </span>
                  <p className="text-[10px] font-mono text-slate-400 mt-1">INV-{invoiceBooking._id.slice(-8).toUpperCase()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Billed To (Customer)</p>
                  <p className="font-bold">{invoiceBooking.customerName}</p>
                  <p className="text-slate-500">{invoiceBooking.customerEmail}</p>
                  <p className="text-slate-500">{invoiceBooking.customerPhone}</p>
                  <p className="text-slate-500 mt-1">{invoiceBooking.address}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Service Provider (Technician)</p>
                  <p className="font-bold">{invoiceBooking.technicianName}</p>
                  <p className="text-slate-500">{invoiceBooking.technicianEmail}</p>
                  <p className="text-slate-500 mt-1">Date: {new Date(invoiceBooking.preferredDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-zinc-700">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-200 dark:border-zinc-700 text-left">
                      <th className="py-2">Description</th>
                      <th className="py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2.5">
                        <p className="font-bold">{invoiceBooking.serviceTitle}</p>
                        <p className="text-[10px] text-slate-500">Category: {invoiceBooking.category}</p>
                      </td>
                      <td className="py-2.5 text-right font-black text-sm">
                        ${invoiceBooking.finalAmount || invoiceBooking.basePrice} USD
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-slate-200 dark:border-zinc-700 font-bold">
                      <td className="py-2.5">Total Paid (Stripe)</td>
                      <td className="py-2.5 text-right text-emerald-600 font-black text-base">
                        ${invoiceBooking.finalAmount || invoiceBooking.basePrice} USD
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setInvoiceModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer text-center"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  downloadInvoicePDF(invoiceBooking);
                  toast.success("Invoice downloaded successfully!");
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
