"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.xssProtection = exports.sqlInjectionProtection = exports.requestSizeLimiter = exports.ipFilter = exports.securityHeaders = exports.speedLimiter = exports.apiRateLimit = exports.uploadRateLimit = exports.paymentRateLimit = exports.authRateLimit = exports.createRateLimit = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_slow_down_1 = __importDefault(require("express-slow-down"));
const logger_1 = require("../utils/logger");
const createRateLimit = (windowMs, max, message) => {
    return (0, express_rate_limit_1.default)({
        windowMs,
        max,
        message: { error: message },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            logger_1.logger.warn('Rate limit exceeded', {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                url: req.url,
                method: req.method
            });
            res.status(429).json({ error: message });
        }
    });
};
exports.createRateLimit = createRateLimit;
exports.authRateLimit = (0, exports.createRateLimit)(15 * 60 * 1000, 5, 'Too many authentication attempts, please try again later');
exports.paymentRateLimit = (0, exports.createRateLimit)(60 * 1000, 3, 'Too many payment attempts, please try again later');
exports.uploadRateLimit = (0, exports.createRateLimit)(60 * 1000, 10, 'Too many upload attempts, please try again later');
exports.apiRateLimit = (0, exports.createRateLimit)(15 * 60 * 1000, 100, 'Too many API requests, please try again later');
exports.speedLimiter = (0, express_slow_down_1.default)({
    windowMs: 15 * 60 * 1000,
    delayAfter: 50,
    delayMs: () => 500
});
const securityHeaders = (req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Content-Security-Policy', "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:; " +
        "connect-src 'self' https:; " +
        "font-src 'self' data:; " +
        "object-src 'none'; " +
        "base-uri 'self'; " +
        "form-action 'self'");
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
    next();
};
exports.securityHeaders = securityHeaders;
const ipFilter = (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    const blockedIPs = [];
    if (clientIP && blockedIPs.includes(clientIP)) {
        logger_1.logger.warn('Blocked IP attempt', { ip: clientIP, url: req.url });
        return res.status(403).json({ error: 'Access denied' });
    }
    next();
};
exports.ipFilter = ipFilter;
const requestSizeLimiter = (req, res, next) => {
    const contentLength = parseInt(req.get('content-length') || '0');
    const maxSize = 3650722201;
    if (contentLength > maxSize) {
        logger_1.logger.warn('Request too large', {
            size: contentLength,
            ip: req.ip,
            url: req.url
        });
        return res.status(413).json({ error: 'Request entity too large' });
    }
    next();
};
exports.requestSizeLimiter = requestSizeLimiter;
const sqlInjectionProtection = (req, res, next) => {
    const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
        /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
        /(\b(OR|AND)\s+['"]\s*=\s*['"])/i,
        /(\b(OR|AND)\s+['"]\d+['"]\s*=\s*['"]\d+['"])/i
    ];
    const checkValue = (value) => {
        if (typeof value === 'string') {
            return sqlPatterns.some(pattern => pattern.test(value));
        }
        if (typeof value === 'object' && value !== null) {
            return Object.values(value).some(checkValue);
        }
        return false;
    };
    if (checkValue(req.body) || checkValue(req.query) || checkValue(req.params)) {
        logger_1.logger.warn('SQL injection attempt detected', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            body: req.body,
            query: req.query,
            params: req.params
        });
        return res.status(400).json({ error: 'Invalid request' });
    }
    next();
};
exports.sqlInjectionProtection = sqlInjectionProtection;
const xssProtection = (req, res, next) => {
    const xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi
    ];
    const sanitizeValue = (value) => {
        if (typeof value === 'string') {
            return xssPatterns.reduce((str, pattern) => str.replace(pattern, ''), value);
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
    next();
};
exports.xssProtection = xssProtection;
//# sourceMappingURL=security.js.map