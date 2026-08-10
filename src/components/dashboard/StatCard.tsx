"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  accent: string;   // Tailwind text colour e.g. "text-cyan-400"
  bg: string;       // Tailwind bg colour   e.g. "bg-cyan-500/10"
  border: string;   // Tailwind border      e.g. "border-cyan-500/20"
  trend?: string;
  delay?: number;
}

export function StatCard({
  label,
  value,
  icon,
  accent,
  bg,
  border,
  trend,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`relative overflow-hidden rounded-2xl border ${border} ${bg}
                  bg-white/80 dark:bg-transparent
                  border-slate-200 dark:${border}
                  p-4 sm:p-5 backdrop-blur-sm`}
    >
      {/* Glow accent */}
      <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-20 ${bg.replace("/10", "")}`} />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
            {label}
          </p>
          <p className={`text-2xl sm:text-3xl font-black ${accent}`}>{value}</p>
          {trend && (
            <p className="text-xs text-slate-500 mt-1.5">{trend}</p>
          )}
        </div>
        <div className={`mt-0.5 p-2 sm:p-2.5 rounded-xl ${bg} ${accent} border ${border} shrink-0`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
