import { motion } from "motion/react";

const RULER_MARKS = [
  { top: "12%", left: "8%", label: "05." },
  { top: "28%", left: "5%", label: "19." },
  { top: "72%", left: "7%", label: "320" },
  { top: "18%", right: "6%", label: "12." },
  { top: "45%", right: "4%", label: "08." },
  { top: "80%", right: "8%", label: "44." },
];

export default function CinematicOverlays() {
  return (
    <>
      {/* Warm Cream Mode Ambient Color Blobs with Hint of Blue */}
      <motion.div
        className="absolute top-1/4 -left-16 w-96 h-96 rounded-full bg-[#FF8A3D]/18 blur-[100px] pointer-events-none z-[1]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full bg-[#F5C518]/15 blur-[120px] pointer-events-none z-[1]"
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute top-10 right-1/3 w-80 h-80 rounded-full bg-[#2563eb]/15 blur-[90px] pointer-events-none z-[1]"
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.55, 0.3] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Subtle texture grid */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply z-[1]"
        animate={{ opacity: [0.02, 0.04, 0.02] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "180px 180px",
        }}
      />

      {/* Ruler markings — desktop only */}
      <div className="absolute inset-0 pointer-events-none z-[2] hidden lg:block">
        {RULER_MARKS.map((mark, i) => (
          <motion.div
            key={mark.label}
            className="absolute flex items-center gap-1 text-slate-500 font-[Inter,sans-serif] text-[9px] tracking-wider font-semibold"
            style={{ top: mark.top, left: mark.left, right: mark.right }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 + i * 0.08, duration: 0.6 }}
          >
            <span className="w-px h-3 bg-[#FF8A3D]/70" />
            <span>{mark.label}</span>
          </motion.div>
        ))}

        {/* Horizontal guide lines */}
        <motion.div
          className="absolute top-[50%] left-[3%] w-[12%] h-px bg-gradient-to-r from-[#FF8A3D]/50 to-transparent"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          style={{ transformOrigin: "left" }}
        />
        <motion.div
          className="absolute top-[50%] right-[3%] w-[12%] h-px bg-gradient-to-l from-[#2563eb]/50 to-transparent"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          style={{ transformOrigin: "right" }}
        />
        <motion.div
          className="absolute left-[50%] top-[8%] w-px h-[10%] bg-gradient-to-b from-[#FF8A3D]/50 to-transparent"
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          style={{ transformOrigin: "top" }}
        />
        <motion.div
          className="absolute left-[50%] bottom-[8%] w-px h-[10%] bg-gradient-to-t from-[#2563eb]/50 to-transparent"
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          style={{ transformOrigin: "bottom" }}
        />
      </div>
    </>
  );
}
