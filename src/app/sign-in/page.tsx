"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Wrench, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { apiFetch, setStoredToken } from "@/lib/api-client";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const { data: session, isPending } = authClient.useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect directly to their dashboard
  useEffect(() => {
    if (!isPending && session?.user) {
      const userRole = (session.user as any)?.role || "customer";
      const targetDashboard =
        userRole === "admin"
          ? "/dashboard/admin"
          : userRole === "technician"
          ? "/dashboard/technician"
          : "/dashboard/customer";

      window.location.href = targetDashboard;
    }
  }, [session, isPending]);

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

      // 2. Fetch JWT token from Better Auth /token endpoint
      try {
        const tokenRes = await fetch("/api/auth/token", { credentials: "include" })
          .then((r) => r.json())
          .catch(() => null);

        let finalToken = tokenRes?.token;
        if (!finalToken) {
          const fallbackRes = await apiFetch("/api/auth/jwt", {
            method: "POST",
            body: JSON.stringify({ email: targetEmail }),
          }).catch(() => null);
          finalToken = fallbackRes?.token;
        }

        if (finalToken) {
          setStoredToken(finalToken);
        }
      } catch (tokenErr) {
        console.warn("JWT sync warning:", tokenErr);
      }

      const userRole = (data?.user as any)?.role || "customer";
      const targetDashboard =
        userRole === "admin"
          ? "/dashboard/admin"
          : userRole === "technician"
          ? "/dashboard/technician"
          : "/dashboard/customer";

      toast.success(`Welcome back, ${data?.user?.name || "User"}!`);

      // Directly navigate to dashboard with full page transition
      window.location.href = targetDashboard;
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard/customer",
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to sign in with Google");
      setLoading(false);
    }
  };

  if (isPending || session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 px-4 py-8 sm:py-12">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-8">
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

        {/* Social Login: Google (Optional Feature) */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-zinc-900 px-3 text-slate-400 font-semibold tracking-wider">
              Or continue with
            </span>
          </div>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={handleGoogleSignIn}
          className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700/60 text-slate-700 dark:text-zinc-200 text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-3 cursor-pointer"
        >
          <GoogleIcon />
          <span>Continue with Google</span>
        </button>

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

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}
