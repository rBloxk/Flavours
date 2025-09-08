/**
 * Comprehensive Media Security System
 * Protects paid content from unauthorized access, downloading, and piracy
 */

import crypto from 'crypto'

export interface MediaAccessToken {
  token: string
  expiresAt: number
  userId: string
  contentId: string
  permissions: string[]
  watermark?: string
}

export interface ProtectedMediaConfig {
  enableDRM: boolean
  enableWatermarking: boolean
  enableStreamingProtection: boolean
  enableAccessLogging: boolean
  maxConcurrentStreams: number
  tokenExpirationMinutes: number
}

export class MediaSecurityService {
  private static instance: MediaSecurityService
  private accessTokens: Map<string, MediaAccessToken> = new Map()
  private activeStreams: Map<string, Set<string>> = new Map()
  private config: ProtectedMediaConfig

  constructor(config: ProtectedMediaConfig) {
    this.config = config
  }

  static getInstance(config?: ProtectedMediaConfig): MediaSecurityService {
    if (!MediaSecurityService.instance) {
      MediaSecurityService.instance = new MediaSecurityService(
        config || {
          enableDRM: true,
          enableWatermarking: true,
          enableStreamingProtection: true,
          enableAccessLogging: true,
          maxConcurrentStreams: 3,
          tokenExpirationMinutes: 60
        }
      )
    }
    return MediaSecurityService.instance
  }

  /**
   * Generate secure access token for media
   */
  generateAccessToken(
    userId: string,
    contentId: string,
    permissions: string[] = ['view'],
    customExpiration?: number
  ): MediaAccessToken {
    const tokenId = crypto.randomUUID()
    const expiresAt = Date.now() + (customExpiration || this.config.tokenExpirationMinutes * 60 * 1000)
    
    // Create secure token with encryption
    const tokenData = {
      tokenId,
      userId,
      contentId,
      permissions,
      expiresAt,
      timestamp: Date.now()
    }

    const token = this.encryptToken(tokenData)
    
    const accessToken: MediaAccessToken = {
      token,
      expiresAt,
      userId,
      contentId,
      permissions,
      watermark: this.config.enableWatermarking ? this.generateWatermark(userId) : undefined
    }

    this.accessTokens.set(token, accessToken)
    
    // Clean up expired tokens
    this.cleanupExpiredTokens()
    
    return accessToken
  }

  /**
   * Validate access token and check permissions
   */
  validateAccessToken(token: string, requiredPermissions: string[] = ['view']): boolean {
    const accessToken = this.accessTokens.get(token)
    
    if (!accessToken) {
      this.logAccessAttempt(token, 'INVALID_TOKEN', 'Token not found')
      return false
    }

    if (Date.now() > accessToken.expiresAt) {
      this.logAccessAttempt(token, 'EXPIRED_TOKEN', 'Token expired')
      this.accessTokens.delete(token)
      return false
    }

    // Check permissions
    const hasPermission = requiredPermissions.every(permission => 
      accessToken.permissions.includes(permission)
    )

    if (!hasPermission) {
      this.logAccessAttempt(token, 'INSUFFICIENT_PERMISSIONS', 'Missing required permissions')
      return false
    }

    return true
  }

  /**
   * Register active stream to prevent concurrent access
   */
  registerStream(token: string, clientId: string): boolean {
    const accessToken = this.accessTokens.get(token)
    if (!accessToken) return false

    const userId = accessToken.userId
    const userStreams = this.activeStreams.get(userId) || new Set()

    // Check concurrent stream limit
    if (userStreams.size >= this.config.maxConcurrentStreams) {
      this.logAccessAttempt(token, 'STREAM_LIMIT_EXCEEDED', 'Too many concurrent streams')
      return false
    }

    userStreams.add(clientId)
    this.activeStreams.set(userId, userStreams)
    
    this.logAccessAttempt(token, 'STREAM_STARTED', 'Stream registered')
    return true
  }

  /**
   * Unregister stream when user stops viewing
   */
  unregisterStream(token: string, clientId: string): void {
    const accessToken = this.accessTokens.get(token)
    if (!accessToken) return

    const userId = accessToken.userId
    const userStreams = this.activeStreams.get(userId)
    
    if (userStreams) {
      userStreams.delete(clientId)
      if (userStreams.size === 0) {
        this.activeStreams.delete(userId)
      } else {
        this.activeStreams.set(userId, userStreams)
      }
    }

    this.logAccessAttempt(token, 'STREAM_ENDED', 'Stream unregistered')
  }

  /**
   * Generate dynamic watermark for user
   */
  private generateWatermark(userId: string): string {
    const timestamp = Date.now()
    const userHash = crypto.createHash('sha256').update(userId).digest('hex').substring(0, 8)
    return `FLAVOURS-${userHash}-${timestamp}`
  }

  /**
   * Encrypt token data
   */
  private encryptToken(data: any): string {
    const secretKey = process.env.MEDIA_SECRET_KEY || 'default-secret-key-change-in-production'
    const cipher = crypto.createCipher('aes-256-cbc', secretKey)
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return encrypted
  }

  /**
   * Decrypt token data
   */
  private decryptToken(encryptedToken: string): any {
    try {
      const secretKey = process.env.MEDIA_SECRET_KEY || 'default-secret-key-change-in-production'
      const decipher = crypto.createDecipher('aes-256-cbc', secretKey)
      let decrypted = decipher.update(encryptedToken, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      return JSON.parse(decrypted)
    } catch (error) {
      return null
    }
  }

  /**
   * Log access attempts for monitoring
   */
  private logAccessAttempt(token: string, status: string, reason: string): void {
    if (!this.config.enableAccessLogging) return

    const logEntry = {
      timestamp: new Date().toISOString(),
      token: token.substring(0, 8) + '...', // Partial token for security
      status,
      reason,
      ip: 'client-ip', // Would be passed from request
      userAgent: 'client-user-agent' // Would be passed from request
    }

    console.log('Media Access Log:', logEntry)
    
    // In production, send to monitoring service
    // await this.sendToMonitoringService(logEntry)
  }

  /**
   * Clean up expired tokens
   */
  private cleanupExpiredTokens(): void {
    const now = Date.now()
    for (const [token, accessToken] of this.accessTokens.entries()) {
      if (now > accessToken.expiresAt) {
        this.accessTokens.delete(token)
      }
    }
  }

  /**
   * Get user's active streams count
   */
  getUserActiveStreams(userId: string): number {
    return this.activeStreams.get(userId)?.size || 0
  }

  /**
   * Revoke all tokens for a user (for security incidents)
   */
  revokeUserTokens(userId: string): void {
    for (const [token, accessToken] of this.accessTokens.entries()) {
      if (accessToken.userId === userId) {
        this.accessTokens.delete(token)
      }
    }
    
    // Also clear active streams
    this.activeStreams.delete(userId)
  }

  /**
   * Get security statistics
   */
  getSecurityStats(): any {
    return {
      activeTokens: this.accessTokens.size,
      activeStreams: Array.from(this.activeStreams.values()).reduce((sum, streams) => sum + streams.size, 0),
      uniqueUsers: this.activeStreams.size,
      config: this.config
    }
  }
}

/**
 * Media URL Protection Utilities
 */
export class MediaURLProtection {
  /**
   * Generate protected media URL with token
   */
  static generateProtectedURL(
    mediaId: string,
    token: string,
    baseUrl: string = '/api/media'
  ): string {
    const params = new URLSearchParams({
      id: mediaId,
      token: token,
      t: Date.now().toString() // Timestamp to prevent caching
    })
    
    return `${baseUrl}/stream?${params.toString()}`
  }

  /**
   * Validate media request headers
   */
  static validateRequestHeaders(headers: Headers): boolean {
    // Check for suspicious headers that might indicate scraping
    const suspiciousHeaders = [
      'x-forwarded-for',
      'x-real-ip',
      'user-agent'
    ]

    // Check for download tools
    const userAgent = headers.get('user-agent')?.toLowerCase() || ''
    const downloadTools = [
      'wget', 'curl', 'python-requests', 'postman', 'insomnia',
      'httpie', 'aria2', 'axel', 'youtube-dl', 'ffmpeg'
    ]

    if (downloadTools.some(tool => userAgent.includes(tool))) {
      return false
    }

    return true
  }

  /**
   * Generate secure filename for downloads
   */
  static generateSecureFilename(originalName: string, userId: string): string {
    const timestamp = Date.now()
    const hash = crypto.createHash('md5').update(`${userId}-${timestamp}`).digest('hex').substring(0, 8)
    const extension = originalName.split('.').pop()
    return `protected_${hash}.${extension}`
  }
}

/**
 * Client-side media protection
 */
export class ClientMediaProtection {
  /**
   * Disable right-click context menu
   */
  static disableContextMenu(element: HTMLElement): void {
    element.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      return false
    })
  }

  /**
   * Disable common keyboard shortcuts
   */
  static disableKeyboardShortcuts(element: HTMLElement): void {
    element.addEventListener('keydown', (e) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S, Ctrl+A, Ctrl+C, Ctrl+V
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.key === 's') ||
        (e.ctrlKey && e.key === 'a') ||
        (e.ctrlKey && e.key === 'c') ||
        (e.ctrlKey && e.key === 'v')
      ) {
        e.preventDefault()
        return false
      }
    })
  }

  /**
   * Disable drag and drop
   */
  static disableDragDrop(element: HTMLElement): void {
    element.addEventListener('dragstart', (e) => e.preventDefault())
    element.addEventListener('drop', (e) => e.preventDefault())
    element.addEventListener('dragover', (e) => e.preventDefault())
  }

  /**
   * Add watermark overlay
   */
  static addWatermarkOverlay(element: HTMLElement, watermark: string): void {
    const overlay = document.createElement('div')
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1000;
      background: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 100px,
        rgba(255, 255, 255, 0.1) 100px,
        rgba(255, 255, 255, 0.1) 200px
      );
      background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="rgba(255,255,255,0.3)" font-family="Arial" font-size="12">${watermark}</text></svg>');
    `
    
    element.style.position = 'relative'
    element.appendChild(overlay)
  }

  /**
   * Detect developer tools
   */
  static detectDevTools(): boolean {
    let devtools = false
    
    const checkDevTools = () => {
      if (window.outerHeight - window.innerHeight > 200 || window.outerWidth - window.innerWidth > 200) {
        devtools = true
        return true
      }
      return false
    }

    // Check on resize
    window.addEventListener('resize', checkDevTools)
    
    // Check periodically
    setInterval(checkDevTools, 1000)
    
    return devtools
  }

  /**
   * Apply all protection measures
   */
  static applyFullProtection(element: HTMLElement, watermark?: string): void {
    this.disableContextMenu(element)
    this.disableKeyboardShortcuts(element)
    this.disableDragDrop(element)
    
    if (watermark) {
      this.addWatermarkOverlay(element, watermark)
    }

    // Detect and warn about dev tools
    if (this.detectDevTools()) {
      console.warn('Developer tools detected. Content protection may be compromised.')
    }
  }
}
