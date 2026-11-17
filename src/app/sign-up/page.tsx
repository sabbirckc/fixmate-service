"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Wrench, User, Hammer, Check, X, Eye, EyeOff, ArrowRight } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { apiFetch, setStoredToken } from "@/lib/api-client";
import type { Role } from "@/types";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"customer" | "technician">("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password validation rules
  const hasMinLength = password.length >= 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!isPasswordValid) {
      toast.error("Please satisfy all password security requirements");
      return;
    }

    setLoading(true);
    try {
      // 1. Sign up through BetterAuth
      const { data, error } = await (authClient.signUp.email as any)({
        email: email.trim().toLowerCase(),
        password,
        name: name.trim(),
        role: role === "technician" ? "technician" : "customer",
      });

      if (error) {
        toast.error(error.message || "Failed to create account. Email may already be in use.");
        setLoading(false);
        return;
      }

      // 2. Obtain Express JWT token
      try {
        const tokenRes = await apiFetch("/api/auth/jwt", {
          method: "POST",
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            name: name.trim(),
            role,
          }),
        });

        if (tokenRes.token) {
          setStoredToken(tokenRes.token);
        }
      } catch (tokenErr) {
        console.warn("Could not fetch server JWT token:", tokenErr);
      }

      toast.success(`Welcome to FixMate, ${name.trim()}! Account created successfully.`);

      // 3. Redirect to designated dashboard
      if (role === "technician") {
        router.push("/dashboard/technician");
      } else {
        router.push("/dashboard/customer");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong during sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-slate-200 dark:border-zinc-800 p-8">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-black text-blue-600 dark:text-blue-500">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <Wrench className="w-5 h-5" />
            </div>
            <span>Fix<span className="text-slate-900 dark:text-white">Mate</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-4">Create Your Account</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Join thousands booking trustworthy device & appliance repairs
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Selection Cards */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("customer")}
                className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border-2 transition-all ${
                  role === "customer"
                    ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 font-semibold"
                    : "border-slate-200 dark:border-zinc-800 hover:border-slate-300 text-slate-600 dark:text-zinc-400"
                }`}
              >
                <User className="w-6 h-6" />
                <span className="text-sm">I'm a Customer</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("technician")}
                className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border-2 transition-all ${
                  role === "technician"
                    ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 font-semibold"
                    : "border-slate-200 dark:border-zinc-800 hover:border-slate-300 text-slate-600 dark:text-zinc-400"
                }`}
              >
                <Hammer className="w-6 h-6" />
                <span className="text-sm">I'm a Technician</span>
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1.5 text-center">
              (Admins are managed via direct system invitation)
            </p>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tanvir Ahmed"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tanvir@example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password with live validation */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Validation checklist */}
            <div className="mt-2.5 space-y-1 text-xs">
              <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-slate-400 dark:text-zinc-500"}`}>
                {hasMinLength ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                <span>At least 6 characters</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasUpperCase ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-slate-400 dark:text-zinc-500"}`}>
                {hasUpperCase ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                <span>At least one uppercase letter (A-Z)</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasLowerCase ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-slate-400 dark:text-zinc-500"}`}>
                {hasLowerCase ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                <span>At least one lowercase letter (a-z)</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !isPasswordValid}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed text-white font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? "Creating Account..." : "Create Account"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600 dark:text-zinc-400">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
