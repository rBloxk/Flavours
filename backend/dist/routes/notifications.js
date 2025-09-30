"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = createNotification;
exports.sendBulkNotification = sendBulkNotification;
exports.sendNotificationToFollowers = sendNotificationToFollowers;
exports.sendNotificationToSubscribers = sendNotificationToSubscribers;
const express_1 = require("express");
const database_1 = require("../config/database");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const logger_1 = require("../utils/logger");
const joi_1 = __importDefault(require("joi"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const router = (0, express_1.Router)();
const emailTransporter = nodemailer_1.default.createTransporter({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});
router.get('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const { page = 1, limit = 20, type = 'all', unread_only = 'false', sort = 'recent' } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        let query = database_1.supabase
            .from('notifications')
            .select(`
        *,
        profiles!notifications_actor_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          is_verified
        )
      `)
            .eq('user_id', req.user.id);
        if (type !== 'all') {
            query = query.eq('type', type);
        }
        if (unread_only === 'true') {
            query = query.eq('is_read', false);
        }
        if (sort === 'oldest') {
            query = query.order('created_at', { ascending: true });
        }
        else {
            query = query.order('created_at', { ascending: false });
        }
        query = query.range(offset, offset + Number(limit) - 1);
        const { data: notifications, error } = await query;
        if (error) {
            throw error;
        }
        const { count: unreadCount } = await database_1.supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', req.user.id)
            .eq('is_read', false);
        res.json({
            success: true,
            data: {
                notifications: notifications || [],
                unread_count: unreadCount || 0,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    hasMore: notifications?.length === Number(limit)
                }
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Get notifications error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});
router.put('/:id/read', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { data: notification, error } = await database_1.supabase
            .from('notifications')
            .update({
            is_read: true,
            read_at: new Date().toISOString()
        })
            .eq('id', id)
            .eq('user_id', req.user.id)
            .select()
            .single();
        if (error) {
            throw error;
        }
        if (!notification) {
            return res.status(404).json({
                error: 'Notification not found'
            });
        }
        res.json({
            success: true,
            data: notification,
            message: 'Notification marked as read'
        });
    }
    catch (error) {
        logger_1.logger.error('Mark notification read error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});
router.put('/read-all', auth_1.authMiddleware, async (req, res) => {
    try {
        const { error } = await database_1.supabase
            .from('notifications')
            .update({
            is_read: true,
            read_at: new Date().toISOString()
        })
            .eq('user_id', req.user.id)
            .eq('is_read', false);
        if (error) {
            throw error;
        }
        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    }
    catch (error) {
        logger_1.logger.error('Mark all notifications read error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});
router.delete('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await database_1.supabase
            .from('notifications')
            .delete()
            .eq('id', id)
            .eq('user_id', req.user.id);
        if (error) {
            throw error;
        }
        res.json({
            success: true,
            message: 'Notification deleted'
        });
    }
    catch (error) {
        logger_1.logger.error('Delete notification error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});
router.delete('/all', auth_1.authMiddleware, async (req, res) => {
    try {
        const { error } = await database_1.supabase
            .from('notifications')
            .delete()
            .eq('user_id', req.user.id);
        if (error) {
            throw error;
        }
        res.json({
            success: true,
            message: 'All notifications deleted'
        });
    }
    catch (error) {
        logger_1.logger.error('Delete all notifications error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});
router.get('/settings', auth_1.authMiddleware, async (req, res) => {
    try {
        const { data: profile } = await database_1.supabase
            .from('profiles')
            .select('notification_settings')
            .eq('user_id', req.user.id)
            .single();
        const defaultSettings = {
            email_notifications: true,
            push_notifications: true,
            in_app_notifications: true,
            sms_notifications: false,
            notification_types: {
                likes: true,
                comments: true,
                follows: true,
                shares: true,
                mentions: true,
                subscriptions: true,
                tips: true,
                streams: true,
                messages: true,
                system: true
            },
            quiet_hours: {
                enabled: false,
                start_time: '22:00',
                end_time: '08:00',
                timezone: 'UTC'
            },
            frequency: 'immediate'
        };
        res.json({
            success: true,
            data: {
                settings: profile?.notification_settings || defaultSettings
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Get notification settings error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});
router.put('/settings', auth_1.authMiddleware, (0, validation_1.validateRequest)({
    body: joi_1.default.object({
        email_notifications: joi_1.default.boolean().optional(),
        push_notifications: joi_1.default.boolean().optional(),
        in_app_notifications: joi_1.default.boolean().optional(),
        sms_notifications: joi_1.default.boolean().optional(),
        notification_types: joi_1.default.object({
            likes: joi_1.default.boolean().optional(),
            comments: joi_1.default.boolean().optional(),
            follows: joi_1.default.boolean().optional(),
            shares: joi_1.default.boolean().optional(),
            mentions: joi_1.default.boolean().optional(),
            subscriptions: joi_1.default.boolean().optional(),
            tips: joi_1.default.boolean().optional(),
            streams: joi_1.default.boolean().optional(),
            messages: joi_1.default.boolean().optional(),
            system: joi_1.default.boolean().optional()
        }).optional(),
        quiet_hours: joi_1.default.object({
            enabled: joi_1.default.boolean().optional(),
            start_time: joi_1.default.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
            end_time: joi_1.default.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
            timezone: joi_1.default.string().optional()
        }).optional(),
        frequency: joi_1.default.string().valid('immediate', 'daily', 'weekly').optional()
    })
}), async (req, res) => {
    try {
        const settings = req.body;
        const { data: updatedProfile, error } = await database_1.supabase
            .from('profiles')
            .update({
            notification_settings: settings,
            updated_at: new Date().toISOString()
        })
            .eq('user_id', req.user.id)
            .select()
            .single();
        if (error) {
            throw error;
        }
        res.json({
            success: true,
            data: updatedProfile,
            message: 'Notification settings updated successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Update notification settings error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});
async function createNotification(userId, type, title, message, context, actorId, deliveryMethods) {
    try {
        const { data: profile } = await database_1.supabase
            .from('profiles')
            .select('notification_settings, email')
            .eq('user_id', userId)
            .single();
        if (!profile) {
            throw new Error('User not found');
        }
        const settings = profile.notification_settings || {};
        if (settings.notification_types && !settings.notification_types[type]) {
            return null;
        }
        if (settings.quiet_hours?.enabled) {
            const now = new Date();
            const currentTime = now.toTimeString().slice(0, 5);
            const startTime = settings.quiet_hours.start_time;
            const endTime = settings.quiet_hours.end_time;
            if (isInQuietHours(currentTime, startTime, endTime)) {
                return await scheduleNotification(userId, type, title, message, context, actorId, deliveryMethods);
            }
        }
        const { data: notification } = await database_1.supabase
            .from('notifications')
            .insert({
            user_id: userId,
            type,
            title,
            message,
            context_type: context ? Object.keys(context)[0] : null,
            context_id: context ? Object.values(context)[0] : null,
            actor_id: actorId,
            delivery_methods: deliveryMethods || ['in_app'],
            is_sent: false
        })
            .select()
            .single();
        if (!notification) {
            throw new Error('Failed to create notification');
        }
        await sendNotification(notification, profile, settings);
        return notification;
    }
    catch (error) {
        logger_1.logger.error('Create notification error:', error);
        throw error;
    }
}
async function sendNotification(notification, profile, settings) {
    const deliveryMethods = notification.delivery_methods || ['in_app'];
    for (const method of deliveryMethods) {
        try {
            switch (method) {
                case 'in_app':
                    break;
                case 'email':
                    if (settings.email_notifications && profile.email) {
                        await sendEmailNotification(profile.email, notification);
                    }
                    break;
                case 'push':
                    if (settings.push_notifications) {
                        await sendPushNotification(profile.user_id, notification);
                    }
                    break;
                case 'sms':
                    if (settings.sms_notifications && profile.phone) {
                        await sendSMSNotification(profile.phone, notification);
                    }
                    break;
            }
        }
        catch (error) {
            logger_1.logger.error(`Failed to send ${method} notification:`, error);
        }
    }
    await database_1.supabase
        .from('notifications')
        .update({ is_sent: true })
        .eq('id', notification.id);
}
async function sendEmailNotification(email, notification) {
    const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: `Flavours - ${notification.title}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Flavours</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-top: 0;">${notification.title}</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">${notification.message}</p>
          <div style="margin-top: 30px; text-align: center;">
            <a href="${process.env.FRONTEND_URL}/notifications" 
               style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Notification
            </a>
          </div>
        </div>
        <div style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
          <p>You received this notification because you have email notifications enabled.</p>
          <p><a href="${process.env.FRONTEND_URL}/settings/notifications">Manage notification preferences</a></p>
        </div>
      </div>
    `
    };
    await emailTransporter.sendMail(mailOptions);
}
async function sendPushNotification(userId, notification) {
    logger_1.logger.info(`Sending push notification to user ${userId}: ${notification.title}`);
}
async function sendSMSNotification(phone, notification) {
    logger_1.logger.info(`Sending SMS notification to ${phone}: ${notification.title}`);
}
async function scheduleNotification(userId, type, title, message, context, actorId, deliveryMethods) {
    logger_1.logger.info(`Scheduling notification for user ${userId}: ${title}`);
}
function isInQuietHours(currentTime, startTime, endTime) {
    const current = timeToMinutes(currentTime);
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);
    if (start <= end) {
        return current >= start || current <= end;
    }
    else {
        return current >= start || current <= end;
    }
}
function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}
async function sendBulkNotification(userIds, type, title, message, context, actorId) {
    const notifications = [];
    for (const userId of userIds) {
        try {
            const notification = await createNotification(userId, type, title, message, context, actorId);
            if (notification) {
                notifications.push(notification);
            }
        }
        catch (error) {
            logger_1.logger.error(`Failed to create notification for user ${userId}:`, error);
        }
    }
    return notifications;
}
async function sendNotificationToFollowers(userId, type, title, message, context) {
    const { data: followers } = await database_1.supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', userId);
    if (!followers) {
        return [];
    }
    const followerIds = followers.map(f => f.follower_id);
    return await sendBulkNotification(followerIds, type, title, message, context, userId);
}
async function sendNotificationToSubscribers(creatorId, type, title, message, context) {
    const { data: subscribers } = await database_1.supabase
        .from('subscriptions')
        .select('subscriber_id')
        .eq('creator_id', creatorId)
        .eq('status', 'active');
    if (!subscribers) {
        return [];
    }
    const subscriberIds = subscribers.map(s => s.subscriber_id);
    return await sendBulkNotification(subscriberIds, type, title, message, context, creatorId);
}
exports.default = router;
//# sourceMappingURL=notifications.js.map