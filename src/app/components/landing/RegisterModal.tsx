import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { GraduationCap, Eye, EyeOff, Loader2, Check, X, ShieldAlert, CheckCircle2, UserCheck, ArrowRight, KeyRound } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { COURSES, YEARS } from "@/app/data";
import { storageService } from "@/app/storage";
import { validatePasswordStrength, validateEmail } from "@/app/utils/security";
import { toast } from "sonner";

interface RegisterModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToSignIn?: () => void;
}

export default function RegisterModal({ open, onClose, onSwitchToSignIn }: RegisterModalProps) {
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [createdSuccess, setCreatedSuccess] = useState(false);
  const [registeredDetails, setRegisteredDetails] = useState<{ name: string; email: string; studentId: string; course: string } | null>(null);

  const navigate = useNavigate();

  // Completely blank initial state (no auto-generated student ID)
  const [form, setForm] = useState({
    studentId: "",
    year: YEARS[0],
    name: "",
    gender: "Female",
    course: COURSES[0],
    email: "",
    password: "",
    confirmPassword: "",
  });

  const pwdValidation = validatePasswordStrength(form.password);
  const isEmailValid = !form.email || validateEmail(form.email);

  // Dynamic email duplicate check
  useEffect(() => {
    if (form.email && validateEmail(form.email)) {
      storageService.getUsers().then((users) => {
        const found = users.some((u) => u.email.toLowerCase() === form.email.trim().toLowerCase());
        setAlreadyExists(found);
      });
    } else {
      setAlreadyExists(false);
    }
  }, [form.email]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.studentId.trim()) {
      toast.error("Please enter your Student ID.");
      return;
    }

    if (!form.name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    if (!form.email.trim() || !validateEmail(form.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (alreadyExists) {
      toast.info("An account with this email already exists! You can sign in below.");
      return;
    }

    if (!pwdValidation.isValid) {
      toast.error("Please ensure your password meets all security guidelines.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match! Please check both password fields.");
      return;
    }

    setLoading(true);
    try {
      const result = await storageService.registerAccount({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        studentId: form.studentId.trim(),
        course: form.course || COURSES[0],
        year: Number(form.year) || 2024,
        gender: form.gender || "Female",
        role: "Alumni",
      });

      if (!result.success) {
        if (result.code === "ALREADY_REGISTERED") {
          setAlreadyExists(true);
          toast.error("You already have an account with this email address!");
        } else {
          toast.error(result.message || "Failed to create account.");
        }
        setLoading(false);
        return;
      }

      setRegisteredDetails({
        name: form.name.trim(),
        email: form.email.trim(),
        studentId: form.studentId.trim(),
        course: form.course,
      });
      setCreatedSuccess(true);
      toast.success("Account created successfully!");
    } catch (err) {
      toast.error("An unexpected error occurred during account creation.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-md cursor-pointer"
        />

        {/* Warm Cream Frosted Glass Modal Window Container (Spacious max-w-4xl) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-4xl bg-[#FAF6F0]/90 backdrop-blur-2xl border border-white/90 rounded-3xl p-6 sm:p-8 md:p-10 shadow-[0_30px_90px_rgba(30,41,59,0.18)] ring-1 ring-white/80 text-slate-900 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        >
          {/* Top vibrant gradient accent line matching Profile color scheme */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#FF8A3D] via-[#F5C518] to-[#FF8A3D]" />

          {/* Frosted Glass Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-stone-200/80 hover:bg-stone-300 text-stone-700 flex items-center justify-center transition-all cursor-pointer z-20 shadow-sm"
            aria-label="Close registration modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-6 pr-10">
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="w-5 h-5 text-[#FF8A3D]" />
              <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#2563eb]">PCC Alumni Portal</p>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-[Cormorant_Garamond,serif] text-slate-900">Create Alumni Account</h2>
            <p className="text-slate-600 text-xs mt-1 font-medium">Register your profile to connect with batchmates and track your career timeline</p>
          </div>

          {/* Scrollable form body */}
          <div className="flex-1 overflow-y-auto pr-1">
            {/* Existing Account Notice */}
            <AnimatePresence>
              {alreadyExists && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-5 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-900 flex items-start gap-3 backdrop-blur-xl shadow-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 text-amber-700">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-xs">
                    <h4 className="font-semibold text-amber-950 text-sm">You already have an account!</h4>
                    <p className="text-amber-800 mt-0.5">
                      Email <span className="font-semibold text-slate-900">{form.email}</span> is already registered in our system.
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onSwitchToSignIn?.();
                        }}
                        className="inline-flex items-center gap-1.5 bg-[#FF8A3D] text-white text-xs font-semibold px-4 py-1.5 rounded-xl hover:bg-[#ff7a22] transition-colors cursor-pointer shadow-sm"
                      >
                        Sign In Now <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <Link
                        to="/forgot-password"
                        onClick={onClose}
                        className="inline-flex items-center gap-1.5 text-xs text-[#2563eb] font-medium hover:underline"
                      >
                        <KeyRound className="w-3.5 h-3.5" /> Forgot Password?
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#2563eb] mb-1.5">
                    Student ID
                  </label>
                  <input
                    type="text"
                    value={form.studentId}
                    onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                    placeholder="e.g. 2024-01234"
                    autoComplete="off"
                    required
                    className="w-full border border-stone-300/80 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF8A3D]/30 focus:border-[#FF8A3D] bg-white/80 focus:bg-white transition-all font-[Inter,sans-serif]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#2563eb] mb-1.5">
                    Graduation Year
                  </label>
                  <select
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                    required
                    className="w-full border border-stone-300/80 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF8A3D]/30 focus:border-[#FF8A3D] bg-white/80 focus:bg-white"
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y} className="bg-[#FAF6F0] text-slate-900">
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#2563eb] mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Maria Santos"
                    autoComplete="off"
                    required
                    className="w-full border border-stone-300/80 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF8A3D]/30 focus:border-[#FF8A3D] bg-white/80 focus:bg-white transition-all font-[Inter,sans-serif]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#2563eb] mb-1.5">
                    Gender
                  </label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    required
                    className="w-full border border-stone-300/80 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF8A3D]/30 focus:border-[#FF8A3D] bg-white/80 focus:bg-white"
                  >
                    <option value="Male" className="bg-[#FAF6F0] text-slate-900">Male</option>
                    <option value="Female" className="bg-[#FAF6F0] text-slate-900">Female</option>
                    <option value="Other" className="bg-[#FAF6F0] text-slate-900">Other</option>
                  </select>
                </div>

                {/* Course full width for comfortable reading without truncation */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#2563eb] mb-1.5">
                    Course / Degree Program
                  </label>
                  <select
                    value={form.course}
                    onChange={(e) => setForm({ ...form, course: e.target.value })}
                    required
                    className="w-full border border-stone-300/80 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF8A3D]/30 focus:border-[#FF8A3D] bg-white/80 focus:bg-white pr-8"
                  >
                    {COURSES.map((c) => (
                      <option key={c} value={c} className="bg-[#FAF6F0] text-slate-900 py-1">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#2563eb] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="user@example.com"
                    autoComplete="off"
                    required
                    className={`w-full border rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 bg-white/80 focus:bg-white transition-all font-[Inter,sans-serif] ${
                      alreadyExists
                        ? "border-amber-400 focus:ring-amber-300"
                        : !isEmailValid
                          ? "border-red-400 focus:ring-red-300"
                          : "border-stone-300/80 focus:ring-[#FF8A3D]/30 focus:border-[#FF8A3D]"
                    }`}
                  />
                  {!isEmailValid && <p className="text-xs text-red-500 mt-1">Please enter a valid email address format.</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#2563eb] mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Min. 8 chars with Uppercase, Number & Symbol"
                      autoComplete="new-password"
                      required
                      className="w-full border border-stone-300/80 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF8A3D]/30 focus:border-[#FF8A3D] bg-white/80 focus:bg-white transition-all pr-12 font-[Inter,sans-serif]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#FF8A3D] cursor-pointer p-1 transition-colors"
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#2563eb] mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPw ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      placeholder="Repeat password"
                      autoComplete="new-password"
                      required
                      className={`w-full border rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 bg-white/80 focus:bg-white transition-all pr-12 font-[Inter,sans-serif] ${
                        form.confirmPassword && form.password !== form.confirmPassword
                          ? "border-red-400 focus:ring-red-300"
                          : "border-stone-300/80 focus:ring-[#FF8A3D]/30 focus:border-[#FF8A3D]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPw(!showConfirmPw)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#FF8A3D] cursor-pointer p-1 transition-colors"
                      aria-label={showConfirmPw ? "Hide password" : "Show password"}
                    >
                      {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {form.confirmPassword && form.password !== form.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
                  )}
                </div>
              </div>

              {/* Password criteria checklist */}
              {form.password && (
                <div className="mt-3 p-3.5 bg-stone-100/80 rounded-2xl border border-stone-200 space-y-1.5 text-xs">
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-[#FF8A3D]" /> Password Security Requirements:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-2 gap-y-1 text-slate-600">
                    <span className={`flex items-center gap-1 ${pwdValidation.hasMinLength ? "text-emerald-600 font-semibold" : "text-stone-400"}`}>
                      {pwdValidation.hasMinLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} 8+ Characters
                    </span>
                    <span className={`flex items-center gap-1 ${pwdValidation.hasUppercase ? "text-emerald-600 font-semibold" : "text-stone-400"}`}>
                      {pwdValidation.hasUppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Uppercase (A-Z)
                    </span>
                    <span className={`flex items-center gap-1 ${pwdValidation.hasLowercase ? "text-emerald-600 font-semibold" : "text-stone-400"}`}>
                      {pwdValidation.hasLowercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Lowercase (a-z)
                    </span>
                    <span className={`flex items-center gap-1 ${pwdValidation.hasNumber ? "text-emerald-600 font-semibold" : "text-stone-400"}`}>
                      {pwdValidation.hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Number (0-9)
                    </span>
                    <span className={`flex items-center gap-1 col-span-2 ${pwdValidation.hasSpecialChar ? "text-emerald-600 font-semibold" : "text-stone-400"}`}>
                      {pwdValidation.hasSpecialChar ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Special Char (!@#$%^&*)
                    </span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || alreadyExists || !pwdValidation.isValid || form.password !== form.confirmPassword}
                className="w-full bg-gradient-to-r from-[#FF8A3D] via-[#ff7a22] to-[#FF8A3D] text-white font-bold py-3.5 rounded-xl hover:from-[#ff7a22] hover:to-[#e66914] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4 cursor-pointer shadow-lg shadow-[#FF8A3D]/25"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Creating account...
                  </>
                ) : alreadyExists ? (
                  "Account Already Exists"
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          </div>
        </motion.div>

        {/* SUCCESS CONFIRMATION OVERLAY INSIDE MODAL */}
        <AnimatePresence>
          {createdSuccess && registeredDetails && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-[#FAF6F0] rounded-3xl max-w-md w-full p-8 shadow-2xl border border-white text-center relative overflow-hidden text-slate-900"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-sm border border-emerald-200">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <h3 className="text-2xl font-bold font-[Cormorant_Garamond,serif] text-slate-900">Account Created!</h3>
                <p className="text-xs text-slate-600 mt-1 font-medium">
                  Welcome to PCC Alumni Portal! Next step: complete setting up your profile details.
                </p>

                <div className="mt-6 p-4 rounded-2xl bg-white border border-stone-200 text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400 uppercase tracking-wider font-semibold">Name</span>
                    <span className="font-semibold text-slate-800">{registeredDetails.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 uppercase tracking-wider font-semibold">Email</span>
                    <span className="font-semibold text-slate-800">{registeredDetails.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 uppercase tracking-wider font-semibold">Student ID</span>
                    <span className="font-semibold text-slate-800">{registeredDetails.studentId}</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate("/alumni/profile?setup=true");
                    }}
                    className="w-full bg-gradient-to-r from-[#FF8A3D] via-[#ff7a22] to-[#FF8A3D] text-white font-bold py-3.5 rounded-xl hover:from-[#ff7a22] hover:to-[#e66914] transition-colors shadow-lg shadow-[#FF8A3D]/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Continue Setting Up Profile <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate("/alumni/dashboard");
                    }}
                    className="w-full border border-stone-300 text-slate-700 font-semibold py-3 rounded-xl hover:bg-white transition-colors cursor-pointer"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
}
