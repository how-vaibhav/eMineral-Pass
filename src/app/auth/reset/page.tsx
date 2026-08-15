"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle2, KeyRound } from "lucide-react";
import { supabase } from "@/lib/supabase";

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-500 transition-colors text-sm disabled:opacity-50";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let isMounted = true;
    const checkSession = async () => {
      const { error: sessionError } = await supabase.auth.getSession();
      if (!isMounted) return;
      if (sessionError) { setError("Reset link is invalid or expired. Please request a new password reset."); return; }
      setIsReady(true);
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) { setIsReady(true); setError(""); }
    });
    return () => { isMounted = false; subscription?.unsubscribe(); };
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) { setError("Please fill in all password fields"); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match"); return; }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters"); return; }

    setLoading(true); setError(""); setSuccess("");
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      setSuccess("Password updated successfully. Redirecting to sign in…");
      await supabase.auth.signOut();
      router.refresh();
      setTimeout(() => router.push("/auth/signin"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update password. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white pt-20 transition-colors duration-300">
      {/* Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-80 h-80 bg-cyan-500 rounded-full filter blur-3xl opacity-[0.06] dark:opacity-[0.09] animate-pulse" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-500 rounded-full filter blur-3xl opacity-[0.06] dark:opacity-[0.09] animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 p-6 sm:p-8"
        >
          <Link href="/auth/signin" className="inline-flex items-center gap-2 mb-6 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Set New Password</h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Choose a strong password for your account</p>
            </div>
          </div>

          {!isReady && !error && (
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
              <div className="w-4 h-4 border-2 border-slate-300 dark:border-slate-600 border-t-cyan-500 rounded-full animate-spin" />
              Preparing reset…
            </div>
          )}

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-start gap-2 p-3 mb-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-start gap-2 p-3 mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-sm">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> {success}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`${inputCls} pr-10`}
                  placeholder="Min. 8 characters"
                  disabled={!isReady || loading}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={!isReady || loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputCls}
                placeholder="Re-enter your password"
                disabled={!isReady || loading}
              />
            </div>

            <motion.button
              type="submit"
              disabled={!isReady || loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-2.5 mt-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-semibold text-white text-sm hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Updating…</>
              ) : "Update Password"}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
