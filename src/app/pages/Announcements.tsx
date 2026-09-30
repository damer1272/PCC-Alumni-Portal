import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Megaphone, Sparkles, Heart, Send, Calendar, User, GraduationCap, Building2, MessageSquare, Filter, Camera, X } from "lucide-react";
import { Announcement } from "../data";
import { storageService, JourneyPost, ProfileData } from "../storage";
import { toast } from "sonner";

type FeedItem =
  | ({ feedType: "announcement" } & Announcement)
  | ({ feedType: "journey" } & JourneyPost);

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [journeyPosts, setJourneyPosts] = useState<JourneyPost[]>([]);
  const [currentUser, setCurrentUser] = useState<ProfileData | null>(null);
  const [filter, setFilter] = useState<"all" | "announcements" | "journeys">("all");

  const [newPostText, setNewPostText] = useState("");
  const [attachedImage, setAttachedImage] = useState<string>("");
  const [isPosting, setIsPosting] = useState(false);
  const postFileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    const [anns, posts, user] = await Promise.all([
      storageService.getAnnouncements(),
      storageService.getJourneyPosts(),
      storageService.getProfile(),
    ]);
    setAnnouncements(anns);
    setJourneyPosts(posts);
    setCurrentUser(user);
  };

  useEffect(() => {
    loadData();
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
        toast.success("Image attached to your journey post!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim() && !attachedImage) return;
    setIsPosting(true);
    await storageService.addJourneyPost(
      newPostText.trim() || "Shared a photo update with the PCC Network",
      attachedImage
    );
    toast.success("Your journey update has been published on the News Timeline!");
    setNewPostText("");
    setAttachedImage("");
    setIsPosting(false);
    loadData();
  };

  const handleLike = async (postId: string) => {
    const updated = await storageService.toggleLikePost(postId);
    setJourneyPosts(updated);
  };

  // Combine items into a unified timeline feed
  const combinedFeed: FeedItem[] = [
    ...journeyPosts.map((jp) => ({ feedType: "journey" as const, ...jp })),
    ...announcements.map((ann) => ({ feedType: "announcement" as const, ...ann })),
  ];

  const filteredFeed = combinedFeed.filter((item) => {
    if (filter === "announcements") return item.feedType === "announcement";
    if (filter === "journeys") return item.feedType === "journey";
    return true;
  });

  const initials = currentUser?.name
    ? currentUser.name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "PCC";

  const isImageAvatar = currentUser?.avatar && (currentUser.avatar.startsWith("data:") || currentUser.avatar.startsWith("http"));

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-[Inter,sans-serif] pb-16">
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FF8A3D] animate-pulse" />
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#2563eb] font-extrabold">Network Stream</p>
          </div>
          <h1 className="font-[Cormorant_Garamond,serif] text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
            News & Journey Timeline
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-lg leading-relaxed font-medium">
            Explore official Pagadian Capitol College announcements, campus events, and inspirational career journey stories shared by fellow alumni.
          </p>
        </div>

        {/* FEED FILTER TABS */}
        <div className="flex items-center bg-stone-200/70 p-1 rounded-2xl border border-stone-300/50 shadow-inner self-start md:self-auto">
          {[
            { id: "all", label: "All Activity" },
            { id: "journeys", label: "Alumni Journeys" },
            { id: "announcements", label: "Campus News" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id as typeof filter)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === tab.id
                  ? "bg-gradient-to-r from-[#FF8A3D] to-[#ff7a22] text-white shadow-md shadow-[#FF8A3D]/25"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* CREATE JOURNEY POST CARD */}
      <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#18345d] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 overflow-hidden shadow-2xs">
            {isImageAvatar ? (
              <img src={currentUser?.avatar} alt={currentUser?.name} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900">Share your journey update with the PCC Network</p>
            <p className="text-[11px] text-slate-500 font-medium">Promotions, career milestones, startup achievements, or stories</p>
          </div>
        </div>

        <form onSubmit={handleCreatePost} className="space-y-3">
          {/* Hidden File Input for Media Upload */}
          <input
            ref={postFileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePostImageSelect}
            className="hidden"
          />

          <textarea
            rows={3}
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            placeholder={`What's new in your professional path, ${currentUser?.name || "Alumnus"}? Share your journey...`}
            className="w-full p-3.5 rounded-2xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF8A3D]/30 bg-stone-50/70 text-slate-900 placeholder:text-stone-400 resize-none font-[Inter,sans-serif]"
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

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => postFileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-[#2563eb] font-semibold transition-colors cursor-pointer bg-stone-100 hover:bg-stone-200 px-3.5 py-2 rounded-xl border border-stone-200"
            >
              <Camera className="w-3.5 h-3.5 text-[#FF8A3D]" />
              {attachedImage ? "Change Attached Photo" : "Attach Photo / Media"}
            </button>

            <button
              type="submit"
              disabled={(!newPostText.trim() && !attachedImage) || isPosting}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF8A3D] to-[#ff7a22] hover:from-[#ff7a22] hover:to-[#e66914] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#FF8A3D]/25 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Share Journey
            </button>
          </div>
        </form>
      </div>

      {/* TIMELINE STREAM */}
      <div className="relative pl-4 sm:pl-8 space-y-8">
        {/* Continuous Gradient Vertical Line */}
        <div className="absolute left-7 sm:left-11 top-6 bottom-6 w-0.5 bg-gradient-to-b from-[#FF8A3D] via-[#2563eb] to-stone-200" />

        {filteredFeed.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.05 }}
            className="relative flex items-start gap-4 sm:gap-6"
          >
            {/* Timeline Node Icon */}
            <div className="relative z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md border-2 border-white">
              {item.feedType === "announcement" ? (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#18345d] to-[#0d1f3c] text-amber-400 flex items-center justify-center">
                  <Megaphone className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#FF8A3D] to-[#F5C518] text-white flex items-center justify-center font-bold text-xs overflow-hidden">
                  {item.authorAvatar.length <= 3 ? item.authorAvatar : <Sparkles className="w-4 h-4 text-white" />}
                </div>
              )}
            </div>

            {/* Timeline Card Content */}
            <div className="flex-1 bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-2xs space-y-3">
              {item.feedType === "announcement" ? (
                /* OFFICIAL CAMPUS ANNOUNCEMENT CARD */
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 bg-[#18345d] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        <Megaphone className="w-3 h-3 text-amber-400" /> Campus News
                      </span>
                      <span className="text-xs font-semibold text-[#2563eb] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                        {item.category}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">{item.date}</span>
                  </div>

                  <div className="pt-3 space-y-2">
                    <h2 className="font-[Cormorant_Garamond,serif] text-2xl font-extrabold text-slate-900 leading-snug">
                      {item.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                      {item.content}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span>Published by: <strong className="text-slate-800 font-bold">{item.createdBy}</strong></span>
                    <span>Pagadian Capitol College, Inc.</span>
                  </div>
                </div>
              ) : (
                /* ALUMNI JOURNEY UPDATE POST CARD */
                <div>
                  <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#18345d] text-white flex items-center justify-center font-bold text-xs overflow-hidden flex-shrink-0 border border-white shadow-2xs">
                        {item.authorAvatar.startsWith("http") || item.authorAvatar.startsWith("data:") ? (
                          <img src={item.authorAvatar} alt={item.authorName} className="w-full h-full object-cover" />
                        ) : (
                          <span>{item.authorAvatar}</span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-sm">{item.authorName}</h3>
                          <span className="text-[10px] font-bold text-[#FF8A3D] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 uppercase tracking-wider">
                            Alumni Journey
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                          <GraduationCap className="w-3 h-3 text-[#FF8A3D]" />
                          <span>{item.authorCourse || "PCC Graduate"}</span>
                          {item.authorYear && <span>• Class of {item.authorYear}</span>}
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">{item.date}</span>
                  </div>

                  {/* Post Content */}
                  <div className="py-3">
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium whitespace-pre-line">
                      {item.content}
                    </p>

                    {item.image && (
                      <div className="mt-3 rounded-2xl overflow-hidden border border-stone-200 shadow-2xs bg-stone-950/90 flex items-center justify-center p-1.5 max-h-[480px]">
                        <img src={item.image} alt="Journey update" className="max-h-[460px] w-auto max-w-full object-contain rounded-xl shadow-xs" />
                      </div>
                    )}
                  </div>

                  {/* Post Actions Bar */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => handleLike(item.id)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                        item.likedByMe
                          ? "bg-rose-50 text-rose-600 border border-rose-200"
                          : "bg-stone-100 hover:bg-stone-200 text-slate-700 border border-stone-200"
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${item.likedByMe ? "fill-rose-600 text-rose-600" : ""}`} />
                      <span>{item.likes} {item.likes === 1 ? "Endorsement" : "Endorsements"}</span>
                    </button>

                    <span className="text-[11px] text-slate-400 font-medium">Shared with PCC Alumni Community</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {filteredFeed.length === 0 && (
          <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-12 text-center ml-8 space-y-2">
            <p className="font-[Cormorant_Garamond,serif] text-2xl font-bold text-slate-800">No posts available</p>
            <p className="text-xs text-slate-500">Be the first to share a journey update or check back for college news.</p>
          </div>
        )}
      </div>
    </div>
  );
}
