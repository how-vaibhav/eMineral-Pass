"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { MailCheck, ArrowLeft, CheckCircle } from "lucide-react";
import { Suspense } from "react";

const cardCls =
  "w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 p-6 sm:p-8";

function VerifyContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white pt-20 transition-colors duration-300">
      {/* Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-80 h-80 bg-cyan-500 rounded-full filter blur-3xl opacity-[0.06] dark:opacity-[0.09] animate-pulse" />
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className={cardCls}
        >
          <Link href="/" className="inline-flex items-center gap-2 mb-6 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <MailCheck className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Verify your email</h1>
          </div>

          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            We sent a verification link to your email address. Please open the link to activate your account.
          </p>

          {email && (
            <p className="mt-4 px-3 py-2 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 text-sm font-semibold text-cyan-700 dark:text-cyan-400 break-all">
              {email}
            </p>
          )}

          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              After verification, return and sign in to access your dashboard.
            </p>
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
            >
              <CheckCircle className="w-4 h-4" /> Go to Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-950" />}>
      <VerifyContent />
    </Suspense>
  );
}
