"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorTracking = exports.performanceMonitoring = exports.metricsEndpoint = exports.healthCheck = exports.requestMonitoring = exports.metricsCollector = void 0;
const logger_1 = require("../utils/logger");
class MetricsCollector {
    constructor() {
        this.metrics = {
            requests_total: 0,
            requests_duration_ms: 0,
            requests_by_status: {},
            requests_by_method: {},
            requests_by_endpoint: {},
            active_connections: 0,
            memory_usage: process.memoryUsage(),
            uptime: process.uptime()
        };
        this.startTime = Date.now();
    }
    incrementRequest(method, endpoint, status, duration) {
        this.metrics.requests_total++;
        this.metrics.requests_duration_ms += duration;
        this.metrics.requests_by_status[status] = (this.metrics.requests_by_status[status] || 0) + 1;
        this.metrics.requests_by_method[method] = (this.metrics.requests_by_method[method] || 0) + 1;
        this.metrics.requests_by_endpoint[endpoint] = (this.metrics.requests_by_endpoint[endpoint] || 0) + 1;
        this.metrics.memory_usage = process.memoryUsage();
        this.metrics.uptime = process.uptime();
    }
    getMetrics() {
        return { ...this.metrics };
    }
    getAverageResponseTime() {
        return this.metrics.requests_total > 0
            ? this.metrics.requests_duration_ms / this.metrics.requests_total
            : 0;
    }
    getRequestsPerMinute() {
        const minutes = (Date.now() - this.startTime) / (1000 * 60);
        return minutes > 0 ? this.metrics.requests_total / minutes : 0;
    }
    reset() {
        this.metrics = {
            requests_total: 0,
            requests_duration_ms: 0,
            requests_by_status: {},
            requests_by_method: {},
            requests_by_endpoint: {},
            active_connections: 0,
            memory_usage: process.memoryUsage(),
            uptime: process.uptime()
        };
        this.startTime = Date.now();
    }
}
exports.metricsCollector = new MetricsCollector();
const requestMonitoring = (req, res, next) => {
    const startTime = Date.now();
    const method = req.method;
    const endpoint = req.route?.path || req.path;
    exports.metricsCollector.getMetrics().active_connections++;
    const originalSend = res.send;
    res.send = function (data) {
        const duration = Date.now() - startTime;
        const status = res.statusCode;
        exports.metricsCollector.incrementRequest(method, endpoint, status, duration);
        if (duration > 1000) {
            logger_1.logger.warn('Slow request detected', {
                method,
                endpoint,
                duration,
                status,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
        }
        if (status >= 400) {
            logger_1.logger.error('Request error', {
                method,
                endpoint,
                duration,
                status,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                body: req.body,
                query: req.query
            });
        }
        exports.metricsCollector.getMetrics().active_connections--;
        return originalSend.call(this, data);
    };
    next();
};
exports.requestMonitoring = requestMonitoring;
const healthCheck = (req, res) => {
    const metrics = exports.metricsCollector.getMetrics();
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        uptime: process.uptime(),
        memory: {
            used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
            total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
            external: Math.round(memoryUsage.external / 1024 / 1024),
            rss: Math.round(memoryUsage.rss / 1024 / 1024)
        },
        cpu: {
            user: cpuUsage.user,
            system: cpuUsage.system
        },
        metrics: {
            requests_total: metrics.requests_total,
            average_response_time: exports.metricsCollector.getAverageResponseTime(),
            requests_per_minute: exports.metricsCollector.getRequestsPerMinute(),
            active_connections: metrics.active_connections,
            requests_by_status: metrics.requests_by_status,
            requests_by_method: metrics.requests_by_method
        },
        environment: process.env.NODE_ENV || 'development'
    };
    const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    if (memoryUsagePercent > 90) {
        health.status = 'unhealthy';
        health.memory.critical = true;
    }
    res.status(health.status === 'healthy' ? 200 : 503).json(health);
};
exports.healthCheck = healthCheck;
const metricsEndpoint = (req, res) => {
    const metrics = exports.metricsCollector.getMetrics();
    const prometheusMetrics = `
# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total ${metrics.requests_total}

# HELP http_request_duration_milliseconds Total duration of HTTP requests in milliseconds
# TYPE http_request_duration_milliseconds counter
http_request_duration_milliseconds ${metrics.requests_duration_ms}

# HELP http_requests_by_status Total number of HTTP requests by status code
# TYPE http_requests_by_status counter
${Object.entries(metrics.requests_by_status).map(([status, count]) => `http_requests_by_status{status="${status}"} ${count}`).join('\n')}

# HELP http_requests_by_method Total number of HTTP requests by method
# TYPE http_requests_by_method counter
${Object.entries(metrics.requests_by_method).map(([method, count]) => `http_requests_by_method{method="${method}"} ${count}`).join('\n')}

# HELP nodejs_memory_usage_bytes Node.js memory usage in bytes
# TYPE nodejs_memory_usage_bytes gauge
nodejs_memory_usage_bytes{type="heap_used"} ${metrics.memory_usage.heapUsed}
nodejs_memory_usage_bytes{type="heap_total"} ${metrics.memory_usage.heapTotal}
nodejs_memory_usage_bytes{type="external"} ${metrics.memory_usage.external}
nodejs_memory_usage_bytes{type="rss"} ${metrics.memory_usage.rss}

# HELP nodejs_uptime_seconds Node.js uptime in seconds
# TYPE nodejs_uptime_seconds counter
nodejs_uptime_seconds ${metrics.uptime}
`;
    res.set('Content-Type', 'text/plain');
    res.send(prometheusMetrics);
};
exports.metricsEndpoint = metricsEndpoint;
const performanceMonitoring = (req, res, next) => {
    const startTime = process.hrtime.bigint();
    const originalSend = res.send;
    res.send = function (data) {
        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - startTime) / 1000000;
        logger_1.logger.info('Request performance', {
            method: req.method,
            url: req.url,
            duration_ms: duration,
            status: res.statusCode,
            memory_used: process.memoryUsage().heapUsed,
            memory_total: process.memoryUsage().heapTotal
        });
        return originalSend.call(this, data);
    };
    next();
};
exports.performanceMonitoring = performanceMonitoring;
const errorTracking = (error, req, res, next) => {
    logger_1.logger.error('Application error', {
        error: error.message,
        stack: error.stack,
        method: req.method,
        url: req.url,
        body: req.body,
        query: req.query,
        params: req.params,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });
    if (process.env.NODE_ENV === 'production') {
    }
    next(error);
};
exports.errorTracking = errorTracking;
//# sourceMappingURL=monitoring.js.map