"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { LogOut, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { SparkleButton } from "@/components/ui/SparkleButton";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

function GlobalNavbarComponent() {
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, isAuthenticated } = useAuth();
  const { effectiveTheme, toggleTheme } = useTheme();

  const isHomepage = pathname === "/";
  const hideAuthButtons = isHomepage && !isAuthenticated;

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = effectiveTheme === "dark";

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`fixed w-full z-50 transition-all ${
          isScrolled
            ? isDark
              ? "bg-slate-950/95 border-b border-slate-800 backdrop-blur-lg"
              : "bg-white/95 border-b border-slate-200 backdrop-blur-lg"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`text-lg sm:text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
          >
            <Link href="/">
              <TextGenerateEffect
                words="eMineral Pass"
                className="bg-linear-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent"
                duration={1.2}
                filter={false}
              />
            </Link>
          </motion.div>

          <div className="hidden md:flex gap-3 lg:gap-4 items-center">
            <Link
              href="/resources"
              className={`text-sm lg:text-base font-medium transition-colors ${
                isDark
                  ? "text-slate-300 hover:text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Resources
            </Link>
            <AnimatedThemeToggler
              theme={effectiveTheme}
              onThemeChange={toggleTheme}
              variant="circle"
              duration={500}
              className={`p-2.5 rounded-xl transition-all ${
                isDark
                  ? "bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-yellow-400"
                  : "bg-slate-100/80 hover:bg-slate-200 border border-slate-300 text-slate-600"
              }`}
            />
            {isAuthenticated && user ? (
              <>
                <span
                  className={`text-sm truncate max-w-37.5 ${
                    isDark ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  {user.user_metadata?.full_name || user.email}
                </span>
                <button
                  onClick={async () => {
                    try {
                      await signOut();
                    } finally {
                      router.replace("/");
                    }
                  }}
                  className={`p-2.5 rounded-lg transition-colors ${
                    isDark
                      ? "bg-red-900/30 hover:bg-red-900/50 border border-red-800"
                      : "bg-red-100/50 hover:bg-red-200/70 border border-red-300"
                  }`}
                  title="Sign out"
                >
                  <LogOut
                    className={`w-5 h-5 ${isDark ? "text-red-400" : "text-red-600"}`}
                  />
                </button>
              </>
            ) : (
              !hideAuthButtons && (
                <>
                  <Link
                    href="/auth/signin"
                    className={`text-sm lg:text-base font-medium transition-colors ${
                      isDark
                        ? "text-slate-300 hover:text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <TextGenerateEffect
                      words="Sign In"
                      duration={0.9}
                      filter={false}
                    />
                  </Link>
                  <SparkleButton href="/auth/signup" className="text-sm lg:text-base px-4 lg:px-6 py-2">
                    Get Started
                  </SparkleButton>
                </>
              )
            )}
          </div>

          <div className="md:hidden flex gap-2 items-center">
            <AnimatedThemeToggler
              theme={effectiveTheme}
              onThemeChange={toggleTheme}
              variant="circle"
              duration={500}
              className={`p-2 rounded-xl transition-all ${
                isDark
                  ? "bg-slate-800/80 hover:bg-slate-700 text-yellow-400"
                  : "bg-slate-100/80 hover:bg-slate-200 text-slate-600"
              }`}
            />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? "bg-slate-800/80 hover:bg-slate-700"
                  : "bg-slate-100/80 hover:bg-slate-200"
              }`}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X
                  className={`w-5 h-5 ${isDark ? "text-white" : "text-slate-900"}`}
                />
              ) : (
                <Menu
                  className={`w-5 h-5 ${isDark ? "text-white" : "text-slate-900"}`}
                />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`md:hidden fixed top-16 left-0 right-0 z-40 ${
              isDark
                ? "bg-slate-900 border-b border-slate-800"
                : "bg-white border-b border-slate-200"
            }`}
          >
            <div className="p-4 space-y-3">
              <Link
                href="/resources"
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isDark
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Resources
              </Link>
              {isAuthenticated && user ? (
                <>
                  <div
                    className={`px-4 py-2 text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}
                  >
                    {user.user_metadata?.full_name || user.email}
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await signOut();
                      } finally {
                        setIsMenuOpen(false);
                        router.replace("/");
                      }
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isDark
                        ? "text-red-400 hover:bg-red-900/30"
                        : "text-red-600 hover:bg-red-100"
                    }`}
                  >
                    <TextGenerateEffect
                      words="Sign Out"
                      duration={0.9}
                      filter={false}
                    />
                  </button>
                </>
              ) : (
                !hideAuthButtons && (
                  <>
                    <Link
                      href="/auth/signin"
                      onClick={() => setIsMenuOpen(false)}
                      className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isDark
                          ? "text-slate-300 hover:bg-slate-800"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <TextGenerateEffect
                        words="Sign In"
                        duration={0.9}
                        filter={false}
                      />
                    </Link>
                    <SparkleButton
                      href="/auth/signup"
                      className="w-full justify-center text-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Get Started
                    </SparkleButton>
                  </>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export const GlobalNavbar = React.memo(GlobalNavbarComponent);
