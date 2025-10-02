import { Router, Request, Response } from 'express'
import { supabase } from '../config/database'
import { authMiddleware } from '../middleware/auth'
import { validateRequest } from '../middleware/validation'
import { logger } from '../utils/logger'
import { redisManager } from '../config/redis'
import { flavourstalkService } from '../services/flavourstalkService'
import { z } from 'zod'

const router = Router()

// Validation schemas
const createChatSessionSchema = z.object({
  interests: z.array(z.string()).min(1).max(10),
  ageRange: z.object({
    min: z.number().min(18).max(100),
    max: z.number().min(18).max(100)
  }).optional(),
  location: z.string().optional(),
  gender: z.enum(['male', 'female', 'non-binary', 'other']).optional(),
  chatType: z.enum(['text', 'audio', 'video']).default('text')
})

const sendMessageSchema = z.object({
  sessionId: z.string().uuid(),
  message: z.string().min(1).max(1000),
  type: z.enum(['text', 'image', 'emoji']).default('text')
})

const reportUserSchema = z.object({
  sessionId: z.string().uuid(),
  reason: z.enum(['inappropriate', 'spam', 'harassment', 'underage', 'fake', 'other']),
  description: z.string().max(500).optional()
})

const updatePreferencesSchema = z.object({
  interests: z.array(z.string()).min(1).max(10).optional(),
  ageRange: z.object({
    min: z.number().min(18).max(100),
    max: z.number().min(18).max(100)
  }).optional(),
  location: z.string().optional(),
  gender: z.enum(['male', 'female', 'non-binary', 'other']).optional(),
  chatType: z.enum(['text', 'audio', 'video']).optional()
})

// Create new chat session
router.post('/sessions', authMiddleware, validateRequest(createChatSessionSchema), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const sessionData = req.body

    // Check if user has an active session
    const activeSession = await flavourstalkService.getActiveSession(userId)
    if (activeSession) {
      return res.status(400).json({
        error: 'You already have an active chat session',
        session: activeSession
      })
    }

    const session = await flavourstalkService.createChatSession({
      userId,
      ...sessionData
    })

    // Store session in Redis for real-time matching
    await redisManager.setex(`chat_session:${session.id}`, 3600, JSON.stringify({
      ...session,
      isActive: true,
      createdAt: new Date().toISOString()
    }))

    res.status(201).json({
      message: 'Chat session created successfully',
      session
    })
  } catch (error) {
    logger.error('Create chat session error:', error)
    res.status(500).json({
      error: 'Failed to create chat session'
    })
  }
})

// Find match for chat session
router.post('/sessions/:id/match', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.id

    const match = await flavourstalkService.findMatch(id, userId)

    if (!match) {
      return res.json({
        message: 'No suitable match found at the moment',
        match: null
      })
    }

    res.json({
      message: 'Match found successfully',
      match
    })
  } catch (error) {
    logger.error('Find match error:', error)
    res.status(500).json({
      error: 'Failed to find match'
    })
  }
})

// Get active session
router.get('/sessions/active', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id

    const session = await flavourstalkService.getActiveSession(userId)

    if (!session) {
      return res.status(404).json({
        error: 'No active session found'
      })
    }

    res.json({ session })
  } catch (error) {
    logger.error('Get active session error:', error)
    res.status(500).json({
      error: 'Failed to fetch active session'
    })
  }
})

// End chat session
router.post('/sessions/:id/end', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.id

    await flavourstalkService.endChatSession(id, userId)

    // Remove from Redis
    await redisManager.del(`chat_session:${id}`)

    res.json({
      message: 'Chat session ended successfully'
    })
  } catch (error) {
    logger.error('End session error:', error)
    res.status(500).json({
      error: 'Failed to end session'
    })
  }
})

// Skip current match
router.post('/sessions/:id/skip', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.id
    const { reason } = req.body

    await flavourstalkService.skipMatch(id, userId, reason)

    res.json({
      message: 'Match skipped successfully'
    })
  } catch (error) {
    logger.error('Skip match error:', error)
    res.status(500).json({
      error: 'Failed to skip match'
    })
  }
})

