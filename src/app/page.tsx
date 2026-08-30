"use client";

import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { useRef } from "react";
import {
  CheckCircle2,
  Zap,
  Shield,
  BookOpen,
  ArrowRight,
  Truck,
  Building2,
  ScanLine,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { EncryptedText } from "@/components/ui/encrypted-text";
import { SparkleButton } from "@/components/ui/SparkleButton";
import { WorkflowSection } from "@/components/WorkflowSection";
import { TextReveal } from "@/components/ui/text-reveal";

// ─── Floating grid background ─────────────────────────────────────────────────
function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute -top-32 -left-32 w-150 h-150 bg-cyan-500/10 rounded-full blur-[120px]" />
      <div className="absolute -top-16 right-0 w-125 h-125 bg-blue-600/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-200 h-75 bg-indigo-500/5 rounded-full blur-[80px]" />
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="flex-1 min-w-27.5 relative overflow-hidden rounded-2xl
                 border border-slate-200 dark:border-white/6
                 bg-slate-50 dark:bg-white/3
                 backdrop-blur-sm p-5 sm:p-6 text-center"
    >
      <div className={`text-xl sm:text-3xl font-black mb-1 ${accent}`}>
        {value}
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-500 font-medium uppercase tracking-widest">
        {label}
      </div>
    </motion.div>
  );
}

// ─── Role card ────────────────────────────────────────────────────────────────
function RoleCard({
  icon,
  emoji,
  title,
  subtitle,
  features,
  href,
  cta,
  accentFrom,
  accentTo,
  glowColor,
  delay,
}: {
  icon: React.ReactNode;
  emoji: string;
  title: string;
  subtitle: string;
  features: string[];
  href: string;
  cta: string;
  accentFrom: string;
  accentTo: string;
  glowColor: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay }}
      whileHover={{ y: -6 }}
      className={`relative flex flex-col overflow-hidden rounded-3xl
                  border border-slate-200 dark:border-white/7
                  bg-slate-50 dark:bg-white/3
                  backdrop-blur-sm p-5 sm:p-8 group transition-all duration-500
                  hover:border-slate-300 dark:hover:border-white/15
                  hover:shadow-2xl ${glowColor}`}
    >
      {/* Top gradient strip */}
      <div
        className={`absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r ${accentFrom} ${accentTo} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />

      {/* Icon + title */}
      <div className="flex items-center gap-4 mb-5 sm:mb-6">
        <div
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-linear-to-br ${accentFrom} ${accentTo} flex items-center justify-center text-white shadow-lg shrink-0`}
        >
          {icon}
        </div>
        <div>
          <div className="text-xl sm:text-2xl mb-0.5">{emoji}</div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            {title}
          </h3>
        </div>
      </div>

      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-5 sm:mb-6">
        {subtitle}
      </p>

      <ul className="space-y-2 sm:space-y-2.5 mb-6 sm:mb-8 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              {f}
            </span>
          </li>
        ))}
      </ul>

      <SparkleButton href={href} className="w-full justify-center">
        {cta}
      </SparkleButton>
    </motion.div>
  );
}

