/**
 * Rate Limiter for API Endpoints
 * Provides protection against abuse and ensures fair usage
 */

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  skipSuccessfulRequests?: boolean // Don't count successful requests
  skipFailedRequests?: boolean // Don't count failed requests
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  /**
   * Check if request should be allowed
   */
  check(key: string, config: RateLimitConfig): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const windowStart = now - config.windowMs
    const entry = this.store.get(key)

    if (!entry || entry.resetTime <= now) {
      // Create new entry or reset expired entry
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + config.windowMs
      }
      this.store.set(key, newEntry)
      
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: newEntry.resetTime
      }
    }

    if (entry.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      }
    }

    // Increment count
    entry.count++
    this.store.set(key, entry)

    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime
    }
  }

  /**
   * Record a request (for tracking purposes)
   */
  record(key: string, success: boolean, config: RateLimitConfig): void {
    const now = Date.now()
    const entry = this.store.get(key)

    if (entry && entry.resetTime > now) {
      // Only count if within window and based on config
      if ((success && !config.skipSuccessfulRequests) || 
          (!success && !config.skipFailedRequests)) {
        entry.count++
        this.store.set(key, entry)
      }
    }
  }

  /**
   * Get current status for a key
   */
  getStatus(key: string): { count: number; resetTime: number } | null {
    const entry = this.store.get(key)
    if (!entry || entry.resetTime <= Date.now()) {
      return null
    }
    return { count: entry.count, resetTime: entry.resetTime }
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.store.delete(key)
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    const entries = Array.from(this.store.entries())
    for (const [key, entry] of entries) {
      if (entry.resetTime <= now) {
        this.store.delete(key)
      }
    }
  }

  /**
   * Destroy the rate limiter
   */
  destroy(): void {
    clearInterval(this.cleanupInterval)
    this.store.clear()
  }
}

// Predefined rate limit configurations
export const RATE_LIMITS = {
  // General API endpoints
  GENERAL: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  } as RateLimitConfig,

  // Authentication endpoints
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    skipSuccessfulRequests: false,
    skipFailedRequests: true
  } as RateLimitConfig,

  // Post creation
  POST_CREATE: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    skipSuccessfulRequests: false,
    skipFailedRequests: true
  } as RateLimitConfig,

  // Comment creation
  COMMENT_CREATE: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
    skipSuccessfulRequests: false,
    skipFailedRequests: true
  } as RateLimitConfig,

  // Like/unlike actions
  LIKE_ACTION: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 50,
    skipSuccessfulRequests: false,
    skipFailedRequests: true
  } as RateLimitConfig,

  // Search endpoints
  SEARCH: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  } as RateLimitConfig,

  // File upload
  UPLOAD: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20,
    skipSuccessfulRequests: false,
    skipFailedRequests: true
  } as RateLimitConfig
}

// Singleton instance
export const rateLimiter = new RateLimiter()

/**
 * Middleware function for rate limiting
 */
export function createRateLimitMiddleware(config: RateLimitConfig) {
  return (request: Request, userId?: string): { allowed: boolean; remaining: number; resetTime: number } => {
    // Create rate limit key based on IP and user ID
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    const key = userId ? `${userId}:${ip}` : ip
    
    return rateLimiter.check(key, config)
  }
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(remaining: number, resetTime: number) {
  return {
    'X-RateLimit-Limit': '100',
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': new Date(resetTime).toISOString(),
    'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString()
  }
}