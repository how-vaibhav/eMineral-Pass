"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Eye, Download, Trash2, Clock, QrCode } from "lucide-react";
import type { UserRecord } from "@/app/dashboard/user/page";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const map: Record<string, { label: string; className: string; dot: string }> =
    {
      active: {
        label: "Active",
        className:
          "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30",
        dot: "bg-emerald-500 animate-pulse",
      },
      expired: {
        label: "Expired",
        className:
          "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30",
        dot: "bg-red-500",
      },
      archived: {
        label: "Archived",
        className:
          "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/15 dark:text-slate-400 dark:border-slate-500/30",
        dot: "bg-slate-400",
      },
    };
  const cfg = map[status] ?? map.archived;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Pass Card ────────────────────────────────────────────────────────────────

interface PassCardProps {
  record: UserRecord;
  passNumber: string;
  mineral: string;
  quantity: string;
  destination: string;
  effectiveStatus: string;
  validUptoDate: Date | null;
  isDeleting: boolean;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
  index: number;
}

export function PassCard({
  record,
  passNumber,
  mineral,
  quantity,
  destination,
  effectiveStatus,
  validUptoDate,
  isDeleting,
  onDelete,
  onDownload,
  index,
}: PassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative overflow-hidden rounded-2xl
                 border border-slate-200 dark:border-white/6
                 bg-white dark:bg-white/3
                 hover:border-slate-300 dark:hover:border-white/12
                 hover:bg-slate-50 dark:hover:bg-white/5
                 shadow-sm dark:shadow-none
                 backdrop-blur-sm transition-all duration-300"
    >
      {/* Left accent bar based on status */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-0.75 rounded-l-2xl transition-colors ${
          effectiveStatus === "active"
            ? "bg-emerald-500"
            : effectiveStatus === "expired"
              ? "bg-red-500"
              : "bg-slate-300 dark:bg-slate-600"
        }`}
      />

      <div className="pl-5 pr-4 sm:pr-5 py-4 sm:py-5">
        {/* Mobile layout: stacked */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          {/* QR icon + pass info */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-500 dark:text-cyan-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-mono text-cyan-600 dark:text-cyan-400/80 mb-0.5 tracking-wider">
                EMP-{passNumber}
              </p>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-tight truncate">
                {mineral}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{quantity} Tonnes</p>
            </div>
          </div>

          {/* Destination + Status on mobile: inline row */}
          <div className="flex items-center gap-3 flex-wrap sm:contents">
            <div className="flex items-center gap-1.5 sm:min-w-32.5">
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0" />
              <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 truncate max-w-30 sm:max-w-none">
                {destination}
              </span>
            </div>

            <div className="shrink-0">
              <StatusBadge status={effectiveStatus} />
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 sm:min-w-37.5">
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
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
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 border-t border-slate-100 dark:border-white/[0.04] pt-3 sm:border-0 sm:pt-0">
            <Link
              href={`/records/${record.id}`}
              className="p-2 rounded-lg text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
              title="View details"
            >
              <Eye className="w-4 h-4" />
            </Link>

            {record.pdf_url ? (
              <button
                onClick={() => onDownload(record.id)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold
                           bg-cyan-50 border border-cyan-200 text-cyan-700
                           dark:bg-cyan-500/10 dark:border-cyan-500/20 dark:text-cyan-400
                           hover:bg-cyan-100 dark:hover:bg-cyan-500/20 transition-all"
                title="Download PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden xs:inline sm:inline">PDF</span>
              </button>
            ) : (
              <span
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold
                           bg-slate-50 border border-slate-200 text-slate-400
                           dark:bg-slate-800/60 dark:border-slate-700/40 dark:text-slate-600
                           cursor-not-allowed"
                title="PDF generating…"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pending</span>
              </span>
            )}

            <button
              onClick={() => onDelete(record.id)}
              disabled={isDeleting}
              className={`p-2 rounded-lg transition-all ${
                isDeleting
                  ? "opacity-40 cursor-not-allowed"
                  : "text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
              }`}
              title={isDeleting ? "Deleting…" : "Delete"}
            >
              {isDeleting ? (
                <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
