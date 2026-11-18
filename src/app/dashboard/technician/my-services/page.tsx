"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import type { Service, ServiceCategory, ServiceMode } from "@/types";
import { toast } from "sonner";
import {
  FolderOpen,
  PlusCircle,
  Edit,
  Trash2,
  AlertTriangle,
  Loader2,
  Check,
  X,
  ExternalLink,
  DollarSign,
  Clock,
  MapPin,
} from "lucide-react";

const CATEGORIES: ServiceCategory[] = [
  "Smartphone",
  "Laptop & PC",
  "AC",
  "Refrigerator",
  "TV",
  "Washing Machine",
  "Electrical",
];

const SERVICE_MODES: ServiceMode[] = ["Home Visit", "Shop Drop-off"];

export default function MyServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState<ServiceCategory>("Smartphone");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [editMode, setEditMode] = useState<ServiceMode>("Home Visit");
  const [editArea, setEditArea] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMyServices = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/api/services/technician/my");
      if (res.success) {
        setServices(res.services || []);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load technician services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyServices();
  }, []);

  // Toggle Availability
  const handleToggleAvailability = async (service: Service) => {
    try {
      const newStatus = !service.isAvailable;
      const res = await apiFetch(`/api/services/${service._id}/availability`, {
        method: "PATCH",
        body: JSON.stringify({ isAvailable: newStatus }),
      });

      if (res.success) {
        toast.success(`Service marked as ${newStatus ? "Available" : "Unavailable"}`);
        setServices((prev) =>
          prev.map((s) => (s._id === service._id ? { ...s, isAvailable: newStatus } : s))
        );
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle availability");
    }
  };

  // Open Edit Modal
  const openEditModal = (s: Service) => {
    setEditingService(s);
    setEditTitle(s.title);
    setEditCategory(s.category);
    setEditDescription(s.description);
    setEditPrice(String(s.basePrice));
    setEditDuration(s.estimatedDuration);
    setEditMode(s.serviceMode);
    setEditArea(s.serviceArea);
    setEditModalOpen(true);
  };

  // Handle Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    const price = parseFloat(editPrice);
    if (isNaN(price) || price <= 0) {
      toast.error("Please provide a valid price");
      return;
    }

    setSavingEdit(true);
    try {
      const res = await apiFetch(`/api/services/${editingService._id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: editTitle.trim(),
          category: editCategory,
          description: editDescription.trim(),
          basePrice: price,
          estimatedDuration: editDuration.trim(),
          serviceMode: editMode,
          serviceArea: editArea.trim(),
        }),
      });

      if (res.success) {
        toast.success("Service updated!", {
          description: "Status reset to 'pending' waiting for Admin re-approval.",
        });
        setEditModalOpen(false);
        fetchMyServices();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update service");
    } finally {
      setSavingEdit(false);
    }
  };

  // Open Delete Modal
  const openDeleteModal = (s: Service) => {
    setDeletingService(s);
    setDeleteModalOpen(true);
  };

  // Handle Confirm Delete
  const handleDelete = async () => {
    if (!deletingService) return;

    setDeleting(true);
    try {
      const res = await apiFetch(`/api/services/${deletingService._id}`, {
        method: "DELETE",
      });

      if (res.success) {
        toast.success("Service deleted successfully");
        setDeleteModalOpen(false);
        setDeletingService(null);
        fetchMyServices();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete service");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">My Repair Services</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your service portfolio, edit listings, and toggle live availability
          </p>
        </div>
        <Link
          href="/dashboard/technician/add-service"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Service</span>
        </Link>
      </div>

      {/* Services Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600 mb-2" />
            <p className="text-xs font-semibold">Loading your services...</p>
          </div>
        ) : services.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-4 px-5">Service Title & Image</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Base Price</th>
                  <th className="py-4 px-4">Approval Status</th>
                  <th className="py-4 px-4">Available</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {services.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={s.image}
                          alt={s.title}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white line-clamp-1 max-w-[220px]">
                            {s.title}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            {s.serviceMode} • {s.estimatedDuration}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-semibold text-slate-700 dark:text-zinc-300">
                      {s.category}
                    </td>

                    <td className="py-4 px-4 font-black text-slate-900 dark:text-white text-sm">
                      ${s.basePrice}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border capitalize ${
                          s.approvalStatus === "approved"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                            : s.approvalStatus === "rejected"
                            ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300"
                            : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {s.approvalStatus}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(s)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                          s.isAvailable
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}
                      >
                        {s.isAvailable ? "Active (On)" : "Paused (Off)"}
                      </button>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(s)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer"
                          title="Edit Service"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteModal(s)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                          title="Delete Service"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/services/${s._id}`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                          title="View Live Listing"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center px-4">
            <FolderOpen className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No services listed yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              Click 'Add New Service' above to create your first repair offering.
            </p>
          </div>
        )}
      </div>

      {/* Edit Service Modal */}
      {editModalOpen && editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit Repair Service</h2>
              <button type="button" onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-800">
              Note: Saving edits will reset approval status to <strong>'pending'</strong> for Admin moderation.
            </p>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Service Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as ServiceCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Service Mode</label>
                  <select
                    value={editMode}
                    onChange={(e) => setEditMode(e.target.value as ServiceMode)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  >
                    {SERVICE_MODES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Base Price ($ USD)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Duration</label>
                  <input
                    type="text"
                    required
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Service Area</label>
                <input
                  type="text"
                  required
                  value={editArea}
                  onChange={(e) => setEditArea(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-semibold cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer text-center"
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && deletingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Service Listing?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete <strong>"{deletingService.title}"</strong>?
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="w-full sm:flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="w-full sm:flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 cursor-pointer text-center"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
