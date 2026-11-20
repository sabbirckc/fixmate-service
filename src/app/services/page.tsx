"use client";

import { useState, useEffect, Suspense, useCallback, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";
import type { Service, ServiceCategory, ServiceMode } from "@/types";
import { apiFetch } from "@/lib/api-client";
import {
  Search,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Wrench,
  Loader2,
  X,
} from "lucide-react";

const CATEGORIES: { label: string; value: string }[] = [
  { label: "All Categories", value: "all" },
  { label: "Smartphone", value: "Smartphone" },
  { label: "Laptop & PC", value: "Laptop & PC" },
  { label: "AC", value: "AC" },
  { label: "Refrigerator", value: "Refrigerator" },
  { label: "TV", value: "TV" },
  { label: "Washing Machine", value: "Washing Machine" },
  { label: "Electrical", value: "Electrical" },
];

const SERVICE_MODES: { label: string; value: string }[] = [
  { label: "All Service Modes", value: "all" },
  { label: "Home Visit", value: "Home Visit" },
  { label: "Shop Drop-off", value: "Shop Drop-off" },
];

const SORT_OPTIONS: { label: string; value: string }[] = [
  { label: "Newest Listed", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
];

function BrowseServicesContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL state synchronization
  const currentSearch = searchParams.get("search") || "";
  const currentCategory = searchParams.get("category") || "all";
  const currentMode = searchParams.get("serviceMode") || "all";
  const currentSort = searchParams.get("sort") || "newest";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const [searchInput, setSearchInput] = useState(currentSearch);
  const [services, setServices] = useState<Service[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isRelatable, setIsRelatable] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sync search input if URL changes (e.g., navigating back)
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  // Push new params to URL
  const updateUrlParams = useCallback(
    (newParams: Record<string, string | number | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(newParams).forEach(([key, value]) => {
        if (value === undefined || value === "" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      // If initiating a new search query, clear any prior category lock unless category was explicitly set
      if ("search" in newParams && newParams.search && !("category" in newParams)) {
        params.delete("category");
      }

      // Reset to page 1 whenever search/filters change (unless page itself is explicitly changing)
      if (!("page" in newParams)) {
        params.delete("page");
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  // Fetch from server on URL param change (Challenge 1: 100% server-side)
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchFilteredServices = async () => {
      try {
        const queryParams: Record<string, string | number> = {
          page: currentPage,
          limit: 9,
        };

        if (currentSearch.trim()) queryParams.search = currentSearch.trim();
        if (currentCategory && currentCategory !== "all") queryParams.category = currentCategory;
        if (currentMode && currentMode !== "all") queryParams.serviceMode = currentMode;
        if (currentSort) queryParams.sort = currentSort;

        const res = await apiFetch("/api/services", { params: queryParams });
        if (isMounted && res.success) {
          setServices(res.services || []);
          setIsRelatable(Boolean(res.isRelatable));
          setTotalPages(res.pagination?.totalPages || 1);
          setTotalCount(res.pagination?.total || 0);
        }
      } catch (err) {
        console.error("Failed to load services:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFilteredServices();

    return () => {
      isMounted = false;
    };
  }, [currentSearch, currentCategory, currentMode, currentSort, currentPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams({ search: searchInput.trim(), category: "all" });
  };

  const handleClearSearch = () => {
    setSearchInput("");
    updateUrlParams({ search: "" });
  };

  const resetAllFilters = () => {
    setSearchInput("");
    router.push(pathname);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
      <Navbar />

      {/* Header Banner */}
      <section className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>FixMate Repair Directory</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Browse Repair Services
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-zinc-400 mt-2">
              Explore verified technicians across smartphones, laptops, ACs, home appliances, and electrical diagnostics. Filter and book in seconds.
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by device, service title, brand, technician, or mode..."
                className="w-full pl-11 pr-10 py-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-200/50 dark:hover:bg-zinc-700/50 transition-colors"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Search</span>
            </button>
          </form>

          {/* Category Filter Pills */}
          <div className="-mx-4 px-4 sm:mx-0 sm:px-0 mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isSelected = currentCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => updateUrlParams({ category: cat.value })}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-sm font-semibold"
                      : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 w-full">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200 dark:border-zinc-800">
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Showing <strong className="text-slate-900 dark:text-white">{services.length}</strong> of{" "}
              <strong className="text-slate-900 dark:text-white">{totalCount}</strong> services
            </span>
            {(currentSearch || currentCategory !== "all" || currentMode !== "all" || currentSort !== "newest") && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="ml-2 inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Service Mode Selector */}
            <select
              value={currentMode}
              onChange={(e) => updateUrlParams({ serviceMode: e.target.value })}
              className="flex-1 sm:flex-none px-3 py-2 rounded-xl text-xs font-medium border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
            >
              {SERVICE_MODES.map((mode) => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>

            {/* Sort Selector */}
            <select
              value={currentSort}
              onChange={(e) => updateUrlParams({ sort: e.target.value })}
              className="flex-1 sm:flex-none px-3 py-2 rounded-xl text-xs font-medium border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Services Grid or Loading / Empty State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 overflow-hidden shadow-sm"
              >
                <div className="aspect-16/10 w-full bg-slate-200 dark:bg-zinc-800" />
                <div className="p-5 space-y-3">
                  <div className="h-5 w-3/4 bg-slate-200 dark:bg-zinc-800 rounded-md" />
                  <div className="h-3 w-full bg-slate-100 dark:bg-zinc-800/60 rounded-md" />
                  <div className="h-3 w-2/3 bg-slate-100 dark:bg-zinc-800/60 rounded-md" />
                  <div className="py-2.5 border-y border-slate-100 dark:border-zinc-800/80 space-y-2">
                    <div className="h-3 w-1/2 bg-slate-100 dark:bg-zinc-800/60 rounded-md" />
                    <div className="h-3 w-2/3 bg-slate-100 dark:bg-zinc-800/60 rounded-md" />
                  </div>
                  <div className="pt-2 flex items-center justify-between">
                    <div className="h-6 w-16 bg-slate-200 dark:bg-zinc-800 rounded-md" />
                    <div className="h-8 w-24 bg-blue-100 dark:bg-blue-950/60 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : services.length > 0 ? (
          <div className="space-y-6">
            {isRelatable && currentSearch && (
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50 text-blue-900 dark:text-blue-200 flex items-center gap-3 text-xs sm:text-sm shadow-sm">
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <p>
                  No exact match found for <strong>&ldquo;{currentSearch}&rdquo;</strong>. Showing <strong>relatable repair services</strong>:
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-8 max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {currentSearch ? `No services matched "${currentSearch}"` : "No repair services matched"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
              {currentSearch
                ? "Try searching with broader terms (e.g. 'phone', 'ac', 'repair', 'screen') or check across all categories."
                : "We couldn't find any approved services matching your active filters. Try adjusting or clearing your filters."}
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              {currentSearch && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear Search</span>
                </button>
              )}
              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset all filters</span>
              </button>
            </div>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="mt-12 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => updateUrlParams({ page: currentPage - 1 })}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer shadow-sm"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => {
              const isCurrent = pg === currentPage;
              return (
                <button
                  key={pg}
                  type="button"
                  onClick={() => updateUrlParams({ page: pg })}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  {pg}
                </button>
              );
            })}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => updateUrlParams({ page: currentPage + 1 })}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer shadow-sm"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function BrowseServicesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Loading services...</div>}>
      <BrowseServicesContent />
    </Suspense>
  );
}
