"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api-client";
import type { Payment } from "@/types";
import { DollarSign, CreditCard, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminTransactionsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const res = await apiFetch("/api/admin/transactions");
        if (res.success) {
          setPayments(res.payments || []);
          setTotalRevenue(res.totalRevenue || 0);
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header & Revenue Display */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Platform Transactions</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Audited ledger of all Stripe payments processed across completed repair bookings
          </p>
        </div>

        {/* Total Revenue Highlight Badge */}
        <div className="p-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg flex items-center gap-3 self-start sm:self-auto">
          <DollarSign className="w-6 h-6 text-emerald-200" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">
              Total Platform Revenue
            </p>
            <p className="text-xl font-black">
              ${totalRevenue.toFixed(2)} USD
            </p>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-44 bg-slate-200 dark:bg-zinc-800 rounded-md" />
                  <div className="h-3 w-32 bg-slate-100 dark:bg-zinc-800/60 rounded-md" />
                </div>
                <div className="h-7 w-20 bg-slate-200 dark:bg-zinc-800 rounded-lg shrink-0" />
              </div>
            ))}
          </div>
        ) : payments.length > 0 ? (
          <>
            {/* Mobile Cards View */}
            <div className="block lg:hidden divide-y divide-slate-100 dark:divide-zinc-800 p-4 space-y-4">
              {payments.map((p) => (
                <div
                  key={p._id}
                  className="pt-4 first:pt-0 rounded-2xl bg-slate-50/60 dark:bg-zinc-800/40 p-4 border border-slate-200/80 dark:border-zinc-700/60 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-slate-900 dark:text-white text-sm">
                      {p.serviceTitle}
                    </p>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                      <CheckCircle className="w-3 h-3" />
                      <span>Settled</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200/60 dark:border-zinc-700/60">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Customer</span>
                      <span className="font-semibold text-slate-700 dark:text-zinc-300 truncate block">
                        {p.customerName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Technician</span>
                      <span className="font-semibold text-slate-700 dark:text-zinc-300 truncate block">
                        {p.technicianName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60 dark:border-zinc-700/60">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Amount Settled</span>
                      <span className="font-black text-slate-900 dark:text-white text-sm">
                        ${p.amount} {p.currency.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-right text-[11px] text-slate-500">
                      <span>{new Date(p.paidAt).toLocaleDateString()}</span>
                      <p className="font-mono text-[10px] text-slate-400 truncate max-w-[140px]">{p.transactionId}</p>
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
                    <th className="py-4 px-5">Service Title</th>
                    <th className="py-4 px-4">Customer</th>
                    <th className="py-4 px-4">Technician</th>
                    <th className="py-4 px-4">Amount</th>
                    <th className="py-4 px-4">Stripe Transaction ID</th>
                    <th className="py-4 px-4">Payment Date</th>
                    <th className="py-4 px-5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {payments.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="py-4 px-5 font-bold text-slate-900 dark:text-white">
                        {p.serviceTitle}
                      </td>

                      <td className="py-4 px-4">
                        <p className="font-semibold text-slate-800 dark:text-zinc-200">{p.customerName}</p>
                        <p className="text-[10px] text-slate-400">{p.customerEmail}</p>
                      </td>

                      <td className="py-4 px-4">
                        <p className="font-semibold text-slate-800 dark:text-zinc-200">{p.technicianName}</p>
                        <p className="text-[10px] text-slate-400">{p.technicianEmail}</p>
                      </td>

                      <td className="py-4 px-4 font-black text-slate-900 dark:text-white text-sm">
                        ${p.amount} {p.currency.toUpperCase()}
                      </td>

                      <td className="py-4 px-4 font-mono text-[11px] text-slate-500">
                        {p.transactionId}
                      </td>

                      <td className="py-4 px-4 text-slate-500">
                        {new Date(p.paidAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      <td className="py-4 px-5 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Settled</span>
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
            <DollarSign className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No transactions recorded</h3>
          </div>
        )}
      </div>
    </div>
  );
}
