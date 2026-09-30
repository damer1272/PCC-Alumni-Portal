import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import { motion } from "motion/react";
import {
  Linkedin, Github, Facebook, Instagram, Edit2, Mail, MapPin,
  GraduationCap, Calendar, User, Briefcase, Camera, Share2, ShieldCheck,
  Phone, Globe, CheckCircle2, Sparkles, Building2, UserCheck, Send, X, Trash2, Heart
} from "lucide-react";
import EditProfileModal, { EditModalMode } from "../components/EditProfileModal";
import { storageService, ProfileData, JourneyPost } from "../storage";
import { EmploymentRecord } from "../data";
import { toast } from "sonner";

export default function MyProfile() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [editOpen, setEditOpen] = useState(false);
  const [editMode, setEditMode] = useState<EditModalMode>("full");
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [employmentHistory, setEmploymentHistory] = useState<EmploymentRecord[]>([]);
  const [myJourneyPosts, setMyJourneyPosts] = useState<JourneyPost[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [postText, setPostText] = useState("");
  const [attachedImage, setAttachedImage] = useState<string>("");
  const [isPosting, setIsPosting] = useState(false);
  const postFileInputRef = useRef<HTMLInputElement>(null);

  const loadProfile = async () => {
    const data = await storageService.getProfile();
    setProfile(data);
    if (data && data.email) {
      const history = await storageService.getEmploymentHistory(data.email);
      setEmploymentHistory(history);
    }
    const allPosts = await storageService.getJourneyPosts();
    if (data) {
      const userEmail = data.email?.trim().toLowerCase();
      const userName = data.name?.trim().toLowerCase();

      const userPosts = allPosts.filter((p) => {
        const pEmail = p.authorEmail?.trim().toLowerCase();
        const pName = p.authorName?.trim().toLowerCase();

        if (userEmail && pEmail && pEmail === userEmail) {
          return true;
        }
        if (userName && pName && pName === userName) {
          return true;
        }
        return false;
      });
      setMyJourneyPosts(userPosts);
    }
  };

  const handleLikePost = async (postId: string) => {
    await storageService.toggleLikePost(postId);
    loadProfile();
  };

  const handleDeletePost = async (postId: string) => {
    await storageService.deleteJourneyPost(postId);
    toast.success("Journey post removed");
    loadProfile();
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handlePostImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Media file size must be under 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAttachedImage(reader.result);
        toast.success("Image attached to your journey update!");
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (searchParams.get("edit") === "1" || searchParams.get("setup") === "true") {
      setEditMode("full");
      setEditOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const openEdit = (mode: EditModalMode = "full") => {
    setEditMode(mode);
    setEditOpen(true);
  };
  const closeEdit = () => setEditOpen(false);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      toast.success("Profile link copied to clipboard!");
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  if (!profile) return null;

  const initials = profile.name
    ? profile.name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
    : "PCC";

  const isImageAvatar = profile.avatar && (profile.avatar.startsWith("data:") || profile.avatar.startsWith("http"));

  const socials = [
    { icon: Linkedin, label: "LinkedIn", href: profile.linkedin, bg: "bg-[#0a66c2] text-white" },
    { icon: Github, label: "GitHub", href: profile.github, bg: "bg-slate-800 text-white" },
    { icon: Facebook, label: "Facebook", href: profile.facebook, bg: "bg-[#1877f2] text-white" },
    { icon: Instagram, label: "Instagram", href: profile.instagram, bg: "bg-[#e1306c] text-white" },
  ].filter((s) => Boolean(s.href && s.href.trim()));

  const hasEmptyDetails = !profile.position && !profile.company && !profile.saying;

  return (
    <div className="space-y-6 font-[Inter,sans-serif] w-full max-w-6xl mx-auto pb-12">
      <EditProfileModal open={editOpen} onClose={closeEdit} onProfileUpdated={loadProfile} initialMode={editMode} />

      {/* Onboarding Banner for fresh accounts */}
      {hasEmptyDetails && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#FF8A3D]/15 via-[#F5C518]/15 to-[#2563eb]/15 border border-[#FF8A3D]/30 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF8A3D] to-[#F5C518] text-white flex items-center justify-center flex-shrink-0 shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Welcome to your PCC Profile, {profile.name}!</h3>
              <p className="text-xs text-slate-600 mt-0.5">Add your position, company, photo, bio, and social links to complete your profile.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openEdit("full")}
            className="bg-gradient-to-r from-[#FF8A3D] to-[#ff7a22] text-white font-bold px-5 py-2.5 rounded-xl text-xs hover:from-[#ff7a22] hover:to-[#e66914] transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-[#FF8A3D]/25 whitespace-nowrap"
          >
            <Edit2 className="w-3.5 h-3.5" /> Setup Profile Now
          </button>
        </motion.div>
      )}

      {/* MAIN PROFILE CARD */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden p-6 sm:p-8"
      >
        {/* HEADER IDENTITY BAR */}
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 border-b border-stone-200 pb-6">

          {/* Left: Avatar + Name Details */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            {/* Avatar with Camera Edit Badge */}
            <div className="relative group flex-shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-stone-100 shadow-lg bg-[#18345d] flex items-center justify-center text-white overflow-hidden relative">
                {isImageAvatar ? (
                  <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-[Cormorant_Garamond,serif] text-4xl sm:text-5xl font-bold">{initials}</span>
                )}
              </div>

              {/* Avatar camera icon triggers Avatar update */}
              <button
                type="button"
                onClick={() => openEdit("avatar")}
                title="Change Profile Picture"
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-slate-900/90 text-white hover:bg-slate-900 border-2 border-white flex items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Identity Info */}
            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {profile.name}
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#2563eb] border border-blue-200 px-2 py-0.5 rounded-md">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
              </div>

              <p className="text-sm font-semibold text-slate-700">
                {profile.position ? (
                  <span>
                    {profile.position} {profile.company ? `at ${profile.company}` : ""}
                  </span>
                ) : (
                  <span className="text-slate-500 italic">PCC Alumni Member</span>
                )}
              </p>

              <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-2 font-medium pt-0.5">
                <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5 text-[#FF8A3D]" /> {profile.course || "Pagadian Capitol College"}</span>
                <span>•</span>
                <span>Class of {profile.year}</span>
              </p>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-center sm:justify-end">
            <button
              type="button"
              onClick={() => openEdit("full")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF8A3D] to-[#ff7a22] hover:from-[#ff7a22] hover:to-[#e66914] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-[#FF8A3D]/25 transition-all cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Profile
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-slate-700 border border-stone-300 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-600" />}
              {copiedLink ? "Copied" : "Share"}
            </button>
          </div>
        </div>

        {/* 2-COLUMN PROFILE BODY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-start">

          {/* LEFT COLUMN: Facebook "Intro" Sidebar Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-stone-50/80 rounded-2xl border border-stone-200 p-5 space-y-4 shadow-2xs">
              <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-stone-200/80 flex items-center justify-between">
                <span>Intro</span>
                <button
                  type="button"
                  onClick={() => openEdit("bio")}
                  className="text-xs text-[#FF8A3D] hover:underline font-semibold cursor-pointer"
                >
                  Edit Bio
                </button>
              </h2>

              {/* Personal Motto / Bio Quote */}
              <div className="text-center text-xs text-slate-700 bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs font-medium">
                {profile.saying ? (
                  <span className="italic">&ldquo;{profile.saying}&rdquo;</span>
                ) : (
                  <span className="text-slate-400 font-normal">No bio quote added yet. Click &quot;Edit Bio&quot; to add one.</span>
                )}
              </div>

              {/* Bullet Info List (Facebook Style) */}
              <div className="space-y-3 text-xs text-slate-700 pt-1">
                <div className="flex items-start gap-3">
                  <GraduationCap className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    Studied <span className="font-bold text-slate-900">{profile.course || "Alumni Program"}</span> at <span className="font-bold text-slate-900">Pagadian Capitol College</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    Graduated in <span className="font-bold text-slate-900">Class of {profile.year}</span>
                    {profile.studentId && <span className="text-slate-500 block text-[11px] font-mono">Student ID: {profile.studentId}</span>}
                  </div>
                </div>

                {profile.position && (
                  <div className="flex items-start gap-3">
                    <Briefcase className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <div>
                      Works as <span className="font-bold text-slate-900">{profile.position}</span>
                      {profile.company && <span> at <span className="font-bold text-slate-900">{profile.company}</span></span>}
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    {profile.address || profile.location ? (
                      <>Lives in <span className="font-bold text-slate-900">{profile.address || profile.location}</span></>
                    ) : (
                      <span className="text-slate-400 font-normal">Location not specified</span>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div className="truncate">
                    <span className="font-medium text-[#2563eb]">{profile.email}</span>
                  </div>
                </div>

                {profile.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <div>
                      Contact: <span className="font-medium text-slate-800">{profile.phone}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Social Profiles Pills */}
              {socials.length > 0 && (
                <div className="pt-3 border-t border-stone-200 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Social Links</p>
                  <div className="flex flex-wrap gap-2">
                    {socials.map(({ icon: Icon, label, href, bg }) => (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${bg} shadow-2xs hover:opacity-90 transition-opacity`}
                      >
                        <Icon className="w-3.5 h-3.5" /> {label}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => openEdit("details")}
                className="w-full text-center bg-white hover:bg-stone-100 text-slate-800 border border-stone-300 font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Edit Details
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Journey Posts & User Details Cards */}
          <div className="lg:col-span-7 space-y-5">

            {/* CREATE JOURNEY POST CARD */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FF8A3D]" /> Share Your Journey Update
                </h3>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Posts directly to News</span>
              </div>

              <div className="flex gap-3 pt-1">
                <div className="w-9 h-9 rounded-full bg-[#18345d] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 overflow-hidden shadow-2xs">
                  {isImageAvatar ? (
                    <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  {/* Hidden File Input for Post Media Attachment */}
                  <input
                    ref={postFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePostImageSelect}
                    className="hidden"
                  />

                  <textarea
                    rows={3}
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    placeholder="Share a career update, story, promotion, or milestone with fellow alumni..."
                    className="w-full p-3 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF8A3D]/30 bg-stone-50/70 text-slate-900 placeholder:text-slate-400 resize-none font-[Inter,sans-serif]"
                  />

                  {/* Media Attachment Preview Card */}
                  {attachedImage && (
                    <div className="relative rounded-2xl overflow-hidden border border-stone-200 shadow-2xs group bg-stone-950/90 flex items-center justify-center p-2 max-h-64">
                      <img src={attachedImage} alt="Attachment preview" className="max-h-60 w-auto max-w-full object-contain rounded-xl" />
                      <button
                        type="button"
                        onClick={() => setAttachedImage("")}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white transition-colors cursor-pointer z-10"
                        title="Remove Attached Media"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-black/60 text-white px-2 py-0.5 rounded-md backdrop-blur-xs">
                        Photo Attached
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => postFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-[#2563eb] font-semibold transition-colors cursor-pointer bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg border border-stone-200 shadow-2xs"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#FF8A3D]" />
                      {attachedImage ? "Change Attached Photo" : "Attach Photo / Media"}
                    </button>

                    <button
                      type="button"
                      disabled={(!postText.trim() && !attachedImage) || isPosting}
                      onClick={async () => {
                        if (!postText.trim() && !attachedImage) return;
                        setIsPosting(true);
                        await storageService.addJourneyPost(
                          postText.trim() || "Shared a photo update with the PCC Network",
                          attachedImage
                        );
                        toast.success("Journey update posted successfully!");
                        setPostText("");
                        setAttachedImage("");
                        setIsPosting(false);
                        loadProfile();
                      }}
                      className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#FF8A3D] to-[#ff7a22] hover:from-[#ff7a22] hover:to-[#e66914] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" /> Post Journey
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* MY PUBLISHED JOURNEY POSTS FEED */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FF8A3D]" /> My Journey Updates ({myJourneyPosts.length})
                </h3>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Visible on Profile & News</span>
              </div>

              {myJourneyPosts.length > 0 ? (
                <div className="space-y-4">
                  {myJourneyPosts.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-stone-200 p-4 bg-stone-50/50 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-2.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#18345d] text-white flex items-center justify-center font-bold text-xs overflow-hidden flex-shrink-0 border border-white shadow-2xs">
                            {item.authorAvatar.startsWith("http") || item.authorAvatar.startsWith("data:") ? (
                              <img src={item.authorAvatar} alt={item.authorName} className="w-full h-full object-cover" />
                            ) : (
                              <span>{item.authorAvatar}</span>
                            )}
                          </div>

                          <div>
                            <h4 className="font-bold text-slate-900 text-xs">{item.authorName}</h4>
                            <p className="text-[11px] text-slate-500 font-medium">
                              {item.authorCourse || profile.course || "PCC Graduate"} • {item.date}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeletePost(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Journey Post"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs text-slate-800 leading-relaxed font-medium whitespace-pre-line">
                          {item.content}
                        </p>

                        {item.image && (
                          <div className="mt-2 rounded-xl overflow-hidden border border-stone-200 shadow-2xs bg-stone-950/90 flex items-center justify-center p-1.5 max-h-[420px]">
                            <img src={item.image} alt="Journey update attachment" className="max-h-[400px] w-auto max-w-full object-contain rounded-lg shadow-xs" />
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => handleLikePost(item.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                            item.likedByMe
                              ? "bg-rose-50 text-rose-600 border border-rose-200"
                              : "bg-white hover:bg-stone-100 text-slate-700 border border-stone-200"
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${item.likedByMe ? "fill-rose-600 text-rose-600" : ""}`} />
                          <span>{item.likes} {item.likes === 1 ? "Endorsement" : "Endorsements"}</span>
                        </button>

                        <span className="text-[10px] text-slate-400 font-medium">Published to PCC Network</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-stone-50 rounded-xl border border-dashed border-stone-200 p-6 text-center space-y-1">
                  <p className="text-xs font-bold text-slate-700">No journey updates published yet</p>
                  <p className="text-[11px] text-slate-500">Share your career milestones, promotions, or photos above to display them here and on the campus timeline.</p>
                </div>
              )}
            </div>

            {/* WORK & EXPERIENCE DETAILS CARD */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3 shadow-2xs">
              <div className="border-b border-stone-100 pb-2.5">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#FF8A3D]" /> Work & Experience
                </h3>
              </div>

              {/* Current Active Role */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1.5 h-full bg-[#FF8A3D]" />
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Current Position
                </span>
                <h4 className="text-base font-bold text-slate-900 leading-tight">
                  {profile.company || "Pagadian Capitol College"}
                </h4>
                <p className="text-xs font-semibold text-[#2563eb]">
                  {profile.position || "Alumni Member"}
                </p>
                {profile.location && (
                  <p className="text-xs text-slate-500 flex items-center gap-1 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {profile.location}
                  </p>
                )}
              </div>

              {/* Career History Records */}
              {employmentHistory.length > 0 && (
                <div className="space-y-2 pt-1">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Career History</p>
                  {employmentHistory.map((rec) => (
                    <div key={rec.id} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{rec.company}</span>
                        <span className="text-[10px] font-semibold text-slate-500">{rec.date}</span>
                      </div>
                      <p className="text-slate-700 font-medium">{rec.position}</p>
                      <p className="text-[11px] text-slate-500">📍 {rec.location} • Status: {rec.status}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ACADEMIC BACKGROUND CARD */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3 shadow-2xs">
              <div className="border-b border-stone-100 pb-2.5">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#2563eb]" /> Education & Campus Record
                </h3>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Class Batch: {profile.year}
                </span>
                <h4 className="text-base font-bold text-slate-900">
                  Pagadian Capitol College, Inc.
                </h4>
                <p className="text-xs font-semibold text-[#2563eb]">
                  {profile.course || "General Alumni Course"}
                </p>
              </div>
            </div>

            {/* CONTACT & BASIC DETAILS CARD */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3 shadow-2xs">
              <div className="border-b border-stone-100 pb-2.5">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#FF8A3D]" /> Contact & Basic Details
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70">
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">Email</span>
                  <span className="font-bold text-slate-900 truncate block">{profile.email}</span>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70">
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">Phone</span>
                  <span className="font-bold text-slate-900 block">{profile.phone || "Not specified"}</span>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70">
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">Gender</span>
                  <span className="font-bold text-slate-900 block">{profile.gender || "Not specified"}</span>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70">
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">Address</span>
                  <span className={`font-bold block ${profile.address || profile.location ? "text-slate-900" : "text-slate-400 font-normal"}`}>
                    {profile.address || profile.location || "Not specified"}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
