import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { motion } from "motion/react";
import {
  Linkedin, Github, Facebook, Instagram, Mail, MapPin,
  GraduationCap, Calendar, User, Briefcase, ArrowLeft, UserPlus, Heart, Check,
  Share2, ShieldCheck, CheckCircle2, Phone, UserCheck, Sparkles
} from "lucide-react";
import { Alumni, EmploymentRecord } from "../data";
import { storageService } from "../storage";
import { toast } from "sonner";

export default function AlumniProfileView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminView = location.pathname.startsWith("/admin");

  const [alumni, setAlumni] = useState<Alumni | null>(null);
  const [employmentHistory, setEmploymentHistory] = useState<EmploymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [endorsements, setEndorsements] = useState(0);
  const [hasEndorsed, setHasEndorsed] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([storageService.getAlumni(), storageService.getProfile()]).then(async ([list, me]) => {
      const found = list.find((a) => String(a.id) === id);

      if (found) {
        const isSelf = me && (
          (found.email && me.email && found.email.toLowerCase() === me.email.toLowerCase()) ||
          (found.studentId && me.studentId && found.studentId === me.studentId) ||
          (found.name && me.name && found.name.toLowerCase() === me.name.toLowerCase())
        );

        if (isSelf && !isAdminView) {
          toast.info("Navigating to your editable profile.");
          navigate("/alumni/profile", { replace: true });
          return;
        }

        const connected = await storageService.isAlumniConnected(found.email);
        setIsConnected(connected);

        const career = await storageService.getEmploymentHistory(found.email);
        setEmploymentHistory(career);
      }

      setAlumni(found || null);
      setLoading(false);
    });
  }, [id, navigate, isAdminView]);

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500 font-[Inter,sans-serif]">
        <div className="w-12 h-12 rounded-2xl bg-[#FF8A3D]/20 border border-[#FF8A3D]/40 text-[#FF8A3D] flex items-center justify-center mx-auto mb-3 animate-pulse">
          <Sparkles className="w-6 h-6" />
        </div>
        <p className="font-semibold text-sm text-slate-700">Loading alumni details…</p>
      </div>
    );
  }

  if (!alumni) {
    return (
      <div className="py-20 text-center space-y-4 font-[Inter,sans-serif]">
        <h2 className="text-2xl font-bold text-slate-900">Alumni Profile Not Found</h2>
        <p className="text-sm text-slate-600">The requested alumni profile does not exist or has been removed.</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF8A3D] text-white text-xs font-bold hover:bg-[#ff7a22] transition-colors cursor-pointer shadow-md shadow-[#FF8A3D]/25"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </button>
      </div>
    );
  }

  const handleConnect = async () => {
    if (!alumni) return;
    const me = await storageService.getProfile();
    const nowConnected = await storageService.toggleConnection(alumni.email);
    setIsConnected(nowConnected);

    if (nowConnected) {
      await storageService.sendConnectionRequest(
        me.name || "Alumni User",
        me.email || "user@example.com",
        alumni.name,
        alumni.email,
        alumni.id
      );
      toast.success(`You are now connected with ${alumni.name}!`);
    } else {
      toast.info(`Disconnected from ${alumni.name}.`);
    }
  };

  const handleEndorse = () => {
    if (!hasEndorsed) {
      setEndorsements((prev) => prev + 1);
      setHasEndorsed(true);
      toast.success(`You endorsed ${alumni.name}'s profile!`);
    } else {
      setEndorsements((prev) => prev - 1);
      setHasEndorsed(false);
      toast.info(`Endorsement removed.`);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      toast.success("Profile link copied!");
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const initials = alumni.name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isImageAvatar = alumni.avatar && (alumni.avatar.startsWith("data:") || alumni.avatar.startsWith("http"));

  const socials = [
    { icon: Linkedin, label: "LinkedIn", href: alumni.linkedin, bg: "bg-[#0a66c2] text-white" },
    { icon: Github, label: "GitHub", href: alumni.github, bg: "bg-slate-800 text-white" },
    { icon: Facebook, label: "Facebook", href: alumni.facebook, bg: "bg-[#1877f2] text-white" },
    { icon: Instagram, label: "Instagram", href: alumni.instagram, bg: "bg-[#e1306c] text-white" },
  ].filter((s) => Boolean(s.href && s.href.trim()));

  return (
    <div className="space-y-6 font-[Inter,sans-serif] w-full max-w-6xl mx-auto pb-12">
      {/* Top Navigation Control */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-stone-200 px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer hover:bg-stone-50"
        >
          <ArrowLeft className="w-4 h-4 text-[#FF8A3D]" /> {isAdminView ? "Back to Manage Alumni" : "Back to Directory"}
        </button>
      </div>

      {/* MAIN PROFILE CONTAINER CARD */}
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
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-stone-100 shadow-lg bg-[#18345d] flex items-center justify-center text-white overflow-hidden flex-shrink-0 relative">
              {isImageAvatar ? (
                <img src={alumni.avatar} alt={alumni.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-[Cormorant_Garamond,serif] text-4xl sm:text-5xl font-bold">{initials}</span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {alumni.name}
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#2563eb] border border-blue-200 px-2 py-0.5 rounded-md">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
                {isConnected && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md">
                    <UserCheck className="w-3.5 h-3.5" /> Connected
                  </span>
                )}
              </div>

              <p className="text-sm font-semibold text-slate-700">
                {alumni.position ? (
                  <span>
                    {alumni.position} {alumni.company ? `at ${alumni.company}` : ""}
                  </span>
                ) : (
                  <span className="text-slate-500 italic">PCC Alumni Member</span>
                )}
              </p>

              <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-2 font-medium pt-0.5">
                <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5 text-[#FF8A3D]" /> {alumni.course || "Pagadian Capitol College"}</span>
                <span>•</span>
                <span>Class of {alumni.year}</span>
              </p>
            </div>
          </div>

          {/* Right: Action Buttons (Hidden when in Admin Mode) */}
          {!isAdminView && (
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-center sm:justify-end">
              <button
                type="button"
                onClick={handleConnect}
                className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                  isConnected
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-gradient-to-r from-[#FF8A3D] to-[#ff7a22] text-white hover:from-[#ff7a22] hover:to-[#e66914]"
                }`}
              >
                {isConnected ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {isConnected ? "Connected" : "Connect"}
              </button>

              <button
                type="button"
                onClick={handleEndorse}
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs ${
                  hasEndorsed
                    ? "bg-rose-50 border-rose-200 text-rose-600"
                    : "bg-white border-stone-200 text-slate-700 hover:bg-stone-50"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${hasEndorsed ? "fill-rose-600 text-rose-600" : ""}`} />
                <span>{endorsements}</span>
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
          )}
        </div>

        {/* 2-COLUMN PROFILE BODY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-start">
          
          {/* LEFT COLUMN: Facebook "Intro" Sidebar Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-stone-50/80 rounded-2xl border border-stone-200 p-5 space-y-4 shadow-2xs">
              <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-stone-200/80">
                Intro
              </h2>

              {/* Personal Motto / Bio Quote */}
              <div className="text-center text-xs text-slate-700 bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs font-medium">
                {alumni.saying ? (
                  <span className="italic">&ldquo;{alumni.saying}&rdquo;</span>
                ) : (
                  <span className="text-slate-400 font-normal">No bio quote added yet.</span>
                )}
              </div>

              {/* Bullet Info List */}
              <div className="space-y-3 text-xs text-slate-700 pt-1">
                <div className="flex items-start gap-3">
                  <GraduationCap className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    Studied <span className="font-bold text-slate-900">{alumni.course || "Alumni Program"}</span> at <span className="font-bold text-slate-900">Pagadian Capitol College</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    Graduated in <span className="font-bold text-slate-900">Class of {alumni.year}</span>
                    {alumni.studentId && <span className="text-slate-500 block text-[11px] font-mono">Student ID: {alumni.studentId}</span>}
                  </div>
                </div>

                {alumni.position && (
                  <div className="flex items-start gap-3">
                    <Briefcase className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <div>
                      Works as <span className="font-bold text-slate-900">{alumni.position}</span>
                      {alumni.company && <span> at <span className="font-bold text-slate-900">{alumni.company}</span></span>}
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    {alumni.location ? (
                      <>Lives in <span className="font-bold text-slate-900">{alumni.location}</span></>
                    ) : (
                      <span className="text-slate-400 font-normal">Location not specified</span>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div className="truncate">
                    <a href={`mailto:${alumni.email}`} className="font-medium text-[#2563eb] hover:underline">
                      {alumni.email}
                    </a>
                  </div>
                </div>
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
            </div>
          </div>

          {/* RIGHT COLUMN: User Details Cards */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* WORK & EXPERIENCE DETAILS CARD */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-stone-100 pb-2.5">
                <Briefcase className="w-4 h-4 text-[#FF8A3D]" /> Work & Experience
              </h3>

              {/* Current Active Role */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1.5 h-full bg-[#FF8A3D]" />
                <h4 className="text-base font-bold text-slate-900 leading-tight">
                  {alumni.company || "Pagadian Capitol College"}
                </h4>
                <p className="text-xs font-semibold text-[#2563eb]">
                  {alumni.position || "Alumni Member"}
                </p>
                {alumni.location && (
                  <p className="text-xs text-slate-500 flex items-center gap-1 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {alumni.location}
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
                      <p className="text-[11px] text-slate-500">📍 {rec.location}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ACADEMIC BACKGROUND CARD */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-stone-100 pb-2.5">
                <GraduationCap className="w-4 h-4 text-[#2563eb]" /> Education & Campus Record
              </h3>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Class Batch: {alumni.year}
                </span>
                <h4 className="text-base font-bold text-slate-900">
                  Pagadian Capitol College, Inc.
                </h4>
                <p className="text-xs font-semibold text-[#2563eb]">
                  {alumni.course || "General Alumni Course"}
                </p>
              </div>
            </div>

            {/* CONTACT DETAILS CARD */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-stone-100 pb-2.5">
                <UserCheck className="w-4 h-4 text-[#FF8A3D]" /> Contact Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70">
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">Email</span>
                  <span className="font-bold text-slate-900 truncate block">{alumni.email}</span>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70">
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">Location</span>
                  <span className={`font-bold block ${alumni.location ? "text-slate-900" : "text-slate-400 font-normal"}`}>
                    {alumni.location || "Not specified"}
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
