import { Router, Request, Response } from 'express'
import { supabase } from '../config/supabase'
import { authMiddleware } from '../middleware/auth'
import { validateRequest } from '../middleware/validation'
import { logger } from '../utils/logger'
import { redisManager } from '../config/redis'
import { camsService } from '../services/camsService'
import { z } from 'zod'

const router = Router()

// Validation schemas
const createStreamSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  category: z.string().min(1),
  tags: z.array(z.string()).max(10).optional(),
  privacy: z.enum(['public', 'followers', 'paid']),
  price: z.number().min(0).optional(),
  quality: z.enum(['480p', '720p', '1080p', '4K']).default('720p'),
  bitrate: z.number().min(500).max(10000).default(2500),
  fps: z.number().min(15).max(60).default(30),
  audioQuality: z.enum(['low', 'medium', 'high']).default('medium')
})

const updateStreamSettingsSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  category: z.string().min(1).optional(),
  tags: z.array(z.string()).max(10).optional(),
  privacy: z.enum(['public', 'followers', 'paid']).optional(),
  price: z.number().min(0).optional(),
  quality: z.enum(['480p', '720p', '1080p', '4K']).optional(),
  bitrate: z.number().min(500).max(10000).optional(),
  fps: z.number().min(15).max(60).optional(),
  audioQuality: z.enum(['low', 'medium', 'high']).optional()
})

const sendGiftSchema = z.object({
  streamId: z.string().uuid(),
  giftType: z.enum(['heart', 'star', 'crown', 'zap']),
  amount: z.number().min(1).max(1000).optional()
})

const reportStreamSchema = z.object({
  streamId: z.string().uuid(),
  reason: z.enum(['inappropriate', 'spam', 'harassment', 'underage', 'other']),
  description: z.string().max(500).optional()
})

// Create new stream
router.post('/streams', authMiddleware, validateRequest(createStreamSchema), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const streamData = req.body

    // Check if user is a creator
    const { data: creator } = await supabase
      .from('creators')
      .select('id, verification_status')
      .eq('user_id', userId)
      .single()

    if (!creator) {
      return res.status(403).json({
        error: 'Only verified creators can start streams'
      })
    }

    if (creator.verification_status !== 'verified') {
      return res.status(403).json({
        error: 'Creator verification required to start streams'
      })
    }

    const stream = await camsService.createStream({
      creatorId: creator.id,
      userId,
      ...streamData
    })

    // Store stream in Redis for real-time access
    await redisManager.setex(`stream:${stream.id}`, 3600, JSON.stringify({
      ...stream,
      viewerCount: 0,
      isLive: true,
      startTime: new Date().toISOString()
    }))

    res.status(201).json({
      message: 'Stream created successfully',
      stream
    })
  } catch (error) {
    logger.error('Create stream error:', error)
    res.status(500).json({
      error: 'Failed to create stream'
    })
  }
})

// Get live streams
router.get('/streams', async (req: Request, res: Response) => {
  try {
    const { category, search, limit = 20, offset = 0 } = req.query

    const streams = await camsService.getLiveStreams({
      category: category as string,
      search: search as string,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    })

    res.json({
      streams,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: streams.length
      }
    })
  } catch (error) {
    logger.error('Get streams error:', error)
    res.status(500).json({
      error: 'Failed to fetch streams'
    })
  }
})

// Get stream by ID
router.get('/streams/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const stream = await camsService.getStreamById(id)
    if (!stream) {
      return res.status(404).json({
        error: 'Stream not found'
      })
    }

    // Get real-time viewer count from Redis
    const streamData = await redisManager.get(`stream:${id}`)
    if (streamData) {
      const realTimeData = JSON.parse(streamData)
      stream.viewerCount = realTimeData.viewerCount
      stream.isLive = realTimeData.isLive
    }

    res.json({ stream })
  } catch (error) {
    logger.error('Get stream error:', error)
    res.status(500).json({
      error: 'Failed to fetch stream'
    })
  }
})

// Update stream settings
router.patch('/streams/:id', authMiddleware, validateRequest(updateStreamSettingsSchema), async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.id
    const updates = req.body

    const stream = await camsService.updateStreamSettings(id, userId, updates)

    // Update Redis cache
    const streamData = await redisManager.get(`stream:${id}`)
    if (streamData) {
      const realTimeData = JSON.parse(streamData)
      await redisManager.setex(`stream:${id}`, 3600, JSON.stringify({
        ...realTimeData,
        ...updates
      }))
    }

    res.json({
      message: 'Stream settings updated',
      stream
    })
  } catch (error) {
    logger.error('Update stream error:', error)
    res.status(500).json({
      error: 'Failed to update stream'
    })
  }
})

// Start streaming
router.post('/streams/:id/start', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.id

    const stream = await camsService.startStream(id, userId)

    // Update Redis with live status
    await redisManager.setex(`stream:${id}`, 3600, JSON.stringify({
      ...stream,
      isLive: true,
      startTime: new Date().toISOString(),
      viewerCount: 0
    }))

    res.json({
      message: 'Stream started successfully',
      stream
    })
  } catch (error) {
    logger.error('Start stream error:', error)
    res.status(500).json({
      error: 'Failed to start stream'
    })
  }
})

// Stop streaming
router.post('/streams/:id/stop', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.id

    const stream = await camsService.stopStream(id, userId)

    // Remove from Redis
    await redisManager.del(`stream:${id}`)

    res.json({
      message: 'Stream stopped successfully',
      stream
    })
  } catch (error) {
    logger.error('Stop stream error:', error)
    res.status(500).json({
      error: 'Failed to stop stream'
    })
  }
})

