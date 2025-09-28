import { Router, Request, Response } from 'express'
import { supabase } from '../config/database'
import { authMiddleware } from '../middleware/auth'
import { validateRequest } from '../middleware/validation'
import { logger } from '../utils/logger'
import Joi from 'joi'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'

const router = Router()

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
    files: 10
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type'))
    }
  }
})

// =============================================
// CONTENT MANAGEMENT ENDPOINTS
// =============================================

// Get posts feed with advanced filtering
router.get('/feed', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      mode = 'intelligent', // intelligent, following, trending, discover
      search = '',
      category = '',
      content_type = '',
      sort = 'recent'
    } = req.query

    const offset = (Number(page) - 1) * Number(limit)

    let query = supabase
      .from('posts')
      .select(`
        *,
        profiles!posts_author_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          is_verified,
          is_creator,
          followers_count
        ),
        media (
          id,
          file_url,
          file_type,
          thumbnail_url,
          width,
          height,
          duration
        )
      `)

    // Apply mode-specific filtering
    if (mode === 'following') {
      // Get posts from users that the current user follows
      query = query.in('author_id', 
        supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', req.user.id)
      )
    } else if (mode === 'trending') {
      // Get posts with high engagement in the last 24 hours
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      query = query
        .gte('created_at', yesterday.toISOString())
        .order('likes_count', { ascending: false })
    } else if (mode === 'discover') {
      // Get posts from users not followed by current user
      query = query.not('author_id', 'in', 
        supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', req.user.id)
      )
    }

    // Apply privacy filter
    if (mode !== 'following') {
      query = query.eq('privacy', 'public')
    }

    // Apply search filter
    if (search) {
      query = query.or(`content.ilike.%${search}%,tags.cs.{${search}},category.ilike.%${search}%`)
    }

    // Apply category filter
    if (category) {
      query = query.eq('category', category)
    }

    // Apply content type filter
    if (content_type) {
      query = query.eq('content_type', content_type)
    }

    // Apply sorting
    if (sort === 'popular') {
      query = query.order('likes_count', { ascending: false })
    } else if (sort === 'trending') {
      query = query.order('views_count', { ascending: false })
    } else if (sort === 'recent') {
      query = query.order('created_at', { ascending: false })
    }

    // Apply pagination
    query = query.range(offset, offset + Number(limit) - 1)

    const { data: posts, error } = await query

    if (error) {
      throw error
    }

    // Get interaction status for each post
    const postsWithInteractions = await Promise.all(
      posts.map(async (post) => {
        const [likesResult, bookmarksResult, sharesResult] = await Promise.all([
          supabase
            .from('likes')
            .select('*')
            .eq('user_id', req.user.id)
            .eq('post_id', post.id)
            .single(),
          supabase
            .from('bookmarks')
            .select('*')
            .eq('user_id', req.user.id)
            .eq('post_id', post.id)
            .single(),
          supabase
            .from('shares')
            .select('*')
            .eq('user_id', req.user.id)
            .eq('post_id', post.id)
            .single()
        ])

        return {
          ...post,
          is_liked: !!likesResult.data,
          is_bookmarked: !!bookmarksResult.data,
          is_shared: !!sharesResult.data
        }
      })
    )

    res.json({
      success: true,
      data: {
        posts: postsWithInteractions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          hasMore: posts.length === Number(limit)
        }
      }
    })
  } catch (error) {
    logger.error('Get feed error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Create new post
router.post('/', authMiddleware, upload.array('media', 10), validateRequest({
  body: Joi.object({
    content: Joi.string().min(1).max(2000).required(),
    content_type: Joi.string().valid('text', 'image', 'video', 'short_video').default('text'),
    privacy: Joi.string().valid('public', 'followers', 'paid', 'private').default('public'),
    is_paid: Joi.boolean().default(false),
    price: Joi.when('is_paid', {
      is: true,
      then: Joi.number().min(0.01).max(1000).required(),
      otherwise: Joi.number().optional()
    }),
    preview_content: Joi.string().max(500).optional(),
    tags: Joi.array().items(Joi.string().max(50)).max(10).optional(),
    mentions: Joi.array().items(Joi.string().max(50)).max(10).optional(),
    location: Joi.string().max(100).optional(),
    category: Joi.string().max(50).optional(),
    scheduled_at: Joi.date().iso().optional()
  })
}), async (req: Request, res: Response) => {
  try {
    const postData = req.body
    const files = req.files as Express.Multer.File[]

    // Create post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        author_id: req.user.id,
        content: postData.content,
        content_type: postData.content_type,
        privacy: postData.privacy,
        is_paid: postData.is_paid,
        price: postData.price || 0,
        preview_content: postData.preview_content,
        tags: postData.tags || [],
        mentions: postData.mentions || [],
        location: postData.location,
        category: postData.category,
        scheduled_at: postData.scheduled_at
      })
      .select()
      .single()

    if (postError) {
      throw postError
    }

    // Handle media uploads
    if (files && files.length > 0) {
      const mediaPromises = files.map(async (file) => {
        // Upload file to storage (implement your storage logic here)
        const fileUrl = await uploadToStorage(file)
        
        return supabase
          .from('media')
          .insert({
            post_id: post.id,
            user_id: req.user.id,
            file_url: fileUrl,
            file_type: file.mimetype.startsWith('image/') ? 'image' : 'video',
            file_size: file.size,
            mime_type: file.mimetype,
            storage_provider: 's3',
            storage_path: `posts/${post.id}/${uuidv4()}`
          })
      })

      await Promise.all(mediaPromises)
    }

    // Get the complete post with media
    const { data: completePost } = await supabase
      .from('posts')
      .select(`
        *,
        profiles!posts_author_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          is_verified,
          is_creator
        ),
        media (
          id,
          file_url,
          file_type,
          thumbnail_url,
          width,
          height,
          duration
        )
      `)
      .eq('id', post.id)
      .single()

    res.status(201).json({
      success: true,
      data: completePost,
      message: 'Post created successfully'
    })
  } catch (error) {
    logger.error('Create post error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Get single post
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles!posts_author_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          is_verified,
          is_creator,
          followers_count
        ),
        media (
          id,
          file_url,
          file_type,
          thumbnail_url,
          width,
          height,
          duration
        ),
        comments (
          id,
          content,
          created_at,
          likes_count,
          profiles!comments_author_id_fkey (
            id,
            username,
            display_name,
            avatar_url,
            is_verified
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error || !post) {
      return res.status(404).json({
        error: 'Post not found'
      })
    }

    // Check privacy
    if (post.privacy === 'private' && (!req.user || req.user.id !== post.author_id)) {
      return res.status(403).json({
        error: 'Post is private'
      })
    }

    // Get interaction status if authenticated
    let postWithInteractions = post
    if (req.user) {
      const [likesResult, bookmarksResult, sharesResult] = await Promise.all([
        supabase
          .from('likes')
          .select('*')
          .eq('user_id', req.user.id)
          .eq('post_id', post.id)
          .single(),
        supabase
          .from('bookmarks')
          .select('*')
          .eq('user_id', req.user.id)
          .eq('post_id', post.id)
          .single(),
        supabase
          .from('shares')
          .select('*')
          .eq('user_id', req.user.id)
          .eq('post_id', post.id)
          .single()
      ])

      postWithInteractions = {
        ...post,
        is_liked: !!likesResult.data,
        is_bookmarked: !!bookmarksResult.data,
        is_shared: !!sharesResult.data
      }
    }

    // Increment view count
    await supabase
      .from('posts')
      .update({ views_count: post.views_count + 1 })
      .eq('id', id)

    res.json({
      success: true,
      data: postWithInteractions
    })
  } catch (error) {
    logger.error('Get post error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Update post
router.put('/:id', authMiddleware, validateRequest({
  body: Joi.object({
    content: Joi.string().min(1).max(2000).optional(),
    privacy: Joi.string().valid('public', 'followers', 'paid', 'private').optional(),
    is_paid: Joi.boolean().optional(),
    price: Joi.when('is_paid', {
      is: true,
      then: Joi.number().min(0.01).max(1000).required(),
      otherwise: Joi.number().optional()
    }),
    preview_content: Joi.string().max(500).optional(),
    tags: Joi.array().items(Joi.string().max(50)).max(10).optional(),
    mentions: Joi.array().items(Joi.string().max(50)).max(10).optional(),
    location: Joi.string().max(100).optional(),
    category: Joi.string().max(50).optional()
  })
}), async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updates = req.body

    // Check if user owns the post
    const { data: existingPost } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', id)
      .single()

    if (!existingPost || existingPost.author_id !== req.user.id) {
      return res.status(403).json({
        error: 'Not authorized to update this post'
      })
    }

    // Update post
    const { data: updatedPost, error } = await supabase
      .from('posts')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    res.json({
      success: true,
      data: updatedPost,
      message: 'Post updated successfully'
    })
  } catch (error) {
    logger.error('Update post error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Delete post
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // Check if user owns the post
    const { data: existingPost } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', id)
      .single()

    if (!existingPost || existingPost.author_id !== req.user.id) {
      return res.status(403).json({
        error: 'Not authorized to delete this post'
      })
    }

    // Delete post (cascade will handle related records)
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    res.json({
      success: true,
      message: 'Post deleted successfully'
    })
  } catch (error) {
    logger.error('Delete post error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// =============================================
// CONTENT INTERACTIONS
// =============================================

// Like/Unlike post
router.post('/:id/like', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // Check if post exists
    const { data: post } = await supabase
      .from('posts')
      .select('id, author_id, privacy')
      .eq('id', id)
      .single()

    if (!post) {
      return res.status(404).json({
        error: 'Post not found'
      })
    }

    // Check if already liked
    const { data: existingLike } = await supabase
      .from('likes')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('post_id', id)
      .single()

    if (existingLike) {
      // Unlike
      await supabase
        .from('likes')
        .delete()
        .eq('user_id', req.user.id)
        .eq('post_id', id)

      res.json({
        success: true,
        action: 'unliked',
        message: 'Post unliked'
      })
    } else {
      // Like
      await supabase
        .from('likes')
        .insert({
          user_id: req.user.id,
          post_id: id
        })

      res.json({
        success: true,
        action: 'liked',
        message: 'Post liked'
      })
    }
  } catch (error) {
    logger.error('Like/Unlike error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Bookmark/Unbookmark post
router.post('/:id/bookmark', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // Check if post exists
    const { data: post } = await supabase
      .from('posts')
      .select('id')
      .eq('id', id)
      .single()

    if (!post) {
      return res.status(404).json({
        error: 'Post not found'
      })
    }

    // Check if already bookmarked
    const { data: existingBookmark } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('post_id', id)
      .single()

    if (existingBookmark) {
      // Unbookmark
      await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', req.user.id)
        .eq('post_id', id)

      res.json({
        success: true,
        action: 'unbookmarked',
        message: 'Post unbookmarked'
      })
    } else {
      // Bookmark
      await supabase
        .from('bookmarks')
        .insert({
          user_id: req.user.id,
          post_id: id
        })

      res.json({
        success: true,
        action: 'bookmarked',
        message: 'Post bookmarked'
      })
    }
  } catch (error) {
    logger.error('Bookmark/Unbookmark error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Share post
router.post('/:id/share', authMiddleware, validateRequest({
  body: Joi.object({
    platform: Joi.string().valid('internal', 'twitter', 'facebook', 'instagram', 'linkedin').default('internal'),
    message: Joi.string().max(500).optional()
  })
}), async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { platform, message } = req.body

    // Check if post exists
    const { data: post } = await supabase
      .from('posts')
      .select('id')
      .eq('id', id)
      .single()

    if (!post) {
      return res.status(404).json({
        error: 'Post not found'
      })
    }

    // Record share
    await supabase
      .from('shares')
      .insert({
        user_id: req.user.id,
        post_id: id,
        platform,
        message
      })

    res.json({
      success: true,
      message: 'Post shared successfully'
    })
  } catch (error) {
    logger.error('Share post error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// =============================================
// COMMENTS
// =============================================

// Get post comments
router.get('/:id/comments', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { page = 1, limit = 20, sort = 'recent' } = req.query

    const offset = (Number(page) - 1) * Number(limit)

    let query = supabase
      .from('comments')
      .select(`
        *,
        profiles!comments_author_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          is_verified
        )
      `)
      .eq('post_id', id)
      .eq('is_deleted', false)
      .is('parent_id', null) // Only top-level comments

    // Apply sorting
    if (sort === 'popular') {
      query = query.order('likes_count', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: true })
    }

    // Apply pagination
    query = query.range(offset, offset + Number(limit) - 1)

    const { data: comments, error } = await query

    if (error) {
      throw error
    }

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const { data: replies } = await supabase
          .from('comments')
          .select(`
            *,
            profiles!comments_author_id_fkey (
              id,
              username,
              display_name,
              avatar_url,
              is_verified
            )
          `)
          .eq('parent_id', comment.id)
          .eq('is_deleted', false)
          .order('created_at', { ascending: true })
          .limit(3)

        return {
          ...comment,
          replies: replies || []
        }
      })
    )

    res.json({
      success: true,
      data: {
        comments: commentsWithReplies,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          hasMore: comments.length === Number(limit)
        }
      }
    })
  } catch (error) {
    logger.error('Get comments error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Add comment
router.post('/:id/comments', authMiddleware, validateRequest({
  body: Joi.object({
    content: Joi.string().min(1).max(500).required(),
    parent_id: Joi.string().uuid().optional()
  })
}), async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { content, parent_id } = req.body

    // Check if post exists
    const { data: post } = await supabase
      .from('posts')
      .select('id, privacy')
      .eq('id', id)
      .single()

    if (!post) {
      return res.status(404).json({
        error: 'Post not found'
      })
    }

    // Create comment
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        post_id: id,
        author_id: req.user.id,
        content,
        parent_id
      })
      .select(`
        *,
        profiles!comments_author_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          is_verified
        )
      `)
      .single()

    if (error) {
      throw error
    }

    res.status(201).json({
      success: true,
      data: comment,
      message: 'Comment added successfully'
    })
  } catch (error) {
    logger.error('Add comment error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// =============================================
// SEARCH AND DISCOVERY
// =============================================

// Search posts
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { 
      q = '', 
      page = 1, 
      limit = 20, 
      type = 'all', // all, images, videos, text
      category = '',
      sort = 'recent',
      date_range = 'all' // all, today, week, month, year
    } = req.query

    const offset = (Number(page) - 1) * Number(limit))

    let query = supabase
      .from('posts')
      .select(`
        *,
        profiles!posts_author_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          is_verified,
          is_creator
        ),
        media (
          id,
          file_url,
          file_type,
          thumbnail_url,
          width,
          height,
          duration
        )
      `)
      .eq('privacy', 'public')

    // Apply search query
    if (q) {
      query = query.or(`content.ilike.%${q}%,tags.cs.{${q}},category.ilike.%${q}%`)
    }

    // Apply content type filter
    if (type !== 'all') {
      query = query.eq('content_type', type)
    }

    // Apply category filter
    if (category) {
      query = query.eq('category', category)
    }

    // Apply date range filter
    if (date_range !== 'all') {
      const now = new Date()
      let startDate: Date

      switch (date_range) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          break
        default:
          startDate = new Date(0)
      }

      query = query.gte('created_at', startDate.toISOString())
    }

    // Apply sorting
    if (sort === 'popular') {
      query = query.order('likes_count', { ascending: false })
    } else if (sort === 'trending') {
      query = query.order('views_count', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    // Apply pagination
    query = query.range(offset, offset + Number(limit) - 1)

    const { data: posts, error } = await query

    if (error) {
      throw error
    }

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          hasMore: posts.length === Number(limit)
        }
      }
    })
  } catch (error) {
    logger.error('Search posts error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Helper function for file upload (implement based on your storage solution)
async function uploadToStorage(file: Express.Multer.File): Promise<string> {
  // Implement your file upload logic here
  // This could be AWS S3, Google Cloud Storage, etc.
  // For now, return a placeholder URL
  return `https://storage.example.com/files/${uuidv4()}-${file.originalname}`
}

export default router