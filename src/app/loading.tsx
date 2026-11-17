import { Wrench } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 px-4 py-20 text-center">
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-600/10 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
          <Wrench className="w-8 h-8 animate-spin" />
        </div>
      </div>
      <h2 className="text-base font-bold text-slate-800 dark:text-zinc-200">
        Loading FixMate...
      </h2>
      <p className="text-xs text-slate-400 mt-1">
        Retrieving verified repair services and live updates
      </p>
    </div>
  );
}
