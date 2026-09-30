import { useEffect, useState } from "react";
import { motion, Variants } from "motion/react";
import { Sparkles, ArrowRight } from "lucide-react";
import bgImage from "@/imports/bg.png";
import ViewfinderFrame from "@/app/components/landing/ViewfinderFrame";
import CinematicOverlays from "@/app/components/landing/CinematicOverlays";
import GlassLoginPanel from "@/app/components/landing/GlassLoginPanel";
import RegisterModal from "@/app/components/landing/RegisterModal";

const NAV_ITEMS = [
  { label: "Network", active: true },
  { label: "Careers", active: false },
  { label: "Directory", active: false },
];

const CATEGORIES = [
  { label: "All", active: true },
  { label: "Alumni", active: false },
  { label: "Careers", active: false },
  { label: "Events", active: false },
];

const STATS = [
  ["2,400+", "Alumni"],
  ["87%", "Employed"],
  ["150+", "Companies"],
];

function scrollToSignIn() {
  document.getElementById("sign-in-panel")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -32 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.3 + i * 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function Login() {
  const [timestamp, setTimestamp] = useState("00:00:00");
  const [registerOpen, setRegisterOpen] = useState(false);

  useEffect(() => {
    const start = Date.now() - 34_000;
    const tick = () => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const h = String(Math.floor(elapsed / 3600)).padStart(2, "0");
      const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
      const s = String(elapsed % 60).padStart(2, "0");
      setTimestamp(`${h}:${m}:${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden font-[Inter,sans-serif] bg-[#FAF6F0]">
      {/* Background campus photo clearly visible at 60% opacity */}
      <motion.img
        src={bgImage}
        alt="University campus"
        className="absolute inset-0 w-full h-full object-cover opacity-60"
        initial={{ scale: 1.05 }}
        animate={{ scale: 1.12 }}
        transition={{ duration: 18, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
      />
      {/* Translucent warm cream backdrop overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-[#FAF6F0]/75 via-[#F8F4EE]/60 to-[#F2ECE4]/75 backdrop-blur-[1px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      />

      <CinematicOverlays />

      {/* UI overlay grid */}
      <div className="relative z-10 min-h-screen flex flex-col pointer-events-none px-5 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
        {/* Top nav */}
        <motion.header
          className="flex items-start justify-between pointer-events-auto"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF8A3D] to-[#F5C518] flex items-center justify-center shadow-md shadow-[#FF8A3D]/25">
              <span className="font-[Cormorant_Garamond,serif] font-bold text-white text-base">PCC</span>
            </div>
            <div>
              <p className="text-slate-900 text-sm font-bold tracking-wide">Alumni Career Portal</p>
              <p className="text-[#2563eb] text-[10px] tracking-[0.18em] uppercase font-bold mt-0.5 hidden sm:block">
                Pagadian Capitol College, Inc.
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-[10px] tracking-[0.2em] uppercase font-bold">
            {NAV_ITEMS.map((item, i) => (
              <motion.span
                key={item.label}
                custom={i + 1}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className={`${item.active ? "text-[#FF8A3D] font-bold" : "text-slate-600 hover:text-slate-900"}`}
              >
                {item.active ? `• ${item.label}` : item.label}
              </motion.span>
            ))}
            <motion.button
              type="button"
              onClick={scrollToSignIn}
              custom={4}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="bg-gradient-to-r from-[#FF8A3D] to-[#ff7a22] text-white px-5 py-2 rounded-full font-bold text-xs shadow-md shadow-[#FF8A3D]/25 hover:from-[#ff7a22] hover:to-[#e66914] transition-all cursor-pointer flex items-center gap-1.5"
            >
              Sign In <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </nav>

          <motion.button
            type="button"
            onClick={scrollToSignIn}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="md:hidden bg-[#FF8A3D] text-white px-3.5 py-1.5 rounded-full text-[10px] font-bold tracking-[0.18em] uppercase pointer-events-auto shadow-md"
          >
            Sign In
          </motion.button>
        </motion.header>

        {/* Hero titles + viewfinder */}
        <div className="flex-1 relative flex items-center min-h-[280px] lg:min-h-0">
          <div className="absolute inset-0 flex items-center px-2 sm:px-8 lg:px-16 lg:pr-[440px] pointer-events-none">
            <div className="max-w-md lg:max-w-xl">
              <motion.div
                custom={0}
                variants={fadeLeft}
                initial="hidden"
                animate="visible"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/85 border border-blue-200/80 text-[#2563eb] text-[10px] font-bold tracking-[0.2em] uppercase mb-4 shadow-sm backdrop-blur-md"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FF8A3D]" /> Pagadian Capitol College, Inc.
              </motion.div>

              <motion.h1
                className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl italic text-slate-900 leading-[0.95] tracking-tight drop-shadow-sm"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
                custom={1}
                variants={fadeLeft}
                initial="hidden"
                animate="visible"
              >
                Your Career
              </motion.h1>
              <motion.h1
                className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl italic leading-[0.95] mt-1 tracking-tight bg-gradient-to-r from-[#FF8A3D] via-[#2563eb] to-[#FF8A3D] bg-clip-text text-transparent drop-shadow-sm"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
                custom={2}
                variants={fadeLeft}
                initial="hidden"
                animate="visible"
              >
                Journey Starts Here
              </motion.h1>
              <motion.p
                className="mt-5 text-xs sm:text-sm lg:text-base text-slate-700 leading-relaxed font-[Inter,sans-serif] max-w-lg font-semibold drop-shadow-sm"
                custom={3}
                variants={fadeLeft}
                initial="hidden"
                animate="visible"
              >
                Connect with fellow graduates, track your career milestones, and stay updated with opportunities from Pagadian Capitol College, Inc.
              </motion.p>
            </div>
          </div>

          <ViewfinderFrame />
        </div>

        {/* Footer */}
        <motion.footer
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.8 }}
        >
          <motion.div
            className="flex items-center gap-6 text-[10px] tracking-[0.2em] uppercase font-bold text-slate-600"
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            <span className="text-[#FF8A3D]">• Slider</span>
            <span className="hover:text-slate-900 transition-colors">List</span>
          </motion.div>

          <div className="hidden sm:flex items-center gap-6 lg:gap-10">
            {STATS.map(([val, lbl], i) => (
              <motion.div
                key={lbl}
                className="text-center"
                custom={i + 1}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
              >
                <p className={`text-xl lg:text-2xl font-bold ${i === 0 ? "text-[#FF8A3D]" : i === 1 ? "text-[#2563eb]" : "text-slate-900"}`}>
                  {val}
                </p>
                <p className="text-[9px] tracking-[0.18em] uppercase text-slate-600 font-bold mt-0.5">{lbl}</p>
              </motion.div>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-5 text-[10px] tracking-[0.2em] uppercase font-bold">
            {CATEGORIES.map((cat, i) => (
              <motion.span
                key={cat.label}
                custom={i + 4}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className={cat.active ? "text-[#2563eb]" : "text-slate-500"}
              >
                {cat.active ? `• ${cat.label}` : cat.label}
              </motion.span>
            ))}
          </div>

          <motion.div
            className="flex items-center justify-between sm:justify-end gap-6 text-[10px] tracking-wider text-slate-500"
            custom={8}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            <span>© {new Date().getFullYear()}</span>
            <span className="font-mono text-slate-700 font-bold">{timestamp}</span>
          </motion.div>
        </motion.footer>
      </div>

      {/* Glass Sign In Panel */}
      <GlassLoginPanel onOpenRegister={() => setRegisterOpen(true)} />

      {/* Pop-up Registration Modal */}
      <RegisterModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSwitchToSignIn={() => scrollToSignIn()}
      />
    </div>
  );
}
