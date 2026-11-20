"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api-client";
import type { Booking, JobStatus } from "@/types";
import { Calendar, Phone, MapPin, Loader2, Wrench } from "lucide-react";
import { toast } from "sonner";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filterStatus !== "all") params.status = filterStatus;

      const res = await apiFetch("/api/admin/bookings", { params });
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
  }, [filterStatus]);

  const statusFilters = [
    { label: "All Bookings", value: "all" },
    { label: "Requested", value: "requested" },
    { label: "Accepted", value: "accepted" },
    { label: "In Progress", value: "in-progress" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled / Rejected", value: "cancelled" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Platform Bookings Ledger</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Global monitoring of all customer repair jobs across technicians and categories
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden self-start sm:self-auto">
          {statusFilters.map((sf) => (
            <button
              key={sf.value}
              type="button"
              onClick={() => setFilterStatus(sf.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                filterStatus === sf.value
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50"
              }`}
            >
              {sf.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-2" />
            <p className="text-xs font-semibold">Loading platform bookings...</p>
          </div>
        ) : bookings.length > 0 ? (
          <>
            {/* Mobile Cards View */}
            <div className="block lg:hidden divide-y divide-slate-100 dark:divide-zinc-800 p-4 space-y-4">
              {bookings.map((b) => (
                <div
                  key={b._id}
                  className="pt-4 first:pt-0 rounded-2xl bg-slate-50/60 dark:bg-zinc-800/40 p-4 border border-slate-200/80 dark:border-zinc-700/60 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">
                        {b.serviceTitle}
                      </p>
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                        {b.category}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border capitalize shrink-0 ${
                      b.status === "completed"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : b.status === "in-progress"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : b.status === "accepted"
                        ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                        : b.status === "cancelled" || b.status === "rejected"
                        ? "bg-slate-100 text-slate-600 border-slate-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}>
                      {b.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200/60 dark:border-zinc-700/60">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Customer</span>
                      <span className="font-semibold text-slate-700 dark:text-zinc-300 truncate block">
                        {b.customerName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Technician</span>
                      <span className="font-semibold text-slate-700 dark:text-zinc-300 truncate block">
                        {b.technicianName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60 dark:border-zinc-700/60">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Amount</span>
                      <span className="font-black text-slate-900 dark:text-white text-sm">
                        ${b.finalAmount || b.basePrice}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">
                        {new Date(b.preferredDate).toLocaleDateString()}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                        b.paymentStatus === "paid"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {b.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-4 px-5">Service</th>
                    <th className="py-4 px-4">Customer</th>
                    <th className="py-4 px-4">Technician</th>
                    <th className="py-4 px-4">Date & Address</th>
                    <th className="py-4 px-4">Amount</th>
                    <th className="py-4 px-4">Job Status</th>
                    <th className="py-4 px-5 text-right">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {bookings.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="py-4 px-5">
                        <p className="font-bold text-slate-900 dark:text-white line-clamp-1 max-w-[180px]">
                          {b.serviceTitle}
                        </p>
                        <span className="text-[10px] text-blue-600 font-semibold">{b.category}</span>
                      </td>

                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-800 dark:text-zinc-200">{b.customerName}</p>
                        <p className="text-[10px] text-slate-400">{b.customerEmail}</p>
                      </td>

                      <td className="py-4 px-4">
                        <p className="font-semibold text-slate-800 dark:text-zinc-200">{b.technicianName}</p>
                        <p className="text-[10px] text-slate-400">{b.technicianEmail}</p>
                      </td>

                      <td className="py-4 px-4">
                        <p className="text-slate-600 dark:text-zinc-400 font-medium">
                          {new Date(b.preferredDate).toLocaleDateString()}
                        </p>
                        <p className="text-[10px] text-slate-400 line-clamp-1 max-w-[150px]">{b.address}</p>
                      </td>

                      <td className="py-4 px-4 font-black text-slate-900 dark:text-white text-sm">
                        ${b.finalAmount || b.basePrice}
                      </td>

                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border capitalize ${
                          b.status === "completed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : b.status === "in-progress"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : b.status === "accepted"
                            ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                            : b.status === "cancelled" || b.status === "rejected"
                            ? "bg-slate-100 text-slate-600 border-slate-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}>
                          {b.status}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-right">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                          b.paymentStatus === "paid"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>
                          {b.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="py-20 text-center px-4">
            <Calendar className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No bookings match criteria</h3>
          </div>
        )}
      </div>
    </div>
  );
}
