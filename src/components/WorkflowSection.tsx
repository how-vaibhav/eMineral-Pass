"use client";

import React, { forwardRef, useRef } from "react";
import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/ui/AnimatedBeam";
import { motion } from "framer-motion";
import {
  FileText,
  ShieldCheck,
  QrCode,
  FileDown,
  Building2,
  BadgeCheck,
} from "lucide-react";
import SpotlightCards from "./ui/spotlight-cards";

// ─── Node Component ────────────────────────────────────────────────────────

interface NodeProps {
  className?: string;
  children?: React.ReactNode;
  label: string;
  sublabel?: string;
}

const Node = forwardRef<HTMLDivElement, NodeProps>(
  ({ className, children, label, sublabel }, ref) => {
    return (
      <div className="flex flex-col items-center gap-3">
        <div
          ref={ref}
          className={cn(
            "z-10 flex items-center justify-center rounded-2xl border",
            "shadow-lg transition-transform duration-300 hover:scale-105",
            className,
          )}
        >
          {children}
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight">
            {label}
          </p>
          {sublabel && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
              {sublabel}
            </p>
          )}
        </div>
      </div>
    );
  },
);
Node.displayName = "Node";

// ─── Central Hub ───────────────────────────────────────────────────────────

const Hub = forwardRef<HTMLDivElement, { className?: string }>(
  ({ className }, ref) => {
    return (
      <div className="flex flex-col items-center gap-3">
        <div
          ref={ref}
          className={cn(
            "z-10 flex items-center justify-center rounded-full border-2",
            "w-24 h-24 shadow-2xl transition-transform duration-300 hover:scale-105",
            "bg-linear-to-br from-cyan-500 to-blue-600",
            "border-cyan-400/60 shadow-cyan-500/40",
            className,
          )}
        >
          {/* Mineral Track logo / shield */}
          <div className="flex flex-col items-center gap-0.5">
            <ShieldCheck className="w-9 h-9 text-white drop-shadow" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-cyan-600 dark:text-cyan-400 leading-tight">
            Mineral Track
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Processing Engine</p>
        </div>
      </div>
    );
  },
);
Hub.displayName = "Hub";

// ─── Main Component ────────────────────────────────────────────────────────

