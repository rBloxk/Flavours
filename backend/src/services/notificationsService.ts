import { supabase } from '../config/supabase'
import { logger } from '../utils/logger'
import { redisManager } from '../config/redis'

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  data?: any
  isRead: boolean
  createdAt: string
  readAt?: string
}

export interface NotificationPreferences {
  id: string
  userId: string
  emailNotifications: boolean
  pushNotifications: boolean
  smsNotifications: boolean
  notificationTypes: Record<string, boolean>
  createdAt: string
  updatedAt: string
}

export interface PushSubscription {
  id: string
  userId: string
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  createdAt: string
}

export interface NotificationType {
  id: string
  name: string
  description: string
  defaultEnabled: boolean
  category: string
}

class NotificationsService {
  async getUserNotifications(userId: string, options: {
    page: number
    limit: number
    unreadOnly?: boolean
    type?: string
  }): Promise<Notification[]> {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (options.unreadOnly) {
        query = query.eq('is_read', false)
      }

      if (options.type) {
        query = query.eq('type', options.type)
      }

      const { data: notifications, error } = await query
        .range(
          (options.page - 1) * options.limit,
          options.page * options.limit - 1
        )

      if (error) {
        logger.error('Get user notifications error:', error)
        throw new Error('Failed to fetch notifications')
      }

      return notifications.map(notification => this.mapNotificationData(notification))
    } catch (error) {
      logger.error('NotificationsService.getUserNotifications error:', error)
      throw error
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) {
        logger.error('Get unread count error:', error)
        throw new Error('Failed to fetch unread count')
      }

