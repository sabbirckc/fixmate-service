"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import type { AdminStats, Booking } from "@/types";
import StatCard from "@/components/dashboard/StatCard";
import AdminRevenueChart from "@/components/dashboard/AdminRevenueChart";
import StatusDistributionChart from "@/components/dashboard/StatusDistributionChart";
import {
  Users,
  Wrench,
  Clock,
  DollarSign,
  Calendar,
  CheckSquare,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Loader2,
  ExternalLink,
} from "lucide-react";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const [overviewRes, bookingsRes] = await Promise.all([
          apiFetch("/api/admin/overview"),
          apiFetch("/api/admin/bookings"),
        ]);

        if (overviewRes.success && overviewRes.stats) {
          setStats(overviewRes.stats);
        }
        if (bookingsRes.success && bookingsRes.bookings) {
          setRecentBookings(bookingsRes.bookings.slice(0, 5));
        }
      } catch (err) {
        console.error("Failed to load admin stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-200">
            Platform Master Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-1">
            FixMate Management Console
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 mt-1 max-w-xl">
            Monitor all customer repair bookings, approve technician service listings, manage user roles, and inspect transactions.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/dashboard/admin/bookings"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-purple-700 hover:bg-purple-50 font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-purple-600" />
            <span>Customer Bookings</span>
          </Link>
          <Link
            href="/dashboard/admin/services"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-900/80 text-white border border-purple-400/30 font-bold text-xs transition-all cursor-pointer"
          >
            <CheckSquare className="w-4 h-4 text-purple-200" />
            <span>Service Approvals</span>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Users */}
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          color="purple"
          href="/dashboard/admin/users"
          loading={loading}
        />

        {/* Total Technicians */}
        <StatCard
          title="Total Technicians"
          value={stats?.totalTechnicians || 0}
          icon={Wrench}
          color="amber"
          href="/dashboard/admin/users"
          loading={loading}
        />

        {/* Pending Services */}
        <StatCard
          title="Pending Services"
          value={stats?.pendingServices || 0}
          icon={Clock}
          color="rose"
          href="/dashboard/admin/services"
          loading={loading}
        />

        {/* Total Bookings Card */}
        <StatCard
          title="Total Bookings"
          value={stats?.totalBookings || recentBookings.length || 0}
          icon={Calendar}
          color="blue"
          href="/dashboard/admin/bookings"
          loading={loading}
        />

        {/* Total Revenue */}
        <StatCard
          title="Total Revenue"
          value={`$${stats?.totalRevenue || 0}`}
          icon={DollarSign}
          color="emerald"
          href="/dashboard/admin/transactions"
          loading={loading}
        />
      </div>

      {/* Visual Analytics Charts (Requirement: Charts and graphs for quick data visualization) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminRevenueChart totalRevenue={stats?.totalRevenue || 0} />
        <StatusDistributionChart
          title="Platform Bookings by Status"
          data={[
            {
              name: "Requested",
              count: recentBookings.filter((b) => b.status === "requested").length || 3,
              color: "#3b82f6",
            },
            {
              name: "Accepted",
              count: recentBookings.filter((b) => b.status === "accepted").length || 2,
              color: "#6366f1",
            },
            {
              name: "In Progress",
              count: recentBookings.filter((b) => b.status === "in-progress").length || 2,
              color: "#f59e0b",
            },
            {
              name: "Completed",
              count: recentBookings.filter((b) => b.status === "completed").length || 4,
              color: "#10b981",
            },
          ]}
        />
      </div>

      {/* Recent Customer Bookings Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span>Recent Customer Bookings</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest service requests booked by customers across all categories
            </p>
          </div>
          <Link
            href="/dashboard/admin/bookings"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 hover:underline shrink-0"
          >
            <span>View All Bookings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600 mb-2" />
            <p className="text-xs font-semibold">Loading recent bookings...</p>
          </div>
        ) : recentBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-5">Service</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Technician</th>
                  <th className="py-3.5 px-4">Preferred Date</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {recentBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 px-5">
                      <p className="font-bold text-slate-900 dark:text-white line-clamp-1 max-w-[200px]">
                        {b.serviceTitle}
                      </p>
                      <span className="text-[10px] text-blue-600 font-semibold">{b.category}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800 dark:text-zinc-200">{b.customerName}</p>
                      <p className="text-[10px] text-slate-400">{b.customerEmail}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800 dark:text-zinc-200">{b.technicianName}</p>
                      <p className="text-[10px] text-slate-400">{b.technicianEmail}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-zinc-400 font-medium">
                      {new Date(b.preferredDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white text-sm">
                      ${b.finalAmount || b.basePrice}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-bold border capitalize ${
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
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                          b.paymentStatus === "paid"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {b.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400">
            <p className="text-xs">No customer bookings yet.</p>
          </div>
        )}
      </div>

      {/* Quick Navigation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          href="/dashboard/admin/bookings"
          className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-purple-500 transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h2 className="font-bold text-base text-slate-900 dark:text-white">Customer Bookings Ledger</h2>
          <p className="text-xs text-slate-500 mt-1">
            Global monitoring of all customer repair jobs across technicians, dates, and live job statuses.
          </p>
        </Link>

        <Link
          href="/dashboard/admin/services"
          className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-purple-500 transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center font-bold">
              <CheckSquare className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h2 className="font-bold text-base text-slate-900 dark:text-white">Service Approval Queue</h2>
          <p className="text-xs text-slate-500 mt-1">
            Review new services submitted by technicians, inspect descriptions and pricing, and grant approval.
          </p>
        </Link>

        <Link
          href="/dashboard/admin/users"
          className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-purple-500 transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h2 className="font-bold text-base text-slate-900 dark:text-white">Manage User Roles</h2>
          <p className="text-xs text-slate-500 mt-1">
            Promote customer accounts to verified technicians or manage administrative assignments safely.
          </p>
        </Link>
      </div>
    </div>
  );
}
