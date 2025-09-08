import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'
import { redisManager } from '../config/redis'

export interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
  code?: string
  details?: any
  retryable?: boolean
}

export class CustomError extends Error implements AppError {
  statusCode: number
  isOperational: boolean
  code: string
  details?: any
  retryable: boolean

  constructor(
    message: string, 
    statusCode: number = 500, 
    isOperational: boolean = true,
    code: string = 'INTERNAL_ERROR',
    details?: any,
    retryable: boolean = false
  ) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.code = code
    this.details = details
    this.retryable = retryable
    
    Error.captureStackTrace(this, this.constructor)
  }
}

// Specific error types
export class ValidationError extends CustomError {
  constructor(message: string, details?: any) {
    super(message, 400, true, 'VALIDATION_ERROR', details)
  }
}

export class AuthenticationError extends CustomError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, true, 'AUTHENTICATION_ERROR')
  }
}

export class AuthorizationError extends CustomError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, true, 'AUTHORIZATION_ERROR')
  }
}

export class NotFoundError extends CustomError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, true, 'NOT_FOUND_ERROR')
  }
}

export class ConflictError extends CustomError {
  constructor(message: string, details?: any) {
    super(message, 409, true, 'CONFLICT_ERROR', details)
  }
}

export class RateLimitError extends CustomError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, true, 'RATE_LIMIT_ERROR')
  }
}

export class PaymentError extends CustomError {
  constructor(message: string, details?: any) {
    super(message, 402, true, 'PAYMENT_ERROR', details)
  }
}

export class DatabaseError extends CustomError {
  constructor(message: string, details?: any) {
    super(message, 500, true, 'DATABASE_ERROR', details, true)
  }
}

export class ExternalServiceError extends CustomError {
  constructor(service: string, message: string, details?: any) {
    super(`${service} service error: ${message}`, 502, true, 'EXTERNAL_SERVICE_ERROR', details, true)
  }
}

// Enhanced error handler
export const errorHandler = (error: AppError, req: Request, res: Response, next: NextFunction) => {
  let statusCode = error.statusCode || 500
  let message = error.message || 'Internal server error'
  let code = error.code || 'INTERNAL_ERROR'

  // Log error details with context
  const errorContext = {
    message: error.message,
    stack: error.stack,
    code: error.code,
    statusCode: error.statusCode,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id,
    timestamp: new Date().toISOString(),
    retryable: error.retryable,
    details: error.details
  }

  // Log based on severity
  if (statusCode >= 500) {
    logger.error('Server error occurred:', errorContext)
  } else if (statusCode >= 400) {
    logger.warn('Client error occurred:', errorContext)
  } else {
    logger.info('Error occurred:', errorContext)
  }

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400
    message = 'Validation error'
    code = 'VALIDATION_ERROR'
  } else if (error.name === 'CastError') {
    statusCode = 400
    message = 'Invalid ID format'
    code = 'INVALID_ID_FORMAT'
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid token'
    code = 'INVALID_TOKEN'
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Token expired'
    code = 'TOKEN_EXPIRED'
  } else if (error.name === 'MulterError') {
    statusCode = 400
    code = 'FILE_UPLOAD_ERROR'
    if (error.message.includes('File too large')) {
      message = 'File size too large'
    } else if (error.message.includes('Unexpected field')) {
      message = 'Unexpected file field'
    } else {
      message = 'File upload error'
    }
  } else if (error.name === 'MongoError' || error.name === 'MongooseError') {
    statusCode = 500
    message = 'Database error'
    code = 'DATABASE_ERROR'
  } else if (error.name === 'RedisError') {
    statusCode = 500
    message = 'Cache service error'
    code = 'CACHE_ERROR'
  }

  // Track error metrics
  trackErrorMetrics(statusCode, code, req)

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  const errorResponse: any = {
    error: message,
    code,
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method,
    requestId: req.headers['x-request-id'] || generateRequestId()
  }

  if (isDevelopment) {
    errorResponse.stack = error.stack
    errorResponse.details = error.details || error.message
  }

  // Add retry information for retryable errors
  if (error.retryable) {
    errorResponse.retryable = true
    errorResponse.retryAfter = 60 // seconds
  }

  res.status(statusCode).json(errorResponse)
}

// Track error metrics
const trackErrorMetrics = (statusCode: number, code: string, req: Request) => {
  try {
    const errorKey = `error:${statusCode}:${code}:${new Date().toISOString().split('T')[0]}`
    redisManager.set(errorKey, 1, 86400) // 24 hours TTL
  } catch (error) {
    logger.error('Failed to track error metrics:', error)
  }
}

// Generate unique request ID
const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Enhanced async handler with error context
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      // Add request context to error
      if (error instanceof CustomError) {
        error.details = {
          ...error.details,
          requestId: req.headers['x-request-id'],
          userId: (req as any).user?.id,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        }
      }
      next(error)
    })
  }
}

// Not found handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new NotFoundError(`Route ${req.originalUrl}`)
  next(error)
}

// Global error handler for unhandled rejections
export const handleUnhandledRejection = (reason: any, promise: Promise<any>) => {
  logger.error('Unhandled Rejection at:', {
    promise,
    reason,
    timestamp: new Date().toISOString()
  })
  
  // In production, you might want to exit the process
  if (process.env.NODE_ENV === 'production') {
    process.exit(1)
  }
}

// Global error handler for uncaught exceptions
export const handleUncaughtException = (error: Error) => {
  logger.error('Uncaught Exception:', {
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  })
  
  // In production, you might want to exit the process
  if (process.env.NODE_ENV === 'production') {
    process.exit(1)
  }
}

// Error recovery middleware
export const errorRecovery = (req: Request, res: Response, next: NextFunction) => {
  // Set request ID for tracking
  if (!req.headers['x-request-id']) {
    req.headers['x-request-id'] = generateRequestId()
  }
  
  next()
}

// Graceful shutdown handler
export const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}, shutting down gracefully...`)
  
  // Close database connections
  // Close Redis connections
  // Close HTTP server
  
  process.exit(0)
}