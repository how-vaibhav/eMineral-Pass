"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft, UserPlus } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/types/auth";

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { effectiveTheme } = useTheme();
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

  const isDark = effectiveTheme === "dark";

  useEffect(() => {
    if (initialRole) {
      setRole(initialRole);
    }
  }, [initialRole]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!role) {
      setError("Please select your role");
      return;
    }

    if (!email || !password || !confirmPassword || !fullName) {
      setError("Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await signUp(email, password, fullName);

      setSuccess(
        `Account created successfully! Redirecting to your ${role === "host" ? "License Portal" : "Dashboard"}...`,
      );

      // Wait 1.5 seconds to show success message, then redirect
      setTimeout(() => {
        if (role === "host") {
          router.push("/dashboard/host");
        } else {
          router.push("/dashboard/user");
        }
      }, 1500);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to create account. Please try again.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen pt-20 ${isDark ? "bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-white" : "bg-linear-to-br from-white via-slate-50 to-white text-slate-900"}`}
    >
      {/* Background animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-20 left-10 w-96 h-96 ${isDark ? "bg-cyan-500" : "bg-cyan-400"} rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse`}
        ></div>
        <div
          className={`absolute bottom-20 right-10 w-96 h-96 ${isDark ? "bg-blue-500" : "bg-blue-400"} rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse`}
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`w-full max-w-md ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} border rounded-2xl shadow-xl p-6 sm:p-8`}
        >
          {/* Back button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-6 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Create Account
            </h1>
            <p className={isDark ? "text-slate-400" : "text-slate-600"}>
              Join eMineral Pass today
            </p>
          </div>

          {/* Role Selection */}
          {!role && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8"
            >
              <label className="block text-sm font-semibold mb-4">
                Select Your Role
              </label>
              <div className="space-y-3">
                <button
                  onClick={() => setRole("host")}
                  className={`w-full p-4 border-2 rounded-lg transition-all text-left ${isDark ? "hover:border-cyan-400 hover:bg-slate-800" : "hover:border-cyan-400 hover:bg-slate-50"} border-slate-700`}
                >
                  <div className="font-semibold">🏢 License Host</div>
                  <p
                    className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}
                  >
                    Manage mineral passes & transport records
                  </p>
                </button>
                <button
                  onClick={() => setRole("user")}
                  className={`w-full p-4 border-2 rounded-lg transition-all text-left ${isDark ? "hover:border-cyan-400 hover:bg-slate-800" : "hover:border-cyan-400 hover:bg-slate-50"} border-slate-700`}
                >
                  <div className="font-semibold">👤 Transport User</div>
                  <p
                    className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}
                  >
                    Submit transport forms & get passes
                  </p>
                </button>
              </div>
            </motion.div>
          )}

          {/* Sign Up Form */}
          {role && (
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6 max-h-[70vh] overflow-y-auto pr-2"
            >
              {/* Role badge */}
              <div className="flex items-center justify-between mb-6">
                <div className="text-sm">
                  <span
                    className={`px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm`}
                  >
                    {role === "host" ? "🏢 License Host" : "👤 Transport User"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setRole(null)}
                  className={`text-sm ${isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"}`}
                >
                  Change
                </button>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg transition-colors ${isDark ? "bg-slate-800 border-slate-700 focus:border-cyan-500 text-white" : "bg-white border-slate-300 focus:border-cyan-500 text-slate-900"} focus:outline-none`}
                  placeholder="Your name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg transition-colors ${isDark ? "bg-slate-800 border-slate-700 focus:border-cyan-500 text-white" : "bg-white border-slate-300 focus:border-cyan-500 text-slate-900"} focus:outline-none`}
                  placeholder="you@example.com"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg transition-colors ${isDark ? "bg-slate-800 border-slate-700 focus:border-cyan-500 text-white" : "bg-white border-slate-300 focus:border-cyan-500 text-slate-900"} focus:outline-none pr-10`}
                    placeholder="Min. 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg transition-colors ${isDark ? "bg-slate-800 border-slate-700 focus:border-cyan-500 text-white" : "bg-white border-slate-300 focus:border-cyan-500 text-slate-900"} focus:outline-none pr-10`}
                    placeholder="Re-enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Success message */}
              {success && (
                <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm">
                  {success}
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-linear-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold text-white flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Create Account
                  </>
                )}
              </button>

              {/* Sign in link */}
              <p
                className={`text-center text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}
              >
                Already have an account?{" "}
                <Link
                  href="/auth/signin"
                  className="text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  Sign in
                </Link>
              </p>
            </motion.form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
