/**
 * Comprehensive Error Handling System
 * Provides consistent error responses and logging
 */

import { NextResponse } from 'next/server'

export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly code?: string
  public readonly details?: any

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string,
    details?: any
  ) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.code = code
    this.details = details

    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, true, 'VALIDATION_ERROR', details)
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, true, 'AUTHENTICATION_ERROR')
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, true, 'AUTHORIZATION_ERROR')
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, true, 'NOT_FOUND_ERROR')
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 409, true, 'CONFLICT_ERROR', details)
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, true, 'RATE_LIMIT_ERROR')
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 500, true, 'DATABASE_ERROR', details)
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, details?: any) {
    super(`${service} service error: ${message}`, 502, true, 'EXTERNAL_SERVICE_ERROR', details)
  }
}

/**
 * Error response interface
 */
interface ErrorResponse {
  success: false
  error: string
  code?: string
  details?: any
  timestamp: string
  path?: string
  requestId?: string
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  error: Error | AppError,
  request?: Request,
  requestId?: string
): NextResponse {
  let statusCode = 500
  let errorCode: string | undefined
  let details: any = undefined

  if (error instanceof AppError) {
    statusCode = error.statusCode
    errorCode = error.code
    details = error.details
  }

  // Log error for monitoring
  logError(error, request, requestId)

  const errorResponse: ErrorResponse = {
    success: false,
    error: error.message || 'Internal server error',
    code: errorCode,
    details,
    timestamp: new Date().toISOString(),
    path: request?.url,
    requestId
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    errorResponse.error = 'Internal server error'
    errorResponse.details = undefined
  }

  return NextResponse.json(errorResponse, { status: statusCode })
}

/**
 * Log error for monitoring and debugging
 */
function logError(error: Error, request?: Request, requestId?: string): void {
  const logData = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    requestId,
    url: request?.url,
    method: request?.method,
    userAgent: request?.headers.get('user-agent'),
    ip: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip')
  }

  if (error instanceof AppError) {
    logData['statusCode'] = error.statusCode
    logData['code'] = error.code
    logData['isOperational'] = error.isOperational
  }

  // Use appropriate log level based on error type
  if (error instanceof AppError && error.isOperational) {
    console.warn('Operational Error:', logData)
  } else {
    console.error('System Error:', logData)
  }

  // In production, send to external monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Send to monitoring service (e.g., Sentry, DataDog, etc.)
    // monitoringService.captureException(error, logData)
  }
}

/**
 * Async error wrapper for API routes
 */
export function asyncHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args)
    } catch (error) {
      throw error
    }
  }
}

/**
 * Validation helper functions
 */
export const validate = {
  required: (value: any, fieldName: string) => {
    if (value === undefined || value === null || value === '') {
      throw new ValidationError(`${fieldName} is required`)
    }
    return value
  },

  string: (value: any, fieldName: string, minLength?: number, maxLength?: number) => {
    if (typeof value !== 'string') {
      throw new ValidationError(`${fieldName} must be a string`)
    }
    if (minLength !== undefined && value.length < minLength) {
      throw new ValidationError(`${fieldName} must be at least ${minLength} characters`)
    }
    if (maxLength !== undefined && value.length > maxLength) {
      throw new ValidationError(`${fieldName} must be no more than ${maxLength} characters`)
    }
    return value
  },

  email: (value: any, fieldName: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (typeof value !== 'string' || !emailRegex.test(value)) {
      throw new ValidationError(`${fieldName} must be a valid email address`)
    }
    return value
  },

  uuid: (value: any, fieldName: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (typeof value !== 'string' || !uuidRegex.test(value)) {
      throw new ValidationError(`${fieldName} must be a valid UUID`)
    }
    return value
  },

  number: (value: any, fieldName: string, min?: number, max?: number) => {
    const num = Number(value)
    if (isNaN(num)) {
      throw new ValidationError(`${fieldName} must be a number`)
    }
    if (min !== undefined && num < min) {
      throw new ValidationError(`${fieldName} must be at least ${min}`)
    }
    if (max !== undefined && num > max) {
      throw new ValidationError(`${fieldName} must be no more than ${max}`)
    }
    return num
  },

  array: (value: any, fieldName: string, minLength?: number, maxLength?: number) => {
    if (!Array.isArray(value)) {
      throw new ValidationError(`${fieldName} must be an array`)
    }
    if (minLength !== undefined && value.length < minLength) {
      throw new ValidationError(`${fieldName} must have at least ${minLength} items`)
    }
    if (maxLength !== undefined && value.length > maxLength) {
      throw new ValidationError(`${fieldName} must have no more than ${maxLength} items`)
    }
    return value
  }
}

/**
 * Security helpers
 */
export const security = {
  sanitizeString: (input: string): string => {
    return input
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim()
  },

  isValidUrl: (url: string): boolean => {
    try {
      const parsedUrl = new URL(url)
      return ['http:', 'https:'].includes(parsedUrl.protocol)
    } catch {
      return false
    }
  },

  generateRequestId: (): string => {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}