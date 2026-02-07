"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { effectiveTheme } = useTheme();
  const [isReady, setIsReady] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isDark = effectiveTheme === "dark";

  useEffect(() => {
    let isMounted = true;

    const checkRecoverySession = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (sessionError || !data.session) {
        setError(
          "Reset link is invalid or expired. Please request a new password reset.",
        );
        return;
      }

      setIsReady(true);
    };

    checkRecoverySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) {
        setIsReady(true);
        setError("");
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setError("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setSuccess("Password updated successfully. Redirecting to sign in...");
      await supabase.auth.signOut();
      setTimeout(() => router.push("/auth/signin"), 1500);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to update password. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen pt-20 ${
        isDark
          ? "bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-white"
          : "bg-linear-to-br from-white via-slate-50 to-white text-slate-900"
      }`}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-20 left-10 w-96 h-96 ${
            isDark ? "bg-cyan-500" : "bg-cyan-400"
          } rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse`}
        ></div>
        <div
          className={`absolute bottom-20 right-10 w-96 h-96 ${
            isDark ? "bg-blue-500" : "bg-blue-400"
          } rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse`}
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`w-full max-w-md ${
            isDark
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-200"
          } border rounded-2xl shadow-xl p-6 sm:p-8`}
        >
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 mb-6 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Sign In
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Set New Password
            </h1>
            <p className={isDark ? "text-slate-400" : "text-slate-600"}>
              Choose a new password for your account
            </p>
          </div>

          {!isReady && !error && (
            <div className="text-sm text-slate-500">Preparing reset...</div>
          )}

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm flex items-start gap-2 mb-4">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm flex items-start gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
              {success}
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg transition-colors ${
                    isDark
                      ? "bg-slate-800 border-slate-700 focus:border-cyan-500 text-white"
                      : "bg-white border-slate-300 focus:border-cyan-500 text-slate-900"
                  } focus:outline-none pr-10`}
                  placeholder="Min. 8 characters"
                  disabled={!isReady || loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  disabled={!isReady || loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg transition-colors ${
                  isDark
                    ? "bg-slate-800 border-slate-700 focus:border-cyan-500 text-white"
                    : "bg-white border-slate-300 focus:border-cyan-500 text-slate-900"
                } focus:outline-none`}
                placeholder="Re-enter password"
                disabled={!isReady || loading}
              />
            </div>

            <button
              type="submit"
              disabled={!isReady || loading}
              className="w-full py-3 bg-linear-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold text-white flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
