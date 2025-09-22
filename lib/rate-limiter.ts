/**
 * Production-ready rate limiting utilities
 */

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  keyGenerator?: (req: any) => string
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

class RateLimiter {
  private store: RateLimitStore = {}
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      keyGenerator: (req) => req.ip || 'unknown',
      ...config
    }
  }

  private generateKey(req: any): string {
    return this.config.keyGenerator!(req)
  }

  private cleanup(): void {
    const now = Date.now()
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < now) {
        delete this.store[key]
      }
    })
  }

  check(req: any): { allowed: boolean; remaining: number; resetTime: number } {
    this.cleanup()
    
    const key = this.generateKey(req)
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    if (!this.store[key]) {
      this.store[key] = {
        count: 1,
        resetTime: now + this.config.windowMs
      }
    } else {
      // Reset if window has passed
      if (this.store[key].resetTime < now) {
        this.store[key] = {
          count: 1,
          resetTime: now + this.config.windowMs
        }
      } else {
        this.store[key].count++
      }
    }

    const remaining = Math.max(0, this.config.maxRequests - this.store[key].count)
    const allowed = this.store[key].count <= this.config.maxRequests

    return {
      allowed,
      remaining,
      resetTime: this.store[key].resetTime
    }
  }

  reset(key: string): void {
    delete this.store[key]
  }

  getStats(): { totalKeys: number; store: RateLimitStore } {
    this.cleanup()
    return {
      totalKeys: Object.keys(this.store).length,
      store: { ...this.store }
    }
  }
}

// Predefined rate limiters
export const authLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
  keyGenerator: (req) => `auth:${req.ip || 'unknown'}`
})

export const apiLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
  keyGenerator: (req) => `api:${req.ip || 'unknown'}`
})

export const uploadLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10, // 10 uploads per hour
  keyGenerator: (req) => `upload:${req.ip || 'unknown'}`
})

export const commentLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5, // 5 comments per minute
  keyGenerator: (req) => `comment:${req.ip || 'unknown'}`
})

// Rate limit middleware for Next.js API routes
export function createRateLimitMiddleware(limiter: RateLimiter) {
  return (req: any, res: any, next?: any) => {
    const result = limiter.check(req)

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', limiter['config'].maxRequests)
    res.setHeader('X-RateLimit-Remaining', result.remaining)
    res.setHeader('X-RateLimit-Reset', new Date(result.resetTime).toISOString())

    if (!result.allowed) {
      res.status(429).json({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
      })
      return
    }

    if (next) {
      next()
    }
  }
}

// Utility functions
export function getRateLimitHeaders(result: { remaining: number; resetTime: number }, maxRequests: number) {
  return {
    'X-RateLimit-Limit': maxRequests.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
  }
}

export function isRateLimited(result: { allowed: boolean }): boolean {
  return !result.allowed
}

export { RateLimiter }
