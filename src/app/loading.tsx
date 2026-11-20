import { Wrench } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 px-4 py-20 text-center animate-in fade-in duration-300">
      <div className="relative mb-5">
        <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 animate-pulse">
          <Wrench className="w-7 h-7" />
        </div>
      </div>
      <h2 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
        Loading FixMate...
      </h2>
      <p className="text-xs text-slate-400 mt-1">
        Connecting to repair network
      </p>
      <div className="mt-4 w-32 h-1 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full bg-blue-600 rounded-full animate-pulse w-3/4" />
      </div>
    </div>
  );
}
