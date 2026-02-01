'use client'

import { ReactNode } from 'react'
import { ThemeProvider } from '@/context/ThemeContext'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <main className="mt-16">
        {children}
      </main>
    </ThemeProvider>
  )
}
