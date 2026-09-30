import { useState } from "react";
import { Link } from "react-router";
import { GraduationCap, Mail, Loader2, CheckCircle2 } from "lucide-react";
import bgImage from "@/imports/bg.png";

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1200);
  }

  return (
    <div className="min-h-screen flex items-center justify-center font-[Inter,sans-serif] relative">
      <img src={bgImage} alt="University campus" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-[#0d1f3c]/85" />

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white rounded-3xl shadow-2xl p-10">
          <div className="flex justify-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#1a3a6b] flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
          </div>

          {!sent ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Forgot Password?</h2>
              <p className="text-gray-500 text-sm text-center mb-8">
                Enter your email and we&apos;ll send you a reset link
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="email" required placeholder="user@example.com" className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/30 focus:border-[#1a3a6b] bg-gray-50" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-[#1a3a6b] text-white font-semibold py-3 rounded-xl hover:bg-[#0d2850] transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : "Send Reset Link"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
              <p className="text-gray-500 text-sm mb-6">We&apos;ve sent a password reset link to your email address.</p>
            </div>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            <Link to="/" className="text-[#1a3a6b] font-semibold hover:underline">← Back to Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
