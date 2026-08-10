"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, FileText, QrCode, Calendar, Filter,
  Settings, CheckCircle2, X, Search, BarChart2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { parseTimestampFlexible } from "@/lib/timestamp-utils";
import { StatCard } from "@/components/dashboard/StatCard";
import { LineChart, DonutChart } from "@/components/dashboard/Charts";
import { PassCard } from "@/components/dashboard/PassCard";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserRecord {
  id: string;
  form_data: Record<string, unknown> | null;
  status: string;
  created_at: string;
  valid_upto: string;
  pdf_url?: string;
  qr_code_url?: string;
}

type FilterStatus = "All" | "active" | "expired" | "archived";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getFormValue(
  formData: Record<string, unknown> | null | undefined,
  keys: string[],
  fallback = "-",
) {
  if (!formData) return fallback;
  for (const key of keys) {
    const value = formData[key];
    if (value !== undefined && value !== null && String(value).trim() !== "")
      return String(value);
  }
  return fallback;
}

function formatDateInput(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const SHORT_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function buildMonthlyData(records: UserRecord[]) {
  const now = new Date();
  return Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const month = d.getMonth();
    const year = d.getFullYear();
    const value = records.filter((r) => {
      const rd = new Date(r.created_at);
      return rd.getMonth() === month && rd.getFullYear() === year;
    }).length;
    return { label: SHORT_MONTHS[month], value };
  });
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ type, message, onClose }: { type: "success" | "error"; message: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -60, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -60, scale: 0.95 }}
      className={`fixed top-20 right-3 sm:right-4 left-3 sm:left-auto z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-sm sm:max-w-sm ${
        type === "success"
          ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-300"
          : "bg-red-50 border-red-200 text-red-800 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-300"
      }`}
    >
      {type === "success"
        ? <CheckCircle2 className="w-4 h-4 shrink-0" />
        : <X className="w-4 h-4 shrink-0" />}
      <span className="text-sm font-medium flex-1">{message}</span>
      <button onClick={onClose} className="ml-1 opacity-60 hover:opacity-100">
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ filterStatus, onClearFilter }: { filterStatus: FilterStatus; onClearFilter: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 sm:py-24 px-6 text-center rounded-2xl
                 border border-slate-200 dark:border-white/[0.05]
                 bg-slate-50 dark:bg-white/[0.02]"
    >
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl
                      bg-slate-100 dark:bg-slate-800/60
                      border border-slate-200 dark:border-slate-700/40
                      flex items-center justify-center mb-5">
        <QrCode className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400 dark:text-slate-600" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-2">No passes found</h3>
      <p className="text-sm text-slate-500 max-w-xs mb-6">
        {filterStatus === "All"
          ? "Create your first mineral transport pass to get started."
          : `No passes match the "${filterStatus}" filter.`}
      </p>
      {filterStatus !== "All" ? (
        <button onClick={onClearFilter} className="text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-semibold transition-colors">
          Clear filter
        </button>
      ) : (
        <Link
          href="/form"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-semibold text-white text-sm hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create New Pass
        </Link>
      )}
    </motion.div>
  );
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/[0.05] bg-slate-50 dark:bg-white/[0.02] p-4 sm:p-5 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-20 sm:w-24" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32 sm:w-40" />
        </div>
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-14 sm:w-16" />
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function UserDashboard() {
  const { user } = useAuth();

  const [filterStatus, setFilterStatus] = useState<FilterStatus>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [records, setRecords] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [showCharts, setShowCharts] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 10_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("records")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (error) throw error;
        setRecords(data ?? []);
      } catch (e) {
        console.error("fetch records:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // ── Status helpers ────────────────────────────────────────────────────────

  const getValidUptoDate = (record: UserRecord): Date | null => {
    const fv = record.form_data?.eform_c_valid_upto;
    if (typeof fv === "string" && fv.trim()) {
      const p = parseTimestampFlexible(fv);
      if (p) return p;
    }
    if (record.valid_upto) {
      const p = new Date(record.valid_upto);
      if (!isNaN(p.getTime())) return p;
    }
    return null;
  };

  const getEffectiveStatus = (record: UserRecord): string => {
    if (record.status === "archived") return "archived";
    if (!record.valid_upto && !record.form_data?.eform_c_valid_upto) return record.status;
    const v = getValidUptoDate(record);
    if (!v) return "expired";
    return now > v ? "expired" : "active";
  };

  // ── Date helpers ──────────────────────────────────────────────────────────

  const setRangeDays = (days: number) => {
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - (days - 1));
    setDateFrom(formatDateInput(start));
    setDateTo(formatDateInput(today));
  };

  const setThisMonth = () => {
    const today = new Date();
    setDateFrom(formatDateInput(new Date(today.getFullYear(), today.getMonth(), 1)));
    setDateTo(formatDateInput(today));
  };

  // ── Stats ─────────────────────────────────────────────────────────────────

  const activeCount    = records.filter((r) => getEffectiveStatus(r) === "active").length;
  const expiredCount   = records.filter((r) => getEffectiveStatus(r) === "expired").length;
  const thisMonthCount = records.filter((r) => {
    const d = new Date(r.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const monthlyData = buildMonthlyData(records);

  const donutSlices = [
    { label: "Active",   value: activeCount,                                       color: "#10b981" },
    { label: "Expired",  value: expiredCount,                                       color: "#ef4444" },
    { label: "Archived", value: records.length - activeCount - expiredCount,        color: "#64748b" },
  ];

  // ── Filter ────────────────────────────────────────────────────────────────

  const filteredRecords = records.filter((record) => {
    const status = getEffectiveStatus(record);
    if (filterStatus !== "All" && status !== filterStatus) return false;

    const created = new Date(record.created_at);
    if (dateFrom && created < new Date(`${dateFrom}T00:00:00`)) return false;
    if (dateTo   && created > new Date(`${dateTo}T23:59:59`))   return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const mineral = getFormValue(record.form_data, ["name_of_mineral", "mineral_name", "mineralName"]).toLowerCase();
      const passNo  = getFormValue(record.form_data, ["eform_c_no", "serial_number"]).toLowerCase();
      const dest    = getFormValue(record.form_data, ["destination_delivery_address", "destination_district", "nameOfConsignee"]).toLowerCase();
      if (!mineral.includes(q) && !passNo.includes(q) && !dest.includes(q)) return false;
    }

    return true;
  });

  // ── Actions ───────────────────────────────────────────────────────────────

  const showNotif = (type: "success" | "error", message: string, duration = 3500) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), duration);
  };

  const handleDownloadPDF = (recordId: string) => {
    try {
      const a = document.createElement("a");
      a.href = `/api/records/${recordId}/download-pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      showNotif("error", "Failed to download PDF. Please try again.");
    }
  };

  const handleDelete = async (recordId: string) => {
    if (!confirm("Delete this pass? This action cannot be undone.")) return;
    setDeletingId(recordId);
    try {
      const { error } = await supabase.from("records").delete().eq("id", recordId);
      if (error) throw error;
      setRecords((prev) => prev.filter((r) => r.id !== recordId));
      showNotif("success", "Pass deleted successfully.");
    } catch {
      showNotif("error", "Failed to delete pass. Please try again.", 5000);
    } finally {
      setDeletingId(null);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pt-16 transition-colors duration-300">

      {/* Toast */}
      <AnimatePresence>
        {notification && (
          <Toast
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Sticky page header ─────────────────────────────────────────────── */}
      <div className="border-b border-slate-200 dark:border-white/[0.05]
                      bg-white/80 dark:bg-slate-900/60
                      backdrop-blur-md sticky top-16 z-30 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">My Passes</h1>
            <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">Mineral transportation dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCharts((v) => !v)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold
                         border border-slate-200 dark:border-white/[0.07]
                         bg-white dark:bg-white/[0.03]
                         text-slate-600 dark:text-slate-400
                         hover:text-slate-900 dark:hover:text-white
                         hover:border-slate-300 dark:hover:border-white/[0.15]
                         transition-all"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              {showCharts ? "Hide" : "Show"} Charts
            </button>
            <Link
              href="/dashboard/settings"
              className="p-2 rounded-xl border border-slate-200 dark:border-white/[0.07]
                         bg-white dark:bg-white/[0.03]
                         text-slate-500 dark:text-slate-400
                         hover:text-slate-900 dark:hover:text-white
                         hover:border-slate-300 dark:hover:border-white/[0.15]
                         transition-all"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>
            <Link
              href="/form"
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">New Pass</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-5 sm:space-y-8">

        {/* ── Stat cards ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            label="Total Passes"
            value={records.length}
            icon={<FileText className="w-4 h-4 sm:w-5 sm:h-5" />}
            accent="text-cyan-500 dark:text-cyan-400"
            bg="bg-cyan-500/10"
            border="border-cyan-500/20"
            delay={0}
          />
          <StatCard
            label="Active"
            value={activeCount}
            icon={<QrCode className="w-4 h-4 sm:w-5 sm:h-5" />}
            accent="text-emerald-600 dark:text-emerald-400"
            bg="bg-emerald-500/10"
            border="border-emerald-500/20"
            delay={0.05}
          />
          <StatCard
            label="Expired"
            value={expiredCount}
            icon={<CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />}
            accent="text-red-600 dark:text-red-400"
            bg="bg-red-500/10"
            border="border-red-500/20"
            delay={0.1}
          />
          <StatCard
            label="This Month"
            value={thisMonthCount}
            icon={<Calendar className="w-4 h-4 sm:w-5 sm:h-5" />}
            accent="text-violet-600 dark:text-violet-400"
            bg="bg-violet-500/10"
            border="border-violet-500/20"
            delay={0.15}
          />
        </div>

        {/* ── Charts ─────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {showCharts && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Line chart */}
                <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-white/[0.06]
                                bg-slate-900 dark:bg-slate-900
                                p-5 sm:p-6 shadow-sm">
                  <LineChart
                    data={monthlyData}
                    title="Activity"
                    subtitle="Passes created — last 6 months"
                    height={160}
                    lineColor="#06b6d4"
                    gradientTop="rgba(6,182,212,0.22)"
                    gradientBottom="rgba(6,182,212,0)"
                  />
                </div>

                {/* Donut */}
                <div className="rounded-2xl border border-slate-200 dark:border-white/[0.06]
                                bg-slate-900 dark:bg-slate-900
                                p-5 sm:p-6 flex flex-col items-center justify-center shadow-sm min-h-[220px]">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Status Breakdown</p>
                  <DonutChart
                    slices={donutSlices}
                    centerLabel={String(records.length)}
                    centerSub="Total"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Charts toggle on mobile (shown below stats) */}
        <button
          onClick={() => setShowCharts((v) => !v)}
          className="sm:hidden w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold
                     border border-slate-200 dark:border-white/[0.07]
                     bg-white dark:bg-white/[0.03]
                     text-slate-600 dark:text-slate-400
                     transition-all"
        >
          <BarChart2 className="w-3.5 h-3.5" />
          {showCharts ? "Hide Charts" : "Show Charts"}
        </button>

        {/* ── Filters ────────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/[0.06]
                        bg-white dark:bg-white/[0.03]
                        backdrop-blur-sm p-4 space-y-4 shadow-sm">
          {/* Search + status chips */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search mineral, pass no., destination…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl
                           bg-slate-50 dark:bg-slate-800/60
                           border border-slate-200 dark:border-white/[0.06]
                           text-sm text-slate-800 dark:text-slate-200
                           placeholder:text-slate-400
                           focus:outline-none focus:border-cyan-400 dark:focus:border-cyan-500/40
                           transition-colors"
              />
            </div>

            {/* Status filter chips */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              {(["All", "active", "expired", "archived"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    filterStatus === s
                      ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-700 dark:text-cyan-300"
                      : "bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-white/[0.05] text-slate-600 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/[0.12]"
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div className="flex flex-wrap items-end gap-2 sm:gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  if (dateTo && e.target.value && new Date(e.target.value) > new Date(dateTo)) setDateTo(e.target.value);
                }}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/[0.06] text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-400 dark:focus:border-cyan-500/40 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  if (dateFrom && e.target.value && new Date(e.target.value) < new Date(dateFrom)) setDateFrom(e.target.value);
                }}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/[0.06] text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-400 dark:focus:border-cyan-500/40 transition-colors"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { label: "Today",      action: () => setRangeDays(1) },
                { label: "7 Days",     action: () => setRangeDays(7) },
                { label: "30 Days",    action: () => setRangeDays(30) },
                { label: "This Month", action: setThisMonth },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={p.action}
                  className="px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold
                             bg-slate-100 dark:bg-slate-800/60
                             border border-slate-200 dark:border-white/[0.05]
                             text-slate-600 dark:text-slate-400
                             hover:text-slate-900 dark:hover:text-white
                             hover:border-slate-300 dark:hover:border-white/[0.12]
                             transition-all"
                >
                  {p.label}
                </button>
              ))}
              {(dateFrom || dateTo) && (
                <button
                  onClick={() => { setDateFrom(""); setDateTo(""); }}
                  className="px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-red-500 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Active filter pills */}
          {(filterStatus !== "All" || dateFrom || dateTo || searchQuery) && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-white/[0.04]">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest self-center">Active filters:</span>
              {filterStatus !== "All" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 text-[11px] font-medium text-cyan-700 dark:text-cyan-400">
                  Status: {filterStatus}
                  <button onClick={() => setFilterStatus("All")} className="ml-1 hover:text-cyan-900 dark:hover:text-white"><X className="w-3 h-3" /></button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-[11px] font-medium text-blue-700 dark:text-blue-400">
                  Search: {searchQuery}
                  <button onClick={() => setSearchQuery("")} className="ml-1 hover:text-blue-900 dark:hover:text-white"><X className="w-3 h-3" /></button>
                </span>
              )}
              {(dateFrom || dateTo) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 text-[11px] font-medium text-violet-700 dark:text-violet-400">
                  {dateFrom || "…"} → {dateTo || "…"}
                  <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="ml-1 hover:text-violet-900 dark:hover:text-white"><X className="w-3 h-3" /></button>
                </span>
              )}
              <span className="text-[11px] text-slate-500 self-center ml-auto">
                {filteredRecords.length} of {records.length}
              </span>
            </div>
          )}
        </div>

        {/* ── Pass list ──────────────────────────────────────────────────── */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredRecords.length === 0 ? (
          <EmptyState filterStatus={filterStatus} onClearFilter={() => setFilterStatus("All")} />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2.5 sm:space-y-3"
          >
            {/* Column headers (sm+) */}
            <div className="hidden sm:grid grid-cols-[2fr_1.5fr_1fr_1.5fr_auto] gap-4 px-5 py-1.5">
              {["Pass / Mineral", "Destination", "Status", "Valid Until", "Actions"].map((h) => (
                <span key={h} className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{h}</span>
              ))}
            </div>

            {filteredRecords.map((record, i) => {
              const fd = record.form_data ?? {};
              return (
                <PassCard
                  key={record.id}
                  record={record}
                  passNumber={getFormValue(fd, ["eform_c_no", "serial_number", "serialNumber"], record.id.slice(0, 8))}
                  mineral={getFormValue(fd, ["name_of_mineral", "mineral_name", "mineralName"], "Unknown Mineral")}
                  quantity={getFormValue(fd, ["quantity_transported", "quantityInTonnes"], "0")}
                  destination={getFormValue(fd, ["destination_delivery_address", "destination_district", "nameOfConsignee"], "Unknown")}
                  effectiveStatus={getEffectiveStatus(record)}
                  validUptoDate={getValidUptoDate(record)}
                  isDeleting={deletingId === record.id}
                  onDelete={handleDelete}
                  onDownload={handleDownloadPDF}
                  index={i}
                />
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
