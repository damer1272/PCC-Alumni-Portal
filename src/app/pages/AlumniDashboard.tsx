import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, Variants } from "motion/react";
import {
  ArrowRight, Briefcase, Users, Megaphone, User, MapPin, Sparkles,
} from "lucide-react";
import { Alumni, Announcement } from "../data";
import { storageService } from "../storage";
import bgImage from "@/imports/bg.png";

const pathways = [
  {
    icon: Users,
    title: "Meet alumni",
    copy: "Browse graduates by course, batch, and industry.",
    to: "/alumni/directory",
  },
  {
    icon: Briefcase,
    title: "Share your path",
    copy: "Keep employment history current so others can learn from you.",
    to: "/alumni/career",
  },
  {
    icon: User,
    title: "Shape your presence",
    copy: "A strong profile is how classmates and recruiters find you.",
    to: "/alumni/profile",
  },
  {
    icon: Megaphone,
    title: "Stay in the loop",
    copy: "Homecomings, fairs, and scholarships — posted here first.",
    to: "/alumni/announcements",
  },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.55, ease: "easeOut" },
  }),
};

export default function AlumniDashboard() {
  const navigate = useNavigate();
  const [alumniList, setAlumniList] = useState<Alumni[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    storageService.getAlumni().then(setAlumniList);
    storageService.getAnnouncements().then(setAnnouncements);
  }, []);

  const spotlight = alumniList.slice(0, 6);

  return (
    <div className="space-y-16 md:space-y-20">
      {/* Hero — brand first, one composition */}
      <section className="relative min-h-[min(72vh,640px)] overflow-hidden rounded-[1.75rem] md:rounded-[2rem]">
        <motion.img
          src={bgImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] as const }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1f3c]/92 via-[#1a3a6b]/78 to-[#2d5a9e]/55" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: "radial-gradient(circle at 20% 30%, rgba(245,240,232,0.15), transparent 45%), radial-gradient(circle at 80% 70%, rgba(45,90,158,0.4), transparent 40%)",
        }} />

        <div className="relative z-10 flex h-full min-h-[min(72vh,640px)] flex-col justify-end p-7 md:p-12 lg:p-14">
          <motion.p
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="font-[Cormorant_Garamond,serif] text-[clamp(2.75rem,8vw,5.5rem)] leading-[0.92] font-semibold text-[#F5F0E8] tracking-tight"
          >
            PCC Alumni
          </motion.p>
          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-4 max-w-xl font-[Cormorant_Garamond,serif] text-[clamp(1.6rem,3.5vw,2.35rem)] italic font-medium text-[#F5F0E8]/90 leading-snug"
          >
            Find your people across batches and careers.
          </motion.h1>
          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-3 max-w-md text-sm md:text-base text-[#F5F0E8]/65 leading-relaxed"
          >
            A living network for Pagadian Capitol College graduates — reconnect, share where you work, and open doors for the next class.
          </motion.p>
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-8 flex flex-wrap gap-3"
          >
            <button
              type="button"
              onClick={() => navigate("/alumni/directory")}
              className="inline-flex items-center gap-2 bg-[#F5F0E8] text-[#0d2850] text-sm font-semibold px-5 py-3 rounded-xl hover:bg-white transition-colors cursor-pointer"
            >
              Explore the directory <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate("/alumni/profile")}
              className="inline-flex items-center gap-2 border border-[#F5F0E8]/35 text-[#F5F0E8] text-sm font-medium px-5 py-3 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              Complete your profile
            </button>
          </motion.div>
        </div>
      </section>

      {/* In your orbit */}
      <section>
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#2d5a9e] font-semibold mb-2 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> In your orbit
            </p>
            <h2 className="font-[Cormorant_Garamond,serif] text-3xl md:text-4xl font-semibold text-[#0d2850] leading-tight">
              Alumni worth knowing
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate("/alumni/directory")}
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-[#1a3a6b] hover:gap-2 transition-all cursor-pointer"
          >
            View all <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {spotlight.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scrollbar-thin">
            {spotlight.map((a, i) => (
              <motion.button
                key={a.id}
                type="button"
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                onClick={() => navigate(`/alumni/directory/${a.id}`)}
                className="snap-start flex-shrink-0 w-[260px] text-left group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-2xl bg-[#1a3a6b] p-5 min-h-[200px] flex flex-col justify-between transition-transform duration-300 group-hover:-translate-y-1 shadow-md">
                  <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-[#2d5a9e]/40 blur-2xl" />
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-[#F5F0E8]/15 border border-white/10 flex items-center justify-center text-[#F5F0E8] font-semibold overflow-hidden">
                      {a.avatar && (a.avatar.startsWith("data:") || a.avatar.startsWith("http")) ? (
                        <img src={a.avatar} alt={a.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{a.avatar}</span>
                      )}
                    </div>
                    <p className="mt-4 font-semibold text-[#F5F0E8] text-lg leading-tight">{a.name}</p>
                    <p className="mt-1 text-xs text-[#F5F0E8]/55 line-clamp-2">{a.position || "Alumni Member"} · {a.company || "PCC Graduate"}</p>
                  </div>
                  <div className="relative flex items-center gap-1.5 text-[11px] text-[#F5F0E8]/45 mt-4">
                    <MapPin className="w-3 h-3" />
                    {a.location || "Location not set"}
                    <span className="ml-auto text-[#F5F0E8]/35">Class of {a.year}</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-2">
            <p className="font-bold text-slate-800 text-base">No alumni records registered yet</p>
            <p className="text-xs text-slate-500">Registered alumni profiles will appear here as graduates join the platform.</p>
          </div>
        )}
      </section>

      {/* Pathways */}
      <section className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        <div className="lg:col-span-4">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#2d5a9e] font-semibold mb-2">
            Ways in
          </p>
          <h2 className="font-[Cormorant_Garamond,serif] text-3xl md:text-4xl font-semibold text-[#0d2850] leading-tight">
            How you show up in the network
          </h2>
          <p className="mt-3 text-sm text-[#1a3a6b]/65 leading-relaxed max-w-sm">
            Four moves that turn a quiet account into a useful presence for classmates and employers.
          </p>
        </div>
        <ul className="lg:col-span-8 divide-y divide-[#1a3a6b]/12 border-y border-[#1a3a6b]/12">
          {pathways.map(({ icon: Icon, title, copy, to }, i) => (
            <motion.li
              key={title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <button
                type="button"
                onClick={() => navigate(to)}
                className="w-full flex items-start gap-4 py-5 text-left group hover:bg-[#1a3a6b]/5 transition-colors -mx-2 px-2 rounded-lg cursor-pointer"
              >
                <span className="mt-0.5 w-9 h-9 rounded-lg bg-[#1a3a6b]/10 text-[#1a3a6b] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="font-semibold text-[#0d2850] group-hover:text-[#1a3a6b]">{title}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#2d5a9e] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </span>
                  <span className="block text-sm text-[#1a3a6b]/60 mt-0.5">{copy}</span>
                </span>
              </button>
            </motion.li>
          ))}
        </ul>
      </section>

      {/* College news */}
      <section>
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#2d5a9e] font-semibold mb-2">
              From the college
            </p>
            <h2 className="font-[Cormorant_Garamond,serif] text-3xl md:text-4xl font-semibold text-[#0d2850] leading-tight">
              Recent announcements
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate("/alumni/announcements")}
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-[#1a3a6b] hover:gap-2 transition-all cursor-pointer"
          >
            All news <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {announcements.length > 0 ? (
          <div className="space-y-0 border-t border-[#1a3a6b]/12">
            {announcements.slice(0, 3).map((ann, i) => (
              <motion.article
                key={ann.id}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid sm:grid-cols-[7rem_1fr_auto] gap-3 sm:gap-6 py-6 border-b border-[#1a3a6b]/12"
              >
                <p className="text-xs font-medium text-[#2d5a9e] uppercase tracking-wider pt-1">{ann.date}</p>
                <div>
                  <h3 className="font-[Cormorant_Garamond,serif] text-xl md:text-2xl font-semibold text-[#0d2850] leading-snug">
                    {ann.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-[#1a3a6b]/65 leading-relaxed line-clamp-2">{ann.content}</p>
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1a3a6b]/50 sm:text-right self-start pt-1">
                  {ann.category}
                </span>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-2">
            <p className="font-bold text-slate-800 text-base">No announcements posted yet</p>
            <p className="text-xs text-slate-500">Official campus updates and news will appear here once published.</p>
          </div>
        )}
      </section>
    </div>
  );
}