// ─── Why card ─────────────────────────────────────────────────────────────────
function WhyCard({
  icon,
  title,
  desc,
  color,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -4 }}
      className="relative group flex gap-4 p-5 sm:p-6 rounded-2xl
                 border border-slate-200 dark:border-white/6
                 bg-white dark:bg-white/2
                 hover:border-slate-300 dark:hover:border-white/12
                 hover:bg-slate-50 dark:hover:bg-white/5
                 transition-all duration-300"
    >
      <div
        className={`mt-0.5 w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}
      >
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-slate-900 dark:text-white mb-1">
          {title}
        </h4>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {desc}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const { effectiveTheme } = useTheme();
  const { isAuthenticated, user, isLoading } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const isDark = effectiveTheme === "dark";
  const showDashboardCta = !isLoading && isAuthenticated && !!user;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.75 } },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      {/* ═══════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 pt-16 sm:pt-20 pb-12 sm:pb-16 overflow-hidden"
      >
        <GridBackground />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 w-full max-w-5xl mx-auto"
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            {/* Badge */}
            <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
              <div
                className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-2 rounded-full
                              border border-cyan-500/30 bg-cyan-500/[0.07]
                              backdrop-blur-sm"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
                </span>
                <span className="text-cyan-600 dark:text-cyan-300 text-xs sm:text-sm font-semibold tracking-wide">
                  🇮🇳 UP Minerals Rules, 2018 — Compliant System
                </span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black leading-none tracking-tight mb-5 sm:mb-6"
            >
              <span className="bg-linear-to-br from-slate-800 via-slate-700 to-slate-500 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent block mb-2">
                Digital
              </span>
              <span className="bg-linear-to-r from-cyan-500 via-cyan-400 to-blue-500 bg-clip-text text-transparent block">
                <EncryptedText
                  text="eMineral Pass"
                  revealDelayMs={60}
                  flipDelayMs={28}
                  encryptedClassName="text-slate-400/60 dark:text-slate-600/60"
                  revealedClassName="text-transparent"
                />
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-xl text-slate-600 dark:text-slate-400 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-2"
            >
              The official digital pass system for mineral transportation in
              Uttar Pradesh — automated, government-compliant, QR-verified.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap mb-12 sm:mb-16"
            >
              {showDashboardCta ? (
                <SparkleButton
                  href="/dashboard/user"
                  className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4"
                >
                  Go to Dashboard
                </SparkleButton>
              ) : (
                <>
                  <SparkleButton
                    href="/auth/signup"
                    className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4"
                  >
                    Request Access
                  </SparkleButton>
                  <SparkleButton
                    href="/auth/signin"
                    variant="secondary"
                    className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4"
                  >
                    Sign In
                  </SparkleButton>
                </>
              )}
            </motion.div>

            {/* Stats row — 3 non-repetitive cards */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-3 sm:gap-4 justify-center"
            >
              <StatCard
                value="ISO"
                label="Compliant"
                accent="text-cyan-500 dark:text-cyan-400"
              />
              <StatCard
                value="24 / 7"
                label="Uptime"
                accent="text-emerald-500 dark:text-emerald-400"
              />
              <StatCard
                value="< 3s"
                label="PDF Generation"
                accent="text-violet-500 dark:text-violet-400"
              />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Bottom fade to next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-slate-50 dark:from-slate-950 to-transparent pointer-events-none" />
      </section>

      {/* ═══════════════════════════════════════════════════════
          TEXT REVEAL
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-slate-50 dark:bg-slate-950">
        <TextReveal>
          eMineral Pass digitises mineral transport across Uttar Pradesh —
          instant QR passes, bilingual PDFs, and real-time verification, all in
          one government-compliant platform.
        </TextReveal>
      </section>

      {/* ═══════════════════════════════════════════════════════
          WORKFLOW
      ══════════════════════════════════════════════════════════ */}
      <WorkflowSection isDark={isDark} />

      {/* ═══════════════════════════════════════════════════════
          WHY eMINERAL PASS
      ══════════════════════════════════════════════════════════ */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Column: Features (Scrolling) */}
            <div className="lg:col-span-6 space-y-12 lg:space-y-24 lg:pb-32">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7 }}
                className="mb-8 lg:hidden text-center"
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 mb-5">
                  <Shield className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                  <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold">
                    Why Choose Us
                  </span>
                </div>
                <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                  Built for India&apos;s{" "}
                  <span className="bg-linear-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                    Mineral Sector
                  </span>
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-lg">
                  Every feature is purpose-built for government compliance,
                  operational speed, and transparent verification.
                </p>
              </motion.div>

              {[
                {
                  icon: <Shield className="w-8 h-8 text-blue-500" />,
                  title: "Government-Compliant",
                  desc: "Follows all field requirements of eForm-C under UP Minerals Rules 2018 exactly.",
                  color: "from-blue-500/10 to-transparent",
                  delay: 0,
                },
                {
                  icon: <Zap className="w-8 h-8 text-cyan-500" />,
                  title: "Instant QR Pass",
                  desc: "A unique, tamper-proof QR code is generated the moment your form is submitted.",
                  color: "from-cyan-500/10 to-transparent",
                  delay: 0,
                },
                {
                  icon: <BookOpen className="w-8 h-8 text-violet-500" />,
                  title: "Bilingual PDFs",
                  desc: "Government-standard PDFs with Hindi & English — Devanagari rendered natively.",
                  color: "from-violet-500/10 to-transparent",
                  delay: 0,
                },
                {
                  icon: <CheckCircle2 className="w-8 h-8 text-emerald-500" />,
                  title: "Public Verification",
                  desc: "Anyone can verify an ePass via the public QR scan endpoint — total transparency.",
                  color: "from-emerald-500/10 to-transparent",
                  delay: 0,
                },
              ].map((item) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 50, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: false, margin: "-20% 0px -20% 0px" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="relative p-8 sm:p-10 rounded-[2.5rem] border border-slate-200 dark:border-white/5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 overflow-hidden group"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity duration-700 mix-blend-overlay pointer-events-none">
                    {item.icon}
                  </div>
                  <div className="relative z-10">
                    <div className="mb-8 p-4 rounded-2xl bg-white dark:bg-slate-800 shadow-md inline-block border border-slate-100 dark:border-white/5 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                      {item.icon}
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Right Column: Sticky Title & Compliance Checklist */}
            <div className="lg:col-span-6 lg:sticky lg:top-32 lg:h-[calc(100vh-8rem)] flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="hidden lg:block mb-12"
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 mb-6">
                  <Shield className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                  <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold tracking-wide uppercase">
                    Why Choose Us
                  </span>
                </div>
                <h2 className="text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-[1.1] tracking-tight">
                  Built for India&apos;s <br />
                  <span className="bg-linear-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                    Mineral Sector
                  </span>
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-xl max-w-lg leading-relaxed">
                  Every feature is purpose-built for government compliance,
                  operational speed, and transparent verification.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="relative rounded-[2.5rem] border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl p-8 sm:p-10 overflow-hidden shadow-2xl"
              >
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex items-center gap-5 mb-10">
                    <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/25 ring-4 ring-blue-500/10">
                      <ScanLine className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Compliance Checklist
                      </h3>
                      <p className="text-sm text-slate-500 font-medium">
                        Verified against government standards
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {[
                      "Uttar Pradesh Minerals Rules, 2018",
                      "End-to-end AES-256 encrypted data",
                      "Compliance-ready for all UP agencies",
                      "Unlimited mineral transportation passes",
                      "Real-time QR scan logging & audit trail",
                      "Role-based access control (RBAC)",
                    ].map((item, i) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, x: 16 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 * i, duration: 0.5 }}
                        className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 border border-transparent hover:border-slate-200 dark:hover:border-white/5"
                      >
                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>
                        <span className="text-base text-slate-700 dark:text-slate-300 font-medium">
                          {item}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOR EVERY ROLE
      ══════════════════════════════════════════════════════════ */}
      <section className="relative py-16 sm:py-28 px-4 sm:px-6 overflow-hidden bg-white dark:bg-slate-950/80 transition-colors duration-300">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-100 bg-slate-100 dark:bg-slate-800/40 rounded-full blur-[80px]" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12 sm:mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/25 mb-5">
              <Building2 className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" />
              <span className="text-violet-600 dark:text-violet-400 text-sm font-semibold">
                Two Roles, One Platform
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              For Every Stakeholder
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-xl mx-auto">
              Whether you&apos;re issuing passes or verifying them — the
              platform adapts to your role.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8">
            <RoleCard
              icon={<Building2 className="w-6 h-6 sm:w-7 sm:h-7" />}
              emoji="🏢"
              title="License Hosts"
              subtitle="Manage mineral transportation passes, track vehicles in real-time, and download compliance reports from a centralised portal."
              features={[
                "View & filter all issued ePasses",
                "Download full PDF records",
                "Real-time analytics dashboard",
                "QR scan verification at checkpoints",
                "Role-based access control",
              ]}
              href="/auth/signup?role=host"
              cta="Access Host Portal"
              accentFrom="from-blue-500"
              accentTo="to-cyan-500"
              glowColor="hover:shadow-blue-500/10"
              delay={0}
            />
            <RoleCard
              icon={<Truck className="w-6 h-6 sm:w-7 sm:h-7" />}
              emoji="🚛"
              title="Transport Users"
              subtitle="Submit mineral transportation requests, receive an instant digital ePass with a unique QR code, and download your PDF in seconds."
              features={[
                "Fill eForm-C digitally in minutes",
                "Instant QR pass on submission",
                "Bilingual PDF (English + Hindi)",
                "Track active & expired passes",
                "Mobile-friendly interface",
              ]}
              href="/auth/signup?role=user"
              cta="Get Your ePass"
              accentFrom="from-violet-500"
              accentTo="to-pink-500"
              glowColor="hover:shadow-violet-500/10"
              delay={0.15}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FINAL CTA BANNER
      ══════════════════════════════════════════════════════════ */}
      <section className="relative py-20 sm:py-24 px-4 sm:px-6 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-linear-to-br from-cyan-500/5 via-blue-600/5 to-violet-500/5" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-px bg-linear-to-r from-transparent via-cyan-500/50 to-transparent" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-150 h-px bg-linear-to-r from-transparent via-blue-500/50 to-transparent" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center relative z-10"
        >
          <div className="text-4xl sm:text-5xl mb-5 sm:mb-6">⚡</div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
            Start Issuing{" "}
            <span className="bg-linear-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
              Digital Passes
            </span>{" "}
            Today
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg mb-8 sm:mb-10">
            Join the digital transformation of mineral transportation in Uttar
            Pradesh with a secure, compliant, and professionally managed
            platform.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <SparkleButton
              href="/auth/signup"
              className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4"
            >
              Create Account
            </SparkleButton>
            <a
              href="/auth/signin"
              className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 font-medium group text-sm sm:text-base"
            >
              Already have an account?
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
