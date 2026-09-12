"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useInView, animate } from "framer-motion";
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

// Advanced Animated Counter Component
function AnimatedCounter({ value, displayValue }: { value: number; displayValue?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  useEffect(() => {
    if (isInView && ref.current) {
      const controls = animate(0, value, {
        duration: 2,
        ease: [0.22, 1, 0.36, 1], // Custom spring-like cubic bezier
        onUpdate: (latest) => {
          if (ref.current) {
            if (displayValue && displayValue.match(/[a-zA-Z]+/)) {
               const suffix = displayValue.match(/[a-zA-Z]+/)?.[0] || "";
               const targetNumber = parseFloat(displayValue.replace(/[a-zA-Z]+/, ""));
               const ratio = latest / value;
               const currentVal = ratio * targetNumber;
               // Format elegantly: 12.0k -> 12k
               const formatted = currentVal % 1 === 0 ? currentVal.toFixed(0) : currentVal.toFixed(1);
               ref.current.textContent = formatted.replace(".0", "") + suffix;
            } else {
               ref.current.textContent = Math.floor(latest).toLocaleString();
            }
          }
        }
      });
      return () => controls.stop();
    }
  }, [isInView, value, displayValue]);

  return <span ref={ref}>0</span>;
}

export function FunnelChart({
  data,
  className,
  layers = 3,
  gap = 6,
}: FunnelChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
    <div ref={containerRef} className={cn("relative w-full aspect-[4/3] sm:aspect-[21/9] group/funnel", className)}>
      
      {/* ─── ADVANCED MORPHING SVG LAYER ──────────────────────── */}
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
          
          <linearGradient id="glow-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(6,182,212,0)" />
            <stop offset="50%" stopColor="rgba(6,182,212,0.4)" />
            <stop offset="100%" stopColor="rgba(6,182,212,0)" />
          </linearGradient>
        </defs>

        {isMounted && data.map((stage, i) => {
          // Dynamic Expansion Logic: Expand hovered, slightly compress others
          const isHovered = hoveredIndex === i;
          const isDimmed = hoveredIndex !== null && hoveredIndex !== i;
          
          let expansionFactor = 1;
          if (isHovered) expansionFactor = 1.15; // Expand significantly on hover
          if (isDimmed) expansionFactor = 0.9;   // Compress slightly to make room mentally

          // Use a logarithmic scale so tiny values don't vanish visually
          const getScale = (val: number) => {
            if (val <= 0) return 0;
            const minFloor = 0.15;
            const logRatio = Math.log(val) / Math.log(maxValue);
            return minFloor + (1 - minFloor) * logRatio;
          };

          const vL = getScale(stage.value) * expansionFactor;
          const vR = getScale(i < data.length - 1 ? data[i + 1].value : stage.value * 0.75) * expansionFactor;

          const hL = viewBoxHeight * vL;
          const hR = viewBoxHeight * vR;

          const x0 = i * segmentWidth + gap / 2;
          const x1 = (i + 1) * segmentWidth - gap / 2;
          const cpOffset = (x1 - x0) * 0.5;

          return (
            <g key={stage.label}>
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
                    animate={{
                      d: pathData,
                      opacity: isDimmed ? layerOpacities[layerIdx] * 0.3 : (isHovered ? layerOpacities[layerIdx] + 0.3 : layerOpacities[layerIdx]),
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 25, mass: 0.8 }}
                    fill="url(#funnel-gradient)"
                    initial={{ opacity: 0, scaleY: 0, transformOrigin: "center" }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
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

          return (
            <div
              key={stage.label}
              className="flex-1 h-full relative cursor-pointer group"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onTouchStart={() => setHoveredIndex(i)}
            >
              {/* Holographic Glare Effect */}
              <div 
                className={cn(
                  "absolute inset-0 pointer-events-none overflow-hidden rounded-xl transition-opacity duration-500",
                  isHovered ? "opacity-100" : "opacity-0"
                )}
              >
                <motion.div
                  initial={{ y: "100%" }}
                  animate={isHovered ? { y: "-100%" } : { y: "100%" }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="w-full h-[200%] bg-gradient-to-t from-transparent via-white/10 dark:via-white/5 to-transparent rotate-12 blur-md"
                />
              </div>

              {/* Interaction highlight indicator (small bar at the top) */}
              <div 
                className={cn(
                  "absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1.5 rounded-b-md transition-all duration-300 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]",
                  isHovered ? "opacity-100 scale-x-100 translate-y-0" : "opacity-0 scale-x-0 -translate-y-2"
                )}
              />

              <div 
                className={cn(
                  "w-full h-full flex flex-col items-center justify-center transition-all duration-500",
                  isDimmed ? "opacity-30 scale-95 blur-[2px]" : "opacity-100 scale-100",
                  isHovered ? "scale-110 -translate-y-2" : ""
                )}
              >
                {/* Value Text with Animated Counter */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: i * 0.1 + 0.2 }}
                  className="flex flex-col items-center relative z-10"
                >
                  <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white drop-shadow-md tracking-tight">
                    <AnimatedCounter value={stage.value} displayValue={stage.displayValue} />
                  </span>
                  
                  {/* Removed Percentage Pill since data points are in different units */}
                </motion.div>
              </div>

              {/* Stage Label (Bottom Aligned) */}
              <div className="absolute bottom-6 left-0 right-0 text-center px-2">
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 + 0.4 }}
                  className={cn(
                    "block text-xs sm:text-sm md:text-base lg:text-lg font-bold transition-all duration-300",
                    isHovered 
                      ? "text-cyan-600 dark:text-cyan-400 scale-110 -translate-y-1 drop-shadow-sm" 
                      : "text-slate-600 dark:text-slate-400"
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

