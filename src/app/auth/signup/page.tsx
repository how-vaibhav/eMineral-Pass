"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/types/auth";

// ─── Shared input style ───────────────────────────────────────────────────────
const inputCls =
  "w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-500 transition-colors text-sm";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp } = useAuth();

  const initialRole = (searchParams.get("role") as UserRole) || null;
  const [role, setRole] = useState<UserRole | null>(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role)         { setError("Please select your role"); return; }
    if (!email || !password || !confirmPassword || !fullName) {
      setError("Please fill in all required fields"); return;
    }
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await signUp(email, password, fullName, role);
      if (!result.session) {
        setSuccess("Account created! Please verify your email to continue.");
        setTimeout(() => router.push(`/auth/verify?email=${encodeURIComponent(email)}`), 1200);
        return;
      }
      setSuccess("Account created successfully! Redirecting…");
      setTimeout(() => router.push(role === "host" ? "/dashboard/host" : "/dashboard/user"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white pt-20 transition-colors duration-300">
      {/* Background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-[0.06] dark:opacity-[0.08] animate-pulse" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-[0.06] dark:opacity-[0.08] animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 p-6 sm:p-8"
        >
          {/* Back link */}
          <Link href="/" className="inline-flex items-center gap-2 mb-6 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Header */}
          <div className="mb-7">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1.5">Create Account</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Join eMineral Pass today</p>
          </div>

          <AnimatePresence mode="wait">
            {!role ? (
              /* ── Role selection ── */
              <motion.div key="role" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Select your role</p>
                {[
                  { role: "host" as UserRole, emoji: "🏢", title: "License Host", desc: "Manage mineral passes & transport records" },
                  { role: "user" as UserRole, emoji: "👤", title: "Transport User", desc: "Submit transport forms & get passes" },
                ].map((r) => (
                  <motion.button
                    key={r.role}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setRole(r.role)}
                    className="w-full p-4 text-left rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-cyan-400 dark:hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-slate-800 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{r.emoji}</span>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{r.title}</div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{r.desc}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            ) : (
              /* ── Sign up form ── */
              <motion.form key="form" onSubmit={handleSubmit} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
                {/* Role badge */}
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-700 dark:text-cyan-400 text-xs font-semibold">
                    {role === "host" ? "🏢 License Host" : "👤 Transport User"}
                  </span>
                  <button type="button" onClick={() => setRole(null)} className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                    Change
                  </button>
                </div>

                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} placeholder="Full Name" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="Email address" />

                {/* Password */}
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputCls} pr-10`} placeholder="Password (8+ chars)" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Confirm password */}
                <div className="relative">
                  <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`${inputCls} pr-10`} placeholder="Confirm password" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Alerts */}
                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
                    </motion.div>
                  )}
                  {success && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-sm">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> {success}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-semibold text-white text-sm hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating account…</>
                  ) : "Create Account"}
                </motion.button>

                <p className="text-center text-sm text-slate-500 dark:text-slate-400 pt-1">
                  Already have an account?{" "}
                  <Link href="/auth/signin" className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-semibold transition-colors">
                    Sign in
                  </Link>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-950" />}>
      <SignUpForm />
    </Suspense>
  );
}
