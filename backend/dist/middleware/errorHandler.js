"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gracefulShutdown = exports.errorRecovery = exports.handleUncaughtException = exports.handleUnhandledRejection = exports.notFoundHandler = exports.asyncHandler = exports.errorHandler = exports.ExternalServiceError = exports.DatabaseError = exports.PaymentError = exports.RateLimitError = exports.ConflictError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.CustomError = void 0;
const logger_1 = require("../utils/logger");
const redis_1 = require("../config/redis");
class CustomError extends Error {
    constructor(message, statusCode = 500, isOperational = true, code = 'INTERNAL_ERROR', details, retryable = false) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.code = code;
        this.details = details;
        this.retryable = retryable;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.CustomError = CustomError;
class ValidationError extends CustomError {
    constructor(message, details) {
        super(message, 400, true, 'VALIDATION_ERROR', details);
    }
}
exports.ValidationError = ValidationError;
class AuthenticationError extends CustomError {
    constructor(message = 'Authentication required') {
        super(message, 401, true, 'AUTHENTICATION_ERROR');
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends CustomError {
    constructor(message = 'Insufficient permissions') {
        super(message, 403, true, 'AUTHORIZATION_ERROR');
    }
}
exports.AuthorizationError = AuthorizationError;
class NotFoundError extends CustomError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404, true, 'NOT_FOUND_ERROR');
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends CustomError {
    constructor(message, details) {
        super(message, 409, true, 'CONFLICT_ERROR', details);
    }
}
exports.ConflictError = ConflictError;
class RateLimitError extends CustomError {
    constructor(message = 'Too many requests') {
        super(message, 429, true, 'RATE_LIMIT_ERROR');
    }
}
exports.RateLimitError = RateLimitError;
class PaymentError extends CustomError {
    constructor(message, details) {
        super(message, 402, true, 'PAYMENT_ERROR', details);
    }
}
exports.PaymentError = PaymentError;
class DatabaseError extends CustomError {
    constructor(message, details) {
        super(message, 500, true, 'DATABASE_ERROR', details, true);
    }
}
exports.DatabaseError = DatabaseError;
class ExternalServiceError extends CustomError {
    constructor(service, message, details) {
        super(`${service} service error: ${message}`, 502, true, 'EXTERNAL_SERVICE_ERROR', details, true);
    }
}
exports.ExternalServiceError = ExternalServiceError;
const errorHandler = (error, req, res, next) => {
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Internal server error';
    let code = error.code || 'INTERNAL_ERROR';
    const errorContext = {
        message: error.message,
        stack: error.stack,
        code: error.code,
        statusCode: error.statusCode,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
        timestamp: new Date().toISOString(),
        retryable: error.retryable,
        details: error.details
    };
    if (statusCode >= 500) {
        logger_1.logger.error('Server error occurred:', errorContext);
    }
    else if (statusCode >= 400) {
        logger_1.logger.warn('Client error occurred:', errorContext);
    }
    else {
        logger_1.logger.info('Error occurred:', errorContext);
    }
    if (error.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation error';
        code = 'VALIDATION_ERROR';
    }
    else if (error.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID format';
        code = 'INVALID_ID_FORMAT';
    }
    else if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
        code = 'INVALID_TOKEN';
    }
    else if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
        code = 'TOKEN_EXPIRED';
    }
    else if (error.name === 'MulterError') {
        statusCode = 400;
        code = 'FILE_UPLOAD_ERROR';
        if (error.message.includes('File too large')) {
            message = 'File size too large';
        }
        else if (error.message.includes('Unexpected field')) {
            message = 'Unexpected file field';
        }
        else {
            message = 'File upload error';
        }
    }
    else if (error.name === 'MongoError' || error.name === 'MongooseError') {
        statusCode = 500;
        message = 'Database error';
        code = 'DATABASE_ERROR';
    }
    else if (error.name === 'RedisError') {
        statusCode = 500;
        message = 'Cache service error';
        code = 'CACHE_ERROR';
    }
    trackErrorMetrics(statusCode, code, req);
    const isDevelopment = process.env.NODE_ENV === 'development';
    const errorResponse = {
        error: message,
        code,
        timestamp: new Date().toISOString(),
        path: req.url,
        method: req.method,
        requestId: req.headers['x-request-id'] || generateRequestId()
    };
    if (isDevelopment) {
        errorResponse.stack = error.stack;
        errorResponse.details = error.details || error.message;
    }
    if (error.retryable) {
        errorResponse.retryable = true;
        errorResponse.retryAfter = 60;
    }
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
const trackErrorMetrics = (statusCode, code, req) => {
    try {
        const errorKey = `error:${statusCode}:${code}:${new Date().toISOString().split('T')[0]}`;
        redis_1.redisManager.set(errorKey, 1, 86400);
    }
    catch (error) {
        logger_1.logger.error('Failed to track error metrics:', error);
    }
};
const generateRequestId = () => {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((error) => {
            if (error instanceof CustomError) {
                error.details = {
                    ...error.details,
                    requestId: req.headers['x-request-id'],
                    userId: req.user?.id,
                    ip: req.ip,
                    userAgent: req.get('User-Agent')
                };
            }
            next(error);
        });
    };
};
exports.asyncHandler = asyncHandler;
const notFoundHandler = (req, res, next) => {
    const error = new NotFoundError(`Route ${req.originalUrl}`);
    next(error);
};
exports.notFoundHandler = notFoundHandler;
const handleUnhandledRejection = (reason, promise) => {
    logger_1.logger.error('Unhandled Rejection at:', {
        promise,
        reason,
        timestamp: new Date().toISOString()
    });
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
};
exports.handleUnhandledRejection = handleUnhandledRejection;
const handleUncaughtException = (error) => {
    logger_1.logger.error('Uncaught Exception:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
    });
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
};
exports.handleUncaughtException = handleUncaughtException;
const errorRecovery = (req, res, next) => {
    if (!req.headers['x-request-id']) {
        req.headers['x-request-id'] = generateRequestId();
    }
    next();
};
exports.errorRecovery = errorRecovery;
const gracefulShutdown = (signal) => {
    logger_1.logger.info(`Received ${signal}, shutting down gracefully...`);
    process.exit(0);
};
exports.gracefulShutdown = gracefulShutdown;
//# sourceMappingURL=errorHandler.js.map