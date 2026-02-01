'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface ThemeContextType {
  theme: 'light' | 'dark' | 'system'
  effectiveTheme: 'light' | 'dark'
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Default context value during SSR/hydration
const DEFAULT_CONTEXT: ThemeContextType = {
  theme: 'system',
  effectiveTheme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>('system')
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  // Define applyTheme BEFORE useEffect
  const applyTheme = (themeValue: 'light' | 'dark' | 'system') => {
    const root = document.documentElement

    let finalTheme: 'light' | 'dark'

    if (themeValue === 'system') {
      finalTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    } else {
      finalTheme = themeValue
    }

    setEffectiveTheme(finalTheme)

    if (finalTheme === 'dark') {
      root.classList.add('dark')
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      root.classList.remove('dark')
      document.documentElement.setAttribute('data-theme', 'light')
    }
  }

  // Initialize theme on mount
  useEffect(() => {
    setMounted(true)

    // Get saved theme from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null
    
    if (savedTheme) {
      setThemeState(savedTheme)
      applyTheme(savedTheme)
    } else {
      // Apply system theme on first visit
      applyTheme('system')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = effectiveTheme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme)
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  }

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = () => {
      applyTheme('system')
    }

    // Use addEventListener with proper cleanup
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <ThemeContext.Provider value={DEFAULT_CONTEXT}>
        {children}
      </ThemeContext.Provider>
    )
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        effectiveTheme,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
