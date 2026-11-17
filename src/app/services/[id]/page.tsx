"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Service, Role } from "@/types";
import { apiFetch } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import {
  Wrench,
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Phone,
  FileText,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Lock,
  X,
  CreditCard,
  User,
} from "lucide-react";

interface TechnicianSummary {
  name: string;
  email: string;
  image?: string | null;
  area: string;
  bio: string;
  phone?: string | null;
}

export default function ServiceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data: session } = authClient.useSession();
  const user = session?.user;
  const userRole = ((user as any)?.role || "customer") as Role;

  const [service, setService] = useState<Service | null>(null);
  const [technician, setTechnician] = useState<TechnicianSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Request Repair Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [problemDescription, setProblemDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Today's date in YYYY-MM-DD format for date input min constraint
  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!id) return;

    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await apiFetch(`/api/services/${id}`);
        if (res.success && res.service) {
          setService(res.service);
          setTechnician(res.technician || null);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error("Failed to load service details:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push(`/sign-in?callbackUrl=/services/${id}`);
      return;
    }

    if (userRole !== "customer") {
      toast.error("Only customers can submit repair requests.");
      return;
    }

    if (!phone.trim()) {
      toast.error("Please enter a contact phone number");
      return;
    }

    if (!address.trim()) {
      toast.error("Please provide your service address");
      return;
    }

    if (!preferredDate) {
      toast.error("Please choose a preferred service date");
      return;
    }

    if (problemDescription.trim().length < 20) {
      toast.error("Problem description must be at least 20 characters long");
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          serviceId: service?._id,
          customerPhone: phone.trim(),
          address: address.trim(),
          preferredDate,
          problemDescription: problemDescription.trim(),
        }),
      });

      if (res.success) {
        toast.success("Repair request submitted successfully!", {
          description: "Technician has been notified. Track it in your bookings.",
          action: {
            label: "My Bookings",
            onClick: () => router.push("/dashboard/customer/bookings"),
          },
        });
        setModalOpen(false);
        // Reset form
        setPhone("");
        setAddress("");
        setPreferredDate("");
        setProblemDescription("");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to submit repair request");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-zinc-950">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-32 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
          <p className="text-sm font-medium">Loading service specifications...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (notFound || !service) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-zinc-950">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-28 px-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Service Not Found</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 max-w-md">
            This service listing does not exist or may currently be offline for maintenance.
          </p>
          <Link
            href="/services"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse All Services</span>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-zinc-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Services</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Image & Details */}
          <div className="lg:col-span-8 space-y-8">
            {/* Banner Image */}
            <div className="relative aspect-16/10 rounded-3xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-100 shadow-md">
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md">
                  {service.category}
                </span>
                <span className="px-3 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold">
                  {service.serviceMode}
                </span>
              </div>
            </div>

            {/* Title & Category Info */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {service.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>Duration: <strong>{service.estimatedDuration}</strong></span>
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span>Area: <strong>{service.serviceArea}</strong></span>
                </span>
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>FixMate Verified & Inspected</span>
                </span>
              </div>
            </div>

            {/* Service Description */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                About This Repair Service
              </h2>
              <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-zinc-300 whitespace-pre-line">
                {service.description}
              </p>

              <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  FixMate Service Guarantee
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>Pay online with Stripe only after work is done</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>Real-time status tracking in customer portal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>Original manufacturer grade replacement parts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>Free diagnostic with repair completion</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing & Booking Action Card + Technician Profile */}
          <div className="lg:col-span-4 space-y-6">
            {/* Booking Action Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl space-y-6 sticky top-24">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">
                  Starting Price
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">
                    ${service.basePrice}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-zinc-400">USD</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  *Final amount is set upon job completion before you pay.
                </p>
              </div>

              {/* Role Restricted Booking Flow */}
              {!user ? (
                <div className="space-y-3">
                  <Link
                    href={`/sign-in?callbackUrl=/services/${id}`}
                    className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 text-center"
                  >
                    <span>Sign In to Request Repair</span>
                  </Link>
                  <p className="text-[11px] text-slate-400 text-center">
                    New customer? <Link href="/sign-up" className="text-blue-600 underline">Sign up in seconds</Link>
                  </p>
                </div>
              ) : userRole === "customer" ? (
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Request Repair</span>
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Lock className="w-4 h-4 text-amber-600" />
                    <span>Customer Exclusive Action</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Only customer accounts can book repair requests. You are currently logged in as a <strong>{userRole}</strong>.
                  </p>
                </div>
              )}

              {/* Technician Summary Card */}
              {technician && (
                <div className="pt-6 border-t border-slate-100 dark:border-zinc-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Assigned Technician
                  </h3>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-base shrink-0">
                      {technician.image ? (
                        <img src={technician.image} alt={technician.name} className="w-full h-full object-cover" />
                      ) : (
                        technician.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {technician.name}
                        </p>
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                        {technician.area}
                      </p>
                    </div>
                  </div>
                  {technician.bio && (
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-3 leading-relaxed bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-slate-100 dark:border-zinc-800">
                      "{technician.bio}"
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Repair Request Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Repair Booking Request
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {service.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Starting at ${service.basePrice} USD • Technician: {service.technicianName}
              </p>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              {/* Customer Read-Only Session Info */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Customer Name</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">{user?.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Customer Email</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate block">{user?.email}</span>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Contact Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 1711-223344"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Service Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Service / Device Pickup Address *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <textarea
                    required
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Flat 4B, House 12, Road 5, Dhanmondi, Dhaka"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Preferred Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Preferred Service Date (Today or Future) *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Problem Description (>= 20 chars) */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Device Problem Description *
                  </label>
                  <span className={`text-[10px] ${problemDescription.length >= 20 ? "text-emerald-600 font-semibold" : "text-slate-400"}`}>
                    {problemDescription.length}/20 min chars
                  </span>
                </div>
                <textarea
                  required
                  rows={3}
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder="Describe what is wrong with the device, error codes, symptoms, etc. (min 20 characters)..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Pay After Service Reminder */}
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs flex items-center gap-2">
                <CreditCard className="w-4 h-4 shrink-0" />
                <span>You do not pay now. Payment is required only after the repair is completed.</span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || problemDescription.length < 20}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  {submitting ? "Submitting..." : "Confirm & Send Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
