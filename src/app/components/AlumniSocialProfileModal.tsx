import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Linkedin, Github, Facebook, Instagram, Mail, MapPin,
  BookOpen, Calendar, UserCheck, Briefcase, MessageSquare, UserPlus, Heart, Send, Check
} from "lucide-react";
import { Alumni } from "../data";
import { toast } from "sonner";

interface AlumniSocialProfileModalProps {
  alumni: Alumni | null;
  onClose: () => void;
}

export default function AlumniSocialProfileModal({ alumni, onClose }: AlumniSocialProfileModalProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [endorsements, setEndorsements] = useState(12);
  const [hasEndorsed, setHasEndorsed] = useState(false);
  const [showMessageInput, setShowMessageInput] = useState(false);
  const [messageText, setMessageText] = useState("");

  if (!alumni) return null;

  const statusTone: Record<string, string> = {
    Employed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Self-Employed": "bg-[#2d5a9e]/10 text-[#2d5a9e] border-[#2d5a9e]/20",
    Unemployed: "bg-red-50 text-red-700 border-red-200",
    "Continuing Studies": "bg-[#1a3a6b]/10 text-[#1a3a6b] border-[#1a3a6b]/20",
  };

  const handleConnect = () => {
    setIsConnected(!isConnected);
    toast.success(
      !isConnected
        ? `Connection request sent to ${alumni.name}!`
        : `Removed ${alumni.name} from your network connections.`
    );
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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    toast.success(`Message sent to ${alumni.name}!`);
    setMessageText("");
    setShowMessageInput(false);
  };

  const socials = [
    { icon: Linkedin, label: "LinkedIn", href: alumni.linkedin, accent: "bg-[#FF8A3D] text-white hover:bg-[#ff7a22]" },
    { icon: Github, label: "GitHub", href: alumni.github, accent: "bg-[#F5C518] text-[#0d2850] hover:bg-[#f0b800]" },
    { icon: Facebook, label: "Facebook", href: alumni.facebook, accent: "bg-[#1a3a6b] text-[#F5F0E8] hover:bg-[#0d2850]" },
    { icon: Instagram, label: "Instagram", href: alumni.instagram, accent: "bg-[#FFB347] text-[#0d2850] hover:bg-[#ffa826]" },
  ].filter((s) => Boolean(s.href));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0d2850]/50 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 24 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] bg-white shadow-2xl border border-[#1a3a6b]/10 my-auto z-10 max-h-[92vh] flex flex-col"
        >
          {/* Header Banner */}
          <div className="relative h-32 sm:h-40 bg-gradient-to-r from-[#0d2850] via-[#1a3a6b] to-[#2d5a9e] p-6 overflow-hidden flex-shrink-0">
            {/* Ambient pattern */}
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-[#FF8A3D]/20 blur-2xl" />
            <div className="absolute right-32 bottom-0 w-32 h-32 rounded-full bg-[#F5C518]/20 blur-xl" />

            <div className="relative flex justify-between items-start">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[#F5C518] text-[11px] font-bold tracking-wider uppercase">
                <UserCheck className="w-3.5 h-3.5" /> Verified PCC Alumni
              </span>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-black/20 text-white hover:bg-black/40 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Profile Overview Header */}
          <div className="relative px-6 sm:px-8 pb-4 -mt-14 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-100 flex-shrink-0">
            {/* Organic Avatar Frame */}
            <div className="flex items-end gap-4">
              <div className="relative">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#1a3a6b] border-4 border-white shadow-xl flex items-center justify-center text-[#F5F0E8] font-[Cormorant_Garamond,serif] text-3xl sm:text-4xl font-bold flex-shrink-0">
                  {alumni.avatar}
                </div>
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#FF8A3D] ring-2 ring-white" />
              </div>
              <div className="mb-1 min-w-0">
                <h2 className="font-[Cormorant_Garamond,serif] text-2xl sm:text-3xl font-bold text-[#0d2850] truncate">
                  {alumni.name}
                </h2>
                <p className="text-xs text-[#2d5a9e] font-semibold">
                  Class of {alumni.year} · {alumni.studentId}
                </p>
              </div>
            </div>

            {/* Social Interaction Bar */}
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <button
                type="button"
                onClick={handleConnect}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer ${
                  isConnected
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-[#1a3a6b] text-white hover:bg-[#0d2850]"
                }`}
              >
                {isConnected ? <Check className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                {isConnected ? "Connected" : "Connect"}
              </button>

              <button
                type="button"
                onClick={() => setShowMessageInput(!showMessageInput)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FF8A3D] text-white text-xs font-bold hover:bg-[#ff7a22] transition-colors shadow-sm cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Message
              </button>

              <button
                type="button"
                onClick={handleEndorse}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                  hasEndorsed
                    ? "bg-pink-50 border-pink-200 text-pink-600"
                    : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${hasEndorsed ? "fill-pink-600 text-pink-600" : ""}`} />
                <span>{endorsements}</span>
              </button>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
            {/* Quick Message Drawer */}
            <AnimatePresence>
              {showMessageInput && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleSendMessage}
                  className="bg-[#e6edf5]/60 p-3.5 rounded-2xl border border-[#1a3a6b]/15 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={`Send a friendly message to ${alumni.name}…`}
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-white border border-transparent focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/30 text-[#0d2850]"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-[#1a3a6b] text-white text-xs font-bold hover:bg-[#0d2850] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Send className="w-3 h-3" /> Send
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Saying / Motto Quote */}
            {alumni.saying && (
              <blockquote className="relative p-5 rounded-2xl bg-gradient-to-r from-[#FF8A3D]/10 via-[#F5C518]/10 to-transparent border-l-4 border-[#FF8A3D]">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#FF8A3D] mb-1">
                  Alumni Saying
                </p>
                <p className="font-[Cormorant_Garamond,serif] text-lg sm:text-xl italic text-[#0d2850] leading-snug">
                  “{alumni.saying}”
                </p>
              </blockquote>
            )}

            {/* Current Position Card */}
            <div className="bg-[#f4f7fb] p-5 rounded-2xl border border-[#1a3a6b]/8 flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-[#F5C518]/25 text-[#0d2850] flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#FF8A3D]">
                  Current Position
                </p>
                <p className="font-[Cormorant_Garamond,serif] text-2xl font-semibold text-[#0d2850] leading-tight mt-0.5">
                  {alumni.position || "Alumni Member"}
                </p>
                <p className="text-xs text-[#1a3a6b]/70 mt-1">
                  <span className="font-semibold text-[#0d2850]">{alumni.company || "PCC Graduate"}</span>
                  {alumni.location && <> · <MapPin className="w-3 h-3 inline text-[#2d5a9e]" /> {alumni.location}</>}
                </p>
              </div>
              <span className={`text-[11px] px-3 py-1 rounded-xl font-bold border ${statusTone[alumni.status] ?? "bg-gray-50 text-gray-700"}`}>
                {alumni.status}
              </span>
            </div>

            {/* Academic & Contact Grid */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl border border-gray-100 bg-gray-50/70">
                <div className="w-8 h-8 rounded-full bg-[#1a3a6b]/10 text-[#1a3a6b] flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-[#2d5a9e] font-semibold">Course / Program</p>
                  <p className="text-xs text-[#0d2850] font-medium mt-0.5">{alumni.course}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl border border-gray-100 bg-gray-50/70">
                <div className="w-8 h-8 rounded-full bg-[#FF8A3D]/15 text-[#FF8A3D] flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-[#2d5a9e] font-semibold">Graduation Batch</p>
                  <p className="text-xs text-[#0d2850] font-medium mt-0.5">Class of {alumni.year}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl border border-gray-100 bg-gray-50/70 sm:col-span-2">
                <div className="w-8 h-8 rounded-full bg-[#F5C518]/25 text-[#0d2850] flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-[#2d5a9e] font-semibold">Email Contact</p>
                  <a href={`mailto:${alumni.email}`} className="text-xs text-[#2d5a9e] font-medium mt-0.5 hover:underline truncate block">
                    {alumni.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Social Media Links Bar */}
            {socials.length > 0 && (
              <div className="pt-2">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1a3a6b] mb-3">
                  Connect on Social Media
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {socials.map(({ icon: Icon, label, href, accent }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold ${accent} shadow-sm transition-transform hover:scale-105`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
