"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import type { Booking } from "@/types";
import StatCard from "@/components/dashboard/StatCard";
import StatusDistributionChart from "@/components/dashboard/StatusDistributionChart";
import {
  Calendar,
  Clock,
  CheckCircle2,
  ArrowRight,
  Wrench,
  CreditCard,
  Plus,
  Loader2,
} from "lucide-react";

export default function CustomerOverviewPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await apiFetch("/api/bookings/my");
        if (res.success) {
          setBookings(res.bookings || []);
        }
      } catch (err) {
        console.error("Failed to load customer overview bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const totalRequests = bookings.length;
  const activeJobs = bookings.filter((b) =>
    ["requested", "accepted", "in-progress"].includes(b.status)
  ).length;
  const completedJobs = bookings.filter((b) => b.status === "completed").length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
            Customer Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-1">
            Track & Manage Your Repairs
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
            Monitor the status of your active service requests in real-time, view invoice amounts, and pay securely only after the job is completed.
          </p>
        </div>
        <Link
          href="/services"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-blue-600 hover:bg-blue-50 font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Repair</span>
        </Link>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Total Requests"
          value={totalRequests}
          icon={Calendar}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="Active Jobs"
          value={activeJobs}
          icon={Clock}
          color="amber"
          loading={loading}
        />
        <StatCard
          title="Completed Jobs"
          value={completedJobs}
          icon={CheckCircle2}
          color="emerald"
          loading={loading}
        />
      </div>

      {/* Visual Analytics Chart (Requirement: Charts and graphs for quick data visualization) */}
      <StatusDistributionChart
        title="My Repair Requests Distribution"
        data={[
          {
            name: "Requested",
            count: bookings.filter((b) => b.status === "requested").length,
            color: "#3b82f6",
          },
          {
            name: "Accepted",
            count: bookings.filter((b) => b.status === "accepted").length,
            color: "#6366f1",
          },
          {
            name: "In Progress",
            count: bookings.filter((b) => b.status === "in-progress").length,
            color: "#f59e0b",
          },
          {
            name: "Completed",
            count: bookings.filter((b) => b.status === "completed").length,
            color: "#10b981",
          },
        ]}
      />

      {/* Recent Bookings Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Service Requests</h2>
            <p className="text-xs text-slate-500">Live preview of your latest repair appointments</p>
          </div>
          <Link
            href="/dashboard/customer/bookings"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : bookings.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800">
            {bookings.slice(0, 4).map((b) => (
              <div key={b._id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={b.serviceImage}
                    alt={b.serviceTitle}
                    className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{b.serviceTitle}</h3>
                    <p className="text-xs text-slate-400">Tech: {b.technicianName} • ${b.finalAmount || b.basePrice} USD</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize ${
                    b.status === "completed"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      : b.status === "in-progress"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                      : b.status === "accepted"
                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                      : b.status === "cancelled" || b.status === "rejected"
                      ? "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400"
                      : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  }`}>
                    {b.status}
                  </span>

                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase ${
                    b.paymentStatus === "paid"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}>
                    {b.paymentStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            <Wrench className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold">No repair requests yet</p>
            <p className="text-xs mt-1">Browse our verified repair catalog to book your first service.</p>
          </div>
        )}
      </div>
    </div>
  );
}
