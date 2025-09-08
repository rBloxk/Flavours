import { Router, Request, Response } from 'express'
import { authMiddleware, requireAdmin, AuthenticatedRequest } from '../middleware/auth'
import { validateRequest } from '../middleware/validation'
import { adminSchemas } from '../schemas/admin'
import { AdminService } from '../services/adminService'
import { logger } from '../utils/logger'

const router = Router()
const adminService = new AdminService()

// All admin routes require authentication and admin role
router.use(authMiddleware)
router.use(requireAdmin)

// Dashboard overview
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const stats = await adminService.getDashboardStats()

    res.json({
      stats
    })
  } catch (error) {
    logger.error('Get dashboard stats error:', error)
    res.status(500).json({
      error: 'Failed to fetch dashboard stats'
    })
  }
})

// Get moderation queue
router.get('/moderation/queue', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status = 'pending', type } = req.query

    const items = await adminService.getModerationQueue({
      page: Number(page),
      limit: Number(limit),
      status: status as string,
      type: type as string
    })

    res.json({
      items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: items.length
      }
    })
  } catch (error) {
    logger.error('Get moderation queue error:', error)
    res.status(500).json({
      error: 'Failed to fetch moderation queue'
    })
  }
})

// Review moderation item
router.post('/moderation/:id/review', validateRequest(adminSchemas.reviewModeration), async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { action, reason } = req.body
    const reviewerId = (req as AuthenticatedRequest).user.id

    const result = await adminService.reviewModerationItem(id, reviewerId, action, reason)

    res.json({
      message: 'Moderation item reviewed successfully',
      result
    })
  } catch (error) {
    logger.error('Review moderation error:', error)
    res.status(500).json({
      error: 'Failed to review moderation item'
    })
  }
})

// Get reports
router.get('/reports', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status = 'pending', type } = req.query

    const reports = await adminService.getReports({
      page: Number(page),
      limit: Number(limit),
      status: status as string,
      type: type as string
    })

    res.json({
      reports,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: reports.length
      }
    })
  } catch (error) {
    logger.error('Get reports error:', error)
    res.status(500).json({
      error: 'Failed to fetch reports'
    })
  }
})

// Handle report
router.post('/reports/:id/handle', validateRequest(adminSchemas.handleReport), async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { action, notes } = req.body
    const adminId = (req as AuthenticatedRequest).user.id

    const result = await adminService.handleReport(id, adminId, action, notes)

    res.json({
      message: 'Report handled successfully',
      result
    })
  } catch (error) {
    logger.error('Handle report error:', error)
    res.status(500).json({
      error: 'Failed to handle report'
    })
  }
})

// Get users
router.get('/users', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query

    const users = await adminService.getUsers({
      page: Number(page),
      limit: Number(limit),
      search: search as string,
      role: role as string,
      status: status as string
    })

    res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: users.length
      }
    })
  } catch (error) {
    logger.error('Get users error:', error)
    res.status(500).json({
      error: 'Failed to fetch users'
    })
  }
})

// Update user status
router.put('/users/:id/status', validateRequest(adminSchemas.updateUserStatus), async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status, reason } = req.body
    const adminId = (req as AuthenticatedRequest).user.id

    const result = await adminService.updateUserStatus(id, status, reason, adminId)

    res.json({
      message: 'User status updated successfully',
      result
    })
  } catch (error) {
    logger.error('Update user status error:', error)
    res.status(500).json({
      error: 'Failed to update user status'
    })
  }
})

// Get creators
router.get('/creators', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, verificationStatus, search } = req.query

    const creators = await adminService.getCreators({
      page: Number(page),
      limit: Number(limit),
      verificationStatus: verificationStatus as string,
      search: search as string
    })

    res.json({
      creators,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: creators.length
      }
    })
  } catch (error) {
    logger.error('Get creators error:', error)
    res.status(500).json({
      error: 'Failed to fetch creators'
    })
  }
})

// Verify creator
router.post('/creators/:id/verify', validateRequest(adminSchemas.verifyCreator), async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status, notes } = req.body
    const adminId = (req as AuthenticatedRequest).user.id

    const result = await adminService.verifyCreator(id, status, notes, adminId)

    res.json({
      message: 'Creator verification updated successfully',
      result
    })
  } catch (error) {
    logger.error('Verify creator error:', error)
    res.status(500).json({
      error: 'Failed to verify creator'
    })
  }
})

// Get analytics
router.get('/analytics', async (req: Request, res: Response) => {
  try {
    const { period = '30d', metric } = req.query

    const analytics = await adminService.getAnalytics({
      period: period as string,
      metric: metric as string
    })

    res.json({
      analytics
    })
  } catch (error) {
    logger.error('Get analytics error:', error)
    res.status(500).json({
      error: 'Failed to fetch analytics'
    })
  }
})

// Get revenue analytics
router.get('/analytics/revenue', async (req: Request, res: Response) => {
  try {
    const { period = '30d', breakdown } = req.query

    const revenue = await adminService.getRevenueAnalytics({
      period: period as string,
      breakdown: breakdown as string
    })

    res.json({
      revenue
    })
  } catch (error) {
    logger.error('Get revenue analytics error:', error)
    res.status(500).json({
      error: 'Failed to fetch revenue analytics'
    })
  }
})

// Get content analytics
router.get('/analytics/content', async (req: Request, res: Response) => {
  try {
    const { period = '30d', type } = req.query

    const content = await adminService.getContentAnalytics({
      period: period as string,
      type: type as string
    })

    res.json({
      content
    })
  } catch (error) {
    logger.error('Get content analytics error:', error)
    res.status(500).json({
      error: 'Failed to fetch content analytics'
    })
  }
})

// Get system health
router.get('/system/health', async (req: Request, res: Response) => {
  try {
    const health = await adminService.getSystemHealth()

    res.json({
      health
    })
  } catch (error) {
    logger.error('Get system health error:', error)
    res.status(500).json({
      error: 'Failed to fetch system health'
    })
  }
})

// Get audit logs
router.get('/audit-logs', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, action, userId, dateFrom, dateTo } = req.query

    const logs = await adminService.getAuditLogs({
      page: Number(page),
      limit: Number(limit),
      action: action as string,
      userId: userId as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string
    })

    res.json({
      logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: logs.length
      }
    })
  } catch (error) {
    logger.error('Get audit logs error:', error)
    res.status(500).json({
      error: 'Failed to fetch audit logs'
    })
  }
})

export default router
