"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditAuthOperation = exports.auditPaymentOperation = exports.auditSensitiveOperation = exports.logAuditEntry = exports.auditLogger = void 0;
const supabase_1 = require("../config/supabase");
const logger_1 = require("../utils/logger");
const auditLogger = async (req, res, next) => {
    const startTime = Date.now();
    const originalSend = res.send;
    res.send = function (data) {
        const duration = Date.now() - startTime;
        const status = res.statusCode >= 400 ? 'failure' : 'success';
        (0, exports.logAuditEntry)({
            user_id: req.user?.id,
            action: `${req.method} ${req.route?.path || req.path}`,
            resource: req.path.split('/')[1] || 'unknown',
            resource_id: req.params.id,
            details: {
                method: req.method,
                url: req.url,
                body: req.method !== 'GET' ? req.body : undefined,
                query: req.query,
                params: req.params,
                status_code: res.statusCode,
                duration_ms: duration,
                response_size: data ? data.length : 0
            },
            ip_address: req.ip || req.connection.remoteAddress || 'unknown',
            user_agent: req.get('User-Agent') || 'unknown',
            timestamp: new Date().toISOString(),
            status,
            error_message: res.statusCode >= 400 ? data : undefined
        });
        return originalSend.call(this, data);
    };
    next();
};
exports.auditLogger = auditLogger;
const logAuditEntry = async (auditData) => {
    try {
        const { error } = await supabase_1.supabase
            .from('audit_logs')
            .insert({
            user_id: auditData.user_id,
            action: auditData.action,
            resource: auditData.resource,
            resource_id: auditData.resource_id,
            details: auditData.details,
            ip_address: auditData.ip_address,
            user_agent: auditData.user_agent,
            timestamp: auditData.timestamp,
            status: auditData.status,
            error_message: auditData.error_message
        });
        if (error) {
            logger_1.logger.error('Failed to log audit entry:', error);
        }
        if (auditData.action.includes('DELETE') ||
            auditData.action.includes('PAYMENT') ||
            auditData.action.includes('AUTH')) {
            logger_1.logger.info('Critical action logged:', auditData);
        }
    }
    catch (error) {
        logger_1.logger.error('Audit logging error:', error);
    }
};
exports.logAuditEntry = logAuditEntry;
const auditSensitiveOperation = (operation) => {
    return async (req, res, next) => {
        try {
            await (0, exports.logAuditEntry)({
                user_id: req.user?.id,
                action: operation,
                resource: req.path.split('/')[1] || 'unknown',
                resource_id: req.params.id,
                details: {
                    method: req.method,
                    url: req.url,
                    body: req.body,
                    query: req.query,
                    params: req.params
                },
                ip_address: req.ip || req.connection.remoteAddress || 'unknown',
                user_agent: req.get('User-Agent') || 'unknown',
                timestamp: new Date().toISOString(),
                status: 'success'
            });
            next();
        }
        catch (error) {
            logger_1.logger.error('Sensitive operation audit error:', error);
            next();
        }
    };
};
exports.auditSensitiveOperation = auditSensitiveOperation;
const auditPaymentOperation = async (req, res, next) => {
    const originalSend = res.send;
    res.send = function (data) {
        const status = res.statusCode >= 400 ? 'failure' : 'success';
        (0, exports.logAuditEntry)({
            user_id: req.user?.id,
            action: `PAYMENT_${req.method}`,
            resource: 'payment',
            resource_id: req.params.id,
            details: {
                method: req.method,
                url: req.url,
                body: req.body,
                status_code: res.statusCode,
                response: data
            },
            ip_address: req.ip || req.connection.remoteAddress || 'unknown',
            user_agent: req.get('User-Agent') || 'unknown',
            timestamp: new Date().toISOString(),
            status,
            error_message: res.statusCode >= 400 ? data : undefined
        });
        return originalSend.call(this, data);
    };
    next();
};
exports.auditPaymentOperation = auditPaymentOperation;
const auditAuthOperation = async (req, res, next) => {
    const originalSend = res.send;
    res.send = function (data) {
        const status = res.statusCode >= 400 ? 'failure' : 'success';
        (0, exports.logAuditEntry)({
            user_id: req.user?.id,
            action: `AUTH_${req.method}`,
            resource: 'authentication',
            details: {
                method: req.method,
                url: req.url,
                body: req.method !== 'GET' ? req.body : undefined,
                status_code: res.statusCode,
                response: data
            },
            ip_address: req.ip || req.connection.remoteAddress || 'unknown',
            user_agent: req.get('User-Agent') || 'unknown',
            timestamp: new Date().toISOString(),
            status,
            error_message: res.statusCode >= 400 ? data : undefined
        });
        return originalSend.call(this, data);
    };
    next();
};
exports.auditAuthOperation = auditAuthOperation;
//# sourceMappingURL=audit.js.map