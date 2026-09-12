"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface FunnelStage {
  label: string;
  value: number;
  displayValue?: string;
}

export interface FunnelChartProps {
  data: FunnelStage[];
  className?: string;
  layers?: number;
  gap?: number;
}

export function FunnelChart({
  data,
  className,
  layers = 3,
  gap = 6,
}: FunnelChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!data || data.length === 0) return null;

  const maxValue = data[0].value;
  const viewBoxWidth = 1200;
  const viewBoxHeight = 500;
  const centerY = viewBoxHeight / 2;
  const segmentWidth = viewBoxWidth / data.length;

  const layerScales = Array.from({ length: layers }, (_, i) => 1 - (i * 0.25));
  const layerOpacities = Array.from({ length: layers }, (_, i) => 0.15 + (i * 0.25));

  return (
    <div className={cn("relative w-full aspect-[4/3] sm:aspect-[21/9]", className)}>
      {/* ─── SVG BACKGROUND LAYER ───────────────────────────────── */}
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-2xl"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="funnel-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>

        {isMounted && data.map((stage, i) => {
          const vL = stage.value / maxValue;
          const vR = i < data.length - 1 ? data[i + 1].value / maxValue : vL * 0.75;

          const hL = viewBoxHeight * vL;
          const hR = viewBoxHeight * vR;

          const x0 = i * segmentWidth + gap / 2;
          const x1 = (i + 1) * segmentWidth - gap / 2;
          const cpOffset = (x1 - x0) * 0.5;

          const isHovered = hoveredIndex === i;
          const isDimmed = hoveredIndex !== null && hoveredIndex !== i;

          return (
            <g
              key={stage.label}
              className="transition-opacity duration-500 ease-out"
              style={{ opacity: isDimmed ? 0.3 : 1 }}
            >
              {layerScales.map((scale, layerIdx) => {
                const scaledHL = hL * scale;
                const scaledHR = hR * scale;

                const topY0 = centerY - scaledHL / 2;
                const topY1 = centerY - scaledHR / 2;
                const botY1 = centerY + scaledHR / 2;
                const botY0 = centerY + scaledHL / 2;

                const pathData = `
                  M ${x0},${topY0}
                  C ${x0 + cpOffset},${topY0} ${x1 - cpOffset},${topY1} ${x1},${topY1}
                  L ${x1},${botY1}
                  C ${x1 - cpOffset},${botY1} ${x0 + cpOffset},${botY0} ${x0},${botY0}
                  Z
                `;

                return (
                  <motion.path
                    key={layerIdx}
                    d={pathData}
                    fill="url(#funnel-gradient)"
                    initial={{ opacity: 0, scaleY: 0, transformOrigin: "center" }}
                    whileInView={{ opacity: layerOpacities[layerIdx], scaleY: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{
                      duration: 0.8,
                      delay: i * 0.1 + layerIdx * 0.1,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    animate={{
                      opacity: isHovered 
                        ? layerOpacities[layerIdx] + 0.2 
                        : layerOpacities[layerIdx],
                      scaleY: isHovered ? 1.05 : 1,
                    }}
                    className="will-change-transform"
                  />
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* ─── HTML INTERACTIVE & TEXT LAYER ───────────────────────── */}
      <div className="absolute inset-0 flex w-full h-full">
        {data.map((stage, i) => {
          const isHovered = hoveredIndex === i;
          const isDimmed = hoveredIndex !== null && hoveredIndex !== i;
          const percentage = Math.round((stage.value / maxValue) * 100);

          return (
            <div
              key={stage.label}
              className="flex-1 h-full relative cursor-pointer group"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onTouchStart={() => setHoveredIndex(i)}
            >
              {/* Interaction highlight indicator (small bar at the top) */}
              <div 
                className={cn(
                  "absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 rounded-b-md transition-all duration-300 bg-cyan-500",
                  isHovered ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
                )}
              />

              <div 
                className={cn(
                  "w-full h-full flex flex-col items-center justify-center transition-all duration-500",
                  isDimmed ? "opacity-40 scale-95 blur-[1px]" : "opacity-100 scale-100",
                  isHovered ? "scale-105" : ""
                )}
              >
                {/* Value Text */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 + 0.4 }}
                  className="flex flex-col items-center"
                >
                  <span className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white drop-shadow-sm">
                    {stage.displayValue || stage.value}
                  </span>
                  
                  {/* Percentage Pill */}
                  <div className="mt-2 px-3 py-0.5 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm shadow-sm text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {percentage}%
                  </div>
                </motion.div>
              </div>

              {/* Stage Label (Bottom Aligned) */}
              <div className="absolute bottom-4 left-0 right-0 text-center px-1">
                <motion.span
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 + 0.5 }}
                  className={cn(
                    "block text-xs sm:text-sm md:text-base font-semibold transition-colors duration-300",
                    isHovered ? "text-cyan-600 dark:text-cyan-400" : "text-slate-600 dark:text-slate-400"
                  )}
                >
                  {stage.label}
                </motion.span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

