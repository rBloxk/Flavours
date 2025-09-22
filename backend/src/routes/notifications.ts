import { Router, Request, Response } from 'express'
import { supabase } from '../config/supabase'
import { authMiddleware } from '../middleware/auth'
import { validateRequest } from '../middleware/validation'
import { logger } from '../utils/logger'
import { redisManager } from '../config/redis'
import { notificationsService } from '../services/notificationsService'
import { z } from 'zod'

const router = Router()

// Validation schemas
const markAsReadSchema = z.object({
  notificationIds: z.array(z.string().uuid()).min(1)
})

const updatePreferencesSchema = z.object({
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  notificationTypes: z.record(z.boolean()).optional()
})

// Get user notifications
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { page = 1, limit = 20, unreadOnly = false, type } = req.query

    const notifications = await notificationsService.getUserNotifications(userId, {
      page: Number(page),
      limit: Number(limit),
      unreadOnly: unreadOnly === 'true',
      type: type as string
    })

    res.json({
      notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: notifications.length
      }
    })
  } catch (error) {
    logger.error('Get notifications error:', error)
    res.status(500).json({
      error: 'Failed to fetch notifications'
    })
  }
})

// Get unread notifications count
router.get('/unread-count', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id

    const count = await notificationsService.getUnreadCount(userId)

    res.json({ count })
  } catch (error) {
    logger.error('Get unread count error:', error)
    res.status(500).json({
      error: 'Failed to fetch unread count'
    })
  }
})

// Mark notifications as read
router.patch('/mark-read', authMiddleware, validateRequest(markAsReadSchema), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { notificationIds } = req.body

    await notificationsService.markAsRead(notificationIds, userId)

    res.json({
      message: 'Notifications marked as read successfully'
    })
  } catch (error) {
    logger.error('Mark as read error:', error)
    res.status(500).json({
      error: 'Failed to mark notifications as read'
    })
  }
})

// Mark all notifications as read
router.patch('/mark-all-read', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id

    await notificationsService.markAllAsRead(userId)

    res.json({
      message: 'All notifications marked as read successfully'
    })
  } catch (error) {
    logger.error('Mark all as read error:', error)
    res.status(500).json({
      error: 'Failed to mark all notifications as read'
    })
  }
})

// Delete notification
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { id } = req.params

    await notificationsService.deleteNotification(id, userId)

    res.json({
      message: 'Notification deleted successfully'
    })
  } catch (error) {
    logger.error('Delete notification error:', error)
    res.status(500).json({
      error: 'Failed to delete notification'
    })
  }
})

// Delete all notifications
router.delete('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id

    await notificationsService.deleteAllNotifications(userId)

    res.json({
      message: 'All notifications deleted successfully'
    })
  } catch (error) {
    logger.error('Delete all notifications error:', error)
    res.status(500).json({
      error: 'Failed to delete all notifications'
    })
  }
})

// Get notification preferences
router.get('/preferences', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id

    const preferences = await notificationsService.getNotificationPreferences(userId)

    res.json({ preferences })
  } catch (error) {
    logger.error('Get notification preferences error:', error)
    res.status(500).json({
      error: 'Failed to fetch notification preferences'
    })
  }
})

// Update notification preferences
router.patch('/preferences', authMiddleware, validateRequest(updatePreferencesSchema), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const preferences = req.body

    const updatedPreferences = await notificationsService.updateNotificationPreferences(userId, preferences)

    res.json({
      message: 'Notification preferences updated successfully',
      preferences: updatedPreferences
    })
  } catch (error) {
    logger.error('Update notification preferences error:', error)
    res.status(500).json({
      error: 'Failed to update notification preferences'
    })
  }
})

// Send notification (admin only)
router.post('/send', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { recipientId, type, title, message, data } = req.body

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', userId)
      .single()

    if (!profile?.is_admin) {
      return res.status(403).json({
        error: 'Admin access required'
      })
    }

    const notification = await notificationsService.sendNotification({
      recipientId,
      type,
      title,
      message,
      data
    })

    res.json({
      message: 'Notification sent successfully',
      notification
    })
  } catch (error) {
    logger.error('Send notification error:', error)
    res.status(500).json({
      error: 'Failed to send notification'
    })
  }
})

// Get notification types
router.get('/types', async (req: Request, res: Response) => {
  try {
    const types = await notificationsService.getNotificationTypes()

    res.json({ types })
  } catch (error) {
    logger.error('Get notification types error:', error)
    res.status(500).json({
      error: 'Failed to fetch notification types'
    })
  }
})

// Subscribe to push notifications
router.post('/push/subscribe', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { endpoint, keys } = req.body

    const subscription = await notificationsService.subscribeToPushNotifications(userId, {
      endpoint,
      keys
    })

    res.json({
      message: 'Push notification subscription created successfully',
      subscription
    })
  } catch (error) {
    logger.error('Subscribe to push notifications error:', error)
    res.status(500).json({
      error: 'Failed to subscribe to push notifications'
    })
  }
})

// Unsubscribe from push notifications
router.delete('/push/unsubscribe', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id

    await notificationsService.unsubscribeFromPushNotifications(userId)

    res.json({
      message: 'Push notification subscription removed successfully'
    })
  } catch (error) {
    logger.error('Unsubscribe from push notifications error:', error)
    res.status(500).json({
      error: 'Failed to unsubscribe from push notifications'
    })
  }
})

// Test notification (for development)
router.post('/test', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { type = 'test', title = 'Test Notification', message = 'This is a test notification' } = req.body

    const notification = await notificationsService.sendNotification({
      recipientId: userId,
      type,
      title,
      message,
      data: { test: true }
    })

    res.json({
      message: 'Test notification sent successfully',
      notification
    })
  } catch (error) {
    logger.error('Test notification error:', error)
    res.status(500).json({
      error: 'Failed to send test notification'
    })
  }
})

export default router

