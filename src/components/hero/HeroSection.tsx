"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Shield, Zap, ScanLine } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { EncryptedText } from "@/components/ui/encrypted-text";
import Link from "next/link";

export function HeroSection() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const showDashboard = !isLoading && isAuthenticated && !!user;

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-500 pt-20">
      
      {/* --- Premium Background Effects --- */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMTI4LDEyOCwxMjgsMC4xKSIvPjwvc3ZnPg==')] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
        
        {/* Glowing Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[30rem] h-[30rem] bg-cyan-400/20 dark:bg-cyan-500/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[35rem] h-[35rem] bg-blue-500/20 dark:bg-blue-600/10 rounded-full blur-[130px] mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-5xl mx-auto text-center"
      >
        {/* Status Badge */}
        <motion.div variants={item} className="mb-10 flex justify-center">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inset-0 rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium tracking-wide">
              UP Minerals Rules, 2018 — Verified Compliant
            </span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={item}
          className="text-6xl sm:text-7xl md:text-[6.5rem] font-extrabold tracking-tight leading-[1.05] mb-8"
        >
          <span className="block text-slate-900 dark:text-white mb-2">
            The Digital
          </span>
          <span className="block bg-linear-to-r from-cyan-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent pb-4">
            <EncryptedText
              text="eMineral Pass"
              revealDelayMs={50}
              flipDelayMs={30}
              encryptedClassName="text-slate-300 dark:text-slate-700"
              revealedClassName="text-transparent"
            />
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={item}
          className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed mb-12 font-medium"
        >
          Generate tamper-proof QR transit passes for mineral transportation
          across Uttar Pradesh — <span className="text-slate-900 dark:text-slate-200 font-semibold">in under 3 seconds.</span>
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          variants={item}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-16"
        >
          {showDashboard ? (
            <Link 
              href="/dashboard/user" 
              className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-300 bg-slate-900 dark:bg-white dark:text-slate-900 rounded-2xl hover:scale-105 hover:shadow-2xl hover:shadow-slate-900/20 dark:hover:shadow-white/20 w-full sm:w-auto"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          ) : (
            <>
              <Link 
                href="/auth/signup" 
                className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-300 bg-blue-600 rounded-2xl hover:bg-blue-700 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30 w-full sm:w-auto"
              >
                Get Started Now
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link 
                href="/auth/signin" 
                className="group inline-flex items-center justify-center px-8 py-4 text-base font-bold text-slate-700 dark:text-slate-200 transition-all duration-300 bg-white dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/10 hover:scale-105 w-full sm:w-auto"
              >
                Sign In
              </Link>
            </>
          )}
        </motion.div>

        {/* Feature Strip - Glassmorphic Card */}
        <motion.div
          variants={item}
          className="max-w-3xl mx-auto rounded-3xl border border-slate-200/50 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-slate-200/20 dark:shadow-none"
        >
          <div className="flex flex-col items-center gap-3 text-center sm:text-left sm:items-start w-full">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-1">
              <Zap className="w-6 h-6 text-cyan-500" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white">Instant PDF</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">Bilingual formatting</p>
          </div>
          
          <div className="hidden sm:block w-px h-16 bg-slate-200 dark:bg-white/10" />

          <div className="flex flex-col items-center gap-3 text-center sm:text-left sm:items-start w-full">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-1">
              <ScanLine className="w-6 h-6 text-blue-500" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white">QR Verified</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">Scan at checkpoints</p>
          </div>

          <div className="hidden sm:block w-px h-16 bg-slate-200 dark:bg-white/10" />

          <div className="flex flex-col items-center gap-3 text-center sm:text-left sm:items-start w-full">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-1">
              <Shield className="w-6 h-6 text-emerald-500" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white">Govt Grade</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">AES-256 encrypted</p>
          </div>
        </motion.div>

      </motion.div>

      {/* Fade at bottom */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-linear-to-t from-white dark:from-slate-950 to-transparent pointer-events-none" />
    </section>
  );
}

export default HeroSection;
