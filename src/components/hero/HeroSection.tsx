"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Shield, Zap, ScanLine } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { EncryptedText } from "@/components/ui/encrypted-text";
import { SparkleButton } from "@/components/ui/SparkleButton";

// ─── CANVAS DOT GRID with cursor repulsion (replaces hundreds of motion divs) ─

interface DotData {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  baseOpacity: number;
}

function useDotCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  spacing = 30,
  dotRadius = 1.3,
  repulsionRadius = 110,
  repulsionStrength = 0.15,
  returnSpeed = 0.06
) {
  const dotsRef = useRef<DotData[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);

  const buildGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const dots: DotData[] = [];
    const cols = Math.ceil(w / spacing);
    const rows = Math.ceil(h / spacing);

    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        const x = c * spacing;
        const y = r * spacing;
        const baseOpacity = 0.12 + ((r + c) % 3) * 0.08;
        dots.push({ baseX: x, baseY: y, x, y, vx: 0, vy: 0, opacity: baseOpacity, baseOpacity });
      }
    }
    dotsRef.current = dots;
  }, [canvasRef, spacing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Size canvas to container
    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);
      buildGrid();
    };
    resize();

    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    // Mouse tracking
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };
    canvas.addEventListener("mousemove", onMove, { passive: true });
    canvas.addEventListener("mouseleave", onLeave, { passive: true });

    // Check if dark mode
    const isDark = () => document.documentElement.classList.contains("dark");

    // Animation loop
    const tick = () => {
      const dots = dotsRef.current;
      const { x: mx, y: my } = mouseRef.current;
      const w = canvas.width / (Math.min(window.devicePixelRatio || 1, 2));
      const h = canvas.height / (Math.min(window.devicePixelRatio || 1, 2));

      ctx.clearRect(0, 0, w, h);

      const dark = isDark();
      const baseR = dark ? 34 : 6;
      const baseG = dark ? 211 : 182;
      const baseB = dark ? 238 : 212;

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];

        // Repulsion from mouse
        const ddx = dot.baseX - mx;
        const ddy = dot.baseY - my;
        const dist = Math.sqrt(ddx * ddx + ddy * ddy);

        if (dist < repulsionRadius && dist > 0) {
          const force = (1 - dist / repulsionRadius) * repulsionStrength;
          const angle = Math.atan2(ddy, ddx);
          dot.vx += Math.cos(angle) * force;
          dot.vy += Math.sin(angle) * force;

          // Brighten near cursor
          dot.opacity = Math.min(dot.baseOpacity + (1 - dist / repulsionRadius) * 0.45, 0.7);
        } else {
          // Decay opacity back
          dot.opacity += (dot.baseOpacity - dot.opacity) * 0.05;
        }

        // Spring back to base position
        dot.vx += (dot.baseX - dot.x) * returnSpeed;
        dot.vy += (dot.baseY - dot.y) * returnSpeed;

        // Damping
        dot.vx *= 0.82;
        dot.vy *= 0.82;

        dot.x += dot.vx;
        dot.y += dot.vy;

        // Draw
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${baseR}, ${baseG}, ${baseB}, ${dot.opacity})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
      ro.disconnect();
    };
  }, [canvasRef, buildGrid, dotRadius, repulsionRadius, repulsionStrength, returnSpeed]);
}

// ─── HERO SECTION ─────────────────────────────────────────────────────────────

export function HeroSection() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useDotCanvas(canvasRef);

  const showDashboard = !isLoading && isAuthenticated && !!user;

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.13, delayChildren: 0.15 } },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: 22 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 pb-20 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Ambient glow orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[550px] h-[550px] bg-cyan-500/12 dark:bg-cyan-500/8 rounded-full blur-[140px]" />
        <div className="absolute top-24 -right-32 w-[450px] h-[450px] bg-blue-600/10 dark:bg-blue-600/6 rounded-full blur-[120px]" />
        <div className="absolute -bottom-20 left-1/3 w-[500px] h-[280px] bg-indigo-500/8 dark:bg-indigo-500/4 rounded-full blur-[100px]" />
      </div>

      {/* Canvas dot grid — single element, single rAF loop */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-auto"
        aria-hidden="true"
      />

      {/* Content */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-4xl mx-auto text-center"
      >
        {/* Status badge */}
        <motion.div variants={item} className="mb-8">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-cyan-500/25 bg-cyan-500/[0.06] backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inset-0 rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            <span className="text-cyan-700 dark:text-cyan-300 text-xs sm:text-sm font-semibold tracking-wide">
              🇮🇳 UP Minerals Rules, 2018 — Compliant
            </span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={item}
          className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight leading-[1.05] mb-6"
        >
          <span className="block bg-linear-to-br from-slate-800 via-slate-700 to-slate-500 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
            Digital
          </span>
          <span className="block bg-linear-to-r from-cyan-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
            <EncryptedText
              text="eMineral Pass"
              revealDelayMs={55}
              flipDelayMs={25}
              encryptedClassName="text-slate-400 dark:text-slate-600/60"
              revealedClassName="text-transparent"
            />
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={item}
          className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10"
        >
          Generate tamper-proof QR transit passes for mineral transportation
          across Uttar Pradesh — in under 3 seconds.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={item}
          className="flex items-center justify-center gap-4 flex-wrap mb-14"
        >
          {showDashboard ? (
            <SparkleButton href="/dashboard/user" className="text-base px-8 py-3.5">
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </SparkleButton>
          ) : (
            <>
              <SparkleButton href="/auth/signup" className="text-base px-8 py-3.5">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </SparkleButton>
              <SparkleButton href="/auth/signin" variant="secondary" className="text-base px-7 py-3.5">
                Sign In
              </SparkleButton>
            </>
          )}
        </motion.div>

        {/* Trust strip */}
        <motion.div
          variants={item}
          className="flex items-center justify-center gap-6 sm:gap-8 text-xs sm:text-sm text-slate-500 dark:text-slate-400"
        >
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-cyan-500" />
            Instant PDF
          </span>
          <span className="hidden sm:block w-px h-4 bg-slate-300 dark:bg-slate-700" />
          <span className="flex items-center gap-1.5">
            <ScanLine className="w-4 h-4 text-cyan-500" />
            QR Verified
          </span>
          <span className="hidden sm:block w-px h-4 bg-slate-300 dark:bg-slate-700" />
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-cyan-500" />
            Government Grade
          </span>
        </motion.div>
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-28 bg-linear-to-t from-slate-50 dark:from-slate-950 to-transparent pointer-events-none" />
    </section>
  );
}

export default HeroSection;
