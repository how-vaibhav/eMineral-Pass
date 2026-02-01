/**
 * Timestamp utilities for auto-generated form fields
 * 
 * Handles server-side generation of:
 * - Generated On: Current server timestamp
 * - Valid Upto: Generated On + 24 hours
 * 
 * Format: DD-MM-YYYY HH:MM:SS AM/PM
 */

/**
 * Format date to DD-MM-YYYY HH:MM:SS AM/PM format
 * Used for official document timestamps
 */
export function formatTimestamp(date: Date): string {
  // Ensure we're working with a Date object
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return ''
  }

  // Extract date components
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  // Extract time components
  let hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  // Convert to 12-hour format
  const period = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12 // Convert 0 to 12 for midnight

  const formattedHours = String(hours).padStart(2, '0')

  return `${day}-${month}-${year} ${formattedHours}:${minutes}:${seconds} ${period}`
}

/**
 * Parse DD-MM-YYYY HH:MM:SS AM/PM format back to Date
 * Used when retrieving timestamps from database
 */
export function parseTimestamp(timestamp: string): Date {
  if (!timestamp) return new Date()

  try {
    const [datePart, timePart, period] = timestamp.split(' ')
    const [day, month, year] = datePart.split('-').map(Number)
    let [hours, minutes, seconds] = timePart.split(':').map(Number)

    // Convert from 12-hour to 24-hour format
    if (period === 'PM' && hours !== 12) {
      hours += 12
    } else if (period === 'AM' && hours === 12) {
      hours = 0
    }

    return new Date(year, month - 1, day, hours, minutes, seconds)
  } catch (error) {
    console.error('Error parsing timestamp:', timestamp, error)
    return new Date()
  }
}

/**
 * Generate timestamp for form submission (server-side only)
 * Should only be called in server actions or API routes
 */
export function generateSubmissionTimestamp(): string {
  return formatTimestamp(new Date())
}

/**
 * Calculate validity expiration (Generated On + 24 hours)
 * Takes the generated_on timestamp and adds 24 hours
 */
export function calculateValidityExpiration(generatedOnTimestamp: string): string {
  const generatedDate = parseTimestamp(generatedOnTimestamp)
  const expiryDate = new Date(generatedDate.getTime() + 24 * 60 * 60 * 1000) // Add 24 hours
  return formatTimestamp(expiryDate)
}

/**
 * Check if a form is still valid
 * Compares current time with valid_upto timestamp
 */
export function isFormStillValid(validUpto: string): boolean {
  try {
    const expiryDate = parseTimestamp(validUpto)
    const currentDate = new Date()
    return currentDate <= expiryDate
  } catch (error) {
    console.error('Error checking form validity:', error)
    return false
  }
}

/**
 * Get remaining validity time as human-readable string
 */
export function getRemainingValidityTime(validUpto: string): string {
  try {
    const expiryDate = parseTimestamp(validUpto)
    const currentDate = new Date()

    if (currentDate > expiryDate) {
      return 'Expired'
    }

    const diffMs = expiryDate.getTime() - currentDate.getTime()
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`
    }
    return `${minutes}m remaining`
  } catch (error) {
    console.error('Error calculating remaining time:', error)
    return 'Invalid'
  }
}

/**
 * Validate timestamp format
 */
export function isValidTimestampFormat(timestamp: string): boolean {
  if (!timestamp) return false

  const regex = /^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2} (AM|PM)$/
  return regex.test(timestamp)
}

/**
 * Get status badge based on validity
 */
export function getStatusBadge(validUpto: string): 'active' | 'expired' {
  return isFormStillValid(validUpto) ? 'active' : 'expired'
}