export function WorkflowBeamDiagram({ isDark }: { isDark: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Input nodes (left side)
  const formRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const vehicleRef = useRef<HTMLDivElement>(null);

  // Center
  const hubRef = useRef<HTMLDivElement>(null);

  // Output nodes (right side)
  const qrRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  const nodeBase =
    "w-16 h-16 border-slate-300 bg-white/90 shadow-sm dark:border-slate-700/80 dark:bg-slate-800/90 backdrop-blur-sm";

  return (
    <div className="w-full overflow-x-auto pb-6 snap-x touch-pan-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div
        ref={containerRef}
        className="relative flex min-h-[350px] min-w-[650px] sm:min-w-0 w-full items-center justify-center overflow-hidden py-8 px-4"
      >
        {/* ── Grid Layout ── */}
        <div className="flex w-full max-w-xl items-center justify-between px-2 sm:px-6 scale-90 sm:scale-100 mx-auto">
          {/* Left column — Inputs */}
        <div className="flex flex-col items-center gap-8">
          <Node
            ref={formRef}
            label="eForm-C"
            sublabel="Transport form"
            className={`${nodeBase} border-blue-500/50 shadow-blue-500/20`}
          >
            <FileText className="w-7 h-7 text-blue-400" />
          </Node>

          <Node
            ref={userRef}
            label="Transport User"
            sublabel="Verified identity"
            className={`${nodeBase} border-cyan-500/50 shadow-cyan-500/20`}
          >
            <div className="text-2xl">👤</div>
          </Node>

          <Node
            ref={vehicleRef}
            label="Vehicle Data"
            sublabel="Challan details"
            className={`${nodeBase} border-indigo-500/50 shadow-indigo-500/20`}
          >
            <div className="text-2xl">🚛</div>
          </Node>
        </div>

        {/* Center — Hub */}
        <Hub ref={hubRef} />

        {/* Right column — Outputs */}
        <div className="flex flex-col items-center gap-8">
          <Node
            ref={qrRef}
            label="QR Pass"
            sublabel="Unique per trip"
            className={`${nodeBase} border-emerald-500/50 shadow-emerald-500/20`}
          >
            <QrCode className="w-7 h-7 text-emerald-400" />
          </Node>

          <Node
            ref={pdfRef}
            label="Official PDF"
            sublabel="Gov't standard"
            className={`${nodeBase} border-orange-500/50 shadow-orange-500/20`}
          >
            <FileDown className="w-7 h-7 text-orange-400" />
          </Node>

          <Node
            ref={hostRef}
            label="License Host"
            sublabel="Portal access"
            className={`${nodeBase} border-rose-500/50 shadow-rose-500/20`}
          >
            <Building2 className="w-7 h-7 text-rose-400" />
          </Node>
        </div>
      </div>

      {/* ── Beams: Inputs → Hub ── */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={formRef}
        toRef={hubRef}
        curvature={-25}
        gradientStartColor="#3b82f6"
        gradientStopColor="#06b6d4"
        duration={3.5}
        delay={0}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={userRef}
        toRef={hubRef}
        curvature={0}
        gradientStartColor="#06b6d4"
        gradientStopColor="#0ea5e9"
        duration={3.5}
        delay={0.6}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={vehicleRef}
        toRef={hubRef}
        curvature={25}
        gradientStartColor="#6366f1"
        gradientStopColor="#06b6d4"
        duration={3.5}
        delay={1.2}
      />

      {/* ── Beams: Hub → Outputs ── */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={hubRef}
        toRef={qrRef}
        curvature={-25}
        reverse
        gradientStartColor="#06b6d4"
        gradientStopColor="#10b981"
        duration={3.5}
        delay={0.3}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={hubRef}
        toRef={pdfRef}
        curvature={0}
        reverse
        gradientStartColor="#06b6d4"
        gradientStopColor="#f97316"
        duration={3.5}
        delay={0.9}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={hubRef}
        toRef={hostRef}
        curvature={25}
        reverse
        gradientStartColor="#06b6d4"
        gradientStopColor="#f43f5e"
        duration={3.5}
        delay={1.5}
      />
      </div>
    </div>
  );
}

// ─── Full Section Export ───────────────────────────────────────────────────

export function WorkflowSection({ isDark }: { isDark: boolean }) {
  return (
    <section
      className={`relative py-24 px-6 overflow-hidden transition-colors ${
        isDark ? "bg-slate-950" : "bg-slate-50"
      }`}
    >
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-2xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-500/5 rounded-full blur-2xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-6">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-cyan-600 dark:text-cyan-400 text-sm font-semibold tracking-wide">
              End-to-End Workflow
            </span>
          </div>
          <h2 className={`text-4xl sm:text-5xl font-bold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
            How Mineral Track Works
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            From form submission to verified digital pass — the entire mineral
            transportation authorization flow, automated and
            government-compliant.
          </p>
        </motion.div>

        {/* Beam Diagram */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={`rounded-xl border overflow-hidden mb-12 ${
            isDark
              ? "bg-slate-900/80 border-white/10"
              : "bg-white border-slate-200/60"
          } backdrop-blur-md shadow-xl`}
        >
          {/* Diagram header bar */}
          <div className={`flex items-center gap-2 px-5 py-3 border-b ${
            isDark ? "border-slate-700/60 bg-slate-800/50" : "border-slate-200 bg-slate-50"
          }`}>
            <span className="w-3 h-3 rounded-full bg-rose-500/70" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
            <span className="ml-3 text-xs text-slate-500 font-mono">
              mineral-track / workflow-engine
            </span>
          </div>
          <WorkflowBeamDiagram isDark={isDark} />
          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-6 pb-5 border-t border-slate-700/40 pt-4">
            <LegendItem color="bg-blue-500" label="Form inputs" />
            <LegendItem color="bg-cyan-500" label="Mineral Track engine" />
            <LegendItem color="bg-emerald-500" label="QR pass output" />
            <LegendItem color="bg-orange-500" label="PDF output" />
            <LegendItem color="bg-rose-500" label="Host portal" />
          </div>
        </motion.div>

        {/* Steps grid */}
        <SpotlightCards isDark={isDark} />
      </div>
    </section>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}
