export default function ServicesLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="h-4 w-32 bg-slate-200 dark:bg-zinc-800 rounded-full mx-auto" />
        <div className="h-8 w-72 bg-slate-200 dark:bg-zinc-800 rounded-xl mx-auto" />
        <div className="h-4 w-96 max-w-full bg-slate-200 dark:bg-zinc-800 rounded-lg mx-auto" />
      </div>

      {/* Search & Filter Bar Skeleton */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4">
        <div className="h-11 w-full bg-slate-100 dark:bg-zinc-800 rounded-xl" />
        <div className="flex gap-2 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-8 w-24 bg-slate-100 dark:bg-zinc-800 rounded-xl shrink-0" />
          ))}
        </div>
      </div>

      {/* Grid of Skeleton Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-sm space-y-4 p-4"
          >
            <div className="h-48 w-full bg-slate-200 dark:bg-zinc-800 rounded-2xl" />
            <div className="space-y-2">
              <div className="h-4 w-20 bg-slate-100 dark:bg-zinc-800 rounded-md" />
              <div className="h-5 w-4/5 bg-slate-200 dark:bg-zinc-800 rounded-lg" />
              <div className="h-3 w-full bg-slate-100 dark:bg-zinc-800 rounded-md" />
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex justify-between items-center">
              <div className="h-6 w-20 bg-slate-200 dark:bg-zinc-800 rounded-md" />
              <div className="h-9 w-28 bg-slate-200 dark:bg-zinc-800 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
