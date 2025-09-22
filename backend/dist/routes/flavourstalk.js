"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const logger_1 = require("../utils/logger");
const redis_1 = require("../config/redis");
const flavourstalkService_1 = require("../services/flavourstalkService");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const createChatSessionSchema = zod_1.z.object({
    interests: zod_1.z.array(zod_1.z.string()).min(1).max(10),
    ageRange: zod_1.z.object({
        min: zod_1.z.number().min(18).max(100),
        max: zod_1.z.number().min(18).max(100)
    }).optional(),
    location: zod_1.z.string().optional(),
    gender: zod_1.z.enum(['male', 'female', 'non-binary', 'other']).optional(),
    chatType: zod_1.z.enum(['text', 'audio', 'video']).default('text')
});
const sendMessageSchema = zod_1.z.object({
    sessionId: zod_1.z.string().uuid(),
    message: zod_1.z.string().min(1).max(1000),
    type: zod_1.z.enum(['text', 'image', 'emoji']).default('text')
});
const reportUserSchema = zod_1.z.object({
    sessionId: zod_1.z.string().uuid(),
    reason: zod_1.z.enum(['inappropriate', 'spam', 'harassment', 'underage', 'fake', 'other']),
    description: zod_1.z.string().max(500).optional()
});
const updatePreferencesSchema = zod_1.z.object({
    interests: zod_1.z.array(zod_1.z.string()).min(1).max(10).optional(),
    ageRange: zod_1.z.object({
        min: zod_1.z.number().min(18).max(100),
        max: zod_1.z.number().min(18).max(100)
    }).optional(),
    location: zod_1.z.string().optional(),
    gender: zod_1.z.enum(['male', 'female', 'non-binary', 'other']).optional(),
    chatType: zod_1.z.enum(['text', 'audio', 'video']).optional()
});
router.post('/sessions', auth_1.authMiddleware, (0, validation_1.validateRequest)(createChatSessionSchema), async (req, res) => {
    try {
        const userId = req.user.id;
        const sessionData = req.body;
        const activeSession = await flavourstalkService_1.flavourstalkService.getActiveSession(userId);
        if (activeSession) {
            return res.status(400).json({
                error: 'You already have an active chat session',
                session: activeSession
            });
        }
        const session = await flavourstalkService_1.flavourstalkService.createChatSession({
            userId,
            ...sessionData
        });
        await redis_1.redisManager.setex(`chat_session:${session.id}`, 3600, JSON.stringify({
            ...session,
            isActive: true,
            createdAt: new Date().toISOString()
        }));
        res.status(201).json({
            message: 'Chat session created successfully',
            session
        });
    }
    catch (error) {
        logger_1.logger.error('Create chat session error:', error);
        res.status(500).json({
            error: 'Failed to create chat session'
        });
    }
});
router.post('/sessions/:id/match', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const match = await flavourstalkService_1.flavourstalkService.findMatch(id, userId);
        if (!match) {
            return res.json({
                message: 'No suitable match found at the moment',
                match: null
            });
        }
        res.json({
            message: 'Match found successfully',
            match
        });
    }
    catch (error) {
        logger_1.logger.error('Find match error:', error);
        res.status(500).json({
            error: 'Failed to find match'
        });
    }
});
router.get('/sessions/active', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const session = await flavourstalkService_1.flavourstalkService.getActiveSession(userId);
        if (!session) {
            return res.status(404).json({
                error: 'No active session found'
            });
        }
        res.json({ session });
    }
    catch (error) {
        logger_1.logger.error('Get active session error:', error);
        res.status(500).json({
            error: 'Failed to fetch active session'
        });
    }
});
router.post('/sessions/:id/end', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        await flavourstalkService_1.flavourstalkService.endChatSession(id, userId);
        await redis_1.redisManager.del(`chat_session:${id}`);
        res.json({
            message: 'Chat session ended successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('End session error:', error);
        res.status(500).json({
            error: 'Failed to end session'
        });
    }
});
router.post('/sessions/:id/skip', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { reason } = req.body;
        await flavourstalkService_1.flavourstalkService.skipMatch(id, userId, reason);
        res.json({
            message: 'Match skipped successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Skip match error:', error);
        res.status(500).json({
            error: 'Failed to skip match'
        });
    }
});
router.post('/sessions/messages', auth_1.authMiddleware, (0, validation_1.validateRequest)(sendMessageSchema), async (req, res) => {
    try {
        const userId = req.user.id;
        const { sessionId, message, type } = req.body;
        const chatMessage = await flavourstalkService_1.flavourstalkService.sendMessage({
            sessionId,
            userId,
            message,
            type
        });
        res.json({
            message: 'Message sent successfully',
            chatMessage
        });
    }
    catch (error) {
        logger_1.logger.error('Send message error:', error);
        res.status(500).json({
            error: 'Failed to send message'
        });
    }
});
router.get('/sessions/:id/messages', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { limit = 50, offset = 0 } = req.query;
        const messages = await flavourstalkService_1.flavourstalkService.getChatMessages(id, userId, {
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
        res.json({ messages });
    }
    catch (error) {
        logger_1.logger.error('Get messages error:', error);
        res.status(500).json({
            error: 'Failed to fetch messages'
        });
    }
});
router.post('/sessions/report', auth_1.authMiddleware, (0, validation_1.validateRequest)(reportUserSchema), async (req, res) => {
    try {
        const userId = req.user.id;
        const { sessionId, reason, description } = req.body;
        const report = await flavourstalkService_1.flavourstalkService.reportUser({
            sessionId,
            reporterId: userId,
            reason,
            description
        });
        res.json({
            message: 'User reported successfully',
            report
        });
    }
    catch (error) {
        logger_1.logger.error('Report user error:', error);
        res.status(500).json({
            error: 'Failed to report user'
        });
    }
});
router.post('/sessions/:id/block', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { blockedUserId, reason } = req.body;
        await flavourstalkService_1.flavourstalkService.blockUser(id, userId, blockedUserId, reason);
        res.json({
            message: 'User blocked successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Block user error:', error);
        res.status(500).json({
            error: 'Failed to block user'
        });
    }
});
router.patch('/preferences', auth_1.authMiddleware, (0, validation_1.validateRequest)(updatePreferencesSchema), async (req, res) => {
    try {
        const userId = req.user.id;
        const preferences = req.body;
        const updatedPreferences = await flavourstalkService_1.flavourstalkService.updatePreferences(userId, preferences);
        res.json({
            message: 'Preferences updated successfully',
            preferences: updatedPreferences
        });
    }
    catch (error) {
        logger_1.logger.error('Update preferences error:', error);
        res.status(500).json({
            error: 'Failed to update preferences'
        });
    }
});
router.get('/preferences', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const preferences = await flavourstalkService_1.flavourstalkService.getPreferences(userId);
        res.json({ preferences });
    }
    catch (error) {
        logger_1.logger.error('Get preferences error:', error);
        res.status(500).json({
            error: 'Failed to fetch preferences'
        });
    }
});
router.get('/history', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 20, offset = 0 } = req.query;
        const history = await flavourstalkService_1.flavourstalkService.getChatHistory(userId, {
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
        res.json({ history });
    }
    catch (error) {
        logger_1.logger.error('Get chat history error:', error);
        res.status(500).json({
            error: 'Failed to fetch chat history'
        });
    }
});
router.get('/stats', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const stats = await flavourstalkService_1.flavourstalkService.getChatStats(userId);
        res.json({ stats });
    }
    catch (error) {
        logger_1.logger.error('Get chat stats error:', error);
        res.status(500).json({
            error: 'Failed to fetch chat statistics'
        });
    }
});
router.get('/interests', async (req, res) => {
    try {
        const interests = await flavourstalkService_1.flavourstalkService.getAvailableInterests();
        res.json({ interests });
    }
    catch (error) {
        logger_1.logger.error('Get interests error:', error);
        res.status(500).json({
            error: 'Failed to fetch interests'
        });
    }
});
router.get('/online-count', async (req, res) => {
    try {
        const count = await flavourstalkService_1.flavourstalkService.getOnlineUsersCount();
        res.json({ count });
    }
    catch (error) {
        logger_1.logger.error('Get online count error:', error);
        res.status(500).json({
            error: 'Failed to fetch online users count'
        });
    }
});
router.post('/sessions/:id/call', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { callType } = req.body;
        const call = await flavourstalkService_1.flavourstalkService.startCall(id, userId, callType);
        res.json({
            message: 'Call started successfully',
            call
        });
    }
    catch (error) {
        logger_1.logger.error('Start call error:', error);
        res.status(500).json({
            error: 'Failed to start call'
        });
    }
});
router.post('/sessions/:id/call/end', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        await flavourstalkService_1.flavourstalkService.endCall(id, userId);
        res.json({
            message: 'Call ended successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('End call error:', error);
        res.status(500).json({
            error: 'Failed to end call'
        });
    }
});
exports.default = router;
//# sourceMappingURL=flavourstalk.js.map