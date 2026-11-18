"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import type { Service, ApprovalStatus } from "@/types";
import { toast } from "sonner";
import {
  CheckSquare,
  Check,
  X,
  ExternalLink,
  Loader2,
  Filter,
  DollarSign,
  Clock,
  MapPin,
  Wrench,
} from "lucide-react";

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("pending");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filter !== "all") params.status = filter;

      const res = await apiFetch("/api/admin/services", { params });
      if (res.success) {
        setServices(res.services || []);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [filter]);

  const handleApproval = async (serviceId: string, approvalStatus: ApprovalStatus) => {
    setUpdatingId(serviceId);
    try {
      const res = await apiFetch(`/api/admin/services/${serviceId}/approval`, {
        method: "PATCH",
        body: JSON.stringify({ approvalStatus }),
      });

      if (res.success) {
        toast.success(`Service marked as '${approvalStatus}'`);
        setServices((prev) =>
          prev.map((s) => (s._id === serviceId ? { ...s, approvalStatus } : s))
        );
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update service approval");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Service Approval Moderation</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review technician submissions. Only approved services are visible on public pages.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden self-start sm:self-auto">
          {[
            { label: "Pending Approvals", value: "pending" },
            { label: "Approved Services", value: "approved" },
            { label: "Rejected Services", value: "rejected" },
            { label: "All Services", value: "all" },
          ].map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                filter === f.value
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-2" />
            <p className="text-xs font-semibold">Loading services queue...</p>
          </div>
        ) : services.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-4 px-5">Service Title & Image</th>
                  <th className="py-4 px-4">Technician</th>
                  <th className="py-4 px-4">Category & Mode</th>
                  <th className="py-4 px-4">Base Price</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-5 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {services.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={s.image}
                          alt={s.title}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white line-clamp-1 max-w-[200px]">
                            {s.title}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            Area: {s.serviceArea} • {s.estimatedDuration}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-800 dark:text-zinc-200">{s.technicianName}</p>
                      <p className="text-[10px] text-slate-400">{s.technicianEmail}</p>
                    </td>

                    <td className="py-4 px-4">
                      <p className="font-semibold text-slate-800 dark:text-zinc-200">{s.category}</p>
                      <span className="text-[10px] text-slate-400">{s.serviceMode}</span>
                    </td>

                    <td className="py-4 px-4 font-black text-slate-900 dark:text-white text-sm">
                      ${s.basePrice}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border capitalize ${
                          s.approvalStatus === "approved"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : s.approvalStatus === "rejected"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {s.approvalStatus}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {s.approvalStatus !== "approved" && (
                          <button
                            type="button"
                            disabled={updatingId === s._id}
                            onClick={() => handleApproval(s._id, "approved")}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        )}

                        {s.approvalStatus !== "rejected" && (
                          <button
                            type="button"
                            disabled={updatingId === s._id}
                            onClick={() => handleApproval(s._id, "rejected")}
                            className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px] font-semibold cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        )}

                        <Link
                          href={`/services/${s._id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600"
                          title="Preview"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center px-4">
            <CheckSquare className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No services found</h3>
            <p className="text-xs text-slate-500 mt-1">
              {filter === "pending" ? "All submitted services have been reviewed!" : "No services matching this filter."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
