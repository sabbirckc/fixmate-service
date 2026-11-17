"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import type { AdminStats } from "@/types";
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
} from "lucide-react";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await apiFetch("/api/admin/overview");
        if (res.success && res.stats) {
          setStats(res.stats);
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
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-200">
            Platform Master Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-1">
            FixMate Management Console
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 mt-1 max-w-xl">
            Monitor platform health, approve technician service listings, manage user roles, and inspect real-time transaction ledgers.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/admin/services"
            className="px-4 py-2.5 rounded-xl bg-white text-purple-700 hover:bg-purple-50 font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            Review Pending Services
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Users</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {loading ? "..." : stats?.totalUsers || 0}
            </p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center font-bold">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Technicians</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {loading ? "..." : stats?.totalTechnicians || 0}
            </p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Approvals</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {loading ? "..." : stats?.pendingServices || 0}
            </p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              ${loading ? "..." : stats?.totalRevenue || 0} USD
            </p>
          </div>
        </div>
      </div>

      {/* Quick Navigation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <p className="text-xs text-slate-500 mt-1">Review new services submitted by technicians, inspect descriptions and pricing, and grant approval.</p>
        </Link>

        <Link
          href="/dashboard/admin/users"
          className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-purple-500 transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h2 className="font-bold text-base text-slate-900 dark:text-white">Manage User Roles</h2>
          <p className="text-xs text-slate-500 mt-1">Promote customer accounts to verified technicians or manage administrative assignments safely.</p>
        </Link>
      </div>
    </div>
  );
}
