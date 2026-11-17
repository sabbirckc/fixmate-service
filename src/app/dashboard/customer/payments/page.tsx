"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api-client";
import type { Payment } from "@/types";
import { CreditCard, CheckCircle, ExternalLink, Calendar, Loader2 } from "lucide-react";

export default function CustomerPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await apiFetch("/api/payments/my");
        if (res.success) {
          setPayments(res.payments || []);
        }
      } catch (err) {
        console.error("Failed to load customer payments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const totalSpent = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Payment History</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official ledger of your verified Stripe payments for completed repair services
          </p>
        </div>
        <div className="p-3.5 px-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center gap-3">
          <CreditCard className="w-5 h-5 text-emerald-600" />
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Settled</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">${totalSpent.toFixed(2)} USD</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
            <p className="text-xs font-semibold">Loading payment history...</p>
          </div>
        ) : payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-4 px-5">Service Title</th>
                  <th className="py-4 px-4">Technician</th>
                  <th className="py-4 px-4">Amount Paid</th>
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
                    <td className="py-4 px-4 text-slate-600 dark:text-zinc-300">
                      {p.technicianName}
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
                        <span>Paid</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center px-4">
            <CreditCard className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No payment transactions</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Once you complete and pay for a repair job with Stripe, your receipts will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
