import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Eye, EyeOff, Loader2, Sparkles, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { storageService } from "@/app/storage";
import { toast } from "sonner";

interface GlassLoginPanelProps {
  onOpenRegister?: () => void;
}

export default function GlassLoginPanel({ onOpenRegister }: GlassLoginPanelProps) {
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"alumni" | "admin">("alumni");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await storageService.loginUser(email, password);

      if (!res.success) {
        const msg = res.message || "Invalid email address or password. Please check your credentials.";
        setErrorMsg(msg);
        toast.error(msg);
        setLoading(false);
        return;
      }

      const welcomeText = `Welcome back to PCC Alumni Portal! Logged in as ${res.role || role}.`;
      setSuccessMsg(welcomeText);
      toast.success(welcomeText);

      setTimeout(() => {
        navigate(res.role === "Admin" || role === "admin" ? "/admin/dashboard" : "/alumni/dashboard");
      }, 700);
    } catch (err) {
      const errText = "Failed to sign in. Please verify your connection and try again.";
      setErrorMsg(errText);
      toast.error(errText);
      setLoading(false);
    }
  }

  return (
    <motion.div
      id="sign-in-panel"
      initial={{ opacity: 0, x: 60, y: 20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
      className="pointer-events-auto z-20
        fixed bottom-0 inset-x-0 rounded-t-3xl p-6 overflow-hidden
        lg:absolute lg:bottom-auto lg:inset-x-auto lg:right-8 lg:top-1/2 lg:-translate-y-1/2 lg:rounded-3xl lg:w-[390px] lg:p-8
        bg-[#FAF6F0]/85 backdrop-blur-2xl border border-white/80 shadow-[0_25px_60px_rgba(30,41,59,0.12)] ring-1 ring-white/70"
    >
      {/* Top vibrant gradient accent line */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#FF8A3D] via-[#F5C518] to-[#FF8A3D]" />

      <div className="mb-5 pt-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-[#FF8A3D] animate-pulse" />
          <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#2563eb]">Portal Access</p>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 font-[Cormorant_Garamond,serif] leading-tight">Welcome back</h2>
        <p className="text-slate-600 text-xs mt-1 font-[Inter,sans-serif] font-medium">Sign in to your alumni or admin account</p>
      </div>

      {/* Role Toggle Switch */}
      <div className="flex bg-stone-200/60 backdrop-blur-md rounded-2xl p-1 mb-4 border border-stone-300/50 shadow-inner">
        {(["alumni", "admin"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => {
              setRole(r);
              setErrorMsg(null);
              setSuccessMsg(null);
              if (r === "admin") setEmail("admin@pcc.edu.ph");
              else setEmail("");
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider capitalize transition-all font-[Inter,sans-serif] cursor-pointer ${
              role === r
                ? "bg-gradient-to-r from-[#FF8A3D] to-[#ff7a22] text-white shadow-md shadow-[#FF8A3D]/25"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* INLINE ERROR INDICATION */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2.5 shadow-2xs overflow-hidden"
          >
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-red-800">Incorrect Email or Password</p>
              <p className="text-[11px] text-red-600 mt-0.5 leading-snug">{errorMsg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INLINE SUCCESS WELCOME MESSAGE */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 shadow-2xs overflow-hidden"
          >
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-emerald-900">Sign In Successful!</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">{successMsg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-[#2563eb] mb-1.5 tracking-[0.18em] uppercase font-[Inter,sans-serif]">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errorMsg) setErrorMsg(null);
            }}
            required
            placeholder="user@example.com"
            className={`w-full border rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-stone-400 focus:outline-none transition-all font-[Inter,sans-serif] ${
              errorMsg
                ? "border-red-400 bg-red-50/40 focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
                : "border-stone-300/80 bg-white/80 focus:bg-white focus:ring-2 focus:ring-[#FF8A3D]/30 focus:border-[#FF8A3D]"
            }`}
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-[#2563eb] mb-1.5 tracking-[0.18em] uppercase font-[Inter,sans-serif]">
            Password
          </label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="Enter your password"
              required
              className={`w-full border rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-stone-400 focus:outline-none transition-all pr-12 font-[Inter,sans-serif] ${
                errorMsg
                  ? "border-red-400 bg-red-50/40 focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
                  : "border-stone-300/80 bg-white/80 focus:bg-white focus:ring-2 focus:ring-[#FF8A3D]/30 focus:border-[#FF8A3D]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#FF8A3D] cursor-pointer p-1 z-10 transition-colors"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer font-[Inter,sans-serif] font-medium">
            <input type="checkbox" defaultChecked className="rounded border-stone-300 accent-[#FF8A3D] bg-white" />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-xs text-[#FF8A3D] font-bold hover:text-[#ff7a22] transition-colors font-[Inter,sans-serif]">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading || Boolean(successMsg)}
          className="w-full bg-gradient-to-r from-[#FF8A3D] via-[#ff7a22] to-[#FF8A3D] text-white font-bold py-3.5 rounded-xl hover:from-[#ff7a22] hover:to-[#e66914] transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-3 font-[Inter,sans-serif] cursor-pointer shadow-lg shadow-[#FF8A3D]/25"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
            </>
          ) : (
            <>
              Sign In <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-5 pt-4 border-t border-stone-200/80 text-center">
        <p className="text-xs text-slate-600 font-[Inter,sans-serif] font-medium">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={onOpenRegister}
            className="text-[#FF8A3D] font-bold hover:text-[#ff7a22] hover:underline transition-colors inline-flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
          >
            Register here <Sparkles className="w-3 h-3 text-[#2563eb]" />
          </button>
        </p>
      </div>
    </motion.div>
  );
}
