"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Wrench, User, Hammer, Check, X, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { apiFetch, setStoredToken } from "@/lib/api-client";
import type { Role } from "@/types";

export default function SignUpPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"customer" | "technician">("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect directly to the home page
  useEffect(() => {
    if (!isPending && session?.user) {
      window.location.href = "/";
    }
  }, [session, isPending]);

  // Password validation rules
  const hasMinLength = password.length >= 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase;

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("fixmate_selected_role", role);
      }
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to sign up with Google");
    } finally {
      setLoading(false);
    }
  };

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
        toast.error(error.message || "Failed to create account. Please check your credentials or try another email.");
        setLoading(false);
        return;
      }

      // 2. Obtain JWT token from Better Auth /token endpoint
      try {
        const tokenRes = await fetch("/api/auth/token", { credentials: "include" })
          .then((r) => r.json())
          .catch(() => null);

        let finalToken = tokenRes?.token;
        if (!finalToken) {
          const fallbackRes = await apiFetch("/api/auth/jwt", {
            method: "POST",
            body: JSON.stringify({
              email: email.trim().toLowerCase(),
              name: name.trim(),
              role,
            }),
          });
          finalToken = fallbackRes?.token;
        }

        if (finalToken) {
          setStoredToken(finalToken);
        }
      } catch (tokenErr) {
        console.warn("Could not fetch server JWT token:", tokenErr);
      }

      toast.success(`Welcome to FixMate, ${name.trim()}! Account created successfully.`);

      // 3. Directly navigate to the home page
      window.location.href = "/";
    } catch (err: any) {
      toast.error(err.message || "Something went wrong during sign up");
    } finally {
      setLoading(false);
    }
  };

  if (isPending || session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 px-4 py-8 sm:py-12 animate-pulse">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-slate-200 dark:border-zinc-800 p-8 space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 mx-auto" />
          <div className="h-6 w-44 bg-slate-200 dark:bg-zinc-800 rounded-lg mx-auto" />
          <div className="space-y-4 pt-2">
            <div className="h-11 w-full bg-slate-100 dark:bg-zinc-800 rounded-xl" />
            <div className="h-11 w-full bg-slate-100 dark:bg-zinc-800 rounded-xl" />
            <div className="h-11 w-full bg-slate-100 dark:bg-zinc-800 rounded-xl" />
            <div className="h-11 w-full bg-blue-100 dark:bg-blue-950/60 rounded-xl" />
          </div>
        </div>
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

        {/* Social Login: Google (Optional Feature) */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-zinc-900 px-3 text-slate-400 font-semibold tracking-wider">
              Or sign up with
            </span>
          </div>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={handleGoogleSignUp}
          className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700/60 text-slate-700 dark:text-zinc-200 text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-3 cursor-pointer"
        >
          <GoogleIcon />
          <span>Continue with Google</span>
        </button>

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
