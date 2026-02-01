import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { v4 as uuidv4 } from 'uuid'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate a unique public token for records
 */
export function generatePublicToken(): string {
  return uuidv4().replace(/-/g, '').slice(0, 16).toUpperCase()
}

/**
 * Format bytes to human-readable format
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * Math.pow(10, dm)) / Math.pow(10, dm) + ' ' + sizes[i]
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string, format = 'PPP'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Get time until expiry
 */
export function getTimeUntilExpiry(validUpto: Date | string): {
  isExpired: boolean
  daysLeft: number
  hoursLeft: number
  minutesLeft: number
} {
  const now = new Date()
  const expiry = typeof validUpto === 'string' ? new Date(validUpto) : validUpto
  const diffMs = expiry.getTime() - now.getTime()

  if (diffMs <= 0) {
    return {
      isExpired: true,
      daysLeft: 0,
      hoursLeft: 0,
      minutesLeft: 0,
    }
  }

  const daysLeft = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hoursLeft = Math.floor((diffMs / (1000 * 60 * 60)) % 24)
  const minutesLeft = Math.floor((diffMs / 1000 / 60) % 60)

  return {
    isExpired: false,
    daysLeft,
    hoursLeft,
    minutesLeft,
  }
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Get user's session from cookies
 */
export function getSessionFromCookie(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/sb-.*-auth-token=([^;]+)/)
  return match ? match[1] : null
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Failed to copy:', error)
    return false
  }
}
