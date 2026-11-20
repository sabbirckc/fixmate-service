import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";
import type { Service, ServiceCategory } from "@/types";
import {
  Wrench,
  ShieldCheck,
  CreditCard,
  Clock,
  Search,
  ArrowRight,
  Smartphone,
  Laptop,
  Wind,
  Refrigerator,
  Tv,
  Sparkles,
  Zap,
  CheckCircle2,
  Star,
  Users,
} from "lucide-react";

// Force dynamic rendering since featured services are fetched from the backend server
export const dynamic = "force-dynamic";

// Fetch featured services from Express backend
async function getFeaturedServices(): Promise<Service[]> {
  try {
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";
    const res = await fetch(`${serverUrl}/api/services/featured`, {
      cache: "no-store",
    });

    if (!res.ok) return [];
    const data = await res.json();
    return data.services || [];
  } catch (error) {
    console.warn("Could not fetch featured services from server, using fallback:", error);
    return [];
  }
}

export default async function HomePage() {
  const featuredServices = await getFeaturedServices();

  const categories: { name: ServiceCategory; icon: any; count: string; color: string }[] = [
    { name: "Smartphone", icon: Smartphone, count: "180+ jobs", color: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400" },
    { name: "Laptop & PC", icon: Laptop, count: "140+ jobs", color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400" },
    { name: "AC", icon: Wind, count: "210+ jobs", color: "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400" },
    { name: "Refrigerator", icon: Refrigerator, count: "95+ jobs", color: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400" },
    { name: "TV", icon: Tv, count: "80+ jobs", color: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400" },
    { name: "Washing Machine", icon: Sparkles, count: "115+ jobs", color: "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400" },
    { name: "Electrical", icon: Zap, count: "160+ jobs", color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" },
  ];

  const steps = [
    {
      num: "01",
      title: "Find a Service",
      desc: "Browse verified repair listings by category, device brand, price, or service mode.",
      icon: Search,
    },
    {
      num: "02",
      title: "Send a Request",
      desc: "Specify your device problem, service address, and preferred appointment date.",
      icon: Wrench,
    },
    {
      num: "03",
      title: "Technician Fixes It",
      desc: "Follow real-time status updates: Requested → Accepted → In Progress → Completed.",
      icon: Clock,
    },
    {
      num: "04",
      title: "Pay After Service",
      desc: "Pay securely via Stripe only after the technician finishes the repair and you are satisfied.",
      icon: CreditCard,
    },
  ];

  const trustPoints = [
    {
      title: "Pay Only When Done",
      desc: "Zero upfront deposits. You pay with Stripe only after your technician completes the job.",
      icon: CreditCard,
    },
    {
      title: "Verified Technicians",
      desc: "Every technician profile and service listing is inspected and approved by FixMate Admins.",
      icon: ShieldCheck,
    },
    {
      title: "Live Status Pipeline",
      desc: "No guessing. Watch your device progress through Requested, Accepted, In Progress, to Completed.",
      icon: Clock,
    },
    {
      title: "Transparent Pricing",
      desc: "Upfront starting prices with itemized final amounts submitted before any payment is charged.",
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-blue-50/60 via-slate-50 to-slate-50 dark:from-zinc-900/50 dark:via-zinc-950 dark:to-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/80 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-200 dark:border-blue-800">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>On-Demand Device & Home Appliance Repairs</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                Broken Device? <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500">
                  Get It Fixed by Verified Technicians
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Connect with certified local experts for smartphones, laptops, ACs, refrigerators, TVs, and appliances. Track every step from request to completion — and <strong>pay only after the job is completed</strong>.
              </p>

              {/* Action Button */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  href="/services"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Browse All Services</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Mini Stats Bar */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/80 dark:border-zinc-800 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">100%</p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Pay After Work</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">500+</p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Completed Jobs</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">4.9 / 5</p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Satisfaction Rate</p>
                </div>
              </div>
            </div>

            {/* Right Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2">
                <img
                  src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"
                  alt="Verified FixMate Technician at Work"
                  className="w-full h-80 sm:h-96 object-cover rounded-2xl"
                />
                {/* Floating Badge */}
                <div className="absolute bottom-3 left-3 sm:bottom-6 sm:left-6 p-3.5 sm:p-4 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-xl border border-slate-200/90 dark:border-zinc-800 flex items-center gap-3 max-w-[calc(100%-1.5rem)] sm:max-w-xs">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Verified Technician</p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">Background-checked & certified for all major brands</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories Section */}
      <section className="py-16 bg-white dark:bg-zinc-900 border-y border-slate-200/80 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Explore Popular Repair Categories
            </h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2">
              Select a category to view approved repair technicians and starting prices
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3.5">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.name}
                  href={`/services?category=${encodeURIComponent(cat.name)}`}
                  className="group flex flex-col items-center text-center p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-zinc-800/40 hover:bg-white dark:hover:bg-zinc-800 transition-all shadow-sm hover:shadow-md"
                >
                  <div className={`w-12 h-12 rounded-2xl ${cat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200 group-hover:text-blue-600 transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1 font-medium">
                    {cat.count}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Services Section (Dynamic 6 Services) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Latest Approved Services</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">
              Featured Repair Offerings
            </h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
              Top-rated technician services available for on-demand booking
            </p>
          </div>

          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            <span>View All Services</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {featuredServices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredServices.slice(0, 6).map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-8">
            <Wrench className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Featured Services Loading</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Make sure the backend server is running on port 5000 to display live approved repair offerings.
            </p>
            <Link
              href="/services"
              className="mt-4 inline-block px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm shadow-md"
            >
              Browse Services Directory
            </Link>
          </div>
        )}
      </section>

      {/* How FixMate Works Section (4 Steps) */}
      <section className="py-20 bg-slate-900 text-white dark:bg-zinc-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Simple & Transparent
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mt-2">
              How FixMate Works
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              From booking to payment, every stage is organized for safety and peace of mind
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="relative p-6 rounded-2xl bg-slate-800/80 dark:bg-zinc-800/80 border border-slate-700/60 dark:border-zinc-700/60 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-3xl font-black text-slate-600/60 dark:text-zinc-600/60 font-mono">
                      {step.num}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose FixMate & Trust Points */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Built On Trust & Integrity
          </span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            Why FixMate is Different
          </h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Eliminating upfront risk and repair uncertainty for homes and businesses
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustPoints.map((tp) => {
            const Icon = tp.icon;
            return (
              <div
                key={tp.title}
                className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1.5">{tp.title}</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">{tp.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-8 sm:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-black">
              Ready to fix your device today?
            </h2>
            <p className="text-blue-100 text-sm max-w-xl">
              Submit a repair request in less than 2 minutes. Free diagnostics, certified parts, and zero upfront payment.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/services"
              className="px-6 py-3.5 rounded-xl bg-white text-blue-600 hover:bg-blue-50 font-bold text-sm shadow-md transition-all text-center"
            >
              Find a Repair
            </Link>
            <Link
              href="/sign-up"
              className="px-6 py-3.5 rounded-xl bg-blue-700/80 hover:bg-blue-800 text-white font-semibold text-sm border border-blue-400/40 transition-all text-center"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
