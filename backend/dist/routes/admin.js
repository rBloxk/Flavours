"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const admin_1 = require("../schemas/admin");
const adminService_1 = require("../services/adminService");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
const adminService = new adminService_1.AdminService();
router.use(auth_1.authMiddleware);
router.use(auth_1.requireAdmin);
router.get('/dashboard', async (req, res) => {
    try {
        const stats = await adminService.getDashboardStats();
        res.json({
            stats
        });
    }
    catch (error) {
        logger_1.logger.error('Get dashboard stats error:', error);
        res.status(500).json({
            error: 'Failed to fetch dashboard stats'
        });
    }
});
router.get('/moderation/queue', async (req, res) => {
    try {
        const { page = 1, limit = 20, status = 'pending', type } = req.query;
        const items = await adminService.getModerationQueue({
            page: Number(page),
            limit: Number(limit),
            status: status,
            type: type
        });
        res.json({
            items,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: items.length
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Get moderation queue error:', error);
        res.status(500).json({
            error: 'Failed to fetch moderation queue'
        });
    }
});
router.post('/moderation/:id/review', (0, validation_1.validateRequest)(admin_1.adminSchemas.reviewModeration), async (req, res) => {
    try {
        const { id } = req.params;
        const { action, reason } = req.body;
        const reviewerId = req.user.id;
        const result = await adminService.reviewModerationItem(id, reviewerId, action, reason);
        res.json({
            message: 'Moderation item reviewed successfully',
            result
        });
    }
    catch (error) {
        logger_1.logger.error('Review moderation error:', error);
        res.status(500).json({
            error: 'Failed to review moderation item'
        });
    }
});
router.get('/reports', async (req, res) => {
    try {
        const { page = 1, limit = 20, status = 'pending', type } = req.query;
        const reports = await adminService.getReports({
            page: Number(page),
            limit: Number(limit),
            status: status,
            type: type
        });
        res.json({
            reports,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: reports.length
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Get reports error:', error);
        res.status(500).json({
            error: 'Failed to fetch reports'
        });
    }
});
router.post('/reports/:id/handle', (0, validation_1.validateRequest)(admin_1.adminSchemas.handleReport), async (req, res) => {
    try {
        const { id } = req.params;
        const { action, notes } = req.body;
        const adminId = req.user.id;
        const result = await adminService.handleReport(id, adminId, action, notes);
        res.json({
            message: 'Report handled successfully',
            result
        });
    }
    catch (error) {
        logger_1.logger.error('Handle report error:', error);
        res.status(500).json({
            error: 'Failed to handle report'
        });
    }
});
router.get('/users', async (req, res) => {
    try {
        const { page = 1, limit = 20, search, role, status } = req.query;
        const users = await adminService.getUsers({
            page: Number(page),
            limit: Number(limit),
            search: search,
            role: role,
            status: status
        });
        res.json({
            users,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: users.length
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Get users error:', error);
        res.status(500).json({
            error: 'Failed to fetch users'
        });
    }
});
router.put('/users/:id/status', (0, validation_1.validateRequest)(admin_1.adminSchemas.updateUserStatus), async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;
        const adminId = req.user.id;
        const result = await adminService.updateUserStatus(id, status, reason, adminId);
        res.json({
            message: 'User status updated successfully',
            result
        });
    }
    catch (error) {
        logger_1.logger.error('Update user status error:', error);
        res.status(500).json({
            error: 'Failed to update user status'
        });
    }
});
router.get('/creators', async (req, res) => {
    try {
        const { page = 1, limit = 20, verificationStatus, search } = req.query;
        const creators = await adminService.getCreators({
            page: Number(page),
            limit: Number(limit),
            verificationStatus: verificationStatus,
            search: search
        });
        res.json({
            creators,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: creators.length
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Get creators error:', error);
        res.status(500).json({
            error: 'Failed to fetch creators'
        });
    }
});
router.post('/creators/:id/verify', (0, validation_1.validateRequest)(admin_1.adminSchemas.verifyCreator), async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        const adminId = req.user.id;
        const result = await adminService.verifyCreator(id, status, notes, adminId);
        res.json({
            message: 'Creator verification updated successfully',
            result
        });
    }
    catch (error) {
        logger_1.logger.error('Verify creator error:', error);
        res.status(500).json({
            error: 'Failed to verify creator'
        });
    }
});
router.get('/analytics', async (req, res) => {
    try {
        const { period = '30d', metric } = req.query;
        const analytics = await adminService.getAnalytics({
            period: period,
            metric: metric
        });
        res.json({
            analytics
        });
    }
    catch (error) {
        logger_1.logger.error('Get analytics error:', error);
        res.status(500).json({
            error: 'Failed to fetch analytics'
        });
    }
});
router.get('/analytics/revenue', async (req, res) => {
    try {
        const { period = '30d', breakdown } = req.query;
        const revenue = await adminService.getRevenueAnalytics({
            period: period,
            breakdown: breakdown
        });
        res.json({
            revenue
        });
    }
    catch (error) {
        logger_1.logger.error('Get revenue analytics error:', error);
        res.status(500).json({
            error: 'Failed to fetch revenue analytics'
        });
    }
});
router.get('/analytics/content', async (req, res) => {
    try {
        const { period = '30d', type } = req.query;
        const content = await adminService.getContentAnalytics({
            period: period,
            type: type
        });
        res.json({
            content
        });
    }
    catch (error) {
        logger_1.logger.error('Get content analytics error:', error);
        res.status(500).json({
            error: 'Failed to fetch content analytics'
        });
    }
});
router.get('/system/health', async (req, res) => {
    try {
        const health = await adminService.getSystemHealth();
        res.json({
            health
        });
    }
    catch (error) {
        logger_1.logger.error('Get system health error:', error);
        res.status(500).json({
            error: 'Failed to fetch system health'
        });
    }
});
router.get('/audit-logs', async (req, res) => {
    try {
        const { page = 1, limit = 20, action, userId, dateFrom, dateTo } = req.query;
        const logs = await adminService.getAuditLogs({
            page: Number(page),
            limit: Number(limit),
            action: action,
            userId: userId,
            dateFrom: dateFrom,
            dateTo: dateTo
        });
        res.json({
            logs,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: logs.length
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Get audit logs error:', error);
        res.status(500).json({
            error: 'Failed to fetch audit logs'
        });
    }
});
exports.default = router;
//# sourceMappingURL=admin.js.map