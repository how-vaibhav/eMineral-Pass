"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  TrendingUp,
  Settings,
  Download,
  Eye,
  FileText,
  Filter,
  QrCode,
  MapPin,
  Clock,
  Search,
  X,
  BarChart2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { parseTimestampFlexible } from "@/lib/timestamp-utils";
import { StatCard } from "@/components/dashboard/StatCard";
import { LineChart, DonutChart } from "@/components/dashboard/Charts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HostRecord {
  id: string;
  form_data: Record<string, unknown> | null;
  status: string;
  created_at: string;
  valid_upto: string;
  total_scans: number;
  pdf_url?: string;
  qr_code_url?: string;
}

type FilterStatus = "All" | "active" | "expired" | "archived";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getFormValue(
  formData: Record<string, unknown> | null | undefined,
  keys: string[],
  fallback = "-",
): string {
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

const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function buildMonthlyData(records: HostRecord[]) {
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

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; dot: string }> = {
    active: {
      label: "Active",
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30",
      dot: "bg-emerald-500 animate-pulse",
    },
    expired: {
      label: "Expired",
      cls: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30",
      dot: "bg-red-500",
    },
    archived: {
      label: "Archived",
      cls: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/15 dark:text-slate-400 dark:border-slate-500/30",
      dot: "bg-slate-400",
    },
  };
  const cfg = map[status] ?? map.archived;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.cls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Record Row ───────────────────────────────────────────────────────────────

function RecordRow({
  record,
  index,
  effectiveStatus,
  passNumber,
  licensee,
  mineral,
  quantity,
  destination,
  validUptoDate,
  onDownload,
}: {
  record: HostRecord;
  index: number;
  effectiveStatus: string;
  passNumber: string;
  licensee: string;
  mineral: string;
  quantity: string;
  destination: string;
  validUptoDate: Date | null;
  onDownload: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="group relative overflow-hidden rounded-2xl
                 border border-slate-200 dark:border-white/6
                 bg-white dark:bg-white/3
                 hover:border-slate-300 dark:hover:border-white/12
                 hover:bg-slate-50 dark:hover:bg-white/5
                 shadow-sm dark:shadow-none
                 backdrop-blur-sm transition-all duration-300"
    >
      {/* Status accent bar */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-0.75 rounded-l-2xl ${
          effectiveStatus === "active"
            ? "bg-emerald-500"
            : effectiveStatus === "expired"
              ? "bg-red-500"
              : "bg-slate-300 dark:bg-slate-600"
        }`}
      />

      <div className="pl-5 pr-4 sm:pr-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          {/* Pass info */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <QrCode className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400/80 mb-0.5 tracking-wider">
                EMP-{passNumber}
              </p>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-tight truncate">
                {licensee}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {mineral} • {quantity} T
              </p>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-3 flex-wrap sm:contents">
            <div className="flex items-center gap-1.5 sm:min-w-30">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="text-xs text-slate-600 dark:text-slate-300 truncate max-w-25 sm:max-w-none">
                {destination}
              </span>
            </div>
            <StatusBadge status={effectiveStatus} />
            <div className="flex items-center gap-1.5 text-xs text-slate-500 sm:min-w-32.5">
              <Clock className="w-3 h-3 shrink-0" />
              <span>
                {validUptoDate
                  ? validUptoDate.toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </span>
            </div>
            <div className="text-xs text-slate-400 hidden sm:block">
              Scans:{" "}
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                {record.total_scans || 0}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 border-t border-slate-100 dark:border-white/4 pt-3 sm:border-0 sm:pt-0">
            <Link
              href={`/records/${record.id}`}
              className="p-2 rounded-lg text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
              title="View"
            >
              <Eye className="w-4 h-4" />
            </Link>
            {record.pdf_url ? (
              <button
                onClick={() => onDownload(record.id)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold
                           bg-cyan-50 border border-cyan-200 text-cyan-700
                           dark:bg-cyan-500/10 dark:border-cyan-500/20 dark:text-cyan-400
                           hover:bg-cyan-100 dark:hover:bg-cyan-500/20 transition-all"
                title="Download PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">PDF</span>
              </button>
            ) : (
              <span
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold
                             bg-slate-50 border border-slate-200 text-slate-400
                             dark:bg-slate-800/60 dark:border-slate-700/40 dark:text-slate-600 cursor-not-allowed"
                title="PDF generating…"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pending</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/2 p-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-24" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-40" />
        </div>
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-16" />
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function HostDashboardUI() {
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [records, setRecords] = useState<HostRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const [showCharts, setShowCharts] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 10_000);
    return () => clearInterval(t);
  }, []);

  // ── Status helpers ──────────────────────────────────────────────────────────

  const getValidUptoDate = (record: HostRecord): Date | null => {
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

  const getEffectiveStatus = (record: HostRecord): string => {
    if (record.status === "archived") return "archived";
    if (!record.valid_upto && !record.form_data?.eform_c_valid_upto)
      return record.status;
    const v = getValidUptoDate(record);
    if (!v) return "expired";
    return now > v ? "expired" : "active";
  };

  // ── Data fetch ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("records")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        setRecords(data ?? []);

        const { count } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true });
        setTotalUsers(count ?? 0);
      } catch (e) {
        console.error("fetch records:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // ── Date helpers ────────────────────────────────────────────────────────────

  const setRangeDays = (days: number) => {
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - (days - 1));
    setDateFrom(formatDateInput(start));
    setDateTo(formatDateInput(today));
  };

  const setThisMonth = () => {
    const today = new Date();
    setDateFrom(
      formatDateInput(new Date(today.getFullYear(), today.getMonth(), 1)),
    );
    setDateTo(formatDateInput(today));
  };

  // ── Stats ───────────────────────────────────────────────────────────────────

  const activeCount = records.filter(
    (r) => getEffectiveStatus(r) === "active",
  ).length;
  const expiredCount = records.filter(
    (r) => getEffectiveStatus(r) === "expired",
  ).length;
  const thisMonthCount = records.filter((r) => {
    const d = new Date(r.created_at);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  }).length;

  const monthlyData = buildMonthlyData(records);
  const donutSlices = [
    { label: "Active", value: activeCount, color: "#10b981" },
    { label: "Expired", value: expiredCount, color: "#ef4444" },
    {
      label: "Archived",
      value: records.length - activeCount - expiredCount,
      color: "#64748b",
    },
  ];

  // ── Filter ──────────────────────────────────────────────────────────────────

  const filteredRecords = records.filter((record) => {
    const status = getEffectiveStatus(record);
    if (filterStatus !== "All" && status !== filterStatus) return false;

    const created = new Date(record.created_at);
    if (dateFrom && created < new Date(`${dateFrom}T00:00:00`)) return false;
    if (dateTo && created > new Date(`${dateTo}T23:59:59`)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const licensee = getFormValue(record.form_data, [
        "name_of_licensee",
        "licensee_name",
        "nameOfLicenseeOfLease",
      ]).toLowerCase();
      const mineral = getFormValue(record.form_data, [
        "name_of_mineral",
        "mineral_name",
        "mineralName",
      ]).toLowerCase();
      const passNo = getFormValue(record.form_data, [
        "eform_c_no",
        "serial_number",
      ]).toLowerCase();
      if (!licensee.includes(q) && !mineral.includes(q) && !passNo.includes(q))
        return false;
    }
    return true;
  });

  const handleDownloadPDF = (recordId: string) => {
    const a = document.createElement("a");
    a.href = `/api/records/${recordId}/download-pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pt-16 transition-colors duration-300">
      {/* ── Sticky header ──────────────────────────────────────────────────── */}
      <div
        className="border-b border-slate-200 dark:border-white/5
                      bg-white/80 dark:bg-slate-900/60
                      backdrop-blur-md sticky top-16 z-30 transition-colors duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              License Portal
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
              All mineral transportation passes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCharts((v) => !v)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold
                         border border-slate-200 dark:border-white/7
                         bg-white dark:bg-white/3
                         text-slate-600 dark:text-slate-400
                         hover:text-slate-900 dark:hover:text-white
                         hover:border-slate-300 dark:hover:border-white/15 transition-all"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              {showCharts ? "Hide" : "Show"} Charts
            </button>
            <Link
              href="/dashboard/settings"
              className="p-2 rounded-xl border border-slate-200 dark:border-white/7
                         bg-white dark:bg-white/3
                         text-slate-500 dark:text-slate-400
                         hover:text-slate-900 dark:hover:text-white
                         hover:border-slate-300 dark:hover:border-white/15 transition-all"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
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
            icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />}
            accent="text-emerald-600 dark:text-emerald-400"
            bg="bg-emerald-500/10"
            border="border-emerald-500/20"
            delay={0.05}
          />
          <StatCard
            label="Total Users"
            value={totalUsers}
            icon={<Users className="w-4 h-4 sm:w-5 sm:h-5" />}
            accent="text-violet-600 dark:text-violet-400"
            bg="bg-violet-500/10"
            border="border-violet-500/20"
            delay={0.1}
          />
          <StatCard
            label="This Month"
            value={thisMonthCount}
            icon={<QrCode className="w-4 h-4 sm:w-5 sm:h-5" />}
            accent="text-blue-600 dark:text-blue-400"
            bg="bg-blue-500/10"
            border="border-blue-500/20"
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
                <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-white/6 bg-slate-900 p-5 sm:p-6 shadow-sm">
                  <LineChart
                    data={monthlyData}
                    title="Pass Activity"
                    subtitle="All passes created — last 6 months"
                    height={160}
                    lineColor="#06b6d4"
                    gradientTop="rgba(6,182,212,0.22)"
                    gradientBottom="rgba(6,182,212,0)"
                  />
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-white/6 bg-slate-900 p-5 sm:p-6 flex flex-col items-center justify-center shadow-sm min-h-55">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                    Status Breakdown
                  </p>
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

        {/* Mobile chart toggle */}
        <button
          onClick={() => setShowCharts((v) => !v)}
          className="sm:hidden w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold
                     border border-slate-200 dark:border-white/7
                     bg-white dark:bg-white/3
                     text-slate-600 dark:text-slate-400 transition-all"
        >
          <BarChart2 className="w-3.5 h-3.5" />
          {showCharts ? "Hide Charts" : "Show Charts"}
        </button>

        {/* ── Filters ────────────────────────────────────────────────────── */}
        <div
          className="rounded-2xl border border-slate-200 dark:border-white/6
                        bg-white dark:bg-white/3
                        backdrop-blur-sm p-4 space-y-4 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search licensee, mineral, pass no…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/6 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400 dark:focus:border-cyan-500/40 transition-colors"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              {(["All", "active", "expired", "archived"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    filterStatus === s
                      ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-700 dark:text-cyan-300"
                      : "bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/12"
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div className="flex flex-wrap items-end gap-2 sm:gap-3">
            {["From", "To"].map((label, li) => {
              const val = li === 0 ? dateFrom : dateTo;
              const setter =
                li === 0
                  ? (v: string) => {
                      setDateFrom(v);
                      if (dateTo && v && new Date(v) > new Date(dateTo))
                        setDateTo(v);
                    }
                  : (v: string) => {
                      setDateTo(v);
                      if (dateFrom && v && new Date(v) < new Date(dateFrom))
                        setDateFrom(v);
                    };
              return (
                <div key={label}>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    {label}
                  </label>
                  <input
                    type="date"
                    value={val}
                    onChange={(e) => setter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/6 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-400 dark:focus:border-cyan-500/40 transition-colors"
                  />
                </div>
              );
            })}
            <div className="flex gap-2 flex-wrap">
              {[
                { label: "Today", action: () => setRangeDays(1) },
                { label: "7 Days", action: () => setRangeDays(7) },
                { label: "30 Days", action: () => setRangeDays(30) },
                { label: "This Month", action: setThisMonth },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={p.action}
                  className="px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/12 transition-all"
                >
                  {p.label}
                </button>
              ))}
              {(dateFrom || dateTo) && (
                <button
                  onClick={() => {
                    setDateFrom("");
                    setDateTo("");
                  }}
                  className="px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-red-500 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Active filter pills */}
          {(filterStatus !== "All" || dateFrom || dateTo || searchQuery) && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-white/4">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest self-center">
                Active filters:
              </span>
              {filterStatus !== "All" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 text-[11px] font-medium text-cyan-700 dark:text-cyan-400">
                  Status: {filterStatus}
                  <button onClick={() => setFilterStatus("All")}>
                    <X className="w-3 h-3 ml-1" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-[11px] font-medium text-blue-700 dark:text-blue-400">
                  Search: {searchQuery}
                  <button onClick={() => setSearchQuery("")}>
                    <X className="w-3 h-3 ml-1" />
                  </button>
                </span>
              )}
              {(dateFrom || dateTo) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 text-[11px] font-medium text-violet-700 dark:text-violet-400">
                  {dateFrom || "…"} → {dateTo || "…"}
                  <button
                    onClick={() => {
                      setDateFrom("");
                      setDateTo("");
                    }}
                  >
                    <X className="w-3 h-3 ml-1" />
                  </button>
                </span>
              )}
              <span className="text-[11px] text-slate-500 self-center ml-auto">
                {filteredRecords.length} of {records.length}
              </span>
            </div>
          )}
        </div>

        {/* ── Record list ────────────────────────────────────────────────── */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : filteredRecords.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 rounded-2xl
                       border border-slate-200 dark:border-white/5
                       bg-slate-50 dark:bg-white/2 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/40 flex items-center justify-center mb-5">
              <FileText className="w-7 h-7 text-slate-400 dark:text-slate-600" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">
              No passes found
            </h3>
            <p className="text-sm text-slate-500 max-w-xs">
              {filterStatus === "All"
                ? "No mineral transport passes exist yet."
                : `No passes match the "${filterStatus}" filter.`}
            </p>
            {filterStatus !== "All" && (
              <button
                onClick={() => setFilterStatus("All")}
                className="mt-4 text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-semibold"
              >
                Clear filter
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2.5 sm:space-y-3"
          >
            {/* Column headers (sm+) */}
            <div className="hidden sm:grid grid-cols-[2fr_1.5fr_1fr_1.5fr_auto] gap-4 px-5 py-1.5">
              {[
                "Pass / Licensee",
                "Destination",
                "Status",
                "Valid Until",
                "Actions",
              ].map((h) => (
                <span
                  key={h}
                  className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest"
                >
                  {h}
                </span>
              ))}
            </div>

            {filteredRecords.map((record, i) => {
              const fd = record.form_data ?? {};
              return (
                <RecordRow
                  key={record.id}
                  record={record}
                  index={i}
                  effectiveStatus={getEffectiveStatus(record)}
                  passNumber={getFormValue(
                    fd,
                    ["eform_c_no", "serial_number", "serialNumber"],
                    record.id.slice(0, 8),
                  )}
                  licensee={getFormValue(
                    fd,
                    [
                      "name_of_licensee",
                      "licensee_name",
                      "nameOfLicenseeOfLease",
                    ],
                    "Unknown Licensee",
                  )}
                  mineral={getFormValue(
                    fd,
                    ["name_of_mineral", "mineral_name", "mineralName"],
                    "N/A",
                  )}
                  quantity={getFormValue(
                    fd,
                    ["quantity_transported", "quantityInTonnes"],
                    "0",
                  )}
                  destination={getFormValue(
                    fd,
                    [
                      "destination_delivery_address",
                      "destination_district",
                      "nameOfConsignee",
                    ],
                    "Unknown",
                  )}
                  validUptoDate={getValidUptoDate(record)}
                  onDownload={handleDownloadPDF}
                />
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
