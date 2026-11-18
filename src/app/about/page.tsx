import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Wrench,
  ShieldCheck,
  CreditCard,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  Award,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us & How FixMate Works",
  description:
    "Learn how FixMate provides honest, reliable smart device and home appliance repairs with zero upfront risk and guaranteed post-completion payments.",
};

export default function AboutPage() {
  const values = [
    {
      title: "100% Pay After Completion",
      desc: "Never pay upfront for incomplete repairs. You pay with Stripe only after your technician completes the job and you inspect the device.",
      icon: CreditCard,
    },
    {
      title: "Verified Background Checks",
      desc: "Every technician profile and service listing is vetted by FixMate administrators to guarantee authentic expertise and high parts quality.",
      icon: ShieldCheck,
    },
    {
      title: "Full Pipeline Transparency",
      desc: "Track every step of your repair job: Requested → Accepted → In Progress → Completed, with zero surprises or hidden extra charges.",
      icon: Clock,
    },
    {
      title: "Direct Technician Empowerment",
      desc: "Local certified repair masters set their own fair pricing, showcase their skills, and grow reliable businesses on FixMate.",
      icon: Award,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-16 pb-20 bg-gradient-to-b from-blue-50/60 via-slate-50 to-slate-50 dark:from-zinc-900/60 dark:via-zinc-950 dark:to-zinc-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-4">
            <Wrench className="w-3.5 h-3.5" />
            <span>Our Mission & Story</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Fixing the Repair Industry, <br />
            <span className="text-blue-600">One Trusted Job at a Time</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-zinc-400 leading-relaxed">
            In Bangladesh and worldwide, finding a skilled, trustworthy repair technician is stressful. After handing over your expensive device or appliance, you often face mystery delays, poor workmanship, and demands for advance payment.
          </p>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            FixMate was engineered to solve both sides of the equation: Customers get verified masters and pay only after satisfaction, while technicians get a structured, professional platform to manage incoming requests.
          </p>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v) => {
            const Icon = v.icon;
            return (
              <div
                key={v.title}
                className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">{v.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{v.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How FixMate Solves It */}
      <section className="py-16 bg-white dark:bg-zinc-900 border-y border-slate-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                The FixMate Standard
              </span>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                Engineered for Customer Protection
              </h2>
              <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                FixMate enforces strict database rules so you are never at risk. Every service listing requires Admin moderation before it reaches the catalog.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Strict Job Pipeline Enforcement</h4>
                    <p className="text-xs text-slate-500">Every repair moves through Requested → Accepted → In Progress → Completed. No shortcutting stages.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Itemized Final Amount Before Payment</h4>
                    <p className="text-xs text-slate-500">Technicians submit the final price upon completion. You inspect and confirm before paying via Stripe.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Zero Upfront Risk</h4>
                    <p className="text-xs text-slate-500">If a technician rejects your booking or you cancel before acceptance, zero charges apply.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"
                alt="FixMate technician team"
                className="rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl font-black">Experience Honest Repair Today</h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Book certified repairs for your phone, PC, AC, or appliance in 2 minutes. Pay only after work is done.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              href="/services"
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md"
            >
              Browse Services
            </Link>
            <Link
              href="/sign-up"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700"
            >
              Join as Technician
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
