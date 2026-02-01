"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon, LogOut } from "lucide-react";
import { motion } from "framer-motion";

function GlobalNavbarComponent() {
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { user, signOut, isAuthenticated } = useAuth();
  const { effectiveTheme, toggleTheme } = useTheme();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide navbar on auth pages only
  const isAuthPage = pathname?.startsWith("/auth/");

  if (!mounted || isAuthPage) {
    return null;
  }

  const isDark = effectiveTheme === "dark";

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed w-full z-50 transition-all ${
        isScrolled
          ? isDark
            ? "bg-slate-950/80 border-b border-slate-800/50 backdrop-blur-lg"
            : "bg-white/80 border-b border-slate-200/50 backdrop-blur-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
        >
          <Link href="/">
            <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
              eMineral
            </span>
            <span className="ml-2">Pass</span>
          </Link>
        </motion.div>
        <div className="flex gap-4 items-center">
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-lg transition-colors ${
              isDark
                ? "bg-slate-800 hover:bg-slate-700"
                : "bg-slate-100 hover:bg-slate-200"
            }`}
            title={`Switch to ${effectiveTheme === "dark" ? "light" : "dark"} mode`}
            aria-label="Toggle theme"
          >
            {effectiveTheme === "dark" ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-slate-400" />
            )}
          </button>
          {isAuthenticated && user ? (
            <>
              <span className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className={`p-2 rounded-lg transition-colors ${
                  isDark
                    ? "bg-red-950 hover:bg-red-900"
                    : "bg-red-100 hover:bg-red-200"
                }`}
                title="Sign out"
              >
                <LogOut
                  className={`w-5 h-5 ${isDark ? "text-red-400" : "text-red-600"}`}
                />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className={`transition-colors ${
                  isDark
                    ? "text-slate-300 hover:text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold text-white hover:shadow-lg"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}

export const GlobalNavbar = React.memo(GlobalNavbarComponent);