// Send message in chat
router.post('/sessions/messages', authMiddleware, validateRequest(sendMessageSchema), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { sessionId, message, type } = req.body

    const chatMessage = await flavourstalkService.sendMessage({
      sessionId,
      userId,
      message,
      type
    })

    res.json({
      message: 'Message sent successfully',
      chatMessage
    })
  } catch (error) {
    logger.error('Send message error:', error)
    res.status(500).json({
      error: 'Failed to send message'
    })
  }
})

// Get chat messages
router.get('/sessions/:id/messages', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.id
    const { limit = 50, offset = 0 } = req.query

    const messages = await flavourstalkService.getChatMessages(id, userId, {
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    })

    res.json({ messages })
  } catch (error) {
    logger.error('Get messages error:', error)
    res.status(500).json({
      error: 'Failed to fetch messages'
    })
  }
})

// Report user
router.post('/sessions/report', authMiddleware, validateRequest(reportUserSchema), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { sessionId, reason, description } = req.body

    const report = await flavourstalkService.reportUser({
      sessionId,
      reporterId: userId,
      reason,
      description
    })

    res.json({
      message: 'User reported successfully',
      report
    })
  } catch (error) {
    logger.error('Report user error:', error)
    res.status(500).json({
      error: 'Failed to report user'
    })
  }
})

// Block user
router.post('/sessions/:id/block', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.id
    const { blockedUserId, reason } = req.body

    await flavourstalkService.blockUser(id, userId, blockedUserId, reason)

    res.json({
      message: 'User blocked successfully'
    })
  } catch (error) {
    logger.error('Block user error:', error)
    res.status(500).json({
      error: 'Failed to block user'
    })
  }
})

// Update chat preferences
router.patch('/preferences', authMiddleware, validateRequest(updatePreferencesSchema), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const preferences = req.body

    const updatedPreferences = await flavourstalkService.updatePreferences(userId, preferences)

    res.json({
      message: 'Preferences updated successfully',
      preferences: updatedPreferences
    })
  } catch (error) {
    logger.error('Update preferences error:', error)
    res.status(500).json({
      error: 'Failed to update preferences'
    })
  }
})

// Get chat preferences
router.get('/preferences', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id

    const preferences = await flavourstalkService.getPreferences(userId)

    res.json({ preferences })
  } catch (error) {
    logger.error('Get preferences error:', error)
    res.status(500).json({
      error: 'Failed to fetch preferences'
    })
  }
})

// Get chat history
router.get('/history', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { limit = 20, offset = 0 } = req.query

    const history = await flavourstalkService.getChatHistory(userId, {
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    })

    res.json({ history })
  } catch (error) {
    logger.error('Get chat history error:', error)
    res.status(500).json({
      error: 'Failed to fetch chat history'
    })
  }
})

// Get chat statistics
router.get('/stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id

    const stats = await flavourstalkService.getChatStats(userId)

    res.json({ stats })
  } catch (error) {
    logger.error('Get chat stats error:', error)
    res.status(500).json({
      error: 'Failed to fetch chat statistics'
    })
  }
})

// Get available interests
router.get('/interests', async (req: Request, res: Response) => {
  try {
    const interests = await flavourstalkService.getAvailableInterests()

    res.json({ interests })
  } catch (error) {
    logger.error('Get interests error:', error)
    res.status(500).json({
      error: 'Failed to fetch interests'
    })
  }
})

// Get online users count
router.get('/online-count', async (req: Request, res: Response) => {
  try {
    const count = await flavourstalkService.getOnlineUsersCount()

    res.json({ count })
  } catch (error) {
    logger.error('Get online count error:', error)
    res.status(500).json({
      error: 'Failed to fetch online users count'
    })
  }
})

// Start voice/video call
router.post('/sessions/:id/call', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.id
    const { callType } = req.body // 'audio' or 'video'

    const call = await flavourstalkService.startCall(id, userId, callType)

    res.json({
      message: 'Call started successfully',
      call
    })
  } catch (error) {
    logger.error('Start call error:', error)
    res.status(500).json({
      error: 'Failed to start call'
    })
  }
})

// End call
router.post('/sessions/:id/call/end', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.id

    await flavourstalkService.endCall(id, userId)

    res.json({
      message: 'Call ended successfully'
    })
  } catch (error) {
    logger.error('End call error:', error)
    res.status(500).json({
      error: 'Failed to end call'
    })
  }
})

export default router

