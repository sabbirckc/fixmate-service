"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api-client";
import type { Booking, JobStatus } from "@/types";
import { toast } from "sonner";
import {
  ClipboardList,
  Check,
  X,
  Play,
  CheckCircle,
  Clock,
  DollarSign,
  AlertCircle,
  Loader2,
  Calendar,
  Phone,
  MapPin,
  FileText,
} from "lucide-react";

export default function TechnicianRequestsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Mark Completed Modal State
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [finalAmountInput, setFinalAmountInput] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filterStatus !== "all") params.status = filterStatus;

      const res = await apiFetch("/api/bookings/technician", { params });
      if (res.success) {
        setBookings(res.bookings || []);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filterStatus]);

  // Handle Pipeline State Transition
  const updateStatus = async (bookingId: string, nextStatus: JobStatus, finalAmount?: number) => {
    setUpdating(true);
    try {
      const payload: any = { nextStatus };
      if (finalAmount !== undefined) payload.finalAmount = finalAmount;

      const res = await apiFetch(`/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      if (res.success) {
        toast.success(res.message || `Status updated to '${nextStatus}'`);
        setCompleteModalOpen(false);
        setActiveBooking(null);
        fetchRequests();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  // Open Completed Modal
  const openCompleteModal = (b: Booking) => {
    setActiveBooking(b);
    setFinalAmountInput(String(b.finalAmount || b.basePrice));
    setCompleteModalOpen(true);
  };

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBooking) return;

    const amount = parseFloat(finalAmountInput);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid final amount greater than 0");
      return;
    }

    updateStatus(activeBooking._id, "completed", amount);
  };

  const statusFilters = [
    { label: "All Requests", value: "all" },
    { label: "Requested", value: "requested" },
    { label: "Accepted", value: "accepted" },
    { label: "In Progress", value: "in-progress" },
    { label: "Completed", value: "completed" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Manage Service Requests</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Enforce the repair pipeline: Accept or Reject requests, start work, and mark completed with final invoicing.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {statusFilters.map((sf) => (
            <button
              key={sf.value}
              type="button"
              onClick={() => setFilterStatus(sf.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                filterStatus === sf.value
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50"
              }`}
            >
              {sf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table / Cards */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600 mb-2" />
            <p className="text-xs font-semibold">Loading requests...</p>
          </div>
        ) : bookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-4 px-5">Customer & Phone</th>
                  <th className="py-4 px-4">Service</th>
                  <th className="py-4 px-4">Address & Date</th>
                  <th className="py-4 px-4">Problem Description</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-5 text-right">Pipeline Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    {/* Customer */}
                    <td className="py-4 px-5">
                      <p className="font-bold text-slate-900 dark:text-white">{b.customerName}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-amber-600" />
                        <span>{b.customerPhone}</span>
                      </p>
                    </td>

                    {/* Service */}
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-800 dark:text-zinc-200 line-clamp-1 max-w-[180px]">
                        {b.serviceTitle}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        Base: ${b.basePrice} {b.finalAmount ? `• Final: $${b.finalAmount}` : ""}
                      </span>
                    </td>

                    {/* Address & Date */}
                    <td className="py-4 px-4">
                      <p className="text-slate-600 dark:text-zinc-300 font-medium line-clamp-1 max-w-[180px]">
                        {b.address}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Date: {new Date(b.preferredDate).toLocaleDateString()}
                      </p>
                    </td>

                    {/* Problem Description */}
                    <td className="py-4 px-4">
                      <p className="text-slate-600 dark:text-zinc-300 line-clamp-2 max-w-[220px]">
                        {b.problemDescription}
                      </p>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border capitalize ${
                          b.status === "completed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : b.status === "in-progress"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : b.status === "accepted"
                            ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                            : b.status === "cancelled" || b.status === "rejected"
                            ? "bg-slate-100 text-slate-600 border-slate-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {b.status}
                      </span>
                      {b.status === "completed" && (
                        <span className={`block mt-1 text-[10px] font-bold uppercase ${
                          b.paymentStatus === "paid" ? "text-emerald-600" : "text-amber-600"
                        }`}>
                          {b.paymentStatus}
                        </span>
                      )}
                    </td>

                    {/* Pipeline Actions (Strict rules from Challenge 3) */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Status: requested -> Accept / Reject */}
                        {b.status === "requested" && (
                          <>
                            <button
                              type="button"
                              disabled={updating}
                              onClick={() => updateStatus(b._id, "accepted")}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Accept</span>
                            </button>
                            <button
                              type="button"
                              disabled={updating}
                              onClick={() => updateStatus(b._id, "rejected")}
                              className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px] font-semibold cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}

                        {/* Status: accepted -> Start Work (in-progress) */}
                        {b.status === "accepted" && (
                          <button
                            type="button"
                            disabled={updating}
                            onClick={() => updateStatus(b._id, "in-progress")}
                            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shadow-sm flex items-center gap-1 cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>Start Work</span>
                          </button>
                        )}

                        {/* Status: in-progress -> Mark Completed (modal for finalAmount) */}
                        {b.status === "in-progress" && (
                          <button
                            type="button"
                            onClick={() => openCompleteModal(b)}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Mark Completed</span>
                          </button>
                        )}

                        {/* Final states */}
                        {["completed", "rejected", "cancelled"].includes(b.status) && (
                          <span className="text-[11px] text-slate-400 font-medium">
                            No actions available
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center px-4">
            <ClipboardList className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No requests found</h3>
            <p className="text-xs text-slate-500 mt-1">
              {filterStatus === "all" ? "You have no repair requests assigned yet." : `No requests in '${filterStatus}' state.`}
            </p>
          </div>
        )}
      </div>

      {/* Mark Completed Modal with Final Amount Input */}
      {completeModalOpen && activeBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Complete Repair Job</h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter the final payable amount for <strong>"{activeBooking.serviceTitle}"</strong>. Customer will be notified to pay this amount via Stripe.
              </p>
            </div>

            <form onSubmit={handleCompleteSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Final Invoice Amount ($ USD) *
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={finalAmountInput}
                    onChange={(e) => setFinalAmountInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Starting base price was ${activeBooking.basePrice}
                </span>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCompleteModalOpen(false)}
                  className="w-full sm:flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="w-full sm:flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 cursor-pointer text-center"
                >
                  {updating ? "Saving..." : "Confirm & Complete"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
