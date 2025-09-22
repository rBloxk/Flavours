"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateContentType = exports.validateRateLimit = exports.sanitizeInput = exports.commonSchemas = exports.validateFileUpload = exports.validateParams = exports.validateQuery = exports.validateRequestJoi = exports.validateRequest = void 0;
const joi_1 = __importDefault(require("joi"));
const zod_1 = require("zod");
const logger_1 = require("../utils/logger");
const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            const result = schema.parse(req.body);
            req.body = result;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const errorDetails = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                    value: err.input
                }));
                logger_1.logger.warn('Validation error', {
                    errors: errorDetails,
                    body: req.body,
                    ip: req.ip,
                    userAgent: req.get('User-Agent')
                });
                return res.status(400).json({
                    error: 'Validation failed',
                    details: errorDetails
                });
            }
            logger_1.logger.error('Unexpected validation error:', error);
            return res.status(500).json({
                error: 'Internal server error'
            });
        }
    };
};
exports.validateRequest = validateRequest;
const validateRequestJoi = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
            convert: true
        });
        if (error) {
            const errorDetails = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                value: detail.context?.value
            }));
            logger_1.logger.warn('Validation error', {
                errors: errorDetails,
                body: req.body,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            return res.status(400).json({
                error: 'Validation failed',
                details: errorDetails
            });
        }
        req.body = value;
        next();
    };
};
exports.validateRequestJoi = validateRequestJoi;
const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true,
            convert: true
        });
        if (error) {
            const errorDetails = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                value: detail.context?.value
            }));
            return res.status(400).json({
                error: 'Query validation failed',
                details: errorDetails
            });
        }
        req.query = value;
        next();
    };
};
exports.validateQuery = validateQuery;
const validateParams = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.params, {
            abortEarly: false,
            stripUnknown: true,
            convert: true
        });
        if (error) {
            const errorDetails = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                value: detail.context?.value
            }));
            return res.status(400).json({
                error: 'Parameter validation failed',
                details: errorDetails
            });
        }
        req.params = value;
        next();
    };
};
exports.validateParams = validateParams;
const validateFileUpload = (options) => {
    return (req, res, next) => {
        const file = req.file;
        const files = req.files;
        if (options.required && !file && (!files || files.length === 0)) {
            return res.status(400).json({
                error: 'File is required'
            });
        }
        const filesToCheck = file ? [file] : (files || []);
        for (const fileToCheck of filesToCheck) {
            if (options.maxSize && fileToCheck.size > options.maxSize) {
                return res.status(400).json({
                    error: `File size exceeds limit of ${options.maxSize} bytes`
                });
            }
            if (options.allowedTypes && !options.allowedTypes.includes(fileToCheck.mimetype)) {
                return res.status(400).json({
                    error: `File type ${fileToCheck.mimetype} is not allowed`
                });
            }
        }
        next();
    };
};
exports.validateFileUpload = validateFileUpload;
exports.commonSchemas = {
    uuid: joi_1.default.string().uuid().required(),
    uuidOptional: joi_1.default.string().uuid().optional(),
    email: joi_1.default.string().email().lowercase().trim().required(),
    emailOptional: joi_1.default.string().email().lowercase().trim().optional(),
    password: joi_1.default.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
        .messages({
        'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
    }),
    username: joi_1.default.string()
        .alphanum()
        .min(3)
        .max(30)
        .required()
        .messages({
        'string.alphanum': 'Username must contain only alphanumeric characters'
    }),
    displayName: joi_1.default.string()
        .min(1)
        .max(100)
        .trim()
        .required(),
    bio: joi_1.default.string()
        .max(500)
        .trim()
        .optional(),
    url: joi_1.default.string().uri().required(),
    urlOptional: joi_1.default.string().uri().optional(),
    phone: joi_1.default.string()
        .pattern(/^\+?[1-9]\d{1,14}$/)
        .optional()
        .messages({
        'string.pattern.base': 'Phone number must be a valid international format'
    }),
    date: joi_1.default.date().iso().required(),
    dateOptional: joi_1.default.date().iso().optional(),
    pagination: joi_1.default.object({
        page: joi_1.default.number().integer().min(1).default(1),
        limit: joi_1.default.number().integer().min(1).max(100).default(20),
        sort: joi_1.default.string().optional(),
        order: joi_1.default.string().valid('asc', 'desc').default('desc')
    }),
    search: joi_1.default.object({
        q: joi_1.default.string().min(1).max(100).trim().optional(),
        category: joi_1.default.string().optional(),
        tags: joi_1.default.array().items(joi_1.default.string()).optional(),
        dateFrom: joi_1.default.date().iso().optional(),
        dateTo: joi_1.default.date().iso().optional()
    }),
    file: joi_1.default.object({
        fieldname: joi_1.default.string().required(),
        originalname: joi_1.default.string().required(),
        encoding: joi_1.default.string().required(),
        mimetype: joi_1.default.string().required(),
        size: joi_1.default.number().integer().min(1).required(),
        buffer: joi_1.default.binary().required()
    }),
    address: joi_1.default.object({
        line1: joi_1.default.string().min(1).max(100).required(),
        line2: joi_1.default.string().max(100).optional(),
        city: joi_1.default.string().min(1).max(50).required(),
        state: joi_1.default.string().min(1).max(50).required(),
        postalCode: joi_1.default.string().min(1).max(20).required(),
        country: joi_1.default.string().min(2).max(2).required()
    }),
    creditCard: joi_1.default.object({
        cardNumber: joi_1.default.string()
            .pattern(/^\d{13,19}$/)
            .required()
            .messages({
            'string.pattern.base': 'Card number must be 13-19 digits'
        }),
        expiryMonth: joi_1.default.string()
            .pattern(/^(0[1-9]|1[0-2])$/)
            .required()
            .messages({
            'string.pattern.base': 'Expiry month must be 01-12'
        }),
        expiryYear: joi_1.default.string()
            .pattern(/^\d{4}$/)
            .required()
            .messages({
            'string.pattern.base': 'Expiry year must be 4 digits'
        }),
        cvv: joi_1.default.string()
            .pattern(/^\d{3,4}$/)
            .required()
            .messages({
            'string.pattern.base': 'CVV must be 3-4 digits'
        }),
        cardholderName: joi_1.default.string()
            .min(1)
            .max(100)
            .trim()
            .required()
    }),
    amount: joi_1.default.number()
        .positive()
        .precision(2)
        .max(10000)
        .required()
        .messages({
        'number.positive': 'Amount must be positive',
        'number.max': 'Amount cannot exceed $10,000'
    }),
    content: joi_1.default.object({
        title: joi_1.default.string().min(1).max(200).trim().required(),
        description: joi_1.default.string().max(1000).trim().optional(),
        content: joi_1.default.string().min(1).max(10000).trim().required(),
        tags: joi_1.default.array().items(joi_1.default.string().max(50)).max(10).optional(),
        category: joi_1.default.string().max(50).optional(),
        isPublic: joi_1.default.boolean().default(true),
        price: joi_1.default.number().positive().precision(2).optional()
    })
};
const sanitizeInput = (req, res, next) => {
    const sanitizeValue = (value) => {
        if (typeof value === 'string') {
            return value
                .trim()
                .replace(/[<>]/g, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '');
        }
        if (typeof value === 'object' && value !== null) {
            const sanitized = {};
            for (const [key, val] of Object.entries(value)) {
                sanitized[key] = sanitizeValue(val);
            }
            return sanitized;
        }
        return value;
    };
    req.body = sanitizeValue(req.body);
    req.query = sanitizeValue(req.query);
    req.params = sanitizeValue(req.params);
    next();
};
exports.sanitizeInput = sanitizeInput;
const validateRateLimit = (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    const suspiciousPatterns = [
        /bot/i,
        /crawler/i,
        /spider/i,
        /scraper/i,
        /curl/i,
        /wget/i
    ];
    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent || ''));
    if (isSuspicious) {
        logger_1.logger.warn('Suspicious request detected', {
            ip: clientIP,
            userAgent,
            url: req.url,
            method: req.method
        });
    }
    next();
};
exports.validateRateLimit = validateRateLimit;
const validateContentType = (allowedTypes) => {
    return (req, res, next) => {
        const contentType = req.get('Content-Type');
        if (!contentType) {
            return res.status(400).json({
                error: 'Content-Type header is required'
            });
        }
        const isValidType = allowedTypes.some(type => contentType.includes(type));
        if (!isValidType) {
            return res.status(400).json({
                error: `Content-Type must be one of: ${allowedTypes.join(', ')}`
            });
        }
        next();
    };
};
exports.validateContentType = validateContentType;
//# sourceMappingURL=validation.js.map