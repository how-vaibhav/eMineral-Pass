"use client";

import type { LucideIcon } from "lucide-react";
import { FileText, ShieldCheck, QrCode, FileDown, Building2, BadgeCheck } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

// ─── Constants ──────────────────────────────────────────────────────────────────

const TILT_MAX = 9;
const TILT_SPRING = { stiffness: 300, damping: 28 } as const;
const GLOW_SPRING = { stiffness: 180, damping: 22 } as const;

// ─── Data ────────────────────────────────────────────────────────────────────────

export interface SpotlightItem {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

const DEFAULT_ITEMS: SpotlightItem[] = [
  {
    icon: FileText,
    title: "Submit eForm-C",
    description: "Fill the official eForm-C with mineral type, quantity, vehicle, and destination.",
    color: "#60a5fa", // blue-400
  },
  {
    icon: ShieldCheck,
    title: "Instant Validation",
    description: "Automated compliance checks against UP Minerals Rules 2018.",
    color: "#2dd4bf", // cyan-400
  },
  {
    icon: QrCode,
    title: "QR Pass Generated",
    description: "Tamper-proof QR code attached to your digital pass instantly.",
    color: "#34d399", // emerald-400
  },
  {
    icon: FileDown,
    title: "PDF Issued",
    description: "Bilingual government-standard PDF (English + Hindi) with watermark.",
    color: "#fb923c", // orange-400
  },
  {
    icon: Building2,
    title: "Host Verification",
    description: "License Hosts securely scan QR codes and track passes at checkpoints.",
    color: "#fb7185", // rose-400
  },
  {
    icon: BadgeCheck,
    title: "Public Transparency",
    description: "Open API endpoint allows anyone to verify authentic passes.",
    color: "#a78bfa", // violet-400
  },
];

// ─── Card ────────────────────────────────────────────────────────────────────────

interface CardProps {
  item: SpotlightItem;
  dimmed: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}

function Card({ item, dimmed, onHoverStart, onHoverEnd }: CardProps) {
  const Icon = item.icon;
  const cardRef = useRef<HTMLDivElement>(null);

  const normX = useMotionValue(0.5);
  const normY = useMotionValue(0.5);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rawRotateX = useTransform(normY, [0, 1], [TILT_MAX, -TILT_MAX]);
  const rawRotateY = useTransform(normX, [0, 1], [-TILT_MAX, TILT_MAX]);

  const rotateX = useSpring(rawRotateX, TILT_SPRING);
  const rotateY = useSpring(rawRotateY, TILT_SPRING);
  const glowOpacity = useSpring(0, GLOW_SPRING);

  const background = useMotionTemplate`radial-gradient(350px circle at ${mouseX}px ${mouseY}px, ${item.color}25, transparent 80%)`;
  const borderBackground = useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, ${item.color}80, transparent 80%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) {
      return;
    }
    const rect = el.getBoundingClientRect();
    normX.set((e.clientX - rect.left) / rect.width);
    normY.set((e.clientY - rect.top) / rect.height);
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handleMouseEnter = () => {
    glowOpacity.set(1);
    onHoverStart();
  };

  const handleMouseLeave = () => {
    normX.set(0.5);
    normY.set(0.5);
    glowOpacity.set(0);
    onHoverEnd();
  };

  return (
    <motion.div
      animate={{
        scale: dimmed ? 0.96 : 1,
        opacity: dimmed ? 0.5 : 1,
      }}
      className={cn(
        "group relative flex flex-col gap-5 overflow-hidden rounded-[20px] p-6 backdrop-blur-xl",
        // Light
        "bg-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-200/60",
        // Dark
        "dark:bg-slate-900/60 dark:shadow-2xl dark:border-white/10",
        "transition-all duration-300"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      ref={cardRef}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1000,
      }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      {/* Animated Glowing Border (Visible only on hover) */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: borderBackground,
          padding: "1.5px", // Creates the border thickness
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />

      {/* Dynamic Hover Spotlight Layer */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[20px]"
        style={{
          opacity: glowOpacity,
          background: background,
        }}
      />

      {/* Shimmer sweep */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-[40%] -translate-x-full -skew-x-12 bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[350%]"
      />

      {/* Icon badge */}
      <div
        className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 shadow-sm"
        style={{
          background: `linear-gradient(135deg, ${item.color}25, ${item.color}05)`,
          boxShadow: `inset 0 0 0 1px ${item.color}40, 0 4px 12px ${item.color}15`,
        }}
      >
        <Icon size={22} strokeWidth={2} style={{ color: item.color }} className="drop-shadow-sm" />
      </div>

      {/* Text */}
      <div className="relative z-10 flex flex-col gap-2.5">
        <h3 className="font-bold text-[16px] text-slate-900 tracking-tight dark:text-white transition-colors">
          {item.title}
        </h3>
        <p className="text-[14px] text-slate-500 leading-relaxed dark:text-slate-400 font-medium">
          {item.description}
        </p>
      </div>

      {/* Accent bottom line */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-[3px] w-0 rounded-full transition-all duration-700 ease-out group-hover:w-full"
        style={{
          background: `linear-gradient(to right, ${item.color}90, transparent)`,
        }}
      />
    </motion.div>
  );
}

Card.displayName = "Card";

// ─── Main export ──────────────────────────────────────────────────────────────────

export interface SpotlightCardsProps {
  items?: SpotlightItem[];
  className?: string;
  isDark?: boolean;
}

export default function SpotlightCards({
  items = DEFAULT_ITEMS,
  className,
  isDark,
}: SpotlightCardsProps) {
  const [hoveredTitle, setHoveredTitle] = useState<string | null>(null);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl p-2",
        className
      )}
    >
      {/* Card grid */}
      <div className="relative grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card
            dimmed={hoveredTitle !== null && hoveredTitle !== item.title}
            item={item}
            key={item.title}
            onHoverEnd={() => setHoveredTitle(null)}
            onHoverStart={() => setHoveredTitle(item.title)}
          />
        ))}
      </div>
    </div>
  );
}
