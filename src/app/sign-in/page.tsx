"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Wrench, Eye, EyeOff, ArrowRight, ShieldCheck, UserCheck, Wrench as ToolIcon } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { apiFetch, setStoredToken } from "@/lib/api-client";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e?: React.FormEvent, customEmail?: string, customPassword?: string) => {
    if (e) e.preventDefault();

    const targetEmail = (customEmail || email).trim().toLowerCase();
    const targetPassword = customPassword || password;

    if (!targetEmail) {
      toast.error("Please enter your email");
      return;
    }
    if (!targetPassword) {
      toast.error("Please enter your password");
      return;
    }

    setLoading(true);
    try {
      // 1. Authenticate with BetterAuth
      const { data, error } = await authClient.signIn.email({
        email: targetEmail,
        password: targetPassword,
      });

      if (error) {
        toast.error(error.message || "Invalid credentials. Please verify your email and password.");
        setLoading(false);
        return;
      }

      // 2. Fetch Express backend JWT token
      try {
        const tokenRes = await apiFetch("/api/auth/jwt", {
          method: "POST",
          body: JSON.stringify({ email: targetEmail }),
        });

        if (tokenRes.token) {
          setStoredToken(tokenRes.token);
        }

        const userRole = tokenRes.user?.role || (data?.user as any)?.role || "customer";

        toast.success(`Welcome back, ${tokenRes.user?.name || data?.user?.name || "User"}!`);

        // 3. Redirect logic
        if (callbackUrl) {
          router.push(callbackUrl);
        } else if (userRole === "admin") {
          router.push("/dashboard/admin");
        } else if (userRole === "technician") {
          router.push("/dashboard/technician");
        } else {
          router.push("/dashboard/customer");
        }
      } catch (tokenErr) {
        console.warn("JWT sync warning:", tokenErr);
        router.push("/dashboard/customer");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  const fillAndLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    handleSignIn(undefined, demoEmail, demoPass);
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-4">Welcome Back</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Sign in to access your repair bookings and dashboard
          </p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. customer@fixmate.com"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">
                Password
              </label>
            </div>
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-zinc-800 text-white font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? "Signing in..." : "Sign In"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Test Demo Credentials */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-zinc-800">
          <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider text-center mb-3">
            Quick Reviewer Test Accounts
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillAndLogin("customer@fixmate.com", "Password123")}
              className="px-2.5 py-2 text-xs font-medium rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex flex-col items-center gap-1 transition-colors cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Customer</span>
            </button>
            <button
              type="button"
              onClick={() => fillAndLogin("technician@fixmate.com", "Password123")}
              className="px-2.5 py-2 text-xs font-medium rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex flex-col items-center gap-1 transition-colors cursor-pointer"
            >
              <ToolIcon className="w-3.5 h-3.5" />
              <span>Technician</span>
            </button>
            <button
              type="button"
              onClick={() => fillAndLogin("admin@fixmate.com", "Password123")}
              className="px-2.5 py-2 text-xs font-medium rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex flex-col items-center gap-1 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-slate-600 dark:text-zinc-400">
          Don't have an account yet?{" "}
          <Link href="/sign-up" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">
            Sign Up now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Loading sign in...</div>}>
      <SignInContent />
    </Suspense>
  );
}
