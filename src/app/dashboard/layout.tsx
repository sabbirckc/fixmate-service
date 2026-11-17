"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { removeStoredToken } from "@/lib/api-client";
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

  const user = session?.user;
  const userRole = ((user as any)?.role || "customer") as Role;

  // Protect dashboard routes
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push(`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!isPending && userRole) {
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

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
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
    { name: "Manage Users", href: "/dashboard/admin/users", icon: Users },
    { name: "Service Approvals", href: "/dashboard/admin/services", icon: CheckSquare },
    { name: "All Bookings", href: "/dashboard/admin/bookings", icon: Calendar },
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
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Wrench className="w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-blue-600 dark:text-blue-500">
              Fix<span className="text-slate-900 dark:text-white">Mate</span>
            </span>
          </Link>
        </div>

        {/* User Card */}
        <div className="p-4 mx-3 my-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
            {user.image ? (
              <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user.name?.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
            <div className="mt-0.5">{roleBadge(userRole)}</div>
          </div>
        </div>

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
          <Link
            href="/"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100/70 dark:hover:bg-zinc-800"
          >
            <Home className="w-4 h-4 shrink-0" />
            <span>Public Website</span>
          </Link>
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 bg-white dark:bg-zinc-900 h-full flex flex-col z-10 shadow-2xl">
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-zinc-800">
              <Link href="/" className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-lg">FixMate</span>
              </Link>
              <button type="button" onClick={() => setSidebarOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {activeLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                      isActive ? "bg-blue-600 text-white" : "text-slate-600 dark:text-zinc-400 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400"
              >
                <UserCheck className="w-4 h-4" />
                <span>Update Profile</span>
              </Link>
            </nav>
            <div className="p-4 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 text-xs font-semibold text-rose-600"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-18 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500">
              <Link href="/" className="hover:text-blue-600">Home</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="capitalize text-slate-800 dark:text-zinc-200 font-semibold">{userRole} Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-50"
            >
              <span>View Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-zinc-800">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</p>
                <p className="text-[10px] text-slate-400 capitalize">{userRole}</p>
              </div>
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold text-sm">
                {user.image ? (
                  <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name?.charAt(0).toUpperCase()
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
