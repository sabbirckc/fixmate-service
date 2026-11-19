export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Banner Skeleton */}
      <div className="h-40 w-full bg-slate-200 dark:bg-zinc-800 rounded-3xl" />

      {/* KPI Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-800 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-3 w-24 bg-slate-200 dark:bg-zinc-800 rounded-md" />
              <div className="h-6 w-16 bg-slate-200 dark:bg-zinc-800 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-zinc-800">
          <div className="h-5 w-40 bg-slate-200 dark:bg-zinc-800 rounded-lg" />
          <div className="h-4 w-20 bg-slate-100 dark:bg-zinc-800 rounded-md" />
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-14 w-full bg-slate-50 dark:bg-zinc-800/40 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
