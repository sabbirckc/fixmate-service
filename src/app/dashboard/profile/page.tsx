"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api-client";
import { uploadImage } from "@/lib/imgbb";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Upload,
  ShieldCheck,
  CheckCircle,
  Loader2,
  Camera,
} from "lucide-react";

export default function ProfilePage() {
  const { data: session } = authClient.useSession();
  const sessionUser = session?.user;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("customer");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState<string | null>(null);

  // ImgBB Upload State (per Notion guide: upload on file selection)
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await apiFetch("/api/users/profile");
        if (res.success && res.user) {
          const u = res.user;
          setName(u.name || "");
          setEmail(u.email || "");
          setRole(u.role || "customer");
          setPhone(u.phone || "");
          setArea(u.area || "");
          setBio(u.bio || "");
          setImage(u.image || null);
        }
      } catch (err) {
        console.warn("Could not fetch remote profile, falling back to session:", err);
        if (sessionUser) {
          setName(sessionUser.name || "");
          setEmail(sessionUser.email || "");
          setRole((sessionUser as any).role || "customer");
          setPhone((sessionUser as any).phone || "");
          setArea((sessionUser as any).area || "");
          setBio((sessionUser as any).bio || "");
          setImage(sessionUser.image || null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [sessionUser]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      toast.loading("Uploading photo to ImgBB...", { id: "profile-upload" });
      const uploadedUrl = await uploadImage(file);
      setImage(uploadedUrl);
      console.log("Uploaded Image URL:", uploadedUrl);
      toast.success("Photo uploaded to ImgBB successfully!", { id: "profile-upload" });
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Failed to upload photo to ImgBB", { id: "profile-upload" });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setSaving(true);
    try {
      const res = await apiFetch("/api/users/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          area: area.trim(),
          bio: bio.trim(),
          image: image,
        }),
      });

      if (res.success) {
        toast.success("Profile updated successfully!", {
          description: "Your updated information is now active across your account.",
        });

        // Trigger BetterAuth session reload so Navbar updates immediately
        window.location.reload();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Profile Settings</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your personal details, contact information, and public technician bio
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleProfileSubmit} className="space-y-6">
          {/* Avatar Upload with ImgBB */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100 dark:border-zinc-800">
            <div className="relative group">
              <div className="w-24 h-24 rounded-3xl overflow-hidden bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold text-3xl shadow-md border-2 border-slate-200 dark:border-zinc-700">
                {uploadingImage ? (
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                ) : image ? (
                  <img src={image} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  name.charAt(0).toUpperCase() || "U"
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-blue-600 text-white shadow-lg cursor-pointer hover:bg-blue-700 transition-transform group-hover:scale-105">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingImage}
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="text-center sm:text-left">
              <h2 className="font-bold text-base text-slate-900 dark:text-white">{name || "User"}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{email}</p>
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                Role: {role}
              </span>
            </div>
          </div>

          {/* Read-Only Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Registered Email</span>
              <span className="font-bold text-slate-800 dark:text-zinc-200">{email} (Read-only)</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Account Role</span>
              <span className="font-bold text-slate-800 dark:text-zinc-200 capitalize">{role} (Read-only)</span>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Phone & Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                Contact Phone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+880 1711-223344"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                City / Service Area
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Dhanmondi, Dhaka"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Bio (Useful for technicians & profile summaries) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
              Short Bio / Technician Qualifications
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Highlight your repair skills, certifications, experience with Apple/Samsung devices, AC inverter repair..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Updates...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
