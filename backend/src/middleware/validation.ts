import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import { logger } from '../utils/logger'
import { CustomError } from './errorHandler'

// Enhanced validation middleware
export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    })

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }))

      logger.warn('Validation error', {
        errors: errorDetails,
        body: req.body,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      })

      return res.status(400).json({
        error: 'Validation failed',
        details: errorDetails
      })
    }

    req.body = value
    next()
  }
}

// Query parameter validation
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    })

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }))

      return res.status(400).json({
        error: 'Query validation failed',
        details: errorDetails
      })
    }

    req.query = value
    next()
  }
}

// Path parameter validation
export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    })

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }))

      return res.status(400).json({
        error: 'Parameter validation failed',
        details: errorDetails
      })
    }

    req.params = value
    next()
  }
}

// File upload validation
export const validateFileUpload = (options: {
  maxSize?: number
  allowedTypes?: string[]
  required?: boolean
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const file = req.file
    const files = req.files as Express.Multer.File[]

    if (options.required && !file && (!files || files.length === 0)) {
      return res.status(400).json({
        error: 'File is required'
      })
    }

    const filesToCheck = file ? [file] : (files || [])

    for (const fileToCheck of filesToCheck) {
      // Check file size
      if (options.maxSize && fileToCheck.size > options.maxSize) {
        return res.status(400).json({
          error: `File size exceeds limit of ${options.maxSize} bytes`
        })
      }

      // Check file type
      if (options.allowedTypes && !options.allowedTypes.includes(fileToCheck.mimetype)) {
        return res.status(400).json({
          error: `File type ${fileToCheck.mimetype} is not allowed`
        })
      }
    }

    next()
  }
}

// Common validation schemas
export const commonSchemas = {
  // UUID validation
  uuid: Joi.string().uuid().required(),
  uuidOptional: Joi.string().uuid().optional(),

  // Email validation
  email: Joi.string().email().lowercase().trim().required(),
  emailOptional: Joi.string().email().lowercase().trim().optional(),

  // Password validation
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
    }),

  // Username validation
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': 'Username must contain only alphanumeric characters'
    }),

  // Display name validation
  displayName: Joi.string()
    .min(1)
    .max(100)
    .trim()
    .required(),

  // Bio validation
  bio: Joi.string()
    .max(500)
    .trim()
    .optional(),

  // URL validation
  url: Joi.string().uri().required(),
  urlOptional: Joi.string().uri().optional(),

  // Phone number validation
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Phone number must be a valid international format'
    }),

  // Date validation
  date: Joi.date().iso().required(),
  dateOptional: Joi.date().iso().optional(),

  // Pagination validation
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().optional(),
    order: Joi.string().valid('asc', 'desc').default('desc')
  }),

  // Search validation
  search: Joi.object({
    q: Joi.string().min(1).max(100).trim().optional(),
    category: Joi.string().optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    dateFrom: Joi.date().iso().optional(),
    dateTo: Joi.date().iso().optional()
  }),

  // File validation
  file: Joi.object({
    fieldname: Joi.string().required(),
    originalname: Joi.string().required(),
    encoding: Joi.string().required(),
    mimetype: Joi.string().required(),
    size: Joi.number().integer().min(1).required(),
    buffer: Joi.binary().required()
  }),

  // Address validation
  address: Joi.object({
    line1: Joi.string().min(1).max(100).required(),
    line2: Joi.string().max(100).optional(),
    city: Joi.string().min(1).max(50).required(),
    state: Joi.string().min(1).max(50).required(),
    postalCode: Joi.string().min(1).max(20).required(),
    country: Joi.string().min(2).max(2).required()
  }),

  // Credit card validation
  creditCard: Joi.object({
    cardNumber: Joi.string()
      .pattern(/^\d{13,19}$/)
      .required()
      .messages({
        'string.pattern.base': 'Card number must be 13-19 digits'
      }),
    expiryMonth: Joi.string()
      .pattern(/^(0[1-9]|1[0-2])$/)
      .required()
      .messages({
        'string.pattern.base': 'Expiry month must be 01-12'
      }),
    expiryYear: Joi.string()
      .pattern(/^\d{4}$/)
      .required()
      .messages({
        'string.pattern.base': 'Expiry year must be 4 digits'
      }),
    cvv: Joi.string()
      .pattern(/^\d{3,4}$/)
      .required()
      .messages({
        'string.pattern.base': 'CVV must be 3-4 digits'
      }),
    cardholderName: Joi.string()
      .min(1)
      .max(100)
      .trim()
      .required()
  }),

  // Amount validation
  amount: Joi.number()
    .positive()
    .precision(2)
    .max(10000)
    .required()
    .messages({
      'number.positive': 'Amount must be positive',
      'number.max': 'Amount cannot exceed $10,000'
    }),

  // Content validation
  content: Joi.object({
    title: Joi.string().min(1).max(200).trim().required(),
    description: Joi.string().max(1000).trim().optional(),
    content: Joi.string().min(1).max(10000).trim().required(),
    tags: Joi.array().items(Joi.string().max(50)).max(10).optional(),
    category: Joi.string().max(50).optional(),
    isPublic: Joi.boolean().default(true),
    price: Joi.number().positive().precision(2).optional()
  })
}

// Sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      return value
        .trim()
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: any = {}
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val)
      }
      return sanitized
    }
    return value
  }

  req.body = sanitizeValue(req.body)
  req.query = sanitizeValue(req.query)
  req.params = sanitizeValue(req.params)

  next()
}

// Rate limiting validation
export const validateRateLimit = (req: Request, res: Response, next: NextFunction) => {
  const clientIP = req.ip || req.connection.remoteAddress
  const userAgent = req.get('User-Agent')
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i
  ]
  
  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(userAgent || '')
  )
  
  if (isSuspicious) {
    logger.warn('Suspicious request detected', {
      ip: clientIP,
      userAgent,
      url: req.url,
      method: req.method
    })
  }
  
  next()
}

// Content type validation
export const validateContentType = (allowedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentType = req.get('Content-Type')
    
    if (!contentType) {
      return res.status(400).json({
        error: 'Content-Type header is required'
      })
    }
    
    const isValidType = allowedTypes.some(type => 
      contentType.includes(type)
    )
    
    if (!isValidType) {
      return res.status(400).json({
        error: `Content-Type must be one of: ${allowedTypes.join(', ')}`
      })
    }
    
    next()
  }
}