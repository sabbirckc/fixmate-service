"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";
import type { User, Role } from "@/types";
import { toast } from "sonner";
import { Users, Shield, UserCheck, Wrench, Loader2, AlertCircle } from "lucide-react";

export default function AdminUsersPage() {
  const { data: session } = authClient.useSession();
  const currentAdminEmail = session?.user?.email;

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/api/admin/users");
      if (res.success) {
        setUsers(res.users || []);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: Role, userEmail: string) => {
    if (userEmail.toLowerCase() === currentAdminEmail?.toLowerCase()) {
      toast.error("Administrators cannot change their own role.");
      return;
    }

    const targetId = userId || "by-email";
    setUpdatingId(targetId);
    try {
      const res = await apiFetch(`/api/admin/users/${targetId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole, email: userEmail }),
      });

      if (res.success) {
        toast.success(`Role updated to '${newRole}'`);
        setUsers((prev) =>
          prev.map((u) =>
            u.email?.toLowerCase() === userEmail.toLowerCase() || (u._id || u.id) === userId
              ? { ...u, role: newRole }
              : u
          )
        );
        // Refresh users list in background to ensure sync
        fetchUsers();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update user role");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">User Role Management</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review registered users and assign platform permissions (Customer, Technician, Administrator).
        </p>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-zinc-800 shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-4 w-36 bg-slate-200 dark:bg-zinc-800 rounded-md" />
                    <div className="h-3 w-48 bg-slate-100 dark:bg-zinc-800/60 rounded-md" />
                  </div>
                </div>
                <div className="h-7 w-20 bg-slate-200 dark:bg-zinc-800 rounded-lg shrink-0" />
              </div>
            ))}
          </div>
        ) : users.length > 0 ? (
          <>
            {/* Mobile Cards View */}
            <div className="block md:hidden divide-y divide-slate-100 dark:divide-zinc-800 p-4 space-y-4">
              {users.map((u) => {
                const uid = u._id || u.id || "";
                const isSelf = u.email === currentAdminEmail;

                return (
                  <div
                    key={uid || u.email}
                    className="pt-4 first:pt-0 rounded-2xl bg-slate-50/60 dark:bg-zinc-800/40 p-4 border border-slate-200/80 dark:border-zinc-700/60 space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl overflow-hidden bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold text-sm shrink-0">
                        {u.image ? (
                          <img src={u.image} alt={u.name} className="w-full h-full object-cover" />
                        ) : (
                          u.name?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                          <span>{u.name}</span>
                          {isSelf && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-purple-100 text-purple-700 font-bold shrink-0">
                              You
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200/60 dark:border-zinc-700/60">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Contact</span>
                        <span className="text-slate-700 dark:text-zinc-300 font-medium block truncate">
                          {u.phone || "No phone"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Joined</span>
                        <span className="text-slate-700 dark:text-zinc-300 font-medium block">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Active"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-zinc-700/60">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Current Role</span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                            u.role === "admin"
                              ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300"
                              : u.role === "technician"
                              ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300"
                              : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300"
                          }`}
                        >
                          {u.role}
                        </span>
                      </div>

                      <div>
                        {isSelf ? (
                          <span className="text-[10px] text-slate-400 italic">Role locked (Self)</span>
                        ) : (
                          <select
                            disabled={updatingId === uid}
                            value={u.role}
                            onChange={(e) => handleRoleChange(uid, e.target.value as Role, u.email)}
                            className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold focus:ring-2 focus:ring-purple-500 cursor-pointer shadow-sm"
                          >
                            <option value="customer">Customer</option>
                            <option value="technician">Technician</option>
                            <option value="admin">Admin</option>
                          </select>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-4 px-5">User</th>
                  <th className="py-4 px-4">Contact & Area</th>
                  <th className="py-4 px-4">Joined Date</th>
                  <th className="py-4 px-4">Current Role</th>
                  <th className="py-4 px-5 text-right">Assign Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {users.map((u) => {
                  const uid = u._id || u.id || "";
                  const isSelf = u.email === currentAdminEmail;

                  return (
                    <tr key={uid || u.email} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold text-sm shrink-0">
                            {u.image ? (
                              <img src={u.image} alt={u.name} className="w-full h-full object-cover" />
                            ) : (
                              u.name?.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isSelf && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] bg-purple-100 text-purple-700 font-bold">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-slate-600 dark:text-zinc-400">
                        <p>{u.phone || "No phone registered"}</p>
                        <p className="text-[10px] text-slate-400">{u.area || "Area not specified"}</p>
                      </td>

                      <td className="py-4 px-4 text-slate-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Active"}
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border capitalize ${
                            u.role === "admin"
                              ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300"
                              : u.role === "technician"
                              ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300"
                              : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-right">
                        {isSelf ? (
                          <span className="text-[11px] text-slate-400 italic">Role locked (Self)</span>
                        ) : (
                          <select
                            disabled={updatingId === uid}
                            value={u.role}
                            onChange={(e) => handleRoleChange(uid, e.target.value as Role, u.email)}
                            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold focus:ring-2 focus:ring-purple-500 cursor-pointer shadow-sm"
                          >
                            <option value="customer">Customer</option>
                            <option value="technician">Technician</option>
                            <option value="admin">Admin</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
        ) : (
          <div className="py-20 text-center px-4">
            <Users className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No users found</h3>
          </div>
        )}
      </div>
    </div>
  );
}
