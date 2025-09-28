import { Router, Request, Response } from 'express'
import { supabase } from '../config/database'
import { authMiddleware } from '../middleware/auth'
import { validateRequest } from '../middleware/validation'
import { logger } from '../utils/logger'
import Joi from 'joi'

const router = Router()

// =============================================
// ADVANCED SEARCH ENDPOINTS
// =============================================

// Global search
router.get('/global', async (req: Request, res: Response) => {
  try {
    const { 
      q = '', 
      page = 1, 
      limit = 20,
      type = 'all', // all, users, posts, streams, content
      filters = '{}',
      sort = 'relevance'
    } = req.query

    const offset = (Number(page) - 1) * Number(limit))
    const parsedFilters = JSON.parse(filters as string)

    let results: any = {
      users: [],
      posts: [],
      streams: [],
      total: 0
    }

    // Search users
    if (type === 'all' || type === 'users') {
      const { data: users } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          display_name,
          avatar_url,
          bio,
          is_verified,
          is_creator,
          followers_count,
          created_at
        `)
        .or(`display_name.ilike.%${q}%,username.ilike.%${q}%,bio.ilike.%${q}%`)
        .eq('is_active', true)
        .range(offset, offset + Number(limit) - 1)

      results.users = users || []
    }

    // Search posts
    if (type === 'all' || type === 'posts') {
      let postsQuery = supabase
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
          views_count,
          created_at,
          profiles!posts_author_id_fkey (
            id,
            username,
            display_name,
            avatar_url,
            is_verified
          ),
          media (
            id,
            file_url,
            file_type,
            thumbnail_url
          )
        `)
        .or(`content.ilike.%${q}%,tags.cs.{${q}},category.ilike.%${q}%`)
        .eq('privacy', 'public')

      // Apply filters
      if (parsedFilters.content_type) {
        postsQuery = postsQuery.eq('content_type', parsedFilters.content_type)
      }
      if (parsedFilters.category) {
        postsQuery = postsQuery.eq('category', parsedFilters.category)
      }
      if (parsedFilters.is_paid !== undefined) {
        postsQuery = postsQuery.eq('is_paid', parsedFilters.is_paid)
      }
      if (parsedFilters.date_range) {
        const days = parsedFilters.date_range === 'day' ? 1 : 
                    parsedFilters.date_range === 'week' ? 7 : 
                    parsedFilters.date_range === 'month' ? 30 : 365
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        postsQuery = postsQuery.gte('created_at', startDate.toISOString())
      }

      // Apply sorting
      if (sort === 'popular') {
        postsQuery = postsQuery.order('likes_count', { ascending: false })
      } else if (sort === 'recent') {
        postsQuery = postsQuery.order('created_at', { ascending: false })
      } else if (sort === 'trending') {
        postsQuery = postsQuery.order('views_count', { ascending: false })
      }

      postsQuery = postsQuery.range(offset, offset + Number(limit) - 1)

      const { data: posts } = await postsQuery
      results.posts = posts || []
    }

    // Search streams
    if (type === 'all' || type === 'streams') {
      const { data: streams } = await supabase
        .from('streams')
        .select(`
          id,
          title,
          description,
          category,
          status,
          viewer_count,
          created_at,
          profiles!streams_creator_id_fkey (
            id,
            username,
            display_name,
            avatar_url,
            is_verified
          )
        `)
        .or(`title.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%`)
        .eq('status', 'live')
        .range(offset, offset + Number(limit) - 1)

      results.streams = streams || []
    }

    // Calculate total results
    results.total = results.users.length + results.posts.length + results.streams.length

    res.json({
      success: true,
      data: {
        query: q,
        results,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: results.total,
          hasMore: results.total === Number(limit)
        }
      }
    })
  } catch (error) {
    logger.error('Global search error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Search users
router.get('/users', async (req: Request, res: Response) => {
  try {
    const { 
      q = '', 
      page = 1, 
      limit = 20,
      filters = '{}',
      sort = 'relevance'
    } = req.query

    const offset = (Number(page) - 1) * Number(limit))
    const parsedFilters = JSON.parse(filters as string)

    // Build users query
    let query = supabase
      .from('profiles')
      .select(`
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
      `)
      .eq('is_active', true)

    // Apply search query
    if (q) {
      query = query.or(`display_name.ilike.%${q}%,username.ilike.%${q}%,bio.ilike.%${q}%,location.ilike.%${q}%`)
    }

    // Apply filters
    if (parsedFilters.is_verified !== undefined) {
      query = query.eq('is_verified', parsedFilters.is_verified)
    }
    if (parsedFilters.is_creator !== undefined) {
      query = query.eq('is_creator', parsedFilters.is_creator)
    }
    if (parsedFilters.min_followers) {
      query = query.gte('followers_count', parsedFilters.min_followers)
    }
    if (parsedFilters.location) {
      query = query.ilike('location', `%${parsedFilters.location}%`)
    }

    // Apply sorting
    if (sort === 'followers') {
      query = query.order('followers_count', { ascending: false })
    } else if (sort === 'recent') {
      query = query.order('created_at', { ascending: false })
    } else if (sort === 'posts') {
      query = query.order('posts_count', { ascending: false })
    } else {
      // Relevance sorting (default)
      query = query.order('followers_count', { ascending: false })
    }

    // Apply pagination
    query = query.range(offset, offset + Number(limit) - 1)

    const { data: users, error } = await query

    if (error) {
      throw error
    }

    // Get total count
    const { count: totalCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    res.json({
      success: true,
      data: {
        users: users || [],
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalCount || 0,
          pages: Math.ceil((totalCount || 0) / Number(limit))
        }
      }
    })
  } catch (error) {
    logger.error('Search users error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Search posts
router.get('/posts', async (req: Request, res: Response) => {
  try {
    const { 
      q = '', 
      page = 1, 
      limit = 20,
      filters = '{}',
      sort = 'relevance'
    } = req.query

    const offset = (Number(page) - 1) * Number(limit))
    const parsedFilters = JSON.parse(filters as string)

    // Build posts query
    let query = supabase
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

    // Apply filters
    if (parsedFilters.content_type) {
      query = query.eq('content_type', parsedFilters.content_type)
    }
    if (parsedFilters.category) {
      query = query.eq('category', parsedFilters.category)
    }
    if (parsedFilters.is_paid !== undefined) {
      query = query.eq('is_paid', parsedFilters.is_paid)
    }
    if (parsedFilters.min_likes) {
      query = query.gte('likes_count', parsedFilters.min_likes)
    }
    if (parsedFilters.min_comments) {
      query = query.gte('comments_count', parsedFilters.min_comments)
    }
    if (parsedFilters.date_range) {
      const days = parsedFilters.date_range === 'day' ? 1 : 
                    parsedFilters.date_range === 'week' ? 7 : 
                    parsedFilters.date_range === 'month' ? 30 : 365
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      query = query.gte('created_at', startDate.toISOString())
    }
    if (parsedFilters.author_id) {
      query = query.eq('author_id', parsedFilters.author_id)
    }

    // Apply sorting
    if (sort === 'popular') {
      query = query.order('likes_count', { ascending: false })
    } else if (sort === 'recent') {
      query = query.order('created_at', { ascending: false })
    } else if (sort === 'trending') {
      query = query.order('views_count', { ascending: false })
    } else if (sort === 'comments') {
      query = query.order('comments_count', { ascending: false })
    } else {
      // Relevance sorting (combination of likes, comments, and recency)
      query = query.order('created_at', { ascending: false })
    }

    // Apply pagination
    query = query.range(offset, offset + Number(limit) - 1)

    const { data: posts, error } = await query

    if (error) {
      throw error
    }

    // Get total count
    const { count: totalCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('privacy', 'public')

    res.json({
      success: true,
      data: {
        posts: posts || [],
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalCount || 0,
          pages: Math.ceil((totalCount || 0) / Number(limit))
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

// Search streams
router.get('/streams', async (req: Request, res: Response) => {
  try {
    const { 
      q = '', 
      page = 1, 
      limit = 20,
      filters = '{}',
      sort = 'relevance'
    } = req.query

    const offset = (Number(page) - 1) * Number(limit))
    const parsedFilters = JSON.parse(filters as string)

    // Build streams query
    let query = supabase
      .from('streams')
      .select(`
        id,
        title,
        description,
        category,
        tags,
        status,
        is_private,
        is_paid,
        price,
        viewer_count,
        peak_viewers,
        created_at,
        started_at,
        profiles!streams_creator_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          is_verified,
          is_creator
        )
      `)
      .eq('status', 'live')

    // Apply search query
    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%,tags.cs.{${q}}`)
    }

    // Apply filters
    if (parsedFilters.category) {
      query = query.eq('category', parsedFilters.category)
    }
    if (parsedFilters.is_paid !== undefined) {
      query = query.eq('is_paid', parsedFilters.is_paid)
    }
    if (parsedFilters.min_viewers) {
      query = query.gte('viewer_count', parsedFilters.min_viewers)
    }
    if (parsedFilters.creator_id) {
      query = query.eq('creator_id', parsedFilters.creator_id)
    }

    // Apply sorting
    if (sort === 'viewers') {
      query = query.order('viewer_count', { ascending: false })
    } else if (sort === 'recent') {
      query = query.order('started_at', { ascending: false })
    } else if (sort === 'popular') {
      query = query.order('peak_viewers', { ascending: false })
    } else {
      // Relevance sorting
      query = query.order('viewer_count', { ascending: false })
    }

    // Apply pagination
    query = query.range(offset, offset + Number(limit) - 1)

    const { data: streams, error } = await query

    if (error) {
      throw error
    }

    // Get total count
    const { count: totalCount } = await supabase
      .from('streams')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'live')

    res.json({
      success: true,
      data: {
        streams: streams || [],
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalCount || 0,
          pages: Math.ceil((totalCount || 0) / Number(limit))
        }
      }
    })
  } catch (error) {
    logger.error('Search streams error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Get search suggestions
router.get('/suggestions', async (req: Request, res: Response) => {
  try {
    const { q = '', type = 'all' } = req.query

    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: {
          suggestions: []
        }
      })
    }

    let suggestions: any[] = []

    // Get user suggestions
    if (type === 'all' || type === 'users') {
      const { data: userSuggestions } = await supabase
        .from('profiles')
        .select('username, display_name, avatar_url, is_verified')
        .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
        .eq('is_active', true)
        .limit(5)

      suggestions = suggestions.concat(
        (userSuggestions || []).map(user => ({
          type: 'user',
          id: user.username,
          title: user.display_name,
          subtitle: `@${user.username}`,
          avatar: user.avatar_url,
          is_verified: user.is_verified
        }))
      )
    }

    // Get hashtag suggestions
    if (type === 'all' || type === 'hashtags') {
      const { data: hashtagSuggestions } = await supabase
        .from('posts')
        .select('tags')
        .not('tags', 'is', null)
        .limit(100)

      const hashtags = new Set<string>()
      hashtagSuggestions?.forEach(post => {
        post.tags?.forEach((tag: string) => {
          if (tag.toLowerCase().includes(q.toLowerCase())) {
            hashtags.add(tag)
          }
        })
      })

      suggestions = suggestions.concat(
        Array.from(hashtags).slice(0, 5).map(hashtag => ({
          type: 'hashtag',
          id: hashtag,
          title: `#${hashtag}`,
          subtitle: 'Hashtag'
        }))
      )
    }

    // Get category suggestions
    if (type === 'all' || type === 'categories') {
      const { data: categorySuggestions } = await supabase
        .from('posts')
        .select('category')
        .not('category', 'is', null)
        .ilike('category', `%${q}%`)
        .limit(5)

      const categories = new Set<string>()
      categorySuggestions?.forEach(post => {
        if (post.category) {
          categories.add(post.category)
        }
      })

      suggestions = suggestions.concat(
        Array.from(categories).map(category => ({
          type: 'category',
          id: category,
          title: category,
          subtitle: 'Category'
        }))
      )
    }

    res.json({
      success: true,
      data: {
        suggestions: suggestions.slice(0, 10)
      }
    })
  } catch (error) {
    logger.error('Get search suggestions error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Get trending topics
router.get('/trending', async (req: Request, res: Response) => {
  try {
    const { timeframe = '24h', limit = 20 } = req.query

    // Calculate date range
    const now = new Date()
    const hours = timeframe === '1h' ? 1 : 
                  timeframe === '24h' ? 24 : 
                  timeframe === '7d' ? 168 : 720
    const startDate = new Date(now.getTime() - hours * 60 * 60 * 1000)

    // Get trending hashtags
    const { data: trendingHashtags } = await supabase
      .from('posts')
      .select('tags')
      .not('tags', 'is', null)
      .gte('created_at', startDate.toISOString())

    const hashtagCounts: Record<string, number> = {}
    trendingHashtags?.forEach(post => {
      post.tags?.forEach((tag: string) => {
        hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1
      })
    })

    const trending = Object.entries(hashtagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, Number(limit))
      .map(([hashtag, count]) => ({
        type: 'hashtag',
        name: hashtag,
        count,
        url: `/search?q=${encodeURIComponent(hashtag)}&type=posts`
      }))

    res.json({
      success: true,
      data: {
        timeframe,
        trending
      }
    })
  } catch (error) {
    logger.error('Get trending topics error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Save search query (for analytics)
router.post('/save-query', authMiddleware, validateRequest({
  body: Joi.object({
    query: Joi.string().min(1).max(100).required(),
    type: Joi.string().valid('users', 'posts', 'streams', 'global').required(),
    filters: Joi.object().optional(),
    results_count: Joi.number().min(0).required()
  })
}), async (req: Request, res: Response) => {
  try {
    const { query, type, filters, results_count } = req.body

    // Save search query for analytics (you might want to create a search_analytics table)
    logger.info(`Search query saved: ${query} (${type}) - ${results_count} results`)

    res.json({
      success: true,
      message: 'Search query saved'
    })
  } catch (error) {
    logger.error('Save search query error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

export default router
