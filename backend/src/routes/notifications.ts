import { Router, Request, Response } from 'express'
import { supabase } from '../config/database'
import { authMiddleware } from '../middleware/auth'
import { validateRequest } from '../middleware/validation'
import { logger } from '../utils/logger'
import Joi from 'joi'
import nodemailer from 'nodemailer'

const router = Router()

// Email transporter configuration
const emailTransporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

// =============================================
// NOTIFICATION ENDPOINTS
// =============================================

// Get user notifications
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      type = 'all',
      unread_only = 'false',
      sort = 'recent'
    } = req.query

    const offset = (Number(page) - 1) * Number(limit)

    // Build notifications query
    let query = supabase
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
      .eq('user_id', req.user.id)

    // Apply type filter
    if (type !== 'all') {
      query = query.eq('type', type)
    }

    // Apply unread filter
    if (unread_only === 'true') {
      query = query.eq('is_read', false)
    }

    // Apply sorting
    if (sort === 'oldest') {
      query = query.order('created_at', { ascending: true })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    // Apply pagination
    query = query.range(offset, offset + Number(limit) - 1)

    const { data: notifications, error } = await query

    if (error) {
      throw error
    }

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id)
      .eq('is_read', false)

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
    })
  } catch (error) {
    logger.error('Get notifications error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Mark notification as read
router.put('/:id/read', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const { data: notification, error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    if (!notification) {
      return res.status(404).json({
        error: 'Notification not found'
      })
    }

    res.json({
      success: true,
      data: notification,
      message: 'Notification marked as read'
    })
  } catch (error) {
    logger.error('Mark notification read error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Mark all notifications as read
router.put('/read-all', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('user_id', req.user.id)
      .eq('is_read', false)

    if (error) {
      throw error
    }

    res.json({
      success: true,
      message: 'All notifications marked as read'
    })
  } catch (error) {
    logger.error('Mark all notifications read error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Delete notification
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id)

    if (error) {
      throw error
    }

    res.json({
      success: true,
      message: 'Notification deleted'
    })
  } catch (error) {
    logger.error('Delete notification error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Delete all notifications
router.delete('/all', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', req.user.id)

    if (error) {
      throw error
    }

    res.json({
      success: true,
      message: 'All notifications deleted'
    })
  } catch (error) {
    logger.error('Delete all notifications error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Get notification settings
router.get('/settings', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Get user's notification preferences
    const { data: profile } = await supabase
      .from('profiles')
      .select('notification_settings')
      .eq('user_id', req.user.id)
      .single()

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
      frequency: 'immediate' // immediate, daily, weekly
    }

    res.json({
      success: true,
      data: {
        settings: profile?.notification_settings || defaultSettings
      }
    })
  } catch (error) {
    logger.error('Get notification settings error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Update notification settings
router.put('/settings', authMiddleware, validateRequest({
  body: Joi.object({
    email_notifications: Joi.boolean().optional(),
    push_notifications: Joi.boolean().optional(),
    in_app_notifications: Joi.boolean().optional(),
    sms_notifications: Joi.boolean().optional(),
    notification_types: Joi.object({
      likes: Joi.boolean().optional(),
      comments: Joi.boolean().optional(),
      follows: Joi.boolean().optional(),
      shares: Joi.boolean().optional(),
      mentions: Joi.boolean().optional(),
      subscriptions: Joi.boolean().optional(),
      tips: Joi.boolean().optional(),
      streams: Joi.boolean().optional(),
      messages: Joi.boolean().optional(),
      system: Joi.boolean().optional()
    }).optional(),
    quiet_hours: Joi.object({
      enabled: Joi.boolean().optional(),
      start_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
      end_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
      timezone: Joi.string().optional()
    }).optional(),
    frequency: Joi.string().valid('immediate', 'daily', 'weekly').optional()
  })
}), async (req: Request, res: Response) => {
  try {
    const settings = req.body

    // Update profile notification settings
    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update({
        notification_settings: settings,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', req.user.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    res.json({
      success: true,
      data: updatedProfile,
      message: 'Notification settings updated successfully'
    })
  } catch (error) {
    logger.error('Update notification settings error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// =============================================
// NOTIFICATION SERVICE METHODS
// =============================================

// Create notification
export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  context?: any,
  actorId?: string,
  deliveryMethods?: string[]
) {
  try {
    // Get user's notification settings
    const { data: profile } = await supabase
      .from('profiles')
      .select('notification_settings, email')
      .eq('user_id', userId)
      .single()

    if (!profile) {
      throw new Error('User not found')
    }

    const settings = profile.notification_settings || {}
    
    // Check if this notification type is enabled
    if (settings.notification_types && !settings.notification_types[type]) {
      return null // User has disabled this notification type
    }

    // Check quiet hours
    if (settings.quiet_hours?.enabled) {
      const now = new Date()
      const currentTime = now.toTimeString().slice(0, 5)
      const startTime = settings.quiet_hours.start_time
      const endTime = settings.quiet_hours.end_time

      if (isInQuietHours(currentTime, startTime, endTime)) {
        // Schedule notification for after quiet hours
        return await scheduleNotification(userId, type, title, message, context, actorId, deliveryMethods)
      }
    }

    // Create notification in database
    const { data: notification } = await supabase
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
      .single()

    if (!notification) {
      throw new Error('Failed to create notification')
    }

    // Send notification based on user preferences
    await sendNotification(notification, profile, settings)

    return notification
  } catch (error) {
    logger.error('Create notification error:', error)
    throw error
  }
}

// Send notification through various channels
async function sendNotification(notification: any, profile: any, settings: any) {
  const deliveryMethods = notification.delivery_methods || ['in_app']

  for (const method of deliveryMethods) {
    try {
      switch (method) {
        case 'in_app':
          // Real-time notification (handled by WebSocket service)
          break

        case 'email':
          if (settings.email_notifications && profile.email) {
            await sendEmailNotification(profile.email, notification)
          }
          break

        case 'push':
          if (settings.push_notifications) {
            await sendPushNotification(profile.user_id, notification)
          }
          break

        case 'sms':
          if (settings.sms_notifications && profile.phone) {
            await sendSMSNotification(profile.phone, notification)
          }
          break
      }
    } catch (error) {
      logger.error(`Failed to send ${method} notification:`, error)
    }
  }

  // Mark as sent
  await supabase
    .from('notifications')
    .update({ is_sent: true })
    .eq('id', notification.id)
}

// Send email notification
async function sendEmailNotification(email: string, notification: any) {
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
  }

  await emailTransporter.sendMail(mailOptions)
}

// Send push notification (implement with your push service)
async function sendPushNotification(userId: string, notification: any) {
  // Implement push notification logic here
  // This could use Firebase Cloud Messaging, OneSignal, etc.
  logger.info(`Sending push notification to user ${userId}: ${notification.title}`)
}

// Send SMS notification (implement with your SMS service)
async function sendSMSNotification(phone: string, notification: any) {
  // Implement SMS notification logic here
  // This could use Twilio, AWS SNS, etc.
  logger.info(`Sending SMS notification to ${phone}: ${notification.title}`)
}

// Schedule notification for later delivery
async function scheduleNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  context?: any,
  actorId?: string,
  deliveryMethods?: string[]
) {
  // Implement notification scheduling logic
  // This could use a job queue like Bull, Agenda, etc.
  logger.info(`Scheduling notification for user ${userId}: ${title}`)
}

// Check if current time is within quiet hours
function isInQuietHours(currentTime: string, startTime: string, endTime: string): boolean {
  const current = timeToMinutes(currentTime)
  const start = timeToMinutes(startTime)
  const end = timeToMinutes(endTime)

  if (start <= end) {
    // Same day quiet hours (e.g., 22:00 to 08:00)
    return current >= start || current <= end
  } else {
    // Overnight quiet hours (e.g., 22:00 to 08:00)
    return current >= start || current <= end
  }
}

// Convert time string to minutes since midnight
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// =============================================
// BULK NOTIFICATION METHODS
// =============================================

// Send notification to multiple users
export async function sendBulkNotification(
  userIds: string[],
  type: string,
  title: string,
  message: string,
  context?: any,
  actorId?: string
) {
  const notifications = []
  
  for (const userId of userIds) {
    try {
      const notification = await createNotification(
        userId,
        type,
        title,
        message,
        context,
        actorId
      )
      if (notification) {
        notifications.push(notification)
      }
    } catch (error) {
      logger.error(`Failed to create notification for user ${userId}:`, error)
    }
  }

  return notifications
}

// Send notification to all followers
export async function sendNotificationToFollowers(
  userId: string,
  type: string,
  title: string,
  message: string,
  context?: any
) {
  // Get followers
  const { data: followers } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('following_id', userId)

  if (!followers) {
    return []
  }

  const followerIds = followers.map(f => f.follower_id)
  return await sendBulkNotification(followerIds, type, title, message, context, userId)
}

// Send notification to all subscribers
export async function sendNotificationToSubscribers(
  creatorId: string,
  type: string,
  title: string,
  message: string,
  context?: any
) {
  // Get subscribers
  const { data: subscribers } = await supabase
    .from('subscriptions')
    .select('subscriber_id')
    .eq('creator_id', creatorId)
    .eq('status', 'active')

  if (!subscribers) {
    return []
  }

  const subscriberIds = subscribers.map(s => s.subscriber_id)
  return await sendBulkNotification(subscriberIds, type, title, message, context, creatorId)
}

export default router