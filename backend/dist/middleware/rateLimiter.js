"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = exports.rateLimiterMiddleware = void 0;
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
const logger_1 = require("../utils/logger");
const rateLimiter = new rate_limiter_flexible_1.RateLimiterMemory({
    points: 100,
    duration: 60,
});
const rateLimiterMiddleware = async (req, res, next) => {
    try {
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        await rateLimiter.consume(ip);
        next();
    }
    catch (rejRes) {
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        logger_1.logger.warn(`Rate limit exceeded for IP: ${ip}`);
        res.status(429).json({
            error: 'Too many requests',
            retryAfter: rejRes.msBeforeNext
        });
    }
};
exports.rateLimiterMiddleware = rateLimiterMiddleware;
exports.rateLimiter = exports.rateLimiterMiddleware;
//# sourceMappingURL=rateLimiter.js.map