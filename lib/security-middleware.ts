/**
 * Security Middleware for API Endpoints
 * Provides security headers, CORS, and other security measures
 */

import { NextRequest, NextResponse } from 'next/server'

interface SecurityConfig {
  cors?: {
    origin: string | string[]
    methods: string[]
    allowedHeaders: string[]
    credentials: boolean
  }
  headers?: {
    [key: string]: string
  }
  rateLimit?: {
    enabled: boolean
    windowMs: number
    maxRequests: number
  }
}

const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://flavours.app', 'https://www.flavours.app']
      : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-API-Key',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset'
    ],
    credentials: true
  },
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
  }
}

/**
 * Create security middleware function
 */
export function createSecurityMiddleware(config: SecurityConfig = {}) {
  const securityConfig = { ...DEFAULT_SECURITY_CONFIG, ...config }

  return (request: NextRequest): NextResponse | null => {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return handleCORS(request, securityConfig.cors!)
    }

    // Apply security headers to all responses
    return null // Continue to actual handler
  }
}

/**
 * Handle CORS preflight requests
 */
function handleCORS(request: NextRequest, corsConfig: NonNullable<SecurityConfig['cors']>): NextResponse {
  const origin = request.headers.get('origin')
  const allowedOrigins = Array.isArray(corsConfig.origin) ? corsConfig.origin : [corsConfig.origin]
  
  const response = new NextResponse(null, { status: 200 })
  
  // Set CORS headers
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }
  
  response.headers.set('Access-Control-Allow-Methods', corsConfig.methods.join(', '))
  response.headers.set('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '))
  response.headers.set('Access-Control-Allow-Credentials', corsConfig.credentials.toString())
  response.headers.set('Access-Control-Max-Age', '86400') // 24 hours
  
  return response
}

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(response: NextResponse, config: SecurityConfig = {}): NextResponse {
  const securityConfig = { ...DEFAULT_SECURITY_CONFIG, ...config }
  
  // Apply security headers
  Object.entries(securityConfig.headers || {}).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Apply CORS headers for actual requests
  if (securityConfig.cors) {
    response.headers.set('Access-Control-Allow-Credentials', securityConfig.cors.credentials.toString())
  }

  return response
}

/**
 * Validate API key middleware
 */
export function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key')
  const expectedApiKey = process.env.API_KEY

  if (!expectedApiKey) {
    return true // No API key required
  }

  return apiKey === expectedApiKey
}

/**
 * Sanitize request body
 */
export function sanitizeRequestBody(body: any): any {
  if (typeof body === 'string') {
    return sanitizeString(body)
  }

  if (Array.isArray(body)) {
    return body.map(sanitizeRequestBody)
  }

  if (body && typeof body === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(body)) {
      sanitized[sanitizeString(key)] = sanitizeRequestBody(value)
    }
    return sanitized
  }

  return body
}

/**
 * Sanitize string input
 */
function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/['"]/g, '') // Remove quotes
    .trim()
}

/**
 * Validate request size
 */
export function validateRequestSize(request: NextRequest, maxSize: number = 10 * 1024 * 1024): boolean {
  const contentLength = request.headers.get('content-length')
  if (contentLength) {
    const size = parseInt(contentLength, 10)
    return size <= maxSize
  }
  return true
}

/**
 * Get client IP address
 */
export function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0] ||
         request.headers.get('x-real-ip') ||
         request.headers.get('cf-connecting-ip') ||
         'unknown'
}

/**
 * Check if request is from a bot
 */
export function isBotRequest(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || ''
  
  const botPatterns = [
    'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python', 'java',
    'go-http', 'okhttp', 'apache', 'nginx', 'monitor', 'check', 'test'
  ]

  return botPatterns.some(pattern => userAgent.includes(pattern))
}

/**
 * Rate limiting by IP
 */
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>()

export function checkIPRateLimit(ip: string, maxRequests: number = 100, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now()
  const entry = ipRequestCounts.get(ip)

  if (!entry || entry.resetTime <= now) {
    ipRequestCounts.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (entry.count >= maxRequests) {
    return false
  }

  entry.count++
  ipRequestCounts.set(ip, entry)
  return true
}

/**
 * Clean up expired rate limit entries
 */
setInterval(() => {
  const now = Date.now()
  for (const [ip, entry] of ipRequestCounts.entries()) {
    if (entry.resetTime <= now) {
      ipRequestCounts.delete(ip)
    }
  }
}, 5 * 60 * 1000) // Clean up every 5 minutes
