import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'
import crypto from 'crypto'

export interface MediaProtectionConfig {
  enableDRM: boolean
  enableWatermarking: boolean
  enableStreamingProtection: boolean
  enableAccessLogging: boolean
  maxConcurrentStreams: number
  tokenExpirationMinutes: number
  allowedDomains: string[]
  blockedUserAgents: string[]
}

export class MediaProtectionMiddleware {
  private config: MediaProtectionConfig
  private activeStreams: Map<string, Set<string>> = new Map()
  private accessLogs: Array<any> = []

  constructor(config: MediaProtectionConfig) {
    this.config = config
  }

  /**
   * Validate media access request
   */
  validateMediaAccess = (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, mediaId, clientId } = req.query
      const userAgent = req.get('User-Agent') || ''
      const ip = req.ip || req.connection.remoteAddress || 'unknown'

      // Log access attempt
      this.logAccessAttempt({
        token: token as string,
        mediaId: mediaId as string,
        clientId: clientId as string,
        ip,
        userAgent,
        timestamp: new Date().toISOString()
      })

      // Check for blocked user agents
      if (this.isBlockedUserAgent(userAgent)) {
        logger.warn('Blocked user agent detected:', { userAgent, ip })
        return res.status(403).json({
          error: 'Access denied',
          reason: 'Blocked user agent'
        })
      }

      // Validate token
      if (!this.validateToken(token as string)) {
        logger.warn('Invalid token:', { token, ip })
        return res.status(401).json({
          error: 'Invalid or expired token'
        })
      }

      // Check concurrent streams
      if (!this.checkConcurrentStreams(token as string, clientId as string)) {
        logger.warn('Stream limit exceeded:', { token, clientId, ip })
        return res.status(429).json({
          error: 'Stream limit exceeded',
          maxStreams: this.config.maxConcurrentStreams
        })
      }

      // Add security headers
      this.addSecurityHeaders(res)

      next()
    } catch (error) {
      logger.error('Media protection error:', error)
      res.status(500).json({
        error: 'Internal server error'
      })
    }
  }

  /**
   * Validate access token
   */
  private validateToken(token: string): boolean {
    if (!token) return false

    try {
      // In a real implementation, you would validate the token against your database
      // For now, we'll do basic validation
      const tokenData = this.decryptToken(token)
      if (!tokenData) return false

      // Check expiration
      if (Date.now() > tokenData.expiresAt) {
        return false
      }

      return true
    } catch (error) {
      logger.error('Token validation error:', error)
      return false
    }
  }

  /**
   * Check concurrent streams limit
   */
  private checkConcurrentStreams(token: string, clientId: string): boolean {
    try {
      const tokenData = this.decryptToken(token)
      if (!tokenData) return false

      const userId = tokenData.userId
      const userStreams = this.activeStreams.get(userId) || new Set()

      if (userStreams.size >= this.config.maxConcurrentStreams) {
        return false
      }

      // Register stream
      userStreams.add(clientId)
      this.activeStreams.set(userId, userStreams)

      // Set up cleanup on response end
      const originalEnd = (res as any).end
      ;(res as any).end = function(...args: any[]) {
        // Unregister stream when response ends
        userStreams.delete(clientId)
        if (userStreams.size === 0) {
          this.activeStreams.delete(userId)
        } else {
          this.activeStreams.set(userId, userStreams)
        }
        originalEnd.apply(this, args)
      }

      return true
    } catch (error) {
      logger.error('Concurrent streams check error:', error)
      return false
    }
  }

  /**
   * Check if user agent is blocked
   */
  private isBlockedUserAgent(userAgent: string): boolean {
    const blockedPatterns = [
      'wget', 'curl', 'python-requests', 'postman', 'insomnia',
      'httpie', 'aria2', 'axel', 'youtube-dl', 'ffmpeg',
      'bot', 'crawler', 'spider', 'scraper'
    ]

    return blockedPatterns.some(pattern => 
      userAgent.toLowerCase().includes(pattern)
    )
  }

  /**
   * Add security headers to response
   */
  private addSecurityHeaders(res: Response): void {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('X-XSS-Protection', '1; mode=block')
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
    res.setHeader('Content-Disposition', 'inline') // Prevent download
    res.setHeader('X-Accel-Buffering', 'no') // Disable nginx buffering
  }

  /**
   * Log access attempt
   */
  private logAccessAttempt(logData: any): void {
    if (!this.config.enableAccessLogging) return

    this.accessLogs.push(logData)
    
    // Keep only last 1000 logs
    if (this.accessLogs.length > 1000) {
      this.accessLogs = this.accessLogs.slice(-1000)
    }

    logger.info('Media access attempt:', logData)
  }

  /**
   * Decrypt token (simplified for demo)
   */
  private decryptToken(token: string): any {
    try {
      // In a real implementation, you would use proper encryption
      // For demo purposes, we'll simulate token validation
      const secretKey = process.env.MEDIA_SECRET_KEY || 'default-secret-key'
      
      // This is a simplified version - in production use proper JWT or similar
      return {
        userId: 'demo-user',
        expiresAt: Date.now() + (60 * 60 * 1000), // 1 hour
        permissions: ['view']
      }
    } catch (error) {
      return null
    }
  }

  /**
   * Get security statistics
   */
  getSecurityStats(): any {
    return {
      activeStreams: Array.from(this.activeStreams.values()).reduce(
        (sum, streams) => sum + streams.size, 0
      ),
      uniqueUsers: this.activeStreams.size,
      totalAccessLogs: this.accessLogs.length,
      config: this.config
    }
  }

  /**
   * Get access logs
   */
  getAccessLogs(limit: number = 100): any[] {
    return this.accessLogs.slice(-limit)
  }
}

// Default configuration
const defaultConfig: MediaProtectionConfig = {
  enableDRM: true,
  enableWatermarking: true,
  enableStreamingProtection: true,
  enableAccessLogging: true,
  maxConcurrentStreams: 3,
  tokenExpirationMinutes: 60,
  allowedDomains: ['localhost', 'flavours.club'],
  blockedUserAgents: [
    'wget', 'curl', 'python-requests', 'postman', 'insomnia',
    'httpie', 'aria2', 'axel', 'youtube-dl', 'ffmpeg'
  ]
}

export const mediaProtection = new MediaProtectionMiddleware(defaultConfig)
