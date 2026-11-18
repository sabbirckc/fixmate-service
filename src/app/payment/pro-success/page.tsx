"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiFetch } from "@/lib/api-client";
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  PlusCircle,
  Loader2,
  Award,
  Zap,
  Check,
} from "lucide-react";

function ProSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID found in callback query parameters.");
      setLoading(false);
      return;
    }

    const verifySubscription = async () => {
      try {
        setLoading(true);
        const res = await apiFetch("/api/payments/verify-pro", {
          method: "POST",
          body: JSON.stringify({ session_id: sessionId }),
        });

        if (res.success) {
          setSuccess(true);
        } else {
          setError(res.message || "Could not verify Pro subscription.");
        }
      } catch (err: any) {
        console.error("Pro subscription verification error:", err);
        setError(err.message || "Failed to verify transaction with payment server.");
      } finally {
        setLoading(false);
      }
    };

    verifySubscription();
  }, [sessionId]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-16">
        <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 p-8 sm:p-10 text-center">
          {loading ? (
            <div className="py-12 space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-amber-500 mx-auto" />
              <h2 className="text-xl font-bold">Confirming Pro Upgrade with Stripe...</h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Recording your subscription and activating your Verified Pro status.
              </p>
            </div>
          ) : error ? (
            <div className="py-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Subscription Verification</h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">{error}</p>
              <Link
                href="/dashboard/technician"
                className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20"
              >
                <span>Return to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Gold Crown / Shield Badge */}
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-amber-500/30 animate-bounce duration-1000">
                <Award className="w-10 h-10" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Stripe Payment Confirmed</span>
                </span>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white">
                  Welcome to Verified Pro!
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1.5">
                  Your $29.00 USD subscription payment was processed successfully. All Pro privileges are now active.
                </p>
              </div>

              {/* Unlocked Benefits Card */}
              <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 text-left text-xs space-y-2.5">
                <p className="font-bold text-amber-900 dark:text-amber-200 text-xs uppercase tracking-wider mb-2">
                  Unlocked Privileges:
                </p>
                <div className="flex items-center gap-2.5 text-slate-700 dark:text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span><strong>Unlimited Service Listings</strong> (3-service limit removed)</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700 dark:text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span><strong>Gold Verified Pro Badge</strong> displayed across all directory listings</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700 dark:text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span><strong>Priority Search Visibility</strong> for all customer inquiries</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700 dark:text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span><strong>FixMate Master Technician</strong> verified trust mark</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/dashboard/technician/add-service"
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs shadow-md shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add a New Service Now</span>
                </Link>
                <Link
                  href="/dashboard/technician"
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-300 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-bold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
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

export default function ProSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-2" />
        </div>
      }
    >
      <ProSuccessContent />
    </Suspense>
  );
}
