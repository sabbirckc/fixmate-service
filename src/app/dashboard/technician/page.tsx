"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import type { Service, Booking } from "@/types";
import StatCard from "@/components/dashboard/StatCard";
import StatusDistributionChart from "@/components/dashboard/StatusDistributionChart";
import {
  Wrench,
  CheckCircle2,
  Clock,
  PlusCircle,
  ArrowRight,
  ClipboardList,
  FolderOpen,
  Loader2,
  Sparkles,
  ShieldCheck,
  Check,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";

export default function TechnicianOverviewPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  const fetchData = async () => {
    try {
      const [servicesRes, bookingsRes, profileRes] = await Promise.all([
        apiFetch("/api/services/technician/my"),
        apiFetch("/api/bookings/technician"),
        apiFetch("/api/users/profile"),
      ]);

      if (servicesRes.success) setServices(servicesRes.services || []);
      if (bookingsRes.success) setBookings(bookingsRes.bookings || []);
      if (profileRes.success) setProfile(profileRes.user || null);
    } catch (err) {
      console.error("Failed to load technician overview data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isPro = profile?.plan === "pro";
  const totalServices = services.length;
  const approvedServices = services.filter((s) => s.approvalStatus === "approved").length;
  const pendingRequests = bookings.filter((b) => b.status === "requested").length;

  const handleUpgradePro = async () => {
    setUpgrading(true);
    try {
      toast.info("Connecting to secure Stripe Checkout...", { duration: 2000 });
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "pro_upgrade",
          amount: 29,
          serviceTitle: "FixMate Verified Pro Technician Plan",
          technicianEmail: profile?.email,
          technicianName: profile?.name,
        }),
      }).then((r) => r.json());

      if (res.success && res.url) {
        window.location.href = res.url;
      } else {
        throw new Error(res.message || "Could not initialize Stripe session");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to initiate Pro upgrade via Stripe");
      setUpgrading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-200">
            Technician Command Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-1">
            Manage Services & Repair Jobs
          </h1>
          <p className="text-xs sm:text-sm text-amber-100 mt-1 max-w-xl">
            List your specialized repair services, update job progress through the status pipeline, and set your final service charges upon completion.
          </p>
        </div>
        <Link
          href="/dashboard/technician/add-service"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-amber-700 hover:bg-amber-50 font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Service</span>
        </Link>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Total Services"
          value={totalServices}
          icon={FolderOpen}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="Approved Services"
          value={approvedServices}
          icon={CheckCircle2}
          color="emerald"
          loading={loading}
        />
        <StatCard
          title="Pending Requests"
          value={pendingRequests}
          icon={Clock}
          color="amber"
          loading={loading}
        />
      </div>

      {/* Pro Plan Status Banner (Optional Feature 1) */}
      <div className={`p-6 rounded-3xl border transition-all ${
        isPro
          ? "bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border-amber-300 dark:border-amber-700/50"
          : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800"
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              {isPro ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black uppercase tracking-wider shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Pro Technician
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold uppercase tracking-wider">
                  Free Technician Plan
                </span>
              )}
              <span className="text-xs text-slate-500 font-medium">
                {isPro ? "Unlimited Listings Active" : `Listing Quota: ${totalServices}/3 services used`}
              </span>
            </div>
            <p className="text-sm text-slate-700 dark:text-zinc-300 font-medium">
              {isPro
                ? "You have full Verified Pro privileges: unlimited repair service listings, gold verified badge on public cards, and priority customer visibility."
                : "Free technicians are limited to listing 3 services. Upgrade to FixMate Verified Pro to unlock unlimited listings, verified gold badge, and priority customer reach."}
            </p>
          </div>

          {!isPro && (
            <button
              type="button"
              disabled={upgrading}
              onClick={handleUpgradePro}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs shadow-lg shadow-amber-500/20 shrink-0 cursor-pointer disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4 text-amber-200" />
              <span>{upgrading ? "Connecting to Stripe..." : "Pay $29 & Upgrade to Pro (Stripe)"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Visual Analytics Chart (Requirement: Charts and graphs for quick data visualization) */}
      <StatusDistributionChart
        title="My Repair Job Pipeline Analytics"
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

      {/* Pending Action Requests Queue */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Service Requests</h2>
            <p className="text-xs text-slate-500">Jobs waiting for response or in progress</p>
          </div>
          <Link
            href="/dashboard/technician/requests"
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            <span>Manage All Requests</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
          </div>
        ) : bookings.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800">
            {bookings.slice(0, 4).map((b) => (
              <div key={b._id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{b.serviceTitle}</h3>
                  <p className="text-xs text-slate-500">
                    Customer: <strong>{b.customerName}</strong> ({b.customerPhone}) • Address: {b.address}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize ${
                    b.status === "completed"
                      ? "bg-emerald-100 text-emerald-700"
                      : b.status === "in-progress"
                      ? "bg-amber-100 text-amber-700"
                      : b.status === "accepted"
                      ? "bg-indigo-100 text-indigo-700"
                      : b.status === "cancelled" || b.status === "rejected"
                      ? "bg-slate-100 text-slate-600"
                      : "bg-blue-100 text-blue-700"
                  }`}>
                    {b.status}
                  </span>
                  <Link
                    href="/dashboard/technician/requests"
                    className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-zinc-300"
                  >
                    Action
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400">
            <ClipboardList className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold">No repair requests assigned yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