// Join stream as viewer
router.post('/streams/:id/join', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.id

    const viewer = await camsService.joinStream(id, userId)

    // Update viewer count in Redis
    const streamData = await redisManager.get(`stream:${id}`)
    if (streamData) {
      const realTimeData = JSON.parse(streamData)
      realTimeData.viewerCount = (realTimeData.viewerCount || 0) + 1
      await redisManager.setex(`stream:${id}`, 3600, JSON.stringify(realTimeData))
    }

    res.json({
      message: 'Joined stream successfully',
      viewer
    })
  } catch (error) {
    logger.error('Join stream error:', error)
    res.status(500).json({
      error: 'Failed to join stream'
    })
  }
})

// Leave stream
router.post('/streams/:id/leave', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.id

    await camsService.leaveStream(id, userId)

    // Update viewer count in Redis
    const streamData = await redisManager.get(`stream:${id}`)
    if (streamData) {
      const realTimeData = JSON.parse(streamData)
      realTimeData.viewerCount = Math.max(0, (realTimeData.viewerCount || 0) - 1)
      await redisManager.setex(`stream:${id}`, 3600, JSON.stringify(realTimeData))
    }

    res.json({
      message: 'Left stream successfully'
    })
  } catch (error) {
    logger.error('Leave stream error:', error)
    res.status(500).json({
      error: 'Failed to leave stream'
    })
  }
})

// Get stream viewers
router.get('/streams/:id/viewers', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.id

    const viewers = await camsService.getStreamViewers(id, userId)

    res.json({ viewers })
  } catch (error) {
    logger.error('Get viewers error:', error)
    res.status(500).json({
      error: 'Failed to fetch viewers'
    })
  }
})

// Send gift to stream
router.post('/streams/gifts', authMiddleware, validateRequest(sendGiftSchema), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { streamId, giftType, amount } = req.body

    const gift = await camsService.sendGift({
      streamId,
      userId,
      giftType,
      amount: amount || 1
    })

    res.json({
      message: 'Gift sent successfully',
      gift
    })
  } catch (error) {
    logger.error('Send gift error:', error)
    res.status(500).json({
      error: 'Failed to send gift'
    })
  }
})

// Get stream chat messages
router.get('/streams/:id/chat', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { limit = 50, offset = 0 } = req.query

    const messages = await camsService.getStreamChat(id, {
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    })

    res.json({ messages })
  } catch (error) {
    logger.error('Get chat error:', error)
    res.status(500).json({
      error: 'Failed to fetch chat messages'
    })
  }
})

// Send chat message
router.post('/streams/:id/chat', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.id
    const { message } = req.body

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Message is required'
      })
    }

    const chatMessage = await camsService.sendChatMessage({
      streamId: id,
      userId,
      message: message.trim()
    })

    res.json({
      message: 'Chat message sent successfully',
      chatMessage
    })
  } catch (error) {
    logger.error('Send chat error:', error)
    res.status(500).json({
      error: 'Failed to send chat message'
    })
  }
})

// Start recording
router.post('/streams/:id/record', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.id

    const recording = await camsService.startRecording(id, userId)

    res.json({
      message: 'Recording started successfully',
      recording
    })
  } catch (error) {
    logger.error('Start recording error:', error)
    res.status(500).json({
      error: 'Failed to start recording'
    })
  }
})

// Stop recording
router.post('/streams/:id/record/stop', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.id

    const recording = await camsService.stopRecording(id, userId)

    res.json({
      message: 'Recording stopped successfully',
      recording
    })
  } catch (error) {
    logger.error('Stop recording error:', error)
    res.status(500).json({
      error: 'Failed to stop recording'
    })
  }
})

// Get stream recordings
router.get('/streams/:id/recordings', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.id

    const recordings = await camsService.getStreamRecordings(id, userId)

    res.json({ recordings })
  } catch (error) {
    logger.error('Get recordings error:', error)
    res.status(500).json({
      error: 'Failed to fetch recordings'
    })
  }
})

// Get stream analytics
router.get('/streams/:id/analytics', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.id

    const analytics = await camsService.getStreamAnalytics(id, userId)

    res.json({ analytics })
  } catch (error) {
    logger.error('Get analytics error:', error)
    res.status(500).json({
      error: 'Failed to fetch analytics'
    })
  }
})

// Report stream
router.post('/streams/report', authMiddleware, validateRequest(reportStreamSchema), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { streamId, reason, description } = req.body

    const report = await camsService.reportStream({
      streamId,
      reporterId: userId,
      reason,
      description
    })

    res.json({
      message: 'Stream reported successfully',
      report
    })
  } catch (error) {
    logger.error('Report stream error:', error)
    res.status(500).json({
      error: 'Failed to report stream'
    })
  }
})

// Ban viewer from stream
router.post('/streams/:id/ban', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.id
    const { viewerId, reason } = req.body

    await camsService.banViewer(id, userId, viewerId, reason)

    res.json({
      message: 'Viewer banned successfully'
    })
  } catch (error) {
    logger.error('Ban viewer error:', error)
    res.status(500).json({
      error: 'Failed to ban viewer'
    })
  }
})

// Promote viewer to moderator
router.post('/streams/:id/moderator', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.id
    const { viewerId } = req.body

    await camsService.promoteToModerator(id, userId, viewerId)

    res.json({
      message: 'Viewer promoted to moderator successfully'
    })
  } catch (error) {
    logger.error('Promote moderator error:', error)
    res.status(500).json({
      error: 'Failed to promote viewer'
    })
  }
})

export default router

