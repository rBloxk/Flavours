import { Router, Request, Response } from 'express'
import { supabase } from '../config/supabase'
import { authMiddleware } from '../middleware/auth'
import { validateRequest } from '../middleware/validation'
import { logger } from '../utils/logger'
import { analyticsService } from '../services/analyticsService'
import { z } from 'zod'

const router = Router()

// Validation schemas
const analyticsQuerySchema = z.object({
  period: z.enum(['1d', '7d', '30d', '90d', '1y']).default('7d'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  metric: z.string().optional(),
  groupBy: z.enum(['hour', 'day', 'week', 'month']).optional()
})

// Get platform analytics (admin only)
router.get('/platform', authMiddleware, validateRequest(analyticsQuerySchema), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { period, startDate, endDate, metric, groupBy } = req.query

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

    const analytics = await analyticsService.getPlatformAnalytics({
      period: period as string,
      startDate: startDate as string,
      endDate: endDate as string,
      metric: metric as string,
      groupBy: groupBy as string
    })

    res.json({ analytics })
  } catch (error) {
    logger.error('Get platform analytics error:', error)
    res.status(500).json({
      error: 'Failed to fetch platform analytics'
    })
  }
})

// Get creator analytics
router.get('/creator', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { period = '7d', startDate, endDate } = req.query

    // Check if user is a creator
    const { data: creator } = await supabase
      .from('creators')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!creator) {
      return res.status(403).json({
        error: 'Creator access required'
      })
    }

    const analytics = await analyticsService.getCreatorAnalytics(creator.id, {
      period: period as string,
      startDate: startDate as string,
      endDate: endDate as string
    })

    res.json({ analytics })
  } catch (error) {
    logger.error('Get creator analytics error:', error)
    res.status(500).json({
      error: 'Failed to fetch creator analytics'
    })
  }
})

// Get content analytics
router.get('/content', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { period = '7d', contentType = 'all' } = req.query

    // Check if user is a creator
    const { data: creator } = await supabase
      .from('creators')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!creator) {
      return res.status(403).json({
        error: 'Creator access required'
      })
    }

    const analytics = await analyticsService.getContentAnalytics(creator.id, {
      period: period as string,
      contentType: contentType as string
    })

    res.json({ analytics })
  } catch (error) {
    logger.error('Get content analytics error:', error)
    res.status(500).json({
      error: 'Failed to fetch content analytics'
    })
  }
})

// Get revenue analytics
router.get('/revenue', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { period = '7d', startDate, endDate } = req.query

    // Check if user is a creator
    const { data: creator } = await supabase
      .from('creators')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!creator) {
      return res.status(403).json({
        error: 'Creator access required'
      })
    }

    const analytics = await analyticsService.getRevenueAnalytics(creator.id, {
      period: period as string,
      startDate: startDate as string,
      endDate: endDate as string
    })

    res.json({ analytics })
  } catch (error) {
    logger.error('Get revenue analytics error:', error)
    res.status(500).json({
      error: 'Failed to fetch revenue analytics'
    })
  }
})

// Get audience analytics
router.get('/audience', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { period = '7d' } = req.query

    // Check if user is a creator
    const { data: creator } = await supabase
      .from('creators')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!creator) {
      return res.status(403).json({
        error: 'Creator access required'
      })
    }

    const analytics = await analyticsService.getAudienceAnalytics(creator.id, {
      period: period as string
    })

    res.json({ analytics })
  } catch (error) {
    logger.error('Get audience analytics error:', error)
    res.status(500).json({
      error: 'Failed to fetch audience analytics'
    })
  }
})

// Get engagement analytics
router.get('/engagement', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { period = '7d', contentType = 'all' } = req.query

    // Check if user is a creator
    const { data: creator } = await supabase
      .from('creators')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!creator) {
      return res.status(403).json({
        error: 'Creator access required'
      })
    }

    const analytics = await analyticsService.getEngagementAnalytics(creator.id, {
      period: period as string,
      contentType: contentType as string
    })

    res.json({ analytics })
  } catch (error) {
    logger.error('Get engagement analytics error:', error)
    res.status(500).json({
      error: 'Failed to fetch engagement analytics'
    })
  }
})

// Get stream analytics
router.get('/streams', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { period = '7d', streamId } = req.query

    // Check if user is a creator
    const { data: creator } = await supabase
      .from('creators')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!creator) {
      return res.status(403).json({
        error: 'Creator access required'
      })
    }

    const analytics = await analyticsService.getStreamAnalytics(creator.id, {
      period: period as string,
      streamId: streamId as string
    })

    res.json({ analytics })
  } catch (error) {
    logger.error('Get stream analytics error:', error)
    res.status(500).json({
      error: 'Failed to fetch stream analytics'
    })
  }
})

// Get chat analytics
router.get('/chat', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { period = '7d' } = req.query

    const analytics = await analyticsService.getChatAnalytics(userId, {
      period: period as string
    })

    res.json({ analytics })
  } catch (error) {
    logger.error('Get chat analytics error:', error)
    res.status(500).json({
      error: 'Failed to fetch chat analytics'
    })
  }
})

// Get real-time metrics
router.get('/realtime', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id

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

    const metrics = await analyticsService.getRealTimeMetrics()

    res.json({ metrics })
  } catch (error) {
    logger.error('Get real-time metrics error:', error)
    res.status(500).json({
      error: 'Failed to fetch real-time metrics'
    })
  }
})

// Get analytics dashboard data
router.get('/dashboard', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { period = '7d' } = req.query

    // Check if user is a creator
    const { data: creator } = await supabase
      .from('creators')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!creator) {
      return res.status(403).json({
        error: 'Creator access required'
      })
    }

    const dashboard = await analyticsService.getAnalyticsDashboard(creator.id, {
      period: period as string
    })

    res.json({ dashboard })
  } catch (error) {
    logger.error('Get analytics dashboard error:', error)
    res.status(500).json({
      error: 'Failed to fetch analytics dashboard'
    })
  }
})

// Export analytics data
router.get('/export', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { period = '7d', format = 'csv', type = 'all' } = req.query

    // Check if user is a creator
    const { data: creator } = await supabase
      .from('creators')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!creator) {
      return res.status(403).json({
        error: 'Creator access required'
      })
    }

    const exportData = await analyticsService.exportAnalyticsData(creator.id, {
      period: period as string,
      format: format as string,
      type: type as string
    })

    res.setHeader('Content-Type', 'application/octet-stream')
    res.setHeader('Content-Disposition', `attachment; filename="analytics-${Date.now()}.${format}"`)
    res.send(exportData)
  } catch (error) {
    logger.error('Export analytics error:', error)
    res.status(500).json({
      error: 'Failed to export analytics data'
    })
  }
})

export default router

