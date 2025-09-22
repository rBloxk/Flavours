"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_1 = require("../config/supabase");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const logger_1 = require("../utils/logger");
const notificationsService_1 = require("../services/notificationsService");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const markAsReadSchema = zod_1.z.object({
    notificationIds: zod_1.z.array(zod_1.z.string().uuid()).min(1)
});
const updatePreferencesSchema = zod_1.z.object({
    emailNotifications: zod_1.z.boolean().optional(),
    pushNotifications: zod_1.z.boolean().optional(),
    smsNotifications: zod_1.z.boolean().optional(),
    notificationTypes: zod_1.z.record(zod_1.z.boolean()).optional()
});
router.get('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20, unreadOnly = false, type } = req.query;
        const notifications = await notificationsService_1.notificationsService.getUserNotifications(userId, {
            page: Number(page),
            limit: Number(limit),
            unreadOnly: unreadOnly === 'true',
            type: type
        });
        res.json({
            notifications,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: notifications.length
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Get notifications error:', error);
        res.status(500).json({
            error: 'Failed to fetch notifications'
        });
    }
});
router.get('/unread-count', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const count = await notificationsService_1.notificationsService.getUnreadCount(userId);
        res.json({ count });
    }
    catch (error) {
        logger_1.logger.error('Get unread count error:', error);
        res.status(500).json({
            error: 'Failed to fetch unread count'
        });
    }
});
router.patch('/mark-read', auth_1.authMiddleware, (0, validation_1.validateRequest)(markAsReadSchema), async (req, res) => {
    try {
        const userId = req.user.id;
        const { notificationIds } = req.body;
        await notificationsService_1.notificationsService.markAsRead(notificationIds, userId);
        res.json({
            message: 'Notifications marked as read successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Mark as read error:', error);
        res.status(500).json({
            error: 'Failed to mark notifications as read'
        });
    }
});
router.patch('/mark-all-read', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        await notificationsService_1.notificationsService.markAllAsRead(userId);
        res.json({
            message: 'All notifications marked as read successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Mark all as read error:', error);
        res.status(500).json({
            error: 'Failed to mark all notifications as read'
        });
    }
});
router.delete('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        await notificationsService_1.notificationsService.deleteNotification(id, userId);
        res.json({
            message: 'Notification deleted successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Delete notification error:', error);
        res.status(500).json({
            error: 'Failed to delete notification'
        });
    }
});
router.delete('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        await notificationsService_1.notificationsService.deleteAllNotifications(userId);
        res.json({
            message: 'All notifications deleted successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Delete all notifications error:', error);
        res.status(500).json({
            error: 'Failed to delete all notifications'
        });
    }
});
router.get('/preferences', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const preferences = await notificationsService_1.notificationsService.getNotificationPreferences(userId);
        res.json({ preferences });
    }
    catch (error) {
        logger_1.logger.error('Get notification preferences error:', error);
        res.status(500).json({
            error: 'Failed to fetch notification preferences'
        });
    }
});
router.patch('/preferences', auth_1.authMiddleware, (0, validation_1.validateRequest)(updatePreferencesSchema), async (req, res) => {
    try {
        const userId = req.user.id;
        const preferences = req.body;
        const updatedPreferences = await notificationsService_1.notificationsService.updateNotificationPreferences(userId, preferences);
        res.json({
            message: 'Notification preferences updated successfully',
            preferences: updatedPreferences
        });
    }
    catch (error) {
        logger_1.logger.error('Update notification preferences error:', error);
        res.status(500).json({
            error: 'Failed to update notification preferences'
        });
    }
});
router.post('/send', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { recipientId, type, title, message, data } = req.body;
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
        const notification = await notificationsService_1.notificationsService.sendNotification({
            recipientId,
            type,
            title,
            message,
            data
        });
        res.json({
            message: 'Notification sent successfully',
            notification
        });
    }
    catch (error) {
        logger_1.logger.error('Send notification error:', error);
        res.status(500).json({
            error: 'Failed to send notification'
        });
    }
});
router.get('/types', async (req, res) => {
    try {
        const types = await notificationsService_1.notificationsService.getNotificationTypes();
        res.json({ types });
    }
    catch (error) {
        logger_1.logger.error('Get notification types error:', error);
        res.status(500).json({
            error: 'Failed to fetch notification types'
        });
    }
});
router.post('/push/subscribe', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { endpoint, keys } = req.body;
        const subscription = await notificationsService_1.notificationsService.subscribeToPushNotifications(userId, {
            endpoint,
            keys
        });
        res.json({
            message: 'Push notification subscription created successfully',
            subscription
        });
    }
    catch (error) {
        logger_1.logger.error('Subscribe to push notifications error:', error);
        res.status(500).json({
            error: 'Failed to subscribe to push notifications'
        });
    }
});
router.delete('/push/unsubscribe', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        await notificationsService_1.notificationsService.unsubscribeFromPushNotifications(userId);
        res.json({
            message: 'Push notification subscription removed successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Unsubscribe from push notifications error:', error);
        res.status(500).json({
            error: 'Failed to unsubscribe from push notifications'
        });
    }
});
router.post('/test', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { type = 'test', title = 'Test Notification', message = 'This is a test notification' } = req.body;
        const notification = await notificationsService_1.notificationsService.sendNotification({
            recipientId: userId,
            type,
            title,
            message,
            data: { test: true }
        });
        res.json({
            message: 'Test notification sent successfully',
            notification
        });
    }
    catch (error) {
        logger_1.logger.error('Test notification error:', error);
        res.status(500).json({
            error: 'Failed to send test notification'
        });
    }
});
exports.default = router;
//# sourceMappingURL=notifications.js.map