import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Upload, Save, Sparkles, User, Briefcase, Mail, Phone, MapPin, Globe, Camera } from "lucide-react";
import { COURSES, YEARS } from "../data";
import { storageService, ProfileData } from "../storage";
import { toast } from "sonner";

export type EditModalMode = "full" | "avatar" | "bio" | "details" | "socials";

interface Props {
  open: boolean;
  onClose: () => void;
  onProfileUpdated?: () => void;
  initialMode?: EditModalMode;
}

export default function EditProfileModal({ open, onClose, onProfileUpdated, initialMode = "full" }: Props) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [activeTab, setActiveTab] = useState<EditModalMode>(initialMode);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      storageService.getProfile().then(setProfile);
      setActiveTab(initialMode);
    }
  }, [open, initialMode]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be under 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProfile({ ...profile, avatar: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    let avatarValue = profile.avatar;
    if (!avatarValue || (!avatarValue.startsWith("data:") && !avatarValue.startsWith("http"))) {
      avatarValue = profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "PCC";
    }

    await storageService.updateProfile({
      ...profile,
      avatar: avatarValue,
    });
    
    toast.success(
      activeTab === "bio"
        ? "Bio quote updated!"
        : activeTab === "avatar"
        ? "Profile picture updated!"
        : activeTab === "details"
        ? "Profile details updated!"
        : activeTab === "socials"
        ? "Social links updated!"
        : "Profile updated successfully!"
    );
    
    if (onProfileUpdated) onProfileUpdated();
    onClose();
  };

  const isImageAvatar = profile?.avatar && (profile.avatar.startsWith("data:") || profile.avatar.startsWith("http"));

  const getTitle = () => {
    switch (activeTab) {
      case "bio":
        return "Edit Bio";
      case "avatar":
        return "Update Profile Picture";
      case "details":
        return "Edit Details";
      case "socials":
        return "Edit Social Links";
      default:
        return "Edit Profile";
    }
  };

  const getSubtitle = () => {
    switch (activeTab) {
      case "bio":
        return "Share a short bio or motto with fellow alumni";
      case "avatar":
        return "Choose a professional photo from your device";
      case "details":
        return "Update your work, education, and contact information";
      case "socials":
        return "Connect your external social media profiles";
      default:
        return "Customize your PCC Alumni Profile";
    }
  };

  return createPortal(
    <AnimatePresence>
      {open && profile && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <motion.button
            type="button"
            aria-label="Close overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0d1f3c]/65 backdrop-blur-md cursor-pointer"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="relative z-10 w-full max-w-3xl max-h-[92vh] overflow-hidden rounded-3xl border border-stone-200 bg-[#FAF6F0] shadow-[0_30px_90px_rgba(13,31,60,0.35)] flex flex-col my-auto text-slate-900"
          >
            {/* Top accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#1a3a6b] via-[#FF8A3D] to-[#F5C518] flex-shrink-0" />

            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 px-6 sm:px-8 pt-6 pb-4 flex-shrink-0 border-b border-stone-200/80">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-[#FF8A3D]">PCC Alumni Portal</p>
                <h2
                  id="edit-profile-title"
                  className="font-[Cormorant_Garamond,serif] text-3xl font-bold text-slate-900 leading-tight mt-0.5"
                >
                  {getTitle()}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">{getSubtitle()}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-stone-200/80 hover:bg-stone-300 text-stone-700 flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer shadow-xs"
                aria-label="Close modal"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Sub-Navigation Tabs for Full Edit Mode */}
            {initialMode === "full" && (
              <div className="flex items-center gap-1.5 px-6 sm:px-8 py-2.5 bg-stone-100/70 border-b border-stone-200 text-xs overflow-x-auto">
                {[
                  { key: "full", label: "Overview" },
                  { key: "avatar", label: "Profile Picture" },
                  { key: "bio", label: "Bio Quote" },
                  { key: "details", label: "Details" },
                  { key: "socials", label: "Social Links" },
                ].map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setActiveTab(t.key as EditModalMode)}
                    className={`px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === t.key
                        ? "bg-[#FF8A3D] text-white shadow-2xs"
                        : "text-slate-600 hover:bg-stone-200/70"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}

            <form className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-6" onSubmit={handleSubmit}>
              
              {/* 1. EDIT BIO ONLY */}
              {activeTab === "bio" && (
                <div className="space-y-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Personal Bio / Quote
                  </label>
                  <textarea
                    rows={4}
                    value={profile.saying}
                    onChange={(e) => setProfile({ ...profile, saying: e.target.value })}
                    placeholder="Describe yourself, your motto, or career goals..."
                    className="w-full border border-stone-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8A3D]/40 bg-white text-slate-900 resize-none font-[Inter,sans-serif]"
                    autoFocus
                  />
                  <p className="text-[11px] text-slate-500">
                    Your bio is displayed prominently in your Facebook-style Intro box for fellow alumni.
                  </p>
                </div>
              )}

              {/* 2. EDIT AVATAR ONLY */}
              {activeTab === "avatar" && (
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs text-center space-y-4">
                  <div className="w-32 h-32 rounded-full bg-[#18345d] mx-auto flex items-center justify-center text-white text-3xl font-bold overflow-hidden border-4 border-white shadow-xl">
                    {isImageAvatar ? (
                      <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{profile.avatar}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{profile.name}</p>
                    <p className="text-xs text-slate-500">JPG or PNG (max size 2MB)</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 bg-[#FF8A3D] hover:bg-[#ff7a22] text-white text-xs font-bold px-5 py-2 rounded-full transition-all cursor-pointer shadow-xs"
                    >
                      <Upload className="w-4 h-4" /> Upload New Photo
                    </button>
                    {isImageAvatar && (
                      <button
                        type="button"
                        onClick={() => setProfile({ ...profile, avatar: "" })}
                        className="text-xs text-red-600 font-semibold hover:underline cursor-pointer"
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* 3. EDIT DETAILS ONLY */}
              {activeTab === "details" && (
                <div className="space-y-6">
                  {/* Personal Details */}
                  <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4 shadow-2xs">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#2563eb] flex items-center gap-1.5 pb-2 border-b border-stone-100">
                      <User className="w-3.5 h-3.5" /> Personal Information
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Student ID</label>
                        <input
                          value={profile.studentId}
                          onChange={(e) => setProfile({ ...profile, studentId: e.target.value })}
                          className="w-full border border-stone-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF8A3D]/40 bg-white text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Gender</label>
                        <select
                          value={profile.gender}
                          onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                          className="w-full border border-stone-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF8A3D]/40 bg-white text-slate-900"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Full Name</label>
                      <input
                        required
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="w-full border border-stone-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF8A3D]/40 bg-white text-slate-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Phone</label>
                        <input
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          className="w-full border border-stone-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF8A3D]/40 bg-white text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Email</label>
                        <input
                          required
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          className="w-full border border-stone-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF8A3D]/40 bg-white text-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Lives in (City/Location)</label>
                      <input
                        value={profile.address}
                        onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                        placeholder="e.g. Pagadian City, Zamboanga del Sur"
                        className="w-full border border-stone-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF8A3D]/40 bg-white text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Career & Education */}
                  <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4 shadow-2xs">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#FF8A3D] flex items-center gap-1.5 pb-2 border-b border-stone-100">
                      <Briefcase className="w-3.5 h-3.5" /> Career & Education
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Position / Job Title</label>
                        <input
                          value={profile.position}
                          onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                          placeholder="e.g. Software Engineer"
                          className="w-full border border-stone-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF8A3D]/40 bg-white text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Company / Employer</label>
                        <input
                          value={profile.company}
                          onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                          placeholder="e.g. Accenture"
                          className="w-full border border-stone-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF8A3D]/40 bg-white text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Course / Program</label>
                        <select
                          value={profile.course}
                          onChange={(e) => setProfile({ ...profile, course: e.target.value })}
                          className="w-full border border-stone-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF8A3D]/40 bg-white text-slate-900"
                        >
                          {COURSES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Graduation Batch</label>
                        <select
                          value={profile.year}
                          onChange={(e) => setProfile({ ...profile, year: Number(e.target.value) })}
                          className="w-full border border-stone-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF8A3D]/40 bg-white text-slate-900"
                        >
                          {YEARS.map((y) => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. EDIT SOCIALS ONLY */}
              {activeTab === "socials" && (
                <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4 shadow-2xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#2563eb] flex items-center gap-1.5 pb-2 border-b border-stone-100">
                    <Globe className="w-3.5 h-3.5" /> Social Media Profiles
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">LinkedIn URL</label>
                      <input
                        value={profile.linkedin}
                        onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full border border-stone-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF8A3D]/40 bg-white text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">GitHub URL</label>
                      <input
                        value={profile.github}
                        onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                        placeholder="https://github.com/username"
                        className="w-full border border-stone-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF8A3D]/40 bg-white text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Facebook URL</label>
                      <input
                        value={profile.facebook}
                        onChange={(e) => setProfile({ ...profile, facebook: e.target.value })}
                        placeholder="https://facebook.com/username"
                        className="w-full border border-stone-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF8A3D]/40 bg-white text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Instagram URL</label>
                      <input
                        value={profile.instagram}
                        onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                        placeholder="https://instagram.com/username"
                        className="w-full border border-stone-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF8A3D]/40 bg-white text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 5. FULL / OVERVIEW MODE */}
              {activeTab === "full" && (
                <div className="space-y-6">
                  {/* Profile Picture Header */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-white border border-stone-200 p-4 shadow-xs">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-[#18345d] flex items-center justify-center text-white text-lg font-bold overflow-hidden border-2 border-white shadow-md">
                        {isImageAvatar ? (
                          <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{profile.avatar}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Profile Picture</p>
                        <p className="text-xs text-slate-500">JPG or PNG (under 2MB)</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("avatar")}
                      className="px-4 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-slate-700 text-xs font-bold cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Bio Header */}
                  <div className="rounded-2xl bg-white border border-stone-200 p-4 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Bio Quote</p>
                      <button
                        type="button"
                        onClick={() => setActiveTab("bio")}
                        className="px-4 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-slate-700 text-xs font-bold cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 bg-stone-50 p-3 rounded-xl border border-stone-100 font-medium">
                      {profile.saying ? (
                        <span className="italic">&ldquo;{profile.saying}&rdquo;</span>
                      ) : (
                        <span className="text-slate-400 font-normal">No bio quote added yet</span>
                      )}
                    </p>
                  </div>

                  {/* Details Header */}
                  <div className="rounded-2xl bg-white border border-stone-200 p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Customize Your Details</p>
                      <button
                        type="button"
                        onClick={() => setActiveTab("details")}
                        className="px-4 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-slate-700 text-xs font-bold cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 font-medium">
                      <div>🎓 {profile.course || "PCC Graduate"} (Class of {profile.year})</div>
                      <div>💼 {profile.position || "Alumni Member"} {profile.company ? `at ${profile.company}` : ""}</div>
                      <div>🏠 {profile.address || profile.location ? `Lives in ${profile.address || profile.location}` : "Location not specified"}</div>
                      <div>📧 {profile.email}</div>
                    </div>
                  </div>

                  {/* Social Links Header */}
                  <div className="rounded-2xl bg-white border border-stone-200 p-4 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Social Media Links</p>
                      <button
                        type="button"
                        onClick={() => setActiveTab("socials")}
                        className="px-4 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-slate-700 text-xs font-bold cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {profile.linkedin && <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-medium">LinkedIn</span>}
                      {profile.github && <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md font-medium">GitHub</span>}
                      {profile.facebook && <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-md font-medium">Facebook</span>}
                      {profile.instagram && <span className="bg-pink-50 text-pink-700 px-2.5 py-1 rounded-md font-medium">Instagram</span>}
                      {!profile.linkedin && !profile.github && !profile.facebook && !profile.instagram && (
                        <span className="text-slate-400 italic">No social links added yet.</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl border border-stone-300 text-slate-700 text-xs font-bold hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF8A3D] to-[#ff7a22] hover:from-[#ff7a22] hover:to-[#e66914] text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-[#FF8A3D]/25 transition-all text-xs cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
