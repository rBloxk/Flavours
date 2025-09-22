"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const routes_1 = require("./routes");
const websocket_1 = require("./websocket");
const logger_1 = require("./utils/logger");
const errorHandler_1 = require("./middleware/errorHandler");
const rateLimiter_1 = require("./middleware/rateLimiter");
const security_1 = require("./middleware/security");
const monitoring_1 = require("./middleware/monitoring");
const audit_1 = require("./middleware/audit");
const validation_1 = require("./middleware/validation");
const redis_1 = require("./config/redis");
const database_1 = require("./config/database");
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: true
    },
    transports: ['websocket', 'polling']
});
exports.io = io;
const PORT = process.env.PORT || 3001;
app.set('trust proxy', 1);
process.on('unhandledRejection', errorHandler_1.handleUnhandledRejection);
process.on('uncaughtException', errorHandler_1.handleUncaughtException);
process.on('SIGTERM', () => (0, errorHandler_1.gracefulShutdown)('SIGTERM'));
process.on('SIGINT', () => (0, errorHandler_1.gracefulShutdown)('SIGINT'));
app.use(security_1.securityHeaders);
app.use(security_1.ipFilter);
app.use(security_1.requestSizeLimiter);
app.use(security_1.sqlInjectionProtection);
app.use(security_1.xssProtection);
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID']
}));
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https:"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
        }
    },
    crossOriginEmbedderPolicy: false
}));
app.use(express_1.default.json({
    limit: '10mb',
    verify: (req, res, buf) => {
        try {
            JSON.parse(buf.toString());
        }
        catch (e) {
            res.status(400).json({ error: 'Invalid JSON' });
            throw new Error('Invalid JSON');
        }
    }
}));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, validation_1.validateContentType)(['application/json', 'multipart/form-data', 'application/x-www-form-urlencoded']));
app.use(validation_1.sanitizeInput);
app.use(errorHandler_1.errorRecovery);
app.use(monitoring_1.requestMonitoring);
app.use(monitoring_1.performanceMonitoring);
app.use(monitoring_1.errorTracking);
app.use(rateLimiter_1.rateLimiter);
app.use(audit_1.auditLogger);
app.get('/health', monitoring_1.healthCheck);
app.get('/metrics', monitoring_1.metricsEndpoint);
(0, routes_1.setupRoutes)(app);
const websocketHandlers = (0, websocket_1.setupWebSocket)(io);
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});
app.use(errorHandler_1.errorHandler);
server.listen(PORT, async () => {
    try {
        await redis_1.redisManager.healthCheck();
        await database_1.databaseManager.healthCheck();
        logger_1.logger.info(`🚀 Flavours Backend Server running on port ${PORT}`);
        logger_1.logger.info(`🔗 WebSocket server ready`);
        logger_1.logger.info(`📊 Health check: http://localhost:${PORT}/health`);
        logger_1.logger.info(`📈 Metrics: http://localhost:${PORT}/metrics`);
        logger_1.logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        logger_1.logger.info(`🔒 Security: Enhanced`);
        logger_1.logger.info(`📝 Monitoring: Enabled`);
        logger_1.logger.info(`💾 Cache: Redis connected`);
        logger_1.logger.info(`🗄️ Database: Supabase connected`);
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
});
const shutdown = async () => {
    logger_1.logger.info('Shutting down server...');
    server.close(async () => {
        try {
            await redis_1.redisManager.close();
            await database_1.databaseManager.close();
            logger_1.logger.info('Server shut down gracefully');
            process.exit(0);
        }
        catch (error) {
            logger_1.logger.error('Error during shutdown:', error);
            process.exit(1);
        }
    });
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
//# sourceMappingURL=index.js.map