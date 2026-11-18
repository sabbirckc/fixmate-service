"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiFetch } from "@/lib/api-client";
import type { Payment } from "@/types";
import {
  CheckCircle2,
  Receipt,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Loader2,
  Calendar,
} from "lucide-react";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const bookingId = searchParams.get("booking_id");

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID found in callback query parameters.");
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        setLoading(true);
        // POST to Express API: Verifies session & updates MongoDB
        const res = await apiFetch("/api/payments/verify", {
          method: "POST",
          body: JSON.stringify({
            session_id: sessionId,
            booking_id: bookingId || undefined,
          }),
        });

        if (res.success && res.payment) {
          setPayment(res.payment);
        } else {
          setError(res.message || "Could not verify payment transaction.");
        }
      } catch (err: any) {
        console.error("Verification error:", err);
        setError(err.message || "Failed to verify transaction with payment server.");
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [sessionId, bookingId]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-16">
        <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 p-8 sm:p-10 text-center">
          {loading ? (
            <div className="py-12 space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto" />
              <h2 className="text-xl font-bold">Verifying Stripe Payment...</h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Recording your transaction ledger and updating your repair booking status.
              </p>
            </div>
          ) : error ? (
            <div className="py-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto">
                <Receipt className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Transaction Verification</h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">{error}</p>
              <Link
                href="/dashboard/customer/bookings"
                className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                <span>Return to My Bookings</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Success Badge */}
              <div className="w-20 h-20 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Payment Successful
                </span>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                  Thank You for Your Payment!
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Your repair invoice has been paid and marked as completed.
                </p>
              </div>

              {/* Receipt Breakdown Card */}
              {payment && (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 text-left text-xs space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-zinc-700">
                    <span className="text-slate-500">Service</span>
                    <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
                      {payment.serviceTitle}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Amount Paid</span>
                    <span className="font-black text-base text-emerald-600">
                      ${payment.amount} {payment.currency?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Technician</span>
                    <span className="font-semibold text-slate-800 dark:text-zinc-200">
                      {payment.technicianName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Transaction ID</span>
                    <span className="font-mono text-[11px] text-slate-500 truncate max-w-[180px]">
                      {payment.transactionId}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Payment Date</span>
                    <span className="text-slate-600 dark:text-zinc-400">
                      {new Date(payment.paidAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/dashboard/customer/bookings"
                  className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  <span>My Bookings</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/dashboard/customer/payments"
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold text-xs flex items-center justify-center"
                >
                  View Receipts
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading payment verification...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
