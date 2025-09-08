import { Request, Response, NextFunction } from 'express'
import { RateLimiterMemory } from 'rate-limiter-flexible'
import { logger } from '../utils/logger'

const rateLimiter = new RateLimiterMemory({
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
})

export const rateLimiterMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ip = req.ip || req.connection.remoteAddress || 'unknown'
    await rateLimiter.consume(ip)
    next()
  } catch (rejRes: any) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown'
    logger.warn(`Rate limit exceeded for IP: ${ip}`)
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: rejRes.msBeforeNext
    })
  }
}

export { rateLimiterMiddleware as rateLimiter }