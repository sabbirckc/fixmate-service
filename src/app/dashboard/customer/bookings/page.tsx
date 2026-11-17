"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import type { Booking, JobStatus } from "@/types";
import { toast } from "sonner";
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
      const res = await apiFetch("/api/payments/create-checkout-session", {
        method: "POST",
        body: JSON.stringify({ bookingId: booking._id }),
      });

      if (res.success && res.url) {
        toast.info("Redirecting to secure Stripe Checkout...", { duration: 2000 });
        window.location.href = res.url;
      } else {
        throw new Error(res.message || "Could not initialize Stripe session");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to initiate payment");
      setPayingBookingId(null);
    }
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
                    <tr key={b._id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
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

                          {/* Paid State Marker */}
                          {b.paymentStatus === "paid" && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Settled</span>
                            </span>
                          )}

                          {!isRequested && !(isCompleted && isUnpaid) && b.paymentStatus !== "paid" && (
                            <span className="text-[11px] text-slate-400">In Progress</span>
                          )}
                        </div>
                      </td>
                    </tr>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Cancel Repair Request?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to cancel the request for <strong>"{targetBooking.serviceTitle}"</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 dark:text-zinc-300 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                No, Keep Booking
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancelBooking}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 cursor-pointer"
              >
                {cancelling ? "Cancelling..." : "Yes, Cancel Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
