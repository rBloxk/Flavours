import { Router, Request, Response } from 'express'
import { authMiddleware, requireCreator, AuthenticatedRequest } from '../middleware/auth'
import { validateRequest } from '../middleware/validation'
import { contentSchemas } from '../schemas/content'
import { ContentService } from '../services/contentService'
import { logger } from '../utils/logger'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'

const router = Router()
const contentService = new ContentService()

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type'))
    }
  }
})

// Create post
router.post('/', authMiddleware, requireCreator, upload.array('media', 10), validateRequest(contentSchemas.createPost), async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id
    const postData = req.body
    const files = req.files as Express.Multer.File[]

    const post = await contentService.createPost({
      ...postData,
      creatorId: userId,
      files
    })

    res.status(201).json({
      message: 'Post created successfully',
      post
    })
  } catch (error) {
    logger.error('Create post error:', error)
    res.status(500).json({
      error: 'Failed to create post'
    })
  }
})

// Get posts (with pagination and filtering)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, creatorId, isPaid, search } = req.query

    const posts = await contentService.getPosts({
      page: Number(page),
      limit: Number(limit),
      creatorId: creatorId as string,
      isPaid: isPaid === 'true',
      search: search as string
    })

    res.json({
      posts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: posts.length
      }
    })
  } catch (error) {
    logger.error('Get posts error:', error)
    res.status(500).json({
      error: 'Failed to fetch posts'
    })
  }
})

// Get single post
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const post = await contentService.getPost(id)

    if (!post) {
      return res.status(404).json({
        error: 'Post not found'
      })
    }

    res.json({
      post
    })
  } catch (error) {
    logger.error('Get post error:', error)
    res.status(500).json({
      error: 'Failed to fetch post'
    })
  }
})

// Update post
router.put('/:id', authMiddleware, requireCreator, upload.array('media', 10), validateRequest(contentSchemas.updatePost), async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id
    const { id } = req.params
    const updateData = req.body
    const files = req.files as Express.Multer.File[]

    // Verify ownership
    const post = await contentService.getPost(id)
    if (!post || post.creator_id !== userId) {
      return res.status(403).json({
        error: 'Not authorized to update this post'
      })
    }

    const updatedPost = await contentService.updatePost(id, {
      ...updateData,
      files
    })

    res.json({
      message: 'Post updated successfully',
      post: updatedPost
    })
  } catch (error) {
    logger.error('Update post error:', error)
    res.status(500).json({
      error: 'Failed to update post'
    })
  }
})

// Delete post
router.delete('/:id', authMiddleware, requireCreator, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id
    const { id } = req.params

    // Verify ownership
    const post = await contentService.getPost(id)
    if (!post || post.creator_id !== userId) {
      return res.status(403).json({
        error: 'Not authorized to delete this post'
      })
    }

    await contentService.deletePost(id)

    res.json({
      message: 'Post deleted successfully'
    })
  } catch (error) {
    logger.error('Delete post error:', error)
    res.status(500).json({
      error: 'Failed to delete post'
    })
  }
})

// Like/Unlike post
router.post('/:id/like', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id
    const { id } = req.params

    const result = await contentService.toggleLike(id, userId)

    res.json({
      message: result.liked ? 'Post liked' : 'Post unliked',
      liked: result.liked,
      likesCount: result.likesCount
    })
  } catch (error) {
    logger.error('Toggle like error:', error)
    res.status(500).json({
      error: 'Failed to toggle like'
    })
  }
})

// Add comment
router.post('/:id/comments', authMiddleware, validateRequest(contentSchemas.addComment), async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id
    const { id } = req.params
    const { content } = req.body

    const comment = await contentService.addComment(id, userId, content)

    res.status(201).json({
      message: 'Comment added successfully',
      comment
    })
  } catch (error) {
    logger.error('Add comment error:', error)
    res.status(500).json({
      error: 'Failed to add comment'
    })
  }
})

// Get comments for post
router.get('/:id/comments', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { page = 1, limit = 20 } = req.query

    const comments = await contentService.getComments(id, {
      page: Number(page),
      limit: Number(limit)
    })

    res.json({
      comments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: comments.length
      }
    })
  } catch (error) {
    logger.error('Get comments error:', error)
    res.status(500).json({
      error: 'Failed to fetch comments'
    })
  }
})

// Delete comment
router.delete('/comments/:commentId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id
    const { commentId } = req.params

    await contentService.deleteComment(commentId, userId)

    res.json({
      message: 'Comment deleted successfully'
    })
  } catch (error) {
    logger.error('Delete comment error:', error)
    res.status(500).json({
      error: 'Failed to delete comment'
    })
  }
})

// Report post
router.post('/:id/report', authMiddleware, validateRequest(contentSchemas.reportPost), async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id
    const { id } = req.params
    const { reason, description } = req.body

    await contentService.reportPost(id, userId, reason, description)

    res.json({
      message: 'Post reported successfully'
    })
  } catch (error) {
    logger.error('Report post error:', error)
    res.status(500).json({
      error: 'Failed to report post'
    })
  }
})

// Get creator's posts
router.get('/creator/:creatorId', async (req: Request, res: Response) => {
  try {
    const { creatorId } = req.params
    const { page = 1, limit = 20, isPaid } = req.query

    const posts = await contentService.getCreatorPosts(creatorId, {
      page: Number(page),
      limit: Number(limit),
      isPaid: isPaid === 'true'
    })

    res.json({
      posts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: posts.length
      }
    })
  } catch (error) {
    logger.error('Get creator posts error:', error)
    res.status(500).json({
      error: 'Failed to fetch creator posts'
    })
  }
})

// Get trending posts
router.get('/trending/feed', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query

    const posts = await contentService.getTrendingPosts({
      page: Number(page),
      limit: Number(limit)
    })

    res.json({
      posts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: posts.length
      }
    })
  } catch (error) {
    logger.error('Get trending posts error:', error)
    res.status(500).json({
      error: 'Failed to fetch trending posts'
    })
  }
})

export default router
