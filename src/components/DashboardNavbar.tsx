'use client'

import React, { memo, useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { Menu, X, Sun, Moon, LogOut } from 'lucide-react'

function DashboardNavbarComponent() {
  const [mounted, setMounted] = useState(false)
  const { user, signOut, isAuthenticated } = useAuth()
  const { effectiveTheme, toggleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const handleSignOut = async () => {
    await signOut()
    setMobileMenuOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Brand */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg" />
            eForm-C
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated && (
              <>
                <Link
                  href="/form"
                  className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition"
                >
                  New Form
                </Link>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition"
                >
                  Dashboard
                </Link>
              </>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200"
              title={`Switch to ${effectiveTheme === 'dark' ? 'light' : 'dark'} mode`}
              aria-label="Toggle theme"
            >
              {effectiveTheme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-500 transition-transform" />
              ) : (
                <Moon className="w-5 h-5 text-slate-400 transition-transform" />
              )}
            </button>

            {/* User Menu */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-4 pl-4 border-l border-slate-200 dark:border-slate-700">
                <span className="text-sm text-slate-600 dark:text-slate-400">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-lg bg-red-100 dark:bg-red-950 hover:bg-red-200 dark:hover:bg-red-900 transition"
                  title="Sign out"
                >
                  <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-4 py-2 rounded-lg transition"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Theme Toggle (Mobile) */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200"
              title={`Switch to ${effectiveTheme === 'dark' ? 'light' : 'dark'} mode`}
              aria-label="Toggle theme"
            >
              {effectiveTheme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-500 transition-transform" />
              ) : (
                <Moon className="w-5 h-5 text-slate-400 transition-transform" />
              )}
            </button>

            {/* Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-slate-600 dark:text-slate-400" />
              ) : (
                <Menu className="w-6 h-6 text-slate-600 dark:text-slate-400" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-slate-200 dark:border-slate-800 pt-4">
            {isAuthenticated && (
              <>
                <Link
                  href="/form"
                  className="block text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 py-2 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  New Form
                </Link>
                <Link
                  href="/dashboard"
                  className="block text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 py-2 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              </>
            )}

            {isAuthenticated && user ? (
              <>
                <div className="py-2 text-sm text-slate-600 dark:text-slate-400">{user.email}</div>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 py-2 transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="block text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-4 py-2 rounded-lg transition text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export const DashboardNavbar = memo(DashboardNavbarComponent)