      return count || 0
    } catch (error) {
      logger.error('NotificationsService.getUnreadCount error:', error)
      throw error
    }
  }

  async markAsRead(notificationIds: string[], userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .in('id', notificationIds)
        .eq('user_id', userId)

      if (error) {
        logger.error('Mark as read error:', error)
        throw new Error('Failed to mark notifications as read')
      }
    } catch (error) {
      logger.error('NotificationsService.markAsRead error:', error)
      throw error
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) {
        logger.error('Mark all as read error:', error)
        throw new Error('Failed to mark all notifications as read')
      }
    } catch (error) {
      logger.error('NotificationsService.markAllAsRead error:', error)
      throw error
    }
  }

  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId)

      if (error) {
        logger.error('Delete notification error:', error)
        throw new Error('Failed to delete notification')
      }
    } catch (error) {
      logger.error('NotificationsService.deleteNotification error:', error)
      throw error
    }
  }

  async deleteAllNotifications(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId)

      if (error) {
        logger.error('Delete all notifications error:', error)
        throw new Error('Failed to delete all notifications')
      }
    } catch (error) {
      logger.error('NotificationsService.deleteAllNotifications error:', error)
      throw error
    }
  }

  async getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const { data: preferences, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Create default preferences if none exist
          return await this.createDefaultPreferences(userId)
        }
        logger.error('Get notification preferences error:', error)
        throw new Error('Failed to fetch notification preferences')
      }

      return this.mapPreferencesData(preferences)
    } catch (error) {
      logger.error('NotificationsService.getNotificationPreferences error:', error)
      throw error
    }
  }

  async updateNotificationPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    try {
      const { data: updatedPreferences, error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          email_notifications: preferences.emailNotifications,
          push_notifications: preferences.pushNotifications,
          sms_notifications: preferences.smsNotifications,
          notification_types: preferences.notificationTypes
        })
        .select()
        .single()

      if (error) {
        logger.error('Update notification preferences error:', error)
        throw new Error('Failed to update notification preferences')
      }

      return this.mapPreferencesData(updatedPreferences)
    } catch (error) {
      logger.error('NotificationsService.updateNotificationPreferences error:', error)
      throw error
    }
  }

  async sendNotification(data: {
    recipientId: string
    type: string
    title: string
    message: string
    data?: any
  }): Promise<Notification> {
    try {
      // Check user preferences
      const preferences = await this.getNotificationPreferences(data.recipientId)
      
      if (preferences && !preferences.notificationTypes[data.type]) {
        throw new Error('User has disabled this notification type')
      }

      const { data: notification, error } = await supabase
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
        .single()

      if (error) {
        logger.error('Send notification error:', error)
        throw new Error('Failed to send notification')
      }

      // Send push notification if enabled
      if (preferences?.pushNotifications) {
        await this.sendPushNotification(data.recipientId, {
          title: data.title,
          message: data.message,
          data: data.data
        })
      }

      // Send email notification if enabled
      if (preferences?.emailNotifications) {
        await this.sendEmailNotification(data.recipientId, {
          title: data.title,
          message: data.message,
          type: data.type
        })
      }

      return this.mapNotificationData(notification)
    } catch (error) {
      logger.error('NotificationsService.sendNotification error:', error)
      throw error
    }
  }

  async getNotificationTypes(): Promise<NotificationType[]> {
    try {
      // Return predefined notification types
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
      ]
    } catch (error) {
      logger.error('NotificationsService.getNotificationTypes error:', error)
      throw error
    }
  }

  async subscribeToPushNotifications(userId: string, subscription: {
    endpoint: string
    keys: {
      p256dh: string
      auth: string
    }
  }): Promise<PushSubscription> {
    try {
      const { data: pushSubscription, error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: userId,
          endpoint: subscription.endpoint,
          keys: subscription.keys
        })
        .select()
        .single()

      if (error) {
        logger.error('Subscribe to push notifications error:', error)
        throw new Error('Failed to subscribe to push notifications')
      }

      return this.mapPushSubscriptionData(pushSubscription)
    } catch (error) {
      logger.error('NotificationsService.subscribeToPushNotifications error:', error)
      throw error
    }
  }

  async unsubscribeFromPushNotifications(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', userId)

      if (error) {
        logger.error('Unsubscribe from push notifications error:', error)
        throw new Error('Failed to unsubscribe from push notifications')
      }
    } catch (error) {
      logger.error('NotificationsService.unsubscribeFromPushNotifications error:', error)
      throw error
    }
  }

  // Helper methods
  private async createDefaultPreferences(userId: string): Promise<NotificationPreferences> {
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
      }

      const { data: preferences, error } = await supabase
        .from('notification_preferences')
        .insert({
          user_id: userId,
          email_notifications: true,
          push_notifications: true,
          sms_notifications: false,
          notification_types: defaultTypes
        })
        .select()
        .single()

      if (error) {
        logger.error('Create default preferences error:', error)
        throw new Error('Failed to create default preferences')
      }

      return this.mapPreferencesData(preferences)
    } catch (error) {
      logger.error('NotificationsService.createDefaultPreferences error:', error)
      throw error
    }
  }

  private async sendPushNotification(userId: string, payload: {
    title: string
    message: string
    data?: any
  }): Promise<void> {
    try {
      // Get user's push subscription
      const { data: subscription } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (!subscription) {
        return // User doesn't have push notifications enabled
      }

      // In a real implementation, you would use a push notification service like FCM or web-push
      // For now, we'll just log the notification
      logger.info(`Push notification sent to user ${userId}:`, payload)

      // Store in Redis for real-time delivery
      await redisManager.setex(`push_notification:${userId}:${Date.now()}`, 300, JSON.stringify(payload))
    } catch (error) {
      logger.error('Send push notification error:', error)
      // Don't throw error as this shouldn't fail the main notification
    }
  }

  private async sendEmailNotification(userId: string, payload: {
    title: string
    message: string
    type: string
  }): Promise<void> {
    try {
      // Get user's email
      const { data: user } = await supabase.auth.admin.getUserById(userId)
      
      if (!user?.user?.email) {
        return
      }

      // In a real implementation, you would use an email service like SendGrid or AWS SES
      // For now, we'll just log the notification
      logger.info(`Email notification sent to ${user.user.email}:`, payload)

      // Store in Redis for email queue processing
      await redisManager.lpush('email_queue', JSON.stringify({
        userId,
        email: user.user.email,
        ...payload
      }))
    } catch (error) {
      logger.error('Send email notification error:', error)
      // Don't throw error as this shouldn't fail the main notification
    }
  }

  private mapNotificationData(data: any): Notification {
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
    }
  }

  private mapPreferencesData(data: any): NotificationPreferences {
    return {
      id: data.id,
      userId: data.user_id,
      emailNotifications: data.email_notifications,
      pushNotifications: data.push_notifications,
      smsNotifications: data.sms_notifications,
      notificationTypes: data.notification_types,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }

  private mapPushSubscriptionData(data: any): PushSubscription {
    return {
      id: data.id,
      userId: data.user_id,
      endpoint: data.endpoint,
      keys: data.keys,
      createdAt: data.created_at
    }
  }
}

export const notificationsService = new NotificationsService()

