"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { authClient } from "@/lib/auth-client";
import { getStoredToken, setStoredToken, removeStoredToken, apiFetch, isTokenExpired, refreshAuthToken } from "@/lib/api-client";
import type { Role } from "@/types";
import {
  Wrench,
  LayoutDashboard,
  Calendar,
  CreditCard,
  PlusCircle,
  FolderOpen,
  ClipboardList,
  Users,
  CheckSquare,
  DollarSign,
  UserCheck,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Loader2,
  Home,
} from "lucide-react";
import { toast } from "sonner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [profileRole, setProfileRole] = useState<Role | null>(null);
  const [profileUser, setProfileUser] = useState<any>(null);

  // Sync real-time role and user profile details from backend database
  useEffect(() => {
    const fetchLatestProfile = () => {
      if (session?.user?.email) {
        apiFetch("/api/users/profile")
          .then((res) => {
            if (res?.success && res?.user) {
              setProfileUser(res.user);
              if (res.user.role) {
                setProfileRole(res.user.role as Role);
              }
            }
          })
          .catch(() => {});
      }
    };

    fetchLatestProfile();

    const handleProfileUpdated = (e: any) => {
      if (e.detail) {
        setProfileUser((prev: any) => ({ ...prev, ...e.detail }));
      } else {
        fetchLatestProfile();
      }
    };

    window.addEventListener("fixmate_profile_updated", handleProfileUpdated);
    return () => window.removeEventListener("fixmate_profile_updated", handleProfileUpdated);
  }, [session?.user?.email]);

  const user = session?.user;
  const displayName = profileUser?.name || user?.name || "FixMate User";
  const displayImage = profileUser?.image || user?.image;
  const userRole = (profileRole || profileUser?.role || (user as any)?.role || "customer") as Role;

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile sidebar and dropdown on route change
  useEffect(() => {
    setSidebarOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  // Protect dashboard routes
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push(`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!isPending && userRole) {
      // Sync JWT token with Express backend (automatically refreshes when expired, missing, or for another account)
      const existingToken = getStoredToken();
      if (session?.user?.email && isTokenExpired(existingToken, session.user.email)) {
        refreshAuthToken();
      }

      // Role route guard
      if (pathname.startsWith("/dashboard/admin") && userRole !== "admin") {
        toast.error("Access forbidden: Administrator privileges required.");
        router.push(userRole === "technician" ? "/dashboard/technician" : "/dashboard/customer");
      } else if (pathname.startsWith("/dashboard/technician") && userRole !== "technician") {
        toast.error("Access forbidden: Technician privileges required.");
        router.push(userRole === "admin" ? "/dashboard/admin" : "/dashboard/customer");
      } else if (pathname.startsWith("/dashboard/customer") && userRole !== "customer") {
        // Customer routes are strictly for customers
        router.push(userRole === "admin" ? "/dashboard/admin" : "/dashboard/technician");
      }
    }
  }, [session, isPending, userRole, pathname, router]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      removeStoredToken();
      toast.success("Signed out successfully");
      router.push("/");
    } catch (err: any) {
      toast.error(err.message || "Failed to sign out");
    }
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex animate-pulse">
        {/* Skeleton Sidebar for Desktop */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 fixed inset-y-0 z-40 p-6 space-y-6">
          <div className="h-9 w-32 bg-slate-200 dark:bg-zinc-800 rounded-xl" />
          <div className="h-16 w-full bg-slate-100 dark:bg-zinc-800/60 rounded-2xl" />
          <div className="space-y-3 pt-4">
            <div className="h-10 w-full bg-slate-100 dark:bg-zinc-800/40 rounded-xl" />
            <div className="h-10 w-full bg-slate-100 dark:bg-zinc-800/40 rounded-xl" />
            <div className="h-10 w-full bg-slate-100 dark:bg-zinc-800/40 rounded-xl" />
          </div>
        </aside>

        {/* Skeleton Main Area */}
        <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
          <header className="h-16 sm:h-18 bg-white/80 dark:bg-zinc-900/80 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between px-4 sm:px-8">
            <div className="h-5 w-32 bg-slate-200 dark:bg-zinc-800 rounded-lg" />
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-zinc-800" />
              <div className="w-24 h-5 bg-slate-200 dark:bg-zinc-800 rounded-lg hidden sm:block" />
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            <div className="h-36 w-full bg-slate-200 dark:bg-zinc-800 rounded-3xl" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="h-28 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl" />
              <div className="h-28 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl" />
              <div className="h-28 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Dynamic Navigation based on Role
  const customerLinks = [
    { name: "Overview", href: "/dashboard/customer", icon: LayoutDashboard },
    { name: "My Bookings", href: "/dashboard/customer/bookings", icon: Calendar },
    { name: "Payment History", href: "/dashboard/customer/payments", icon: CreditCard },
  ];

  const technicianLinks = [
    { name: "Overview", href: "/dashboard/technician", icon: LayoutDashboard },
    { name: "Add a Service", href: "/dashboard/technician/add-service", icon: PlusCircle },
    { name: "My Services", href: "/dashboard/technician/my-services", icon: FolderOpen },
    { name: "Manage Requests", href: "/dashboard/technician/requests", icon: ClipboardList },
  ];

  const adminLinks = [
    { name: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
    { name: "Customer Bookings", href: "/dashboard/admin/bookings", icon: Calendar },
    { name: "Service Approvals", href: "/dashboard/admin/services", icon: CheckSquare },
    { name: "Manage Users", href: "/dashboard/admin/users", icon: Users },
    { name: "Transactions", href: "/dashboard/admin/transactions", icon: DollarSign },
  ];

  const activeLinks =
    userRole === "admin"
      ? adminLinks
      : userRole === "technician"
      ? technicianLinks
      : customerLinks;

  const roleBadge = (role: Role) => {
    if (role === "admin") {
      return (
        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          Admin
        </span>
      );
    }
    if (role === "technician") {
      return (
        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          Technician
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
        Customer
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 fixed inset-y-0 z-40">
        {/* Brand */}
        <div className="h-18 flex items-center gap-2.5 px-6 border-b border-slate-100 dark:border-zinc-800">
          <Link href="/" onClick={handleHomeClick} className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Wrench className="w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-blue-600 dark:text-blue-500">
              Fix<span className="text-slate-900 dark:text-white">Mate</span>
            </span>
          </Link>
        </div>

        {/* User Card */}
        <Link
          href="/dashboard/profile"
          className="p-4 mx-3 my-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800/80 flex items-center gap-3 hover:border-blue-400 dark:hover:border-blue-500/50 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            {displayImage ? (
              <img src={displayImage} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              displayName?.charAt(0).toUpperCase() || "U"
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {displayName}
            </p>
            <div className="mt-0.5">{roleBadge(userRole)}</div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
        </Link>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {userRole} Portal
          </div>
          {activeLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/70 dark:hover:bg-zinc-800"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}

          <div className="pt-4 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Account
          </div>
          <Link
            href="/dashboard/profile"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/dashboard/profile"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/70 dark:hover:bg-zinc-800"
            }`}
          >
            <UserCheck className="w-4 h-4 shrink-0" />
            <span>Update Profile</span>
          </Link>
        </nav>

        {/* Sidebar Footer Actions */}
        <div className="p-3 border-t border-slate-100 dark:border-zinc-800 space-y-1">
          <Link
            href="/"
            onClick={handleHomeClick}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/70 dark:hover:bg-zinc-800 transition-colors"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            <span>Back to site</span>
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-72 max-w-[85vw] bg-white dark:bg-zinc-900 h-full flex flex-col z-10 shadow-2xl border-r border-slate-200 dark:border-zinc-800 animate-in slide-in-from-left duration-200">
            <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 dark:border-zinc-800">
              <Link
                href="/"
                onClick={(e) => {
                  handleHomeClick(e);
                  setSidebarOpen(false);
                }}
                className="flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
                  <Wrench className="w-4 h-4" />
                </div>
                <span className="font-bold text-lg text-slate-900 dark:text-white">Fix<span className="text-blue-600">Mate</span></span>
              </Link>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile User Profile Header */}
            <div className="p-4 mx-3 my-2 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold shrink-0">
                {displayImage ? (
                  <img src={displayImage} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  displayName?.charAt(0).toUpperCase() || "U"
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{displayName}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                <div className="mt-1">{roleBadge(userRole)}</div>
              </div>
            </div>

            <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
              <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Menu
              </div>
              {activeLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                        : "text-slate-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/70 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              <div className="pt-3 px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Account
              </div>
              <Link
                href="/dashboard/profile"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  pathname === "/dashboard/profile"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/70 dark:hover:bg-zinc-800"
                }`}
              >
                <UserCheck className="w-4 h-4 shrink-0" />
                <span>Update Profile</span>
              </Link>
            </nav>
            <div className="p-3 border-t border-slate-100 dark:border-zinc-800 space-y-1">
              <Link
                href="/"
                onClick={(e) => {
                  handleHomeClick(e);
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/70 dark:hover:bg-zinc-800 transition-colors"
              >
                <ExternalLink className="w-4 h-4 shrink-0" />
                <span>Back to site</span>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 sm:h-18 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between px-3 sm:px-6 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500">
              <Link href="/" onClick={handleHomeClick} className="hover:text-blue-600">Home</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="capitalize text-slate-800 dark:text-zinc-200 font-semibold">{userRole} Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {/* Topbar User Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 pl-2.5 py-1 pr-1.5 rounded-xl border-l border-slate-200 dark:border-zinc-800 hover:bg-slate-100/70 dark:hover:bg-zinc-800/70 transition-all cursor-pointer group"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                    {displayName}
                  </p>
                  <p className="text-[10px] text-slate-400 capitalize">{userRole}</p>
                </div>
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform shrink-0">
                  {displayImage ? (
                    <img src={displayImage} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    displayName?.charAt(0).toUpperCase() || "U"
                  )}
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    dropdownOpen ? "rotate-180 text-blue-600" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl border border-slate-200 dark:border-zinc-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 truncate mb-1.5">
                      {user.email}
                    </p>
                    <div className="flex items-center gap-2">
                      {roleBadge(userRole)}
                    </div>
                  </div>

                  <div className="py-1.5">
                    <Link
                      href={
                        userRole === "admin"
                          ? "/dashboard/admin"
                          : userRole === "technician"
                          ? "/dashboard/technician"
                          : "/dashboard/customer"
                      }
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/60 font-medium transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/60 font-medium transition-colors"
                    >
                      <UserCheck className="w-4 h-4 text-slate-500" />
                      <span>Update Profile</span>
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 dark:border-zinc-800 pt-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        handleSignOut();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors font-medium cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
