"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsService = void 0;
const supabase_1 = require("../config/supabase");
const logger_1 = require("../utils/logger");
const redis_1 = require("../config/redis");
class NotificationsService {
    async getUserNotifications(userId, options) {
        try {
            let query = supabase_1.supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            if (options.unreadOnly) {
                query = query.eq('is_read', false);
            }
            if (options.type) {
                query = query.eq('type', options.type);
            }
            const { data: notifications, error } = await query
                .range((options.page - 1) * options.limit, options.page * options.limit - 1);
            if (error) {
                logger_1.logger.error('Get user notifications error:', error);
                throw new Error('Failed to fetch notifications');
            }
            return notifications.map(notification => this.mapNotificationData(notification));
        }
        catch (error) {
            logger_1.logger.error('NotificationsService.getUserNotifications error:', error);
            throw error;
        }
    }
    async getUnreadCount(userId) {
        try {
            const { count, error } = await supabase_1.supabase
                .from('notifications')
                .select('*', { count: 'exact' })
                .eq('user_id', userId)
                .eq('is_read', false);
            if (error) {
                logger_1.logger.error('Get unread count error:', error);
                throw new Error('Failed to fetch unread count');
            }
            return count || 0;
        }
        catch (error) {
            logger_1.logger.error('NotificationsService.getUnreadCount error:', error);
            throw error;
        }
    }
    async markAsRead(notificationIds, userId) {
        try {
            const { error } = await supabase_1.supabase
                .from('notifications')
                .update({
                is_read: true,
                read_at: new Date().toISOString()
            })
                .in('id', notificationIds)
                .eq('user_id', userId);
            if (error) {
                logger_1.logger.error('Mark as read error:', error);
                throw new Error('Failed to mark notifications as read');
            }
        }
        catch (error) {
            logger_1.logger.error('NotificationsService.markAsRead error:', error);
            throw error;
        }
    }
    async markAllAsRead(userId) {
        try {
            const { error } = await supabase_1.supabase
                .from('notifications')
                .update({
                is_read: true,
                read_at: new Date().toISOString()
            })
                .eq('user_id', userId)
                .eq('is_read', false);
            if (error) {
                logger_1.logger.error('Mark all as read error:', error);
                throw new Error('Failed to mark all notifications as read');
            }
        }
        catch (error) {
            logger_1.logger.error('NotificationsService.markAllAsRead error:', error);
            throw error;
        }
    }
    async deleteNotification(notificationId, userId) {
        try {
            const { error } = await supabase_1.supabase
                .from('notifications')
                .delete()
                .eq('id', notificationId)
                .eq('user_id', userId);
            if (error) {
                logger_1.logger.error('Delete notification error:', error);
                throw new Error('Failed to delete notification');
            }
        }
        catch (error) {
            logger_1.logger.error('NotificationsService.deleteNotification error:', error);
            throw error;
        }
    }
    async deleteAllNotifications(userId) {
        try {
            const { error } = await supabase_1.supabase
                .from('notifications')
                .delete()
                .eq('user_id', userId);
            if (error) {
                logger_1.logger.error('Delete all notifications error:', error);
                throw new Error('Failed to delete all notifications');
            }
        }
        catch (error) {
            logger_1.logger.error('NotificationsService.deleteAllNotifications error:', error);
            throw error;
        }
    }
    async getNotificationPreferences(userId) {
        try {
            const { data: preferences, error } = await supabase_1.supabase
                .from('notification_preferences')
                .select('*')
                .eq('user_id', userId)
                .single();
            if (error) {
                if (error.code === 'PGRST116') {
                    return await this.createDefaultPreferences(userId);
                }
                logger_1.logger.error('Get notification preferences error:', error);
                throw new Error('Failed to fetch notification preferences');
            }
            return this.mapPreferencesData(preferences);
        }
        catch (error) {
            logger_1.logger.error('NotificationsService.getNotificationPreferences error:', error);
            throw error;
        }
    }
    async updateNotificationPreferences(userId, preferences) {
        try {
            const { data: updatedPreferences, error } = await supabase_1.supabase
                .from('notification_preferences')
                .upsert({
                user_id: userId,
                email_notifications: preferences.emailNotifications,
                push_notifications: preferences.pushNotifications,
                sms_notifications: preferences.smsNotifications,
                notification_types: preferences.notificationTypes
            })
                .select()
                .single();
            if (error) {
                logger_1.logger.error('Update notification preferences error:', error);
                throw new Error('Failed to update notification preferences');
            }
            return this.mapPreferencesData(updatedPreferences);
        }
        catch (error) {
            logger_1.logger.error('NotificationsService.updateNotificationPreferences error:', error);
            throw error;
        }
    }
    async sendNotification(data) {
        try {
            const preferences = await this.getNotificationPreferences(data.recipientId);
            if (preferences && !preferences.notificationTypes[data.type]) {
                throw new Error('User has disabled this notification type');
            }
            const { data: notification, error } = await supabase_1.supabase
                .from('notifications')
                .insert({
                user_id: data.recipientId,
                type: data.type,
                title: data.title,
                message: data.message,
                data: data.data,
                is_read: false
            })
                .select()
                .single();
            if (error) {
                logger_1.logger.error('Send notification error:', error);
                throw new Error('Failed to send notification');
            }
            if (preferences?.pushNotifications) {
                await this.sendPushNotification(data.recipientId, {
                    title: data.title,
                    message: data.message,
                    data: data.data
                });
            }
            if (preferences?.emailNotifications) {
                await this.sendEmailNotification(data.recipientId, {
                    title: data.title,
                    message: data.message,
                    type: data.type
                });
            }
            return this.mapNotificationData(notification);
        }
        catch (error) {
            logger_1.logger.error('NotificationsService.sendNotification error:', error);
            throw error;
        }
    }
    async getNotificationTypes() {
        try {
            return [
                {
                    id: 'new_follower',
                    name: 'New Follower',
                    description: 'When someone follows you',
                    defaultEnabled: true,
                    category: 'social'
                },
                {
                    id: 'new_like',
                    name: 'New Like',
                    description: 'When someone likes your post',
                    defaultEnabled: true,
                    category: 'social'
                },
                {
                    id: 'new_comment',
                    name: 'New Comment',
                    description: 'When someone comments on your post',
                    defaultEnabled: true,
                    category: 'social'
                },
                {
                    id: 'new_subscription',
                    name: 'New Subscription',
                    description: 'When someone subscribes to your content',
                    defaultEnabled: true,
                    category: 'monetization'
                },
                {
                    id: 'new_tip',
                    name: 'New Tip',
                    description: 'When someone sends you a tip',
                    defaultEnabled: true,
                    category: 'monetization'
                },
                {
                    id: 'new_message',
                    name: 'New Message',
                    description: 'When you receive a direct message',
                    defaultEnabled: true,
                    category: 'communication'
                },
                {
                    id: 'stream_started',
                    name: 'Stream Started',
                    description: 'When a creator you follow starts streaming',
                    defaultEnabled: true,
                    category: 'live'
                },
                {
                    id: 'chat_match',
                    name: 'Chat Match',
                    description: 'When you get matched in FlavoursTalk',
                    defaultEnabled: true,
                    category: 'chat'
                },
                {
                    id: 'system_update',
                    name: 'System Updates',
                    description: 'Important platform updates and announcements',
                    defaultEnabled: true,
                    category: 'system'
                },
                {
                    id: 'security_alert',
                    name: 'Security Alerts',
                    description: 'Security-related notifications',
                    defaultEnabled: true,
                    category: 'security'
                }
            ];
        }
        catch (error) {
            logger_1.logger.error('NotificationsService.getNotificationTypes error:', error);
            throw error;
        }
    }
    async subscribeToPushNotifications(userId, subscription) {
        try {
            const { data: pushSubscription, error } = await supabase_1.supabase
                .from('push_subscriptions')
                .upsert({
                user_id: userId,
                endpoint: subscription.endpoint,
                keys: subscription.keys
            })
                .select()
                .single();
            if (error) {
                logger_1.logger.error('Subscribe to push notifications error:', error);
                throw new Error('Failed to subscribe to push notifications');
            }
            return this.mapPushSubscriptionData(pushSubscription);
        }
        catch (error) {
            logger_1.logger.error('NotificationsService.subscribeToPushNotifications error:', error);
            throw error;
        }
    }
    async unsubscribeFromPushNotifications(userId) {
        try {
            const { error } = await supabase_1.supabase
                .from('push_subscriptions')
                .delete()
                .eq('user_id', userId);
            if (error) {
                logger_1.logger.error('Unsubscribe from push notifications error:', error);
                throw new Error('Failed to unsubscribe from push notifications');
            }
        }
        catch (error) {
            logger_1.logger.error('NotificationsService.unsubscribeFromPushNotifications error:', error);
            throw error;
        }
    }
    async createDefaultPreferences(userId) {
        try {
            const defaultTypes = {
                new_follower: true,
                new_like: true,
                new_comment: true,
                new_subscription: true,
                new_tip: true,
                new_message: true,
                stream_started: true,
                chat_match: true,
                system_update: true,
                security_alert: true
            };
            const { data: preferences, error } = await supabase_1.supabase
                .from('notification_preferences')
                .insert({
                user_id: userId,
                email_notifications: true,
                push_notifications: true,
                sms_notifications: false,
                notification_types: defaultTypes
            })
                .select()
                .single();
            if (error) {
                logger_1.logger.error('Create default preferences error:', error);
                throw new Error('Failed to create default preferences');
            }
            return this.mapPreferencesData(preferences);
        }
        catch (error) {
            logger_1.logger.error('NotificationsService.createDefaultPreferences error:', error);
            throw error;
        }
    }
    async sendPushNotification(userId, payload) {
        try {
            const { data: subscription } = await supabase_1.supabase
                .from('push_subscriptions')
                .select('*')
                .eq('user_id', userId)
                .single();
            if (!subscription) {
                return;
            }
            logger_1.logger.info(`Push notification sent to user ${userId}:`, payload);
            await redis_1.redisManager.setex(`push_notification:${userId}:${Date.now()}`, 300, JSON.stringify(payload));
        }
        catch (error) {
            logger_1.logger.error('Send push notification error:', error);
        }
    }
    async sendEmailNotification(userId, payload) {
        try {
            const { data: user } = await supabase_1.supabase.auth.admin.getUserById(userId);
            if (!user?.user?.email) {
                return;
            }
            logger_1.logger.info(`Email notification sent to ${user.user.email}:`, payload);
            await redis_1.redisManager.lpush('email_queue', JSON.stringify({
                userId,
                email: user.user.email,
                ...payload
            }));
        }
        catch (error) {
            logger_1.logger.error('Send email notification error:', error);
        }
    }
    mapNotificationData(data) {
        return {
            id: data.id,
            userId: data.user_id,
            type: data.type,
            title: data.title,
            message: data.message,
            data: data.data,
            isRead: data.is_read,
            createdAt: data.created_at,
            readAt: data.read_at
        };
    }
    mapPreferencesData(data) {
        return {
            id: data.id,
            userId: data.user_id,
            emailNotifications: data.email_notifications,
            pushNotifications: data.push_notifications,
            smsNotifications: data.sms_notifications,
            notificationTypes: data.notification_types,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        };
    }
    mapPushSubscriptionData(data) {
        return {
            id: data.id,
            userId: data.user_id,
            endpoint: data.endpoint,
            keys: data.keys,
            createdAt: data.created_at
        };
    }
}
exports.notificationsService = new NotificationsService();
//# sourceMappingURL=notificationsService.js.map