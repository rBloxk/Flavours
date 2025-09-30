"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaProtection = exports.MediaProtectionMiddleware = void 0;
const logger_1 = require("../utils/logger");
class MediaProtectionMiddleware {
    constructor(config) {
        this.activeStreams = new Map();
        this.accessLogs = [];
        this.validateMediaAccess = (req, res, next) => {
            try {
                const { token, mediaId, clientId } = req.query;
                const userAgent = req.get('User-Agent') || '';
                const ip = req.ip || req.connection.remoteAddress || 'unknown';
                this.logAccessAttempt({
                    token: token,
                    mediaId: mediaId,
                    clientId: clientId,
                    ip,
                    userAgent,
                    timestamp: new Date().toISOString()
                });
                if (this.isBlockedUserAgent(userAgent)) {
                    logger_1.logger.warn('Blocked user agent detected:', { userAgent, ip });
                    return res.status(403).json({
                        error: 'Access denied',
                        reason: 'Blocked user agent'
                    });
                }
                if (!this.validateToken(token)) {
                    logger_1.logger.warn('Invalid token:', { token, ip });
                    return res.status(401).json({
                        error: 'Invalid or expired token'
                    });
                }
                if (!this.checkConcurrentStreams(token, clientId)) {
                    logger_1.logger.warn('Stream limit exceeded:', { token, clientId, ip });
                    return res.status(429).json({
                        error: 'Stream limit exceeded',
                        maxStreams: this.config.maxConcurrentStreams
                    });
                }
                this.addSecurityHeaders(res);
                next();
            }
            catch (error) {
                logger_1.logger.error('Media protection error:', error);
                res.status(500).json({
                    error: 'Internal server error'
                });
            }
        };
        this.config = config;
    }
    validateToken(token) {
        if (!token)
            return false;
        try {
            const tokenData = this.decryptToken(token);
            if (!tokenData)
                return false;
            if (Date.now() > tokenData.expiresAt) {
                return false;
            }
            return true;
        }
        catch (error) {
            logger_1.logger.error('Token validation error:', error);
            return false;
        }
    }
    checkConcurrentStreams(token, clientId) {
        try {
            const tokenData = this.decryptToken(token);
            if (!tokenData)
                return false;
            const userId = tokenData.userId;
            const userStreams = this.activeStreams.get(userId) || new Set();
            if (userStreams.size >= this.config.maxConcurrentStreams) {
                return false;
            }
            userStreams.add(clientId);
            this.activeStreams.set(userId, userStreams);
            const originalEnd = res.end;
            res.end = function (...args) {
                userStreams.delete(clientId);
                if (userStreams.size === 0) {
                    this.activeStreams.delete(userId);
                }
                else {
                    this.activeStreams.set(userId, userStreams);
                }
                originalEnd.apply(this, args);
            };
            return true;
        }
        catch (error) {
            logger_1.logger.error('Concurrent streams check error:', error);
            return false;
        }
    }
    isBlockedUserAgent(userAgent) {
        const blockedPatterns = [
            'wget', 'curl', 'python-requests', 'postman', 'insomnia',
            'httpie', 'aria2', 'axel', 'youtube-dl', 'ffmpeg',
            'bot', 'crawler', 'spider', 'scraper'
        ];
        return blockedPatterns.some(pattern => userAgent.toLowerCase().includes(pattern));
    }
    addSecurityHeaders(res) {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Content-Disposition', 'inline');
        res.setHeader('X-Accel-Buffering', 'no');
    }
    logAccessAttempt(logData) {
        if (!this.config.enableAccessLogging)
            return;
        this.accessLogs.push(logData);
        if (this.accessLogs.length > 1000) {
            this.accessLogs = this.accessLogs.slice(-1000);
        }
        logger_1.logger.info('Media access attempt:', logData);
    }
    decryptToken(token) {
        try {
            const secretKey = process.env.MEDIA_SECRET_KEY || 'default-secret-key';
            return {
                userId: 'demo-user',
                expiresAt: Date.now() + (60 * 60 * 1000),
                permissions: ['view']
            };
        }
        catch (error) {
            return null;
        }
    }
    getSecurityStats() {
        return {
            activeStreams: Array.from(this.activeStreams.values()).reduce((sum, streams) => sum + streams.size, 0),
            uniqueUsers: this.activeStreams.size,
            totalAccessLogs: this.accessLogs.length,
            config: this.config
        };
    }
    getAccessLogs(limit = 100) {
        return this.accessLogs.slice(-limit);
    }
}
exports.MediaProtectionMiddleware = MediaProtectionMiddleware;
const defaultConfig = {
    enableDRM: true,
    enableWatermarking: true,
    enableStreamingProtection: true,
    enableAccessLogging: true,
    maxConcurrentStreams: 3,
    tokenExpirationMinutes: 60,
    allowedDomains: ['localhost', 'flavours.club'],
    blockedUserAgents: [
        'wget', 'curl', 'python-requests', 'postman', 'insomnia',
        'httpie', 'aria2', 'axel', 'youtube-dl', 'ffmpeg'
    ]
};
exports.mediaProtection = new MediaProtectionMiddleware(defaultConfig);
//# sourceMappingURL=mediaProtection.js.map