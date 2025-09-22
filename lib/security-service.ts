// Advanced security service for authentication, monitoring, and threat detection
import React from 'react'

export class SecurityService {
  private apiUrl: string
  private securityEvents: SecurityEvent[] = []
  private threatDetectionRules: ThreatRule[] = []
  private isMonitoring = false

  constructor(apiUrl: string = '/api/v1/security') {
    this.apiUrl = apiUrl
    this.initializeSecurity()
  }

  // Initialize security features
  private initializeSecurity() {
    this.setupThreatDetection()
    this.setupRateLimiting()
    this.setupContentSecurityPolicy()
    this.setupSecurityHeaders()
    this.startMonitoring()
  }

  // Advanced authentication with MFA
  async authenticateWithMFA(credentials: {
    email: string
    password: string
    mfaCode?: string
    deviceInfo?: DeviceInfo
  }): Promise<AuthResult> {
    try {
      const deviceFingerprint = await this.generateDeviceFingerprint()
      const riskScore = await this.calculateRiskScore(credentials, deviceFingerprint)

      // Log authentication attempt
      this.logSecurityEvent({
        type: 'auth_attempt',
        severity: 'medium',
        userId: credentials.email,
        metadata: {
          deviceFingerprint,
          riskScore,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      })

      // High risk requires MFA
      if (riskScore > 70 && !credentials.mfaCode) {
        return {
          success: false,
          requiresMFA: true,
          riskScore,
          message: 'Additional verification required'
        }
      }

      // Perform authentication
      const response = await fetch(`${this.apiUrl}/auth/mfa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Fingerprint': deviceFingerprint,
          'X-Risk-Score': riskScore.toString()
        },
        body: JSON.stringify(credentials)
      })

      const result = await response.json()

      if (result.success) {
        // Store secure session
        await this.createSecureSession(result.token, deviceFingerprint)
        
        // Log successful authentication
        this.logSecurityEvent({
          type: 'auth_success',
          severity: 'low',
          userId: credentials.email,
          metadata: { deviceFingerprint, riskScore }
        })
      } else {
        // Log failed authentication
        this.logSecurityEvent({
          type: 'auth_failure',
          severity: 'high',
          userId: credentials.email,
          metadata: { 
            deviceFingerprint, 
            riskScore,
            reason: result.message 
          }
        })
      }

      return result
    } catch (error) {
      this.logSecurityEvent({
        type: 'auth_error',
        severity: 'high',
        userId: credentials.email,
        metadata: { error: error.message }
      })
      throw error
    }
  }

  // Generate device fingerprint
  private async generateDeviceFingerprint(): Promise<string> {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillText('Device fingerprint', 2, 2)

    const fingerprint = {
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      canvas: canvas.toDataURL(),
      webgl: this.getWebGLFingerprint(),
      audio: await this.getAudioFingerprint(),
      fonts: this.getFontFingerprint()
    }

    return this.hashObject(fingerprint)
  }

  // Get WebGL fingerprint
  private getWebGLFingerprint(): string {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) return 'no-webgl'

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
      return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
    } catch {
      return 'webgl-error'
    }
  }

  // Get audio fingerprint
  private async getAudioFingerprint(): Promise<string> {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const analyser = audioContext.createAnalyser()
      const gainNode = audioContext.createGain()
      const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1)

      oscillator.type = 'triangle'
      oscillator.frequency.setValueAtTime(10000, audioContext.currentTime)

      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      oscillator.connect(analyser)
      analyser.connect(scriptProcessor)
      scriptProcessor.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.start(0)

      return new Promise((resolve) => {
        scriptProcessor.onaudioprocess = () => {
          const frequencyData = new Uint8Array(analyser.frequencyBinCount)
          analyser.getByteFrequencyData(frequencyData)
          resolve(this.hashArray(frequencyData))
        }
      })
    } catch {
      return 'audio-error'
    }
  }

  // Get font fingerprint
  private getFontFingerprint(): string[] {
    const fonts = [
      'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana',
      'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS',
      'Trebuchet MS', 'Arial Black', 'Impact'
    ]

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const detectedFonts: string[] = []

    fonts.forEach(font => {
      ctx.font = `72px ${font}, monospace`
      const baseline = ctx.measureText('mmmmmmmmmmlli').width
      ctx.font = `72px monospace`
      const baselineMono = ctx.measureText('mmmmmmmmmmlli').width
      
      if (baseline !== baselineMono) {
        detectedFonts.push(font)
      }
    })

    return detectedFonts
  }

  // Calculate risk score
  private async calculateRiskScore(credentials: any, deviceFingerprint: string): Promise<number> {
    let riskScore = 0

    // Check for suspicious patterns
    if (this.isSuspiciousEmail(credentials.email)) riskScore += 20
    if (this.isWeakPassword(credentials.password)) riskScore += 30
    if (this.isNewDevice(deviceFingerprint)) riskScore += 25
    if (this.isSuspiciousLocation()) riskScore += 15
    if (this.isSuspiciousTime()) riskScore += 10

    // Check against known threats
    const threatScore = await this.checkThreatIntelligence(credentials.email, deviceFingerprint)
    riskScore += threatScore

    return Math.min(riskScore, 100)
  }

  // Threat detection rules
  private setupThreatDetection() {
    this.threatDetectionRules = [
      {
        name: 'brute_force',
        pattern: /multiple_failed_attempts/,
        threshold: 5,
        timeWindow: 300000, // 5 minutes
        action: 'block_ip'
      },
      {
        name: 'suspicious_activity',
        pattern: /unusual_access_pattern/,
        threshold: 3,
        timeWindow: 600000, // 10 minutes
        action: 'require_mfa'
      },
      {
        name: 'data_exfiltration',
        pattern: /bulk_data_access/,
        threshold: 1,
        timeWindow: 60000, // 1 minute
        action: 'alert_admin'
      }
    ]
  }

  // Rate limiting
  private setupRateLimiting() {
    const rateLimits = new Map<string, { count: number; resetTime: number }>()

    return {
      checkLimit: (key: string, limit: number, windowMs: number): boolean => {
        const now = Date.now()
        const current = rateLimits.get(key)

        if (!current || now > current.resetTime) {
          rateLimits.set(key, { count: 1, resetTime: now + windowMs })
          return true
        }

        if (current.count >= limit) {
          return false
        }

        current.count++
        return true
      }
    }
  }

  // Content Security Policy
  private setupContentSecurityPolicy() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "media-src 'self' https: blob:",
      "connect-src 'self' https: wss:",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'"
    ].join('; ')

    const meta = document.createElement('meta')
    meta.httpEquiv = 'Content-Security-Policy'
    meta.content = csp
    document.head.appendChild(meta)
  }

  // Security headers
  private setupSecurityHeaders() {
    // These would be set by the server, but we can add client-side security
    document.addEventListener('DOMContentLoaded', () => {
      // Prevent clickjacking
      if (window.top !== window.self) {
        window.top.location = window.self.location
      }
    })
  }

  // Start security monitoring
  private startMonitoring() {
    this.isMonitoring = true

    // Monitor for suspicious behavior
    this.monitorUserBehavior()
    this.monitorNetworkActivity()
    this.monitorDOMChanges()
    this.monitorConsoleAccess()
  }

  // Monitor user behavior
  private monitorUserBehavior() {
    let mouseMovements: number[] = []
    let keystrokes: number[] = []
    let clickPatterns: number[] = []

    // Track mouse movements
    document.addEventListener('mousemove', (e) => {
      mouseMovements.push(Date.now())
      if (mouseMovements.length > 100) {
        mouseMovements = mouseMovements.slice(-50)
      }
    })

    // Track keystrokes
    document.addEventListener('keydown', (e) => {
      keystrokes.push(Date.now())
      if (keystrokes.length > 100) {
        keystrokes = keystrokes.slice(-50)
      }
    })

    // Track clicks
    document.addEventListener('click', (e) => {
      clickPatterns.push(Date.now())
      if (clickPatterns.length > 100) {
        clickPatterns = clickPatterns.slice(-50)
      }
    })

    // Analyze behavior patterns
    setInterval(() => {
      this.analyzeBehaviorPatterns({ mouseMovements, keystrokes, clickPatterns })
    }, 30000) // Every 30 seconds
  }

  // Monitor network activity
  private monitorNetworkActivity() {
    const originalFetch = window.fetch
    const requests: NetworkRequest[] = []

    window.fetch = async (...args) => {
      const startTime = Date.now()
      const url = args[0] as string
      
      try {
        const response = await originalFetch(...args)
        const endTime = Date.now()
        
        requests.push({
          url,
          method: args[1]?.method || 'GET',
          status: response.status,
          duration: endTime - startTime,
          timestamp: startTime
        })

        // Check for suspicious requests
        this.analyzeNetworkRequests(requests.slice(-10))

        return response
      } catch (error) {
        requests.push({
          url,
          method: args[1]?.method || 'GET',
          status: 0,
          duration: Date.now() - startTime,
          timestamp: startTime,
          error: error.message
        })
        throw error
      }
    }
  }

  // Monitor DOM changes
  private monitorDOMChanges() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element
              if (element.tagName === 'SCRIPT' && !element.getAttribute('src')) {
                this.logSecurityEvent({
                  type: 'suspicious_script',
                  severity: 'high',
                  metadata: { script: element.textContent }
                })
              }
            }
          })
        }
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  }

  // Monitor console access
  private monitorConsoleAccess() {
    const originalConsole = { ...console }
    
    Object.keys(console).forEach(key => {
      const originalMethod = console[key as keyof Console]
      if (typeof originalMethod === 'function') {
        console[key as keyof Console] = (...args) => {
          this.logSecurityEvent({
            type: 'console_access',
            severity: 'medium',
            metadata: { method: key, args: args.map(arg => String(arg)) }
          })
          return originalMethod.apply(console, args)
        }
      }
    })
  }

  // Analyze behavior patterns
  private analyzeBehaviorPatterns(patterns: any) {
    // Detect bot-like behavior
    const mouseRegularity = this.calculateRegularity(patterns.mouseMovements)
    const keystrokeRegularity = this.calculateRegularity(patterns.keystrokes)
    
    if (mouseRegularity > 0.8 || keystrokeRegularity > 0.8) {
      this.logSecurityEvent({
        type: 'bot_behavior',
        severity: 'high',
        metadata: { mouseRegularity, keystrokeRegularity }
      })
    }
  }

  // Analyze network requests
  private analyzeNetworkRequests(requests: NetworkRequest[]) {
    // Detect suspicious patterns
    const suspiciousPatterns = [
      /admin/i,
      /api\/v1\/users\/\d+\/delete/i,
      /bulk/i,
      /export/i
    ]

    requests.forEach(request => {
      suspiciousPatterns.forEach(pattern => {
        if (pattern.test(request.url)) {
          this.logSecurityEvent({
            type: 'suspicious_request',
            severity: 'medium',
            metadata: { url: request.url, method: request.method }
          })
        }
      })
    })
  }

  // Helper methods
  private isSuspiciousEmail(email: string): boolean {
    const suspiciousPatterns = [
      /temp/i,
      /fake/i,
      /test/i,
      /\+.*@/ // Email aliases
    ]
    return suspiciousPatterns.some(pattern => pattern.test(email))
  }

  private isWeakPassword(password: string): boolean {
    return password.length < 8 || 
           !/[A-Z]/.test(password) || 
           !/[a-z]/.test(password) || 
           !/[0-9]/.test(password)
  }

  private isNewDevice(fingerprint: string): boolean {
    const knownDevices = JSON.parse(localStorage.getItem('known_devices') || '[]')
    return !knownDevices.includes(fingerprint)
  }

  private isSuspiciousLocation(): boolean {
    // This would integrate with geolocation API
    return false
  }

  private isSuspiciousTime(): boolean {
    const hour = new Date().getHours()
    return hour < 6 || hour > 22 // Outside normal hours
  }

  private async checkThreatIntelligence(email: string, fingerprint: string): Promise<number> {
    // This would integrate with threat intelligence services
    return 0
  }

  private calculateRegularity(timestamps: number[]): number {
    if (timestamps.length < 3) return 0
    
    const intervals = []
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i] - timestamps[i - 1])
    }
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length
    
    return variance / avgInterval
  }

  private hashObject(obj: any): string {
    return btoa(JSON.stringify(obj)).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32)
  }

  private hashArray(arr: Uint8Array): string {
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32)
  }

  private async createSecureSession(token: string, fingerprint: string) {
    // Store token securely
    sessionStorage.setItem('auth_token', token)
    sessionStorage.setItem('device_fingerprint', fingerprint)
    
    // Add to known devices
    const knownDevices = JSON.parse(localStorage.getItem('known_devices') || '[]')
    if (!knownDevices.includes(fingerprint)) {
      knownDevices.push(fingerprint)
      localStorage.setItem('known_devices', JSON.stringify(knownDevices))
    }
  }

  // Log security event
  private logSecurityEvent(event: SecurityEvent) {
    this.securityEvents.push(event)
    
    // Send to server
    this.sendSecurityEvent(event)
    
    // Check against threat rules
    this.checkThreatRules(event)
  }

  private async sendSecurityEvent(event: SecurityEvent) {
    try {
      await fetch(`${this.apiUrl}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(event)
      })
    } catch (error) {
      console.error('Failed to send security event:', error)
    }
  }

  private checkThreatRules(event: SecurityEvent) {
    this.threatDetectionRules.forEach(rule => {
      if (rule.pattern.test(event.type)) {
        const recentEvents = this.securityEvents.filter(e => 
          e.type === event.type && 
          Date.now() - new Date(e.metadata.timestamp).getTime() < rule.timeWindow
        )
        
        if (recentEvents.length >= rule.threshold) {
          this.triggerSecurityAction(rule.action, event)
        }
      }
    })
  }

  private triggerSecurityAction(action: string, event: SecurityEvent) {
    switch (action) {
      case 'block_ip':
        this.logSecurityEvent({
          type: 'ip_blocked',
          severity: 'critical',
          metadata: { reason: 'brute_force_detected' }
        })
        break
      case 'require_mfa':
        this.logSecurityEvent({
          type: 'mfa_required',
          severity: 'high',
          metadata: { reason: 'suspicious_activity' }
        })
        break
      case 'alert_admin':
        this.logSecurityEvent({
          type: 'admin_alert',
          severity: 'critical',
          metadata: { reason: 'data_exfiltration_attempt' }
        })
        break
    }
  }

  // Public methods
  getSecurityEvents(): SecurityEvent[] {
    return [...this.securityEvents]
  }

  getThreatLevel(): 'low' | 'medium' | 'high' | 'critical' {
    const recentEvents = this.securityEvents.filter(e => 
      Date.now() - new Date(e.metadata.timestamp).getTime() < 300000 // Last 5 minutes
    )
    
    const criticalCount = recentEvents.filter(e => e.severity === 'critical').length
    const highCount = recentEvents.filter(e => e.severity === 'high').length
    
    if (criticalCount > 0) return 'critical'
    if (highCount > 2) return 'high'
    if (highCount > 0) return 'medium'
    return 'low'
  }

  stopMonitoring() {
    this.isMonitoring = false
  }
}

// Types
interface SecurityEvent {
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  userId?: string
  metadata: any
}

interface ThreatRule {
  name: string
  pattern: RegExp
  threshold: number
  timeWindow: number
  action: string
}

interface DeviceInfo {
  userAgent: string
  screenResolution: string
  timezone: string
  language: string
}

interface AuthResult {
  success: boolean
  requiresMFA?: boolean
  riskScore?: number
  message?: string
  token?: string
}

interface NetworkRequest {
  url: string
  method: string
  status: number
  duration: number
  timestamp: number
  error?: string
}

// Singleton instance
export const securityService = new SecurityService()

// React hook for security
export function useSecurity() {
  const [threatLevel, setThreatLevel] = React.useState<'low' | 'medium' | 'high' | 'critical'>('low')
  const [securityEvents, setSecurityEvents] = React.useState<SecurityEvent[]>([])

  React.useEffect(() => {
    const interval = setInterval(() => {
      setThreatLevel(securityService.getThreatLevel())
      setSecurityEvents(securityService.getSecurityEvents())
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const authenticateWithMFA = React.useCallback((credentials: any) => 
    securityService.authenticateWithMFA(credentials), [])

  return {
    threatLevel,
    securityEvents,
    authenticateWithMFA
  }
}
