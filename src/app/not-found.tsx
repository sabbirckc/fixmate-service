import Link from "next/link";
import { Wrench, ArrowLeft, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 px-4 py-16 text-center">
      {/* Repair themed illustration icon */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/20 mx-auto">
          <Wrench className="w-12 h-12 -rotate-45" />
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-rose-500 text-white font-mono font-bold text-xs flex items-center justify-center shadow-md">
          404
        </div>
      </div>

      <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
        Page Not Found
      </span>

      <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-2">
        Looks Like This Part Needs Repair!
      </h1>

      <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-2 max-w-md mx-auto leading-relaxed">
        The page or service you are trying to reach doesn't exist, has been relocated, or is currently under scheduled maintenance.
      </p>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <Link
          href="/services"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold text-xs transition-all cursor-pointer"
        >
          <Search className="w-4 h-4" />
          <span>Browse Services</span>
        </Link>
      </div>
    </div>
  );
}
