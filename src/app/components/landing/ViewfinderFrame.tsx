import { motion, Variants } from "motion/react";

const bracketVariants: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: 0.6 + i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

export default function ViewfinderFrame() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[3]">
      <motion.div
        className="relative w-[min(70vw,520px)] h-[min(55vh,380px)]"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Corner brackets with vibrant orange & amber accents */}
        {[
          "top-0 left-0 border-t-2 border-l-2 border-[#FF8A3D]",
          "top-0 right-0 border-t-2 border-r-2 border-[#F5C518]",
          "bottom-0 left-0 border-b-2 border-l-2 border-[#F5C518]",
          "bottom-0 right-0 border-b-2 border-r-2 border-[#FF8A3D]",
        ].map((pos, i) => (
          <motion.span
            key={pos}
            custom={i}
            variants={bracketVariants}
            initial="hidden"
            animate="visible"
            className={`absolute w-7 h-7 shadow-[0_0_12px_rgba(255,138,61,0.4)] ${pos}`}
          />
        ))}

        {/* Frame border */}
        <motion.div
          className="absolute inset-0 border border-white/20 rounded-xl shadow-[inset_0_0_30px_rgba(255,138,61,0.08)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        />

        {/* Crosshair reticle */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0.4, 0.9, 0.4], scale: 1 }}
          transition={{
            opacity: { delay: 1.2, duration: 2.5, repeat: Infinity, ease: "easeInOut" },
            scale: { delay: 1, duration: 0.4, ease: "easeOut" },
          }}
        >
          <span className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#FF8A3D] to-transparent shadow-[0_0_8px_#FF8A3D]" />
          <span className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-[#F5C518] to-transparent shadow-[0_0_8px_#F5C518]" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#FF8A3D] ring-2 ring-[#F5C518]/50 shadow-[0_0_10px_#FF8A3D]" />
        </motion.div>

        {/* Labels with rich color accents */}
        {[
          { text: "Alumni Network", className: "absolute -top-6 left-0 text-[#FF8A3D]", delay: 1.0 },
          { text: "Career Tracking", className: "absolute -top-6 right-0 text-[#F5C518]", delay: 1.1 },
          {
            text: "Pagadian Capitol College, Inc.",
            className: "absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[#F5F0E8]/70 font-medium",
            delay: 1.2,
          },
        ].map(({ text, className, delay }) => (
          <motion.span
            key={text}
            className={`${className} text-[10px] tracking-[0.22em] uppercase font-bold font-[Inter,sans-serif]`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5, ease: "easeOut" }}
          >
            {text}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}
