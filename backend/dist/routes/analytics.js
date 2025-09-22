"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_1 = require("../config/supabase");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const logger_1 = require("../utils/logger");
const analyticsService_1 = require("../services/analyticsService");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const analyticsQuerySchema = zod_1.z.object({
    period: zod_1.z.enum(['1d', '7d', '30d', '90d', '1y']).default('7d'),
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
    metric: zod_1.z.string().optional(),
    groupBy: zod_1.z.enum(['hour', 'day', 'week', 'month']).optional()
});
router.get('/platform', auth_1.authMiddleware, (0, validation_1.validateRequest)(analyticsQuerySchema), async (req, res) => {
    try {
        const userId = req.user.id;
        const { period, startDate, endDate, metric, groupBy } = req.query;
        const { data: profile } = await supabase_1.supabase
            .from('profiles')
            .select('is_admin')
            .eq('user_id', userId)
            .single();
        if (!profile?.is_admin) {
            return res.status(403).json({
                error: 'Admin access required'
            });
        }
        const analytics = await analyticsService_1.analyticsService.getPlatformAnalytics({
            period: period,
            startDate: startDate,
            endDate: endDate,
            metric: metric,
            groupBy: groupBy
        });
        res.json({ analytics });
    }
    catch (error) {
        logger_1.logger.error('Get platform analytics error:', error);
        res.status(500).json({
            error: 'Failed to fetch platform analytics'
        });
    }
});
router.get('/creator', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { period = '7d', startDate, endDate } = req.query;
        const { data: creator } = await supabase_1.supabase
            .from('creators')
            .select('id')
            .eq('user_id', userId)
            .single();
        if (!creator) {
            return res.status(403).json({
                error: 'Creator access required'
            });
        }
        const analytics = await analyticsService_1.analyticsService.getCreatorAnalytics(creator.id, {
            period: period,
            startDate: startDate,
            endDate: endDate
        });
        res.json({ analytics });
    }
    catch (error) {
        logger_1.logger.error('Get creator analytics error:', error);
        res.status(500).json({
            error: 'Failed to fetch creator analytics'
        });
    }
});
router.get('/content', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { period = '7d', contentType = 'all' } = req.query;
        const { data: creator } = await supabase_1.supabase
            .from('creators')
            .select('id')
            .eq('user_id', userId)
            .single();
        if (!creator) {
            return res.status(403).json({
                error: 'Creator access required'
            });
        }
        const analytics = await analyticsService_1.analyticsService.getContentAnalytics(creator.id, {
            period: period,
            contentType: contentType
        });
        res.json({ analytics });
    }
    catch (error) {
        logger_1.logger.error('Get content analytics error:', error);
        res.status(500).json({
            error: 'Failed to fetch content analytics'
        });
    }
});
router.get('/revenue', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { period = '7d', startDate, endDate } = req.query;
        const { data: creator } = await supabase_1.supabase
            .from('creators')
            .select('id')
            .eq('user_id', userId)
            .single();
        if (!creator) {
            return res.status(403).json({
                error: 'Creator access required'
            });
        }
        const analytics = await analyticsService_1.analyticsService.getRevenueAnalytics(creator.id, {
            period: period,
            startDate: startDate,
            endDate: endDate
        });
        res.json({ analytics });
    }
    catch (error) {
        logger_1.logger.error('Get revenue analytics error:', error);
        res.status(500).json({
            error: 'Failed to fetch revenue analytics'
        });
    }
});
router.get('/audience', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { period = '7d' } = req.query;
        const { data: creator } = await supabase_1.supabase
            .from('creators')
            .select('id')
            .eq('user_id', userId)
            .single();
        if (!creator) {
            return res.status(403).json({
                error: 'Creator access required'
            });
        }
        const analytics = await analyticsService_1.analyticsService.getAudienceAnalytics(creator.id, {
            period: period
        });
        res.json({ analytics });
    }
    catch (error) {
        logger_1.logger.error('Get audience analytics error:', error);
        res.status(500).json({
            error: 'Failed to fetch audience analytics'
        });
    }
});
router.get('/engagement', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { period = '7d', contentType = 'all' } = req.query;
        const { data: creator } = await supabase_1.supabase
            .from('creators')
            .select('id')
            .eq('user_id', userId)
            .single();
        if (!creator) {
            return res.status(403).json({
                error: 'Creator access required'
            });
        }
        const analytics = await analyticsService_1.analyticsService.getEngagementAnalytics(creator.id, {
            period: period,
            contentType: contentType
        });
        res.json({ analytics });
    }
    catch (error) {
        logger_1.logger.error('Get engagement analytics error:', error);
        res.status(500).json({
            error: 'Failed to fetch engagement analytics'
        });
    }
});
router.get('/streams', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { period = '7d', streamId } = req.query;
        const { data: creator } = await supabase_1.supabase
            .from('creators')
            .select('id')
            .eq('user_id', userId)
            .single();
        if (!creator) {
            return res.status(403).json({
                error: 'Creator access required'
            });
        }
        const analytics = await analyticsService_1.analyticsService.getStreamAnalytics(creator.id, {
            period: period,
            streamId: streamId
        });
        res.json({ analytics });
    }
    catch (error) {
        logger_1.logger.error('Get stream analytics error:', error);
        res.status(500).json({
            error: 'Failed to fetch stream analytics'
        });
    }
});
router.get('/chat', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { period = '7d' } = req.query;
        const analytics = await analyticsService_1.analyticsService.getChatAnalytics(userId, {
            period: period
        });
        res.json({ analytics });
    }
    catch (error) {
        logger_1.logger.error('Get chat analytics error:', error);
        res.status(500).json({
            error: 'Failed to fetch chat analytics'
        });
    }
});
router.get('/realtime', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { data: profile } = await supabase_1.supabase
            .from('profiles')
            .select('is_admin')
            .eq('user_id', userId)
            .single();
        if (!profile?.is_admin) {
            return res.status(403).json({
                error: 'Admin access required'
            });
        }
        const metrics = await analyticsService_1.analyticsService.getRealTimeMetrics();
        res.json({ metrics });
    }
    catch (error) {
        logger_1.logger.error('Get real-time metrics error:', error);
        res.status(500).json({
            error: 'Failed to fetch real-time metrics'
        });
    }
});
router.get('/dashboard', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { period = '7d' } = req.query;
        const { data: creator } = await supabase_1.supabase
            .from('creators')
            .select('id')
            .eq('user_id', userId)
            .single();
        if (!creator) {
            return res.status(403).json({
                error: 'Creator access required'
            });
        }
        const dashboard = await analyticsService_1.analyticsService.getAnalyticsDashboard(creator.id, {
            period: period
        });
        res.json({ dashboard });
    }
    catch (error) {
        logger_1.logger.error('Get analytics dashboard error:', error);
        res.status(500).json({
            error: 'Failed to fetch analytics dashboard'
        });
    }
});
router.get('/export', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { period = '7d', format = 'csv', type = 'all' } = req.query;
        const { data: creator } = await supabase_1.supabase
            .from('creators')
            .select('id')
            .eq('user_id', userId)
            .single();
        if (!creator) {
            return res.status(403).json({
                error: 'Creator access required'
            });
        }
        const exportData = await analyticsService_1.analyticsService.exportAnalyticsData(creator.id, {
            period: period,
            format: format,
            type: type
        });
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="analytics-${Date.now()}.${format}"`);
        res.send(exportData);
    }
    catch (error) {
        logger_1.logger.error('Export analytics error:', error);
        res.status(500).json({
            error: 'Failed to export analytics data'
        });
    }
});
exports.default = router;
//# sourceMappingURL=analytics.js.map