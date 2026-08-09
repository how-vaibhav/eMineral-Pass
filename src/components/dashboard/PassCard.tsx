"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin, Eye, Download, Trash2, Clock, QrCode,
} from "lucide-react";
import type { UserRecord } from "@/app/dashboard/user/page";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const map: Record<string, { label: string; className: string }> = {
    active:   { label: "Active",   className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
    expired:  { label: "Expired",  className: "bg-red-500/15 text-red-400 border-red-500/30" },
    archived: { label: "Archived", className: "bg-slate-500/15 text-slate-400 border-slate-500/30" },
  };
  const cfg = map[status] ?? { label: status, className: "bg-slate-500/15 text-slate-400 border-slate-500/30" };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === "active" ? "bg-emerald-400 animate-pulse" : "bg-current"}`} />
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
      className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] hover:border-white/[0.12] hover:bg-white/[0.05] backdrop-blur-sm transition-all duration-300"
    >
      {/* Left accent bar based on status */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl transition-colors ${
          effectiveStatus === "active"
            ? "bg-emerald-500"
            : effectiveStatus === "expired"
            ? "bg-red-500"
            : "bg-slate-600"
        }`}
      />

      <div className="pl-5 pr-5 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">

          {/* QR icon + pass info */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-mono text-cyan-400/80 mb-0.5 tracking-wider">
                EMP-{passNumber}
              </p>
              <h3 className="font-bold text-white text-base leading-tight truncate">{mineral}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{quantity} Tonnes</p>
            </div>
          </div>

          {/* Destination */}
          <div className="flex items-center gap-2 min-w-[130px]">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="text-sm text-slate-300 truncate">{destination}</span>
          </div>

          {/* Status */}
          <div className="shrink-0">
            <StatusBadge status={effectiveStatus} />
          </div>

          {/* Valid date */}
          <div className="flex items-center gap-2 text-xs text-slate-500 min-w-[150px]">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>{validUptoDate ? validUptoDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/records/${record.id}`}
              className="p-2 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
              title="View details"
            >
              <Eye className="w-4 h-4" />
            </Link>

            {record.pdf_url ? (
              <button
                onClick={() => onDownload(record.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-all"
                title="Download PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">PDF</span>
              </button>
            ) : (
              <span
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/60 border border-slate-700/40 text-slate-600 cursor-not-allowed"
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
                  : "text-slate-600 hover:text-red-400 hover:bg-red-500/10"
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
