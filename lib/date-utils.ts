/**
 * Date utility functions to prevent hydration mismatches
 * by ensuring consistent date formatting between server and client
 */

/**
 * Format a date string to a consistent format that works on both server and client
 * @param dateString - ISO date string or Date object
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }
): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  
  // Use a consistent locale to prevent hydration mismatches
  return date.toLocaleDateString('en-US', options)
}

/**
 * Format a date to show relative time (e.g., "2h ago", "3d ago")
 * @param dateString - ISO date string or Date object
 * @returns Relative time string
 */
export function formatRelativeTime(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    return diffInMinutes < 1 ? 'now' : `${diffInMinutes}m ago`
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`
  } else {
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }
}

/**
 * Format a date for display in posts and feeds
 * @param dateString - ISO date string or Date object
 * @returns Formatted date string
 */
export function formatPostDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  
  if (diffInHours < 24) {
    return formatRelativeTime(dateString)
  } else {
    return formatDate(dateString, {
      month: 'short',
      day: 'numeric'
    })
  }
}

/**
 * Format a date for file uploads and storage
 * @param dateString - ISO date string or Date object
 * @returns Formatted date string
 */
export function formatFileDate(dateString: string | Date): string {
  return formatDate(dateString, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Format a date for admin dashboard
 * @param dateString - ISO date string or Date object
 * @returns Formatted date string
 */
export function formatAdminDate(dateString: string | Date): string {
  return formatDate(dateString, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Get current date in a consistent format
 * @returns Current date string
 */
export function getCurrentDate(): string {
  return formatDate(new Date())
}
