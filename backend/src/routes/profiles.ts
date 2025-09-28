import { Router, Request, Response } from 'express'
import { supabase } from '../config/database'
import { authMiddleware } from '../middleware/auth'
import { validateRequest } from '../middleware/validation'
import { logger } from '../utils/logger'
import Joi from 'joi'

const router = Router()

// =============================================
// PROFILE MANAGEMENT ENDPOINTS
// =============================================

// Get user profile by username
router.get('/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params
    const { include_stats = 'true', include_posts = 'false' } = req.query

    // Get profile with creator info
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        *,
        creators (
          id,
          subscription_price,
          subscription_tiers,
          total_subscribers,
          total_earnings,
          monthly_earnings,
          verification_status,
          creator_settings,
          analytics_settings
        )
      `)
      .eq('username', username)
      .single()

    if (profileError || !profile) {
      return res.status(404).json({
        error: 'Profile not found'
      })
    }

    // Get follower/following relationship if authenticated
    let isFollowing = false
    let isFollowedBy = false
    let isBlocked = false

    if (req.user) {
      const { data: followData } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', req.user.id)
        .eq('following_id', profile.id)
        .single()

      const { data: followedByData } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', profile.id)
        .eq('following_id', req.user.id)
        .single()

      const { data: blockData } = await supabase
        .from('blocks')
        .select('*')
        .or(`blocker_id.eq.${req.user.id},blocked_id.eq.${req.user.id}`)
        .single()

      isFollowing = !!followData
      isFollowedBy = !!followedByData
      isBlocked = !!blockData
    }

    // Get recent posts if requested
    let recentPosts = []
    if (include_posts === 'true') {
      const { data: posts } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          content_type,
          privacy,
          is_paid,
          price,
          tags,
          category,
          likes_count,
          comments_count,
          shares_count,
          views_count,
          created_at,
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
        .eq('author_id', profile.id)
        .eq('privacy', 'public')
        .order('created_at', { ascending: false })
        .limit(6)

      recentPosts = posts || []
    }

    res.json({
      success: true,
      data: {
        ...profile,
        isFollowing,
        isFollowedBy,
        isBlocked,
        recentPosts
      }
    })
  } catch (error) {
    logger.error('Get profile error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Get profile followers
router.get('/:username/followers', async (req: Request, res: Response) => {
  try {
    const { username } = req.params
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      filter = 'all',
      sort = 'recent' 
    } = req.query

    const offset = (Number(page) - 1) * Number(limit)

    // Get profile ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single()

    if (!profile) {
      return res.status(404).json({
        error: 'Profile not found'
      })
    }

    // Build followers query
    let query = supabase
      .from('follows')
      .select(`
        created_at,
        profiles!follows_follower_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          bio,
          location,
          is_verified,
          is_creator,
          followers_count,
          following_count,
          posts_count,
          created_at
        )
      `)
      .eq('following_id', profile.id)

    // Apply search filter
    if (search) {
      query = query.or(`profiles.display_name.ilike.%${search}%,profiles.username.ilike.%${search}%,profiles.bio.ilike.%${search}%`)
    }

    // Apply additional filters
    if (filter === 'verified') {
      query = query.eq('profiles.is_verified', true)
    } else if (filter === 'creators') {
      query = query.eq('profiles.is_creator', true)
    }

    // Apply sorting
    if (sort === 'name') {
      query = query.order('profiles.display_name', { ascending: true })
    } else if (sort === 'followers') {
      query = query.order('profiles.followers_count', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    // Apply pagination
    query = query.range(offset, offset + Number(limit) - 1)

    const { data: followers, error } = await query

    if (error) {
      throw error
    }

    // Get mutual followers count for each follower
    const followersWithMutuals = await Promise.all(
      followers.map(async (follow) => {
        if (!req.user) return { ...follow, mutual_followers: 0 }

        const { count: mutualCount } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', req.user.id)
          .eq('following_id', follow.profiles.id)

        return {
          ...follow,
          mutual_followers: mutualCount || 0
        }
      })
    )

    // Get total count
    const { count: totalCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', profile.id)

    res.json({
      success: true,
      data: {
        followers: followersWithMutuals,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalCount || 0,
          pages: Math.ceil((totalCount || 0) / Number(limit))
        }
      }
    })
  } catch (error) {
    logger.error('Get followers error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Get profile following
router.get('/:username/following', async (req: Request, res: Response) => {
  try {
    const { username } = req.params
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      filter = 'all',
      sort = 'recent' 
    } = req.query

    const offset = (Number(page) - 1) * Number(limit)

    // Get profile ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single()

    if (!profile) {
      return res.status(404).json({
        error: 'Profile not found'
      })
    }

    // Build following query
    let query = supabase
      .from('follows')
      .select(`
        created_at,
        profiles!follows_following_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          bio,
          location,
          is_verified,
          is_creator,
          followers_count,
          following_count,
          posts_count,
          created_at
        )
      `)
      .eq('follower_id', profile.id)

    // Apply search filter
    if (search) {
      query = query.or(`profiles.display_name.ilike.%${search}%,profiles.username.ilike.%${search}%,profiles.bio.ilike.%${search}%`)
    }

    // Apply additional filters
    if (filter === 'verified') {
      query = query.eq('profiles.is_verified', true)
    } else if (filter === 'creators') {
      query = query.eq('profiles.is_creator', true)
    } else if (filter === 'mutual') {
      // This would need a more complex query to find mutual follows
      // For now, we'll handle this in the application logic
    }

    // Apply sorting
    if (sort === 'name') {
      query = query.order('profiles.display_name', { ascending: true })
    } else if (sort === 'followers') {
      query = query.order('profiles.followers_count', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    // Apply pagination
    query = query.range(offset, offset + Number(limit) - 1)

    const { data: following, error } = await query

    if (error) {
      throw error
    }

    // Get mutual followers count and follow-back status for each following
    const followingWithMutuals = await Promise.all(
      following.map(async (follow) => {
        let mutualCount = 0
        let isFollowingBack = false

        if (req.user) {
          const { count: mutualCountResult } = await supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('follower_id', req.user.id)
            .eq('following_id', follow.profiles.id)

          const { data: followBackData } = await supabase
            .from('follows')
            .select('*')
            .eq('follower_id', follow.profiles.id)
            .eq('following_id', req.user.id)
            .single()

          mutualCount = mutualCountResult || 0
          isFollowingBack = !!followBackData
        }

        return {
          ...follow,
          mutual_followers: mutualCount,
          is_following_back: isFollowingBack
        }
      })
    )

    // Get total count
    const { count: totalCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', profile.id)

    res.json({
      success: true,
      data: {
        following: followingWithMutuals,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalCount || 0,
          pages: Math.ceil((totalCount || 0) / Number(limit))
        }
      }
    })
  } catch (error) {
    logger.error('Get following error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Get profile posts
router.get('/:username/posts', async (req: Request, res: Response) => {
  try {
    const { username } = req.params
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      filter = 'all',
      sort = 'recent',
      view_mode = 'list'
    } = req.query

    const offset = (Number(page) - 1) * Number(limit)

    // Get profile ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single()

    if (!profile) {
      return res.status(404).json({
        error: 'Profile not found'
      })
    }

    // Build posts query
    let query = supabase
      .from('posts')
      .select(`
        *,
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
      .eq('author_id', profile.id)

    // Apply privacy filter based on authentication
    if (!req.user || req.user.id !== profile.id) {
      // For non-owners, only show public posts
      query = query.eq('privacy', 'public')
    }

    // Apply search filter
    if (search) {
      query = query.or(`content.ilike.%${search}%,tags.cs.{${search}},category.ilike.%${search}%`)
    }

    // Apply content type filter
    if (filter === 'images') {
      query = query.eq('content_type', 'image')
    } else if (filter === 'videos') {
      query = query.eq('content_type', 'video')
    } else if (filter === 'liked') {
      // This would need a join with likes table
      // For now, we'll handle this in application logic
    } else if (filter === 'bookmarked') {
      // This would need a join with bookmarks table
      // For now, we'll handle this in application logic
    }

    // Apply sorting
    if (sort === 'popular') {
      query = query.order('likes_count', { ascending: false })
    } else if (sort === 'views') {
      query = query.order('views_count', { ascending: false })
    } else if (sort === 'comments') {
      query = query.order('comments_count', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    // Apply pagination
    query = query.range(offset, offset + Number(limit) - 1)

    const { data: posts, error } = await query

    if (error) {
      throw error
    }

    // Get interaction status for each post if authenticated
    let postsWithInteractions = posts
    if (req.user) {
      postsWithInteractions = await Promise.all(
        posts.map(async (post) => {
          const [likesResult, bookmarksResult] = await Promise.all([
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
              .single()
          ])

          return {
            ...post,
            is_liked: !!likesResult.data,
            is_bookmarked: !!bookmarksResult.data
          }
        })
      )
    }

    // Get total count
    const { count: totalCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', profile.id)

    res.json({
      success: true,
      data: {
        posts: postsWithInteractions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalCount || 0,
          pages: Math.ceil((totalCount || 0) / Number(limit))
        }
      }
    })
  } catch (error) {
    logger.error('Get posts error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Get profile liked posts
router.get('/:username/likes', async (req: Request, res: Response) => {
  try {
    const { username } = req.params
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      filter = 'all',
      sort = 'recent',
      view_mode = 'list'
    } = req.query

    const offset = (Number(page) - 1) * Number(limit)

    // Get profile ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single()

    if (!profile) {
      return res.status(404).json({
        error: 'Profile not found'
      })
    }

    // Build liked posts query
    let query = supabase
      .from('likes')
      .select(`
        created_at,
        posts!likes_post_id_fkey (
          id,
          content,
          content_type,
          privacy,
          is_paid,
          price,
          tags,
          category,
          likes_count,
          comments_count,
          shares_count,
          views_count,
          created_at,
          published_at,
          media (
            id,
            file_url,
            file_type,
            thumbnail_url,
            width,
            height,
            duration
          ),
          profiles!posts_author_id_fkey (
            id,
            username,
            display_name,
            avatar_url,
            is_verified,
            is_creator
          )
        )
      `)
      .eq('user_id', profile.id)

    // Apply search filter
    if (search) {
      query = query.or(`posts.content.ilike.%${search}%,posts.tags.cs.{${search}},posts.category.ilike.%${search}%,posts.profiles.display_name.ilike.%${search}%`)
    }

    // Apply content type filter
    if (filter === 'images') {
      query = query.eq('posts.content_type', 'image')
    } else if (filter === 'videos') {
      query = query.eq('posts.content_type', 'video')
    } else if (filter === 'bookmarked') {
      // This would need a join with bookmarks table
    }

    // Apply sorting
    if (sort === 'popular') {
      query = query.order('posts.likes_count', { ascending: false })
    } else if (sort === 'views') {
      query = query.order('posts.views_count', { ascending: false })
    } else if (sort === 'comments') {
      query = query.order('posts.comments_count', { ascending: false })
    } else if (sort === 'created') {
      query = query.order('posts.created_at', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    // Apply pagination
    query = query.range(offset, offset + Number(limit) - 1)

    const { data: likedPosts, error } = await query

    if (error) {
      throw error
    }

    // Get bookmark status for each post if authenticated
    let postsWithBookmarks = likedPosts
    if (req.user) {
      postsWithBookmarks = await Promise.all(
        likedPosts.map(async (like) => {
          const { data: bookmarkData } = await supabase
            .from('bookmarks')
            .select('*')
            .eq('user_id', req.user.id)
            .eq('post_id', like.posts.id)
            .single()

          return {
            ...like,
            posts: {
              ...like.posts,
              is_bookmarked: !!bookmarkData
            }
          }
        })
      )
    }

    // Get total count
    const { count: totalCount } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id)

    res.json({
      success: true,
      data: {
        likedPosts: postsWithBookmarks,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalCount || 0,
          pages: Math.ceil((totalCount || 0) / Number(limit))
        }
      }
    })
  } catch (error) {
    logger.error('Get liked posts error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Follow/Unfollow user
router.post('/:username/follow', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { username } = req.params
    const { action = 'follow' } = req.body

    // Get target profile
    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single()

    if (!targetProfile) {
      return res.status(404).json({
        error: 'Profile not found'
      })
    }

    if (targetProfile.id === req.user.id) {
      return res.status(400).json({
        error: 'Cannot follow yourself'
      })
    }

    if (action === 'follow') {
      // Check if already following
      const { data: existingFollow } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', req.user.id)
        .eq('following_id', targetProfile.id)
        .single()

      if (existingFollow) {
        return res.status(400).json({
          error: 'Already following this user'
        })
      }

      // Create follow relationship
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: req.user.id,
          following_id: targetProfile.id
        })

      if (error) {
        throw error
      }

      res.json({
        success: true,
        message: 'Successfully followed user'
      })
    } else if (action === 'unfollow') {
      // Remove follow relationship
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', req.user.id)
        .eq('following_id', targetProfile.id)

      if (error) {
        throw error
      }

      res.json({
        success: true,
        message: 'Successfully unfollowed user'
      })
    } else {
      res.status(400).json({
        error: 'Invalid action. Use "follow" or "unfollow"'
      })
    }
  } catch (error) {
    logger.error('Follow/Unfollow error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Block/Unblock user
router.post('/:username/block', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { username } = req.params
    const { action = 'block', reason } = req.body

    // Get target profile
    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single()

    if (!targetProfile) {
      return res.status(404).json({
        error: 'Profile not found'
      })
    }

    if (targetProfile.id === req.user.id) {
      return res.status(400).json({
        error: 'Cannot block yourself'
      })
    }

    if (action === 'block') {
      // Check if already blocked
      const { data: existingBlock } = await supabase
        .from('blocks')
        .select('*')
        .eq('blocker_id', req.user.id)
        .eq('blocked_id', targetProfile.id)
        .single()

      if (existingBlock) {
        return res.status(400).json({
          error: 'User is already blocked'
        })
      }

      // Create block relationship
      const { error } = await supabase
        .from('blocks')
        .insert({
          blocker_id: req.user.id,
          blocked_id: targetProfile.id,
          reason
        })

      if (error) {
        throw error
      }

      // Also unfollow if following
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', req.user.id)
        .eq('following_id', targetProfile.id)

      res.json({
        success: true,
        message: 'Successfully blocked user'
      })
    } else if (action === 'unblock') {
      // Remove block relationship
      const { error } = await supabase
        .from('blocks')
        .delete()
        .eq('blocker_id', req.user.id)
        .eq('blocked_id', targetProfile.id)

      if (error) {
        throw error
      }

      res.json({
        success: true,
        message: 'Successfully unblocked user'
      })
    } else {
      res.status(400).json({
        error: 'Invalid action. Use "block" or "unblock"'
      })
    }
  } catch (error) {
    logger.error('Block/Unblock error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Update profile
router.put('/me', authMiddleware, validateRequest({
  body: Joi.object({
    display_name: Joi.string().min(1).max(100).optional(),
    bio: Joi.string().max(500).optional(),
    location: Joi.string().max(100).optional(),
    website: Joi.string().uri().optional(),
    avatar_url: Joi.string().uri().optional(),
    cover_url: Joi.string().uri().optional(),
    interests: Joi.array().items(Joi.string().max(50)).max(20).optional(),
    categories: Joi.array().items(Joi.string().max(50)).max(10).optional(),
    social_links: Joi.object({
      twitter: Joi.string().optional(),
      instagram: Joi.string().optional(),
      youtube: Joi.string().optional(),
      tiktok: Joi.string().optional()
    }).optional(),
    privacy_settings: Joi.object({
      profile_visibility: Joi.string().valid('public', 'followers', 'private').optional(),
      show_email: Joi.boolean().optional(),
      show_location: Joi.boolean().optional(),
      show_website: Joi.boolean().optional(),
      show_followers: Joi.boolean().optional(),
      show_following: Joi.boolean().optional(),
      allow_messages: Joi.string().valid('everyone', 'followers', 'none').optional(),
      allow_comments: Joi.string().valid('everyone', 'followers', 'none').optional()
    }).optional()
  })
}), async (req: Request, res: Response) => {
  try {
    const updates = req.body

    // Update profile
    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
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
      message: 'Profile updated successfully'
    })
  } catch (error) {
    logger.error('Update profile error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Get profile statistics
router.get('/:username/stats', async (req: Request, res: Response) => {
  try {
    const { username } = req.params
    const { timeframe = '30d' } = req.query

    // Get profile ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single()

    if (!profile) {
      return res.status(404).json({
        error: 'Profile not found'
      })
    }

    // Calculate date range
    const now = new Date()
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365
    const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000))

    // Get analytics data
    const [analyticsResult, postsResult, followersResult] = await Promise.all([
      supabase
        .from('user_analytics')
        .select('*')
        .eq('user_id', profile.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true }),
      supabase
        .from('posts')
        .select('created_at, likes_count, comments_count, shares_count, views_count')
        .eq('author_id', profile.id)
        .gte('created_at', startDate.toISOString()),
      supabase
        .from('follows')
        .select('created_at')
        .eq('following_id', profile.id)
        .gte('created_at', startDate.toISOString())
    ])

    // Calculate aggregated stats
    const totalPosts = postsResult.data?.length || 0
    const totalLikes = postsResult.data?.reduce((sum, post) => sum + post.likes_count, 0) || 0
    const totalComments = postsResult.data?.reduce((sum, post) => sum + post.comments_count, 0) || 0
    const totalShares = postsResult.data?.reduce((sum, post) => sum + post.shares_count, 0) || 0
    const totalViews = postsResult.data?.reduce((sum, post) => sum + post.views_count, 0) || 0
    const newFollowers = followersResult.data?.length || 0

    res.json({
      success: true,
      data: {
        timeframe,
        stats: {
          posts: totalPosts,
          likes: totalLikes,
          comments: totalComments,
          shares: totalShares,
          views: totalViews,
          followers: newFollowers
        },
        analytics: analyticsResult.data || [],
        posts: postsResult.data || [],
        followers: followersResult.data || []
      }
    })
  } catch (error) {
    logger.error('Get profile stats error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

export default router
