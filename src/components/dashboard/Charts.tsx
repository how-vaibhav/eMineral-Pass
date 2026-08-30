"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DataPoint {
  label: string;
  value: number;
}

// ─── Line Chart ───────────────────────────────────────────────────────────────

interface LineChartProps {
  data: DataPoint[];
  /** Stroke colour – any CSS colour */
  lineColor?: string;
  /** Gradient stop (top) */
  gradientTop?: string;
  /** Gradient stop (bottom) */
  gradientBottom?: string;
  /** SVG viewport height (px) */
  height?: number;
  title?: string;
  subtitle?: string;
}

export function LineChart({
  data,
  lineColor = "#06b6d4",
  gradientTop = "rgba(6,182,212,0.28)",
  gradientBottom = "rgba(6,182,212,0)",
  height = 160,
  title,
  subtitle,
}: LineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const W = 600; // viewBox width (unitless)
  const H = height;
  const padL = 10;
  const padR = 10;
  const padT = 18;
  const padB = 28;

  const max = useMemo(() => Math.max(...data.map((d) => d.value), 1), [data]);

  // Map data → SVG coordinates
  const pts = useMemo(() => {
    const n = data.length;
    return data.map((d, i) => {
      const x = padL + (i / (n - 1)) * (W - padL - padR);
      const y = padT + (1 - d.value / max) * (H - padT - padB);
      return { x, y, ...d };
    });
  }, [data, max, H]);

  // Build smooth cubic-bezier path
  const linePath = useMemo(() => {
    if (pts.length < 2) return "";
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cpX = (prev.x + curr.x) / 2;
      d += ` C ${cpX},${prev.y} ${cpX},${curr.y} ${curr.x},${curr.y}`;
    }
    return d;
  }, [pts]);

  // Area fill (close path at bottom)
  const areaPath = useMemo(() => {
    if (pts.length < 2) return "";
    const last = pts[pts.length - 1];
    const first = pts[0];
    const baseline = H - padB;
    return `${linePath} L ${last.x},${baseline} L ${first.x},${baseline} Z`;
  }, [linePath, pts, H]);

  // Grid lines (4 horizontal)
  const gridLines = [0.25, 0.5, 0.75, 1].map((frac) => ({
    y: padT + (1 - frac) * (H - padT - padB),
    label: Math.round(frac * max),
  }));

  const gradId = "lcGrad";

  return (
    <div className="w-full select-none">
      {/* Header */}
      {(title || subtitle) && (
        <div className="mb-3">
          {title && (
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              {title}
            </p>
          )}
          {subtitle && (
            <p className="text-base font-bold text-white mt-0.5">{subtitle}</p>
          )}
        </div>
      )}

      {/* SVG */}
      <div className="relative w-full overflow-hidden rounded-xl">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height={H}
          className="overflow-visible"
          onMouseLeave={() => setHoverIdx(null)}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={gradientTop} />
              <stop offset="100%" stopColor={gradientBottom} />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          {gridLines.map((g, i) => (
            <g key={i}>
              <line
                x1={padL}
                y1={g.y}
                x2={W - padR}
                y2={g.y}
                stroke="#1e293b"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={padL - 4}
                y={g.y + 4}
                textAnchor="end"
                fontSize="9"
                fill="#475569"
              >
                {g.label}
              </text>
            </g>
          ))}

          {/* Area fill */}
          <motion.path 
            d={areaPath} 
            fill={`url(#${gradId})`} 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          />

          {/* Line */}
          <motion.path
            d={linePath}
            fill="none"
            stroke={lineColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />

          {/* Hover crosshair + tooltip */}
          {hoverIdx !== null && pts[hoverIdx] && (
            <>
              {/* Vertical rule */}
              <line
                x1={pts[hoverIdx].x}
                y1={padT}
                x2={pts[hoverIdx].x}
                y2={H - padB}
                stroke={lineColor}
                strokeWidth="1"
                strokeOpacity="0.4"
                strokeDasharray="3 3"
              />
              {/* Tooltip bubble */}
              <g>
                <rect
                  x={Math.min(pts[hoverIdx].x - 18, W - 50)}
                  y={pts[hoverIdx].y - 28}
                  width="36"
                  height="18"
                  rx="5"
                  fill="#0f172a"
                  stroke={lineColor}
                  strokeWidth="1"
                  strokeOpacity="0.6"
                />
                <text
                  x={Math.min(pts[hoverIdx].x, W - 32)}
                  y={pts[hoverIdx].y - 15}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="700"
                  fill={lineColor}
                >
                  {pts[hoverIdx].value}
                </text>
              </g>
            </>
          )}

          {/* Data dots */}
          {pts.map((p, i) => (
            <g
              key={i}
              style={{ cursor: "crosshair" }}
              onMouseEnter={() => setHoverIdx(i)}
            >
              {/* Invisible hover target (fat) */}
              <rect
                x={p.x - (W / data.length / 2)}
                y={padT}
                width={W / data.length}
                height={H - padT - padB}
                fill="transparent"
              />
              {/* Outer ring (always visible on hover, subtle otherwise) */}
              <circle
                cx={p.x}
                cy={p.y}
                r={hoverIdx === i ? 7 : 4}
                fill={hoverIdx === i ? lineColor : "#0f172a"}
                stroke={lineColor}
                strokeWidth={hoverIdx === i ? 2.5 : 1.5}
                style={{ transition: "r 0.15s ease, fill 0.15s ease" }}
              />
              {/* Inner dot on hover */}
              {hoverIdx === i && (
                <circle cx={p.x} cy={p.y} r={2.5} fill="#0f172a" />
              )}
            </g>
          ))}

          {/* X-axis labels */}
          {pts.map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={H - 4}
              textAnchor="middle"
              fontSize="9"
              fontWeight={hoverIdx === i ? "700" : "500"}
              fill={hoverIdx === i ? lineColor : "#475569"}
              style={{ transition: "fill 0.15s" }}
            >
              {p.label}
            </text>
          ))}

          {/* Baseline */}
          <line
            x1={padL}
            y1={H - padB}
            x2={W - padR}
            y2={H - padB}
            stroke="#1e293b"
            strokeWidth="1"
          />
        </svg>
      </div>
    </div>
  );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────

interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  slices: DonutSlice[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerSub?: string;
}

export function DonutChart({
  slices,
  size = 140,
  strokeWidth = 22,
  centerLabel,
  centerSub,
}: DonutChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const total = slices.reduce((s, d) => s + d.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  let cumulative = 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          {/* Background ring */}
          <circle
            cx={cx} cy={cy} r={radius}
            fill="none" stroke="#1e293b" strokeWidth={strokeWidth}
          />

          {total === 0 ? (
            <circle
              cx={cx} cy={cy} r={radius}
              fill="none" stroke="#334155" strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
            />
          ) : (
            slices.map((slice, i) => {
              if (slice.value === 0) return null;
              const fraction = slice.value / total;
              const dash = fraction * circumference;
              const offset = circumference - cumulative * circumference;
              cumulative += fraction;

              return (
                <motion.circle
                  key={i}
                  cx={cx} cy={cy} r={radius}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth={hovered === i ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={`${dash} ${circumference}`}
                  strokeDashoffset={offset}
                  strokeLinecap="butt"
                  transform={`rotate(-90 ${cx} ${cy})`}
                  style={{ transition: "stroke-width 0.2s ease" }}
                  initial={{ strokeDasharray: `0 ${circumference}` }}
                  animate={{ strokeDasharray: `${dash} ${circumference}` }}
                  transition={{ duration: 1, delay: i * 0.15, ease: "easeOut" }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  className="cursor-pointer"
                />
              );
            })
          )}
        </svg>

        {/* Centre label */}
        {(centerLabel || centerSub) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {hovered !== null ? (
              <>
                <p className="text-2xl font-black leading-none" style={{ color: slices[hovered]?.color }}>
                  {slices[hovered]?.value}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                  {slices[hovered]?.label}
                </p>
              </>
            ) : (
              <>
                {centerLabel && <p className="text-2xl font-black text-white leading-none">{centerLabel}</p>}
                {centerSub   && <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{centerSub}</p>}
              </>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
        {slices.map((s, i) => (
          <div
            key={s.label}
            className="flex items-center gap-1.5 cursor-pointer"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform"
              style={{
                backgroundColor: s.color,
                transform: hovered === i ? "scale(1.4)" : "scale(1)",
              }}
            />
            <span className={`text-xs transition-colors ${hovered === i ? "text-white" : "text-slate-400"}`}>
              {s.label}
            </span>
            <span className="text-xs font-bold text-white">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
