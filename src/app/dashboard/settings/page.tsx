"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Lock,
  Bell,
  Download,
  Eye,
  EyeOff,
  Copy,
  Check,
  LogOut,
  Trash2,
  FileText,
  Moon,
} from "lucide-react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { effectiveTheme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("account");
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  interface HostRecord {
    id: string;
  }

  const isDark = effectiveTheme === "dark";

  const handleCopyUserId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUpdateProfile = async () => {
    if (!formData.fullName) {
      setNotification({
        type: "error",
        message: "Full name is required",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: formData.fullName },
      });

      if (error) throw error;

      setNotification({
        type: "success",
        message: "Profile updated successfully",
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setNotification({
        type: "error",
        message: "Failed to update profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      setNotification({
        type: "error",
        message: "Please fill in all password fields",
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setNotification({
        type: "error",
        message: "Passwords do not match",
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      setNotification({
        type: "error",
        message: "Password must be at least 6 characters long",
      });
      return;
    }

    if (!user?.email) {
      setNotification({
        type: "error",
        message: "Missing user email. Please sign in again.",
      });
      return;
    }

    setLoading(true);
    try {
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: formData.currentPassword,
      });

      if (reauthError) throw reauthError;

      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword,
      });

      if (error) throw error;

      setNotification({
        type: "success",
        message: "Password changed successfully",
      });
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Error changing password:", error);
      setNotification({
        type: "error",
        message: "Failed to change password. Check current password.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (!confirm("Are you sure you want to sign out?")) return;

    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
      setNotification({
        type: "error",
        message: "Failed to sign out",
      });
    } finally {
      window.location.href = "/";
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Are you sure you want to delete your account? This action cannot be undone and will delete all your records.",
      )
    )
      return;

    if (!confirm("Are you absolutely sure? This is permanent.")) return;

    setLoading(true);
    try {
      // Delete user account
      const { error } = await supabase.auth.admin.deleteUser(user?.id || "");

      if (error) throw error;

      setNotification({
        type: "success",
        message: "Account deleted successfully",
      });

      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      console.error("Error deleting account:", error);
      setNotification({
        type: "error",
        message: "Failed to delete account",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    if (!user) {
      setNotification({
        type: "error",
        message: "You must be signed in to export data.",
      });
      return;
    }

    const chunkArray = <T,>(items: T[], size: number) => {
      const chunks: T[][] = [];
      for (let i = 0; i < items.length; i += size) {
        chunks.push(items.slice(i, i + size));
      }
      return chunks;
    };

    setIsExporting(true);
    try {
      const exportPayload: Record<string, unknown> = {
        exported_at: new Date().toISOString(),
        user: {
          id: user.id,
          email: user.email,
          metadata: user.user_metadata || {},
        },
      };

      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        exportPayload.profile_error = profileError.message;
      } else {
        exportPayload.profile = profileData;
      }

      const { data: recordsData, error: recordsError } = await supabase
        .from("records")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (recordsError) throw recordsError;

      const records = (recordsData as HostRecord[]) || [];
      exportPayload.records = records;

      const recordIds = records.map((record) => record.id);
      const scanLogs: unknown[] = [];

      if (recordIds.length > 0) {
        const chunks = chunkArray(recordIds, 100);
        for (const chunk of chunks) {
          const { data: scanData, error: scanError } = await supabase
            .from("scan_logs")
            .select("*")
            .in("record_id", chunk)
            .order("scanned_at", { ascending: false });

          if (scanError) throw scanError;
          scanLogs.push(...(scanData || []));
        }
      }

      exportPayload.scan_logs = scanLogs;

      const { data: templatesData, error: templatesError } = await supabase
        .from("form_templates")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (templatesError) {
        exportPayload.form_templates_error = templatesError.message;
      } else {
        exportPayload.form_templates = templatesData || [];
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `emineral-pass-export-${user.id}-${timestamp}.json`;
      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);

      setNotification({
        type: "success",
        message: "Your data export is ready and downloading.",
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Error exporting data:", error);
      setNotification({
        type: "error",
        message: "Failed to export data. Please try again.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4 pb-8 sm:px-6 md:px-8 transition-colors bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      {/* Notification Toast */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          className={`fixed top-4 left-4 right-4 sm:top-24 sm:left-auto sm:right-4 z-50 px-4 py-3 rounded-xl shadow-lg border ${
            notification.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/90 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300"
              : "bg-red-50 dark:bg-red-950/90 border-red-300 dark:border-red-700 text-red-800 dark:text-red-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">
              {notification.type === "success" ? "✓" : "⚠"}
            </span>
            <span className="font-semibold text-sm">
              {notification.message}
            </span>
          </div>
        </motion.div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-8"
        >
          <Link
            href="/dashboard/user"
            className="p-2 rounded-xl transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage your account and preferences
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 h-fit shadow-sm"
          >
            <nav className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:space-y-1 lg:overflow-visible scrollbar-hide">
              {[
                { id: "account", label: "Account", icon: User },
                { id: "security", label: "Security", icon: Lock },
                { id: "appearance", label: "Appearance", icon: Moon },
                { id: "notifications", label: "Notifications", icon: Bell },
                { id: "privacy", label: "Privacy & Data", icon: Lock },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`shrink-0 lg:w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === id
                      ? "bg-cyan-50 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/25"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-transparent"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">{label}</span>
                </button>
              ))}
            </nav>
          </motion.div>

          {/* Content Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 space-y-6"
          >
            {/* Account Tab */}
            {activeTab === "account" && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6 shadow-sm">
                <h2 className="text-lg sm:text-xl font-bold">
                  Account Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      User ID
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={user?.id || ""}
                        disabled
                        className="flex-1 px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed text-xs font-mono"
                      />
                      <button
                        onClick={handleCopyUserId}
                        title="Copy User ID"
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-500 text-sm transition-colors"
                    />
                  </div>
                  <button
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    className="w-full py-2.5 bg-linear-to-r from-cyan-500 to-blue-600 rounded-xl font-semibold text-white text-sm hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 transition-all"
                  >
                    {loading ? "Updating…" : "Update Profile"}
                  </button>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6 shadow-sm">
                <h2 className="text-lg sm:text-xl font-bold">
                  Change Password
                </h2>
                <div className="space-y-4">
                  {[
                    { label: "Current Password", key: "currentPassword" },
                    {
                      label: "New Password",
                      key: "newPassword",
                      showToggle: true,
                    },
                    { label: "Confirm Password", key: "confirmPassword" },
                  ].map(({ label, key, showToggle }) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold mb-1.5 text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        {label}
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData[key as keyof typeof formData]}
                          onChange={(e) =>
                            setFormData({ ...formData, [key]: e.target.value })
                          }
                          className="w-full px-3 py-2 pr-10 rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 text-sm transition-colors"
                        />
                        {showToggle && (
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={handleChangePassword}
                    disabled={loading}
                    className="w-full py-2.5 bg-linear-to-r from-cyan-500 to-blue-600 rounded-xl font-semibold text-white text-sm hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 transition-all"
                  >
                    {loading ? "Updating…" : "Update Password"}
                  </button>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
                  <h3 className="text-sm font-bold mb-3 text-red-600 dark:text-red-400 uppercase tracking-widest">
                    Danger Zone
                  </h3>
                  <div className="space-y-2.5">
                    <button
                      onClick={handleSignOut}
                      className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all border-2 flex items-center justify-center gap-2 border-amber-400 dark:border-amber-600 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={loading}
                      className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all border-2 flex items-center justify-center gap-2 disabled:opacity-50 border-red-400 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" /> Delete Account Permanently
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === "appearance" && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6 shadow-sm">
                <h2 className="text-lg sm:text-xl font-bold">Theme Settings</h2>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {effectiveTheme === "dark" ? "Dark Mode" : "Light Mode"}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      Click the button to animate between light and dark
                    </p>
                  </div>
                  <AnimatedThemeToggler
                    theme={effectiveTheme}
                    onThemeChange={toggleTheme}
                    variant="circle"
                    duration={500}
                    className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-yellow-500 hover:border-cyan-400 dark:hover:border-cyan-500 transition-all self-start sm:self-auto"
                  />
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-600">
                  Your preference is saved automatically in your browser.
                </p>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
                <h2 className="text-lg sm:text-xl font-bold mb-4">
                  Notification Preferences
                </h2>
                <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    📧 Email notifications will be sent for important events
                    such as:
                  </p>
                  <ul className="mt-3 space-y-1.5 text-sm text-slate-700 dark:text-slate-300 list-disc list-inside">
                    <li>Pass creation and expiration</li>
                    <li>Password changes</li>
                    <li>Account security updates</li>
                    <li>Pass access and scans</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Privacy & Data Tab */}
            {activeTab === "privacy" && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
                <h2 className="text-lg sm:text-xl font-bold">Privacy & Data</h2>
                <div className="p-4 rounded-2xl border border-cyan-200 dark:border-cyan-500/20 bg-cyan-50 dark:bg-cyan-500/10">
                  <h3 className="font-semibold mb-1.5 flex items-center gap-2 text-cyan-800 dark:text-cyan-300">
                    <FileText className="w-4 h-4" /> Data Collection
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    We collect minimal personal data necessary to provide our
                    services. Your data is encrypted and never shared with third
                    parties.
                  </p>
                </div>
                <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10">
                  <h3 className="font-semibold mb-1.5 flex items-center gap-2 text-blue-800 dark:text-blue-300">
                    <Download className="w-4 h-4" /> Download Your Data
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                    You can request a copy of all your data in JSON format.
                  </p>
                  <button
                    onClick={handleExportData}
                    disabled={isExporting}
                    className="px-4 py-2 rounded-xl font-semibold text-sm transition-all border-2 disabled:opacity-60 border-blue-400 dark:border-blue-500 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/15"
                  >
                    {isExporting ? "Exporting…" : "Export Data"}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
