"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon, LogOut, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function GlobalNavbarComponent() {
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, signOut, isAuthenticated } = useAuth();
  const { effectiveTheme, toggleTheme } = useTheme();

  // Determine if we should hide auth buttons (on homepage when not authenticated)
  const isHomepage = pathname === "/";
  const hideAuthButtons = isHomepage && !isAuthenticated;

  // Prevent hydration mismatch
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
              <span className="bg-linear-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                eMineral
              </span>
              <span
                className={`ml-1 sm:ml-2 ${isDark ? "text-white" : "text-slate-900"}`}
              >
                Pass
              </span>
            </Link>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-3 lg:gap-4 items-center">
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-lg transition-colors ${
                isDark
                  ? "bg-slate-800/80 hover:bg-slate-700 border border-slate-700"
                  : "bg-slate-100/80 hover:bg-slate-200 border border-slate-300"
              }`}
              title={`Switch to ${effectiveTheme === "dark" ? "light" : "dark"} mode`}
              aria-label="Toggle theme"
            >
              {effectiveTheme === "dark" ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>
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
                      window.location.href = "/";
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
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-4 lg:px-6 py-2 bg-linear-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold text-white text-sm lg:text-base hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                  >
                    Get Started
                  </Link>
                </>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex gap-2 items-center">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? "bg-slate-800/80 hover:bg-slate-700"
                  : "bg-slate-100/80 hover:bg-slate-200"
              }`}
              title={`Switch to ${effectiveTheme === "dark" ? "light" : "dark"} mode`}
              aria-label="Toggle theme"
            >
              {effectiveTheme === "dark" ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>
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

      {/* Mobile Menu */}
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
              {isAuthenticated && user ? (
                <>
                  <div
                    className={`px-4 py-2 text-sm font-medium ${
                      isDark ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    {user.user_metadata?.full_name || user.email}
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await signOut();
                      } finally {
                        setIsMenuOpen(false);
                        window.location.href = "/";
                      }
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isDark
                        ? "text-red-400 hover:bg-red-900/30"
                        : "text-red-600 hover:bg-red-100"
                    }`}
                  >
                    Sign Out
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
                      Sign In
                    </Link>
                    <Link
                      href="/auth/signup"
                      onClick={() => setIsMenuOpen(false)}
                      className="block w-full px-4 py-2 bg-linear-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold text-white text-sm hover:shadow-lg text-center transition-all"
                    >
                      Get Started
                    </Link>
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
