"use client";

import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";

export function GlobalFooter() {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === "dark";

  return (
    <footer
      className={`${
        isDark
          ? "border-slate-800 bg-slate-950 text-slate-400"
          : "border-slate-200 bg-slate-50 text-slate-600"
      } border-t py-12 md:py-16 px-6 transition-colors`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              eMineral Pass
            </h2>
            <p className="max-w-sm leading-relaxed text-sm">
              The official digital platform for secure, transparent, and compliant mineral transport authorization across Uttar Pradesh.
            </p>
          </div>

          {/* Platform Links */}
          <div className="space-y-4">
            <h3 className={`text-sm font-semibold tracking-wider uppercase ${isDark ? "text-slate-200" : "text-slate-800"}`}>
              Platform
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/services" className={`hover:underline transition-colors ${isDark ? "hover:text-primary" : "hover:text-primary"}`}>
                  Services
                </Link>
              </li>
              <li>
                <Link href="/resources" className={`hover:underline transition-colors ${isDark ? "hover:text-primary" : "hover:text-primary"}`}>
                  Resources & Guides
                </Link>
              </li>
              <li>
                <Link href="/faq" className={`hover:underline transition-colors ${isDark ? "hover:text-primary" : "hover:text-primary"}`}>
                  FAQ & Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h3 className={`text-sm font-semibold tracking-wider uppercase ${isDark ? "text-slate-200" : "text-slate-800"}`}>
              Company
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/about" className={`hover:underline transition-colors ${isDark ? "hover:text-primary" : "hover:text-primary"}`}>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className={`hover:underline transition-colors ${isDark ? "hover:text-primary" : "hover:text-primary"}`}>
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/auth/signin" className={`hover:underline transition-colors ${isDark ? "hover:text-primary" : "hover:text-primary"}`}>
                  Sign In
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className={`pt-8 border-t ${isDark ? "border-slate-800" : "border-slate-200"} flex flex-col md:flex-row justify-between items-center gap-4 text-xs`}>
          <p>
            <TextGenerateEffect
              words="© 2026 eMineral Pass. All rights reserved."
              duration={1.5}
              filter={false}
            />
          </p>
          <p>
            Operated under Uttar Pradesh Minerals Rules, 2018.
          </p>
        </div>
      </div>
    </footer>
  );
}
