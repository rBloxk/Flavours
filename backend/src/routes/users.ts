import { Router, Request, Response } from 'express'
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth'
import { validateRequest } from '../middleware/validation'
import { userSchemas } from '../schemas/users'
import { UserService } from '../services/userService'
import { logger } from '../utils/logger'
import multer from 'multer'

const router = Router()
const userService = new UserService()

// Configure multer for profile picture uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for profile pictures
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'))
    }
  }
})

// Get user profile
router.get('/profile/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params
    const profile = await userService.getProfileByUsername(username)

    if (!profile) {
      return res.status(404).json({
        error: 'Profile not found'
      })
    }

    res.json({
      profile
    })
  } catch (error) {
    logger.error('Get profile error:', error)
    res.status(500).json({
      error: 'Failed to fetch profile'
    })
  }
})

// Get current user profile
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id
    const profile = await userService.getProfileByUserId(userId)

    if (!profile) {
      return res.status(404).json({
        error: 'Profile not found'
      })
    }

    res.json({
      profile
    })
  } catch (error) {
    logger.error('Get current user profile error:', error)
    res.status(500).json({
      error: 'Failed to fetch profile'
    })
  }
})

// Update profile
router.put('/profile', authMiddleware, validateRequest(userSchemas.updateProfile), async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id
    const updateData = req.body

    const profile = await userService.updateProfile(userId, updateData)

    res.json({
      message: 'Profile updated successfully',
      profile
    })
  } catch (error) {
    logger.error('Update profile error:', error)
    res.status(500).json({
      error: 'Failed to update profile'
    })
  }
})

// Upload profile picture
router.post('/profile/picture', authMiddleware, upload.single('picture'), async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id
    const file = req.file

    if (!file) {
      return res.status(400).json({
        error: 'No file uploaded'
      })
    }

    const avatarUrl = await userService.uploadProfilePicture(userId, file)

    res.json({
      message: 'Profile picture uploaded successfully',
      avatarUrl
    })
  } catch (error) {
    logger.error('Upload profile picture error:', error)
    res.status(500).json({
      error: 'Failed to upload profile picture'
    })
  }
})

// Follow/Unfollow user
router.post('/:userId/follow', authMiddleware, async (req: Request, res: Response) => {
  try {
    const followerId = (req as AuthenticatedRequest).user.id
    const { userId } = req.params

    if (followerId === userId) {
      return res.status(400).json({
        error: 'Cannot follow yourself'
      })
    }

    const result = await userService.toggleFollow(userId, followerId)

    res.json({
      message: result.following ? 'User followed' : 'User unfollowed',
      following: result.following,
      followersCount: result.followersCount
    })
  } catch (error) {
    logger.error('Toggle follow error:', error)
    res.status(500).json({
      error: 'Failed to toggle follow'
    })
  }
})

// Get followers
router.get('/:userId/followers', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const { page = 1, limit = 20 } = req.query

    const followers = await userService.getFollowers(userId, {
      page: Number(page),
      limit: Number(limit)
    })

    res.json({
      followers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: followers.length
      }
    })
  } catch (error) {
    logger.error('Get followers error:', error)
    res.status(500).json({
      error: 'Failed to fetch followers'
    })
  }
})

// Get following
router.get('/:userId/following', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const { page = 1, limit = 20 } = req.query

    const following = await userService.getFollowing(userId, {
      page: Number(page),
      limit: Number(limit)
    })

    res.json({
      following,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: following.length
      }
    })
  } catch (error) {
    logger.error('Get following error:', error)
    res.status(500).json({
      error: 'Failed to fetch following'
    })
  }
})

// Block/Unblock user
router.post('/:userId/block', authMiddleware, async (req: Request, res: Response) => {
  try {
    const blockerId = (req as AuthenticatedRequest).user.id
    const { userId } = req.params

    if (blockerId === userId) {
      return res.status(400).json({
        error: 'Cannot block yourself'
      })
    }

    const result = await userService.toggleBlock(userId, blockerId)

    res.json({
      message: result.blocked ? 'User blocked' : 'User unblocked',
      blocked: result.blocked
    })
  } catch (error) {
    logger.error('Toggle block error:', error)
    res.status(500).json({
      error: 'Failed to toggle block'
    })
  }
})

// Get blocked users
router.get('/blocked', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id
    const { page = 1, limit = 20 } = req.query

    const blockedUsers = await userService.getBlockedUsers(userId, {
      page: Number(page),
      limit: Number(limit)
    })

    res.json({
      blockedUsers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: blockedUsers.length
      }
    })
  } catch (error) {
    logger.error('Get blocked users error:', error)
    res.status(500).json({
      error: 'Failed to fetch blocked users'
    })
  }
})

// Search users
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q, page = 1, limit = 20 } = req.query

    if (!q || (q as string).length < 2) {
      return res.status(400).json({
        error: 'Search query must be at least 2 characters'
      })
    }

    const users = await userService.searchUsers(q as string, {
      page: Number(page),
      limit: Number(limit)
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
    logger.error('Search users error:', error)
    res.status(500).json({
      error: 'Failed to search users'
    })
  }
})

// Get user stats
router.get('/:userId/stats', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const stats = await userService.getUserStats(userId)

    res.json({
      stats
    })
  } catch (error) {
    logger.error('Get user stats error:', error)
    res.status(500).json({
      error: 'Failed to fetch user stats'
    })
  }
})

// Update user settings
router.put('/settings', authMiddleware, validateRequest(userSchemas.updateSettings), async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id
    const settings = req.body

    const updatedSettings = await userService.updateUserSettings(userId, settings)

    res.json({
      message: 'Settings updated successfully',
      settings: updatedSettings
    })
  } catch (error) {
    logger.error('Update settings error:', error)
    res.status(500).json({
      error: 'Failed to update settings'
    })
  }
})

// Get user notifications
router.get('/notifications', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id
    const { page = 1, limit = 20, unreadOnly = false } = req.query

    const notifications = await userService.getNotifications(userId, {
      page: Number(page),
      limit: Number(limit),
      unreadOnly: unreadOnly === 'true'
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

// Mark notification as read
router.put('/notifications/:notificationId/read', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id
    const { notificationId } = req.params

    await userService.markNotificationAsRead(notificationId, userId)

    res.json({
      message: 'Notification marked as read'
    })
  } catch (error) {
    logger.error('Mark notification as read error:', error)
    res.status(500).json({
      error: 'Failed to mark notification as read'
    })
  }
})

// Mark all notifications as read
router.put('/notifications/read-all', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id

    await userService.markAllNotificationsAsRead(userId)

    res.json({
      message: 'All notifications marked as read'
    })
  } catch (error) {
    logger.error('Mark all notifications as read error:', error)
    res.status(500).json({
      error: 'Failed to mark all notifications as read'
    })
  }
})

export default router
