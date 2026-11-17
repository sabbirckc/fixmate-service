"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api-client";
import { uploadImageToImgBB } from "@/lib/imgbb";
import type { ServiceCategory, ServiceMode } from "@/types";
import { toast } from "sonner";
import {
  Upload,
  PlusCircle,
  Tag,
  DollarSign,
  Clock,
  MapPin,
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  Wrench,
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

export default function AddServicePage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ServiceCategory>("Smartphone");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState("1-2 hours");
  const [serviceMode, setServiceMode] = useState<ServiceMode>("Home Visit");
  const [serviceArea, setServiceArea] = useState(user ? (user as any).area || "Dhanmondi, Dhaka" : "Dhanmondi, Dhaka");

  // Image Upload State (ImgBB file input)
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a service title");
      return;
    }

    if (!description.trim()) {
      toast.error("Please provide a service description");
      return;
    }

    const price = parseFloat(basePrice);
    if (isNaN(price) || price <= 0) {
      toast.error("Base price must be a positive number greater than 0");
      return;
    }

    if (!imageFile) {
      toast.error("Please upload a service banner image file");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Upload file to ImgBB
      toast.loading("Uploading service banner to ImgBB...", { id: "img-upload" });
      const uploadedUrl = await uploadImageToImgBB(imageFile);
      toast.dismiss("img-upload");

      // 2. Submit to backend
      const res = await apiFetch("/api/services", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          category,
          description: description.trim(),
          image: uploadedUrl,
          basePrice: price,
          estimatedDuration: estimatedDuration.trim(),
          serviceMode,
          serviceArea: serviceArea.trim(),
        }),
      });

      if (res.success) {
        toast.success("Service created successfully!", {
          description: "Your listing is now pending and waiting for Admin approval.",
        });
        router.push("/dashboard/technician/my-services");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create service");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Add a New Repair Service</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Create a verified repair listing. Once approved by an Admin, it will be published to the public catalog.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Read-only Technician Profile Info */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Technician Name</span>
              <span className="font-bold text-slate-800 dark:text-zinc-200">{user?.name} (Read-only)</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Technician Email</span>
              <span className="font-bold text-slate-800 dark:text-zinc-200 truncate block">{user?.email} (Read-only)</span>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
              Service Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. iPhone 15 Pro Max Screen & Digitizer Replacement"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Category & Service Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                Repair Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                Service Mode *
              </label>
              <select
                value={serviceMode}
                onChange={(e) => setServiceMode(e.target.value as ServiceMode)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
              >
                {SERVICE_MODES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                Starting Base Price ($ USD) *
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  placeholder="e.g. 120"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                Estimated Duration *
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                  placeholder="e.g. 1-2 hours or 1 day"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Service Area */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
              Service Coverage Area *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={serviceArea}
                onChange={(e) => setServiceArea(e.target.value)}
                placeholder="e.g. Dhanmondi, Gulshan, Mirpur (Dhaka)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
              Detailed Description & Problem Coverage *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the repair process, parts warranty, what symptoms this service fixes, etc..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* ImgBB File Upload Input (Rule: File input, not a URL field!) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
              Service Banner Image (ImgBB File Upload) *
            </label>
            <div className="border-2 border-dashed border-slate-300 dark:border-zinc-700 rounded-2xl p-6 text-center hover:border-amber-500 transition-colors">
              {imagePreview ? (
                <div className="space-y-3">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-h-48 object-cover rounded-xl mx-auto"
                  />
                  <div className="flex justify-center gap-3">
                    <label className="cursor-pointer px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg">
                      <span>Change File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                    Click to select an image file to upload through ImgBB
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, WEBP up to 10MB</p>
                  <label className="mt-3 inline-block cursor-pointer px-4 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold text-xs rounded-xl border border-amber-200">
                    <span>Browse Image File</span>
                    <input
                      type="file"
                      accept="image/*"
                      required
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting to Admin...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Submit for Admin Approval</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
