"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_1 = require("../config/supabase");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const logger_1 = require("../utils/logger");
const redis_1 = require("../config/redis");
const camsService_1 = require("../services/camsService");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const createStreamSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().max(500).optional(),
    category: zod_1.z.string().min(1),
    tags: zod_1.z.array(zod_1.z.string()).max(10).optional(),
    privacy: zod_1.z.enum(['public', 'followers', 'paid']),
    price: zod_1.z.number().min(0).optional(),
    quality: zod_1.z.enum(['480p', '720p', '1080p', '4K']).default('720p'),
    bitrate: zod_1.z.number().min(500).max(10000).default(2500),
    fps: zod_1.z.number().min(15).max(60).default(30),
    audioQuality: zod_1.z.enum(['low', 'medium', 'high']).default('medium')
});
const updateStreamSettingsSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(100).optional(),
    description: zod_1.z.string().max(500).optional(),
    category: zod_1.z.string().min(1).optional(),
    tags: zod_1.z.array(zod_1.z.string()).max(10).optional(),
    privacy: zod_1.z.enum(['public', 'followers', 'paid']).optional(),
    price: zod_1.z.number().min(0).optional(),
    quality: zod_1.z.enum(['480p', '720p', '1080p', '4K']).optional(),
    bitrate: zod_1.z.number().min(500).max(10000).optional(),
    fps: zod_1.z.number().min(15).max(60).optional(),
    audioQuality: zod_1.z.enum(['low', 'medium', 'high']).optional()
});
const sendGiftSchema = zod_1.z.object({
    streamId: zod_1.z.string().uuid(),
    giftType: zod_1.z.enum(['heart', 'star', 'crown', 'zap']),
    amount: zod_1.z.number().min(1).max(1000).optional()
});
const reportStreamSchema = zod_1.z.object({
    streamId: zod_1.z.string().uuid(),
    reason: zod_1.z.enum(['inappropriate', 'spam', 'harassment', 'underage', 'other']),
    description: zod_1.z.string().max(500).optional()
});
router.post('/streams', auth_1.authMiddleware, (0, validation_1.validateRequest)(createStreamSchema), async (req, res) => {
    try {
        const userId = req.user.id;
        const streamData = req.body;
        const { data: creator } = await supabase_1.supabase
            .from('creators')
            .select('id, verification_status')
            .eq('user_id', userId)
            .single();
        if (!creator) {
            return res.status(403).json({
                error: 'Only verified creators can start streams'
            });
        }
        if (creator.verification_status !== 'verified') {
            return res.status(403).json({
                error: 'Creator verification required to start streams'
            });
        }
        const stream = await camsService_1.camsService.createStream({
            creatorId: creator.id,
            userId,
            ...streamData
        });
        await redis_1.redisManager.setex(`stream:${stream.id}`, 3600, JSON.stringify({
            ...stream,
            viewerCount: 0,
            isLive: true,
            startTime: new Date().toISOString()
        }));
        res.status(201).json({
            message: 'Stream created successfully',
            stream
        });
    }
    catch (error) {
        logger_1.logger.error('Create stream error:', error);
        res.status(500).json({
            error: 'Failed to create stream'
        });
    }
});
router.get('/streams', async (req, res) => {
    try {
        const { category, search, limit = 20, offset = 0 } = req.query;
        const streams = await camsService_1.camsService.getLiveStreams({
            category: category,
            search: search,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
        res.json({
            streams,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                total: streams.length
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Get streams error:', error);
        res.status(500).json({
            error: 'Failed to fetch streams'
        });
    }
});
router.get('/streams/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const stream = await camsService_1.camsService.getStreamById(id);
        if (!stream) {
            return res.status(404).json({
                error: 'Stream not found'
            });
        }
        const streamData = await redis_1.redisManager.get(`stream:${id}`);
        if (streamData) {
            const realTimeData = JSON.parse(streamData);
            stream.viewerCount = realTimeData.viewerCount;
            stream.isLive = realTimeData.isLive;
        }
        res.json({ stream });
    }
    catch (error) {
        logger_1.logger.error('Get stream error:', error);
        res.status(500).json({
            error: 'Failed to fetch stream'
        });
    }
});
router.patch('/streams/:id', auth_1.authMiddleware, (0, validation_1.validateRequest)(updateStreamSettingsSchema), async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const updates = req.body;
        const stream = await camsService_1.camsService.updateStreamSettings(id, userId, updates);
        const streamData = await redis_1.redisManager.get(`stream:${id}`);
        if (streamData) {
            const realTimeData = JSON.parse(streamData);
            await redis_1.redisManager.setex(`stream:${id}`, 3600, JSON.stringify({
                ...realTimeData,
                ...updates
            }));
        }
        res.json({
            message: 'Stream settings updated',
            stream
        });
    }
    catch (error) {
        logger_1.logger.error('Update stream error:', error);
        res.status(500).json({
            error: 'Failed to update stream'
        });
    }
});
router.post('/streams/:id/start', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const stream = await camsService_1.camsService.startStream(id, userId);
        await redis_1.redisManager.setex(`stream:${id}`, 3600, JSON.stringify({
            ...stream,
            isLive: true,
            startTime: new Date().toISOString(),
            viewerCount: 0
        }));
        res.json({
            message: 'Stream started successfully',
            stream
        });
    }
    catch (error) {
        logger_1.logger.error('Start stream error:', error);
        res.status(500).json({
            error: 'Failed to start stream'
        });
    }
});
router.post('/streams/:id/stop', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const stream = await camsService_1.camsService.stopStream(id, userId);
        await redis_1.redisManager.del(`stream:${id}`);
        res.json({
            message: 'Stream stopped successfully',
            stream
        });
    }
    catch (error) {
        logger_1.logger.error('Stop stream error:', error);
        res.status(500).json({
            error: 'Failed to stop stream'
        });
    }
});
router.post('/streams/:id/join', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const viewer = await camsService_1.camsService.joinStream(id, userId);
        const streamData = await redis_1.redisManager.get(`stream:${id}`);
        if (streamData) {
            const realTimeData = JSON.parse(streamData);
            realTimeData.viewerCount = (realTimeData.viewerCount || 0) + 1;
            await redis_1.redisManager.setex(`stream:${id}`, 3600, JSON.stringify(realTimeData));
        }
        res.json({
            message: 'Joined stream successfully',
            viewer
        });
    }
    catch (error) {
        logger_1.logger.error('Join stream error:', error);
        res.status(500).json({
            error: 'Failed to join stream'
        });
    }
});
router.post('/streams/:id/leave', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        await camsService_1.camsService.leaveStream(id, userId);
        const streamData = await redis_1.redisManager.get(`stream:${id}`);
        if (streamData) {
            const realTimeData = JSON.parse(streamData);
            realTimeData.viewerCount = Math.max(0, (realTimeData.viewerCount || 0) - 1);
            await redis_1.redisManager.setex(`stream:${id}`, 3600, JSON.stringify(realTimeData));
        }
        res.json({
            message: 'Left stream successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Leave stream error:', error);
        res.status(500).json({
            error: 'Failed to leave stream'
        });
    }
});
router.get('/streams/:id/viewers', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const viewers = await camsService_1.camsService.getStreamViewers(id, userId);
        res.json({ viewers });
    }
    catch (error) {
        logger_1.logger.error('Get viewers error:', error);
        res.status(500).json({
            error: 'Failed to fetch viewers'
        });
    }
});
router.post('/streams/gifts', auth_1.authMiddleware, (0, validation_1.validateRequest)(sendGiftSchema), async (req, res) => {
    try {
        const userId = req.user.id;
        const { streamId, giftType, amount } = req.body;
        const gift = await camsService_1.camsService.sendGift({
            streamId,
            userId,
            giftType,
            amount: amount || 1
        });
        res.json({
            message: 'Gift sent successfully',
            gift
        });
    }
    catch (error) {
        logger_1.logger.error('Send gift error:', error);
        res.status(500).json({
            error: 'Failed to send gift'
        });
    }
});
router.get('/streams/:id/chat', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 50, offset = 0 } = req.query;
        const messages = await camsService_1.camsService.getStreamChat(id, {
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
        res.json({ messages });
    }
    catch (error) {
        logger_1.logger.error('Get chat error:', error);
        res.status(500).json({
            error: 'Failed to fetch chat messages'
        });
    }
});
router.post('/streams/:id/chat', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { message } = req.body;
        if (!message || message.trim().length === 0) {
            return res.status(400).json({
                error: 'Message is required'
            });
        }
        const chatMessage = await camsService_1.camsService.sendChatMessage({
            streamId: id,
            userId,
            message: message.trim()
        });
        res.json({
            message: 'Chat message sent successfully',
            chatMessage
        });
    }
    catch (error) {
        logger_1.logger.error('Send chat error:', error);
        res.status(500).json({
            error: 'Failed to send chat message'
        });
    }
});
router.post('/streams/:id/record', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const recording = await camsService_1.camsService.startRecording(id, userId);
        res.json({
            message: 'Recording started successfully',
            recording
        });
    }
    catch (error) {
        logger_1.logger.error('Start recording error:', error);
        res.status(500).json({
            error: 'Failed to start recording'
        });
    }
});
router.post('/streams/:id/record/stop', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const recording = await camsService_1.camsService.stopRecording(id, userId);
        res.json({
            message: 'Recording stopped successfully',
            recording
        });
    }
    catch (error) {
        logger_1.logger.error('Stop recording error:', error);
        res.status(500).json({
            error: 'Failed to stop recording'
        });
    }
});
router.get('/streams/:id/recordings', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const recordings = await camsService_1.camsService.getStreamRecordings(id, userId);
        res.json({ recordings });
    }
    catch (error) {
        logger_1.logger.error('Get recordings error:', error);
        res.status(500).json({
            error: 'Failed to fetch recordings'
        });
    }
});
router.get('/streams/:id/analytics', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const analytics = await camsService_1.camsService.getStreamAnalytics(id, userId);
        res.json({ analytics });
    }
    catch (error) {
        logger_1.logger.error('Get analytics error:', error);
        res.status(500).json({
            error: 'Failed to fetch analytics'
        });
    }
});
router.post('/streams/report', auth_1.authMiddleware, (0, validation_1.validateRequest)(reportStreamSchema), async (req, res) => {
    try {
        const userId = req.user.id;
        const { streamId, reason, description } = req.body;
        const report = await camsService_1.camsService.reportStream({
            streamId,
            reporterId: userId,
            reason,
            description
        });
        res.json({
            message: 'Stream reported successfully',
            report
        });
    }
    catch (error) {
        logger_1.logger.error('Report stream error:', error);
        res.status(500).json({
            error: 'Failed to report stream'
        });
    }
});
router.post('/streams/:id/ban', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { viewerId, reason } = req.body;
        await camsService_1.camsService.banViewer(id, userId, viewerId, reason);
        res.json({
            message: 'Viewer banned successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Ban viewer error:', error);
        res.status(500).json({
            error: 'Failed to ban viewer'
        });
    }
});
router.post('/streams/:id/moderator', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { viewerId } = req.body;
        await camsService_1.camsService.promoteToModerator(id, userId, viewerId);
        res.json({
            message: 'Viewer promoted to moderator successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Promote moderator error:', error);
        res.status(500).json({
            error: 'Failed to promote viewer'
        });
    }
});
exports.default = router;
//# sourceMappingURL=cams.js.map