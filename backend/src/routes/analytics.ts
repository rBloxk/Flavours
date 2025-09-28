import { Router, Request, Response } from 'express'
import { supabase } from '../config/database'
import { authMiddleware } from '../middleware/auth'
import { validateRequest } from '../middleware/validation'
import { logger } from '../utils/logger'
import Joi from 'joi'

const router = Router()

// =============================================
// ANALYTICS ENDPOINTS
// =============================================

// Get user analytics overview
router.get('/overview', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { timeframe = '30d' } = req.query

    // Calculate date range
    const now = new Date()
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365
    const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000))

    // Get user analytics data
    const { data: analytics } = await supabase
      .from('user_analytics')
      .select('*')
      .eq('user_id', req.user.id)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true })

    // Calculate aggregated stats
    const totalStats = analytics?.reduce((acc, day) => ({
      daily_active: acc.daily_active + (day.daily_active ? 1 : 0),
      session_duration: acc.session_duration + day.session_duration,
      posts_viewed: acc.posts_viewed + day.posts_viewed,
      posts_liked: acc.posts_liked + day.posts_liked,
      posts_shared: acc.posts_shared + day.posts_shared,
      daily_earnings: acc.daily_earnings + day.daily_earnings,
      daily_tips_received: acc.daily_tips_received + day.daily_tips_received,
      daily_subscribers_gained: acc.daily_subscribers_gained + day.daily_subscribers_gained
    }), {
      daily_active: 0,
      session_duration: 0,
      posts_viewed: 0,
      posts_liked: 0,
      posts_shared: 0,
      daily_earnings: 0,
      daily_tips_received: 0,
      daily_subscribers_gained: 0
    }) || {
      daily_active: 0,
      session_duration: 0,
      posts_viewed: 0,
      posts_liked: 0,
      posts_shared: 0,
      daily_earnings: 0,
      daily_tips_received: 0,
      daily_subscribers_gained: 0
    }

    // Calculate averages
    const avgSessionDuration = analytics?.length ? totalStats.session_duration / analytics.length : 0
    const avgPostsViewed = analytics?.length ? totalStats.posts_viewed / analytics.length : 0
    const avgPostsLiked = analytics?.length ? totalStats.posts_liked / analytics.length : 0

    res.json({
      success: true,
      data: {
        timeframe,
        overview: {
          total_days: analytics?.length || 0,
          active_days: totalStats.daily_active,
          avg_session_duration: Math.round(avgSessionDuration),
          avg_posts_viewed: Math.round(avgPostsViewed),
          avg_posts_liked: Math.round(avgPostsLiked),
          total_earnings: totalStats.daily_earnings,
          total_tips_received: totalStats.daily_tips_received,
          total_subscribers_gained: totalStats.daily_subscribers_gained
        },
        daily_data: analytics || []
      }
    })
  } catch (error) {
    logger.error('Get analytics overview error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Get content analytics
router.get('/content', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { 
      timeframe = '30d',
      page = 1,
      limit = 20,
      sort = 'views',
      content_type = 'all'
    } = req.query

    const offset = (Number(page) - 1) * Number(limit)

    // Calculate date range
    const now = new Date()
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365
    const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000))

    // Build content analytics query
    let query = supabase
      .from('content_analytics')
      .select(`
        *,
        posts!content_analytics_post_id_fkey (
          id,
          content,
          content_type,
          category,
          tags,
          created_at,
          media (
            id,
            file_url,
            file_type,
            thumbnail_url
          )
        )
      `)
      .eq('posts.author_id', req.user.id)
      .gte('date', startDate.toISOString().split('T')[0])

    // Apply content type filter
    if (content_type !== 'all') {
      query = query.eq('posts.content_type', content_type)
    }

    // Apply sorting
    if (sort === 'views') {
      query = query.order('total_views', { ascending: false })
    } else if (sort === 'likes') {
      query = query.order('likes_count', { ascending: false })
    } else if (sort === 'comments') {
      query = query.order('comments_count', { ascending: false })
    } else if (sort === 'earnings') {
      query = query.order('total_earnings', { ascending: false })
    } else {
      query = query.order('date', { ascending: false })
    }

    // Apply pagination
    query = query.range(offset, offset + Number(limit) - 1)

    const { data: contentAnalytics, error } = await query

    if (error) {
      throw error
    }

    // Get total count
    const { count: totalCount } = await supabase
      .from('content_analytics')
      .select('*', { count: 'exact', head: true })
      .eq('posts.author_id', req.user.id)
      .gte('date', startDate.toISOString().split('T')[0])

    res.json({
      success: true,
      data: {
        content_analytics: contentAnalytics || [],
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalCount || 0,
          pages: Math.ceil((totalCount || 0) / Number(limit))
        }
      }
    })
  } catch (error) {
    logger.error('Get content analytics error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Get audience analytics
router.get('/audience', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { timeframe = '30d' } = req.query

    // Calculate date range
    const now = new Date()
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365
    const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000))

    // Get follower growth data
    const { data: followerGrowth } = await supabase
      .from('follows')
      .select('created_at')
      .eq('following_id', req.user.id)
      .gte('created_at', startDate.toISOString())

    // Get follower demographics (mock data for now)
    const demographics = {
      age_groups: [
        { range: '18-24', percentage: 35 },
        { range: '25-34', percentage: 40 },
        { range: '35-44', percentage: 20 },
        { range: '45+', percentage: 5 }
      ],
      genders: [
        { gender: 'Female', percentage: 60 },
        { gender: 'Male', percentage: 35 },
        { gender: 'Other', percentage: 5 }
      ],
      locations: [
        { country: 'United States', percentage: 45 },
        { country: 'Canada', percentage: 15 },
        { country: 'United Kingdom', percentage: 12 },
        { country: 'Australia', percentage: 8 },
        { country: 'Other', percentage: 20 }
      ]
    }

    // Get engagement metrics
    const { data: engagementData } = await supabase
      .from('posts')
      .select('likes_count, comments_count, shares_count, views_count')
      .eq('author_id', req.user.id)
      .gte('created_at', startDate.toISOString())

    const totalEngagement = engagementData?.reduce((acc, post) => ({
      likes: acc.likes + post.likes_count,
      comments: acc.comments + post.comments_count,
      shares: acc.shares + post.shares_count,
      views: acc.views + post.views_count
    }), { likes: 0, comments: 0, shares: 0, views: 0 }) || { likes: 0, comments: 0, shares: 0, views: 0 }

    const engagementRate = totalEngagement.views > 0 
      ? ((totalEngagement.likes + totalEngagement.comments + totalEngagement.shares) / totalEngagement.views) * 100 
      : 0

    res.json({
      success: true,
      data: {
        timeframe,
        follower_growth: followerGrowth || [],
        demographics,
        engagement: {
          total_likes: totalEngagement.likes,
          total_comments: totalEngagement.comments,
          total_shares: totalEngagement.shares,
          total_views: totalEngagement.views,
          engagement_rate: Math.round(engagementRate * 100) / 100
        }
      }
    })
  } catch (error) {
    logger.error('Get audience analytics error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Get revenue analytics
router.get('/revenue', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { timeframe = '30d' } = req.query

    // Calculate date range
    const now = new Date()
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365
    const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000))

    // Get subscription revenue
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('price, created_at, status')
      .eq('creator_id', req.user.id)
      .gte('created_at', startDate.toISOString())

    // Get tips revenue
    const { data: tips } = await supabase
      .from('tips')
      .select('amount, created_at, payment_status')
      .eq('recipient_id', req.user.id)
      .gte('created_at', startDate.toISOString())

    // Calculate revenue metrics
    const subscriptionRevenue = subscriptions?.reduce((sum, sub) => 
      sub.status === 'active' ? sum + sub.price : sum, 0) || 0

    const tipsRevenue = tips?.reduce((sum, tip) => 
      tip.payment_status === 'completed' ? sum + tip.amount : sum, 0) || 0

    const totalRevenue = subscriptionRevenue + tipsRevenue

    // Get revenue by day
    const revenueByDay = []
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000))
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)

      const daySubscriptions = subscriptions?.filter(sub => 
        new Date(sub.created_at) >= dayStart && new Date(sub.created_at) < dayEnd
      ) || []

      const dayTips = tips?.filter(tip => 
        new Date(tip.created_at) >= dayStart && new Date(tip.created_at) < dayEnd
      ) || []

      const dayRevenue = daySubscriptions.reduce((sum, sub) => sum + sub.price, 0) +
                       dayTips.reduce((sum, tip) => sum + tip.amount, 0)

      revenueByDay.push({
        date: dayStart.toISOString().split('T')[0],
        revenue: dayRevenue,
        subscriptions: daySubscriptions.length,
        tips: dayTips.length
      })
    }

    res.json({
      success: true,
      data: {
        timeframe,
        overview: {
          total_revenue: totalRevenue,
          subscription_revenue: subscriptionRevenue,
          tips_revenue: tipsRevenue,
          total_subscriptions: subscriptions?.length || 0,
          total_tips: tips?.length || 0
        },
        daily_revenue: revenueByDay
      }
    })
  } catch (error) {
    logger.error('Get revenue analytics error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Get performance metrics
router.get('/performance', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { timeframe = '30d' } = req.query

    // Calculate date range
    const now = new Date()
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365
    const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000))

    // Get posts performance
    const { data: posts } = await supabase
      .from('posts')
      .select('likes_count, comments_count, shares_count, views_count, created_at, content_type')
      .eq('author_id', req.user.id)
      .gte('created_at', startDate.toISOString())

    // Calculate performance metrics
    const totalPosts = posts?.length || 0
    const totalLikes = posts?.reduce((sum, post) => sum + post.likes_count, 0) || 0
    const totalComments = posts?.reduce((sum, post) => sum + post.comments_count, 0) || 0
    const totalShares = posts?.reduce((sum, post) => sum + post.shares_count, 0) || 0
    const totalViews = posts?.reduce((sum, post) => sum + post.views_count, 0) || 0

    const avgLikesPerPost = totalPosts > 0 ? totalLikes / totalPosts : 0
    const avgCommentsPerPost = totalPosts > 0 ? totalComments / totalPosts : 0
    const avgSharesPerPost = totalPosts > 0 ? totalShares / totalPosts : 0
    const avgViewsPerPost = totalPosts > 0 ? totalViews / totalPosts : 0

    // Get top performing posts
    const topPosts = posts?.sort((a, b) => b.likes_count - a.likes_count).slice(0, 5) || []

    // Get content type performance
    const contentTypePerformance = posts?.reduce((acc, post) => {
      const type = post.content_type
      if (!acc[type]) {
        acc[type] = { count: 0, likes: 0, comments: 0, shares: 0, views: 0 }
      }
      acc[type].count++
      acc[type].likes += post.likes_count
      acc[type].comments += post.comments_count
      acc[type].shares += post.shares_count
      acc[type].views += post.views_count
      return acc
    }, {} as Record<string, any>) || {}

    res.json({
      success: true,
      data: {
        timeframe,
        overview: {
          total_posts: totalPosts,
          total_likes: totalLikes,
          total_comments: totalComments,
          total_shares: totalShares,
          total_views: totalViews,
          avg_likes_per_post: Math.round(avgLikesPerPost * 100) / 100,
          avg_comments_per_post: Math.round(avgCommentsPerPost * 100) / 100,
          avg_shares_per_post: Math.round(avgSharesPerPost * 100) / 100,
          avg_views_per_post: Math.round(avgViewsPerPost * 100) / 100
        },
        top_posts: topPosts,
        content_type_performance: contentTypePerformance
      }
    })
  } catch (error) {
    logger.error('Get performance analytics error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// =============================================
// REPORTING ENDPOINTS
// =============================================

// Generate analytics report
router.post('/report', authMiddleware, validateRequest({
  body: Joi.object({
    timeframe: Joi.string().valid('7d', '30d', '90d', '1y').default('30d'),
    report_type: Joi.string().valid('overview', 'content', 'audience', 'revenue', 'performance', 'comprehensive').default('comprehensive'),
    format: Joi.string().valid('json', 'pdf', 'csv').default('json'),
    email: Joi.boolean().default(false)
  })
}), async (req: Request, res: Response) => {
  try {
    const { timeframe, report_type, format, email } = req.body

    // Generate report based on type
    let reportData: any = {}

    if (report_type === 'overview' || report_type === 'comprehensive') {
      // Get overview data
      const overviewResponse = await fetch(`${req.protocol}://${req.get('host')}/api/v1/analytics/overview?timeframe=${timeframe}`, {
        headers: { Authorization: req.headers.authorization }
      })
      reportData.overview = await overviewResponse.json()
    }

    if (report_type === 'content' || report_type === 'comprehensive') {
      // Get content analytics
      const contentResponse = await fetch(`${req.protocol}://${req.get('host')}/api/v1/analytics/content?timeframe=${timeframe}`, {
        headers: { Authorization: req.headers.authorization }
      })
      reportData.content = await contentResponse.json()
    }

    if (report_type === 'audience' || report_type === 'comprehensive') {
      // Get audience analytics
      const audienceResponse = await fetch(`${req.protocol}://${req.get('host')}/api/v1/analytics/audience?timeframe=${timeframe}`, {
        headers: { Authorization: req.headers.authorization }
      })
      reportData.audience = await audienceResponse.json()
    }

    if (report_type === 'revenue' || report_type === 'comprehensive') {
      // Get revenue analytics
      const revenueResponse = await fetch(`${req.protocol}://${req.get('host')}/api/v1/analytics/revenue?timeframe=${timeframe}`, {
        headers: { Authorization: req.headers.authorization }
      })
      reportData.revenue = await revenueResponse.json()
    }

    if (report_type === 'performance' || report_type === 'comprehensive') {
      // Get performance analytics
      const performanceResponse = await fetch(`${req.protocol}://${req.get('host')}/api/v1/analytics/performance?timeframe=${timeframe}`, {
        headers: { Authorization: req.headers.authorization }
      })
      reportData.performance = await performanceResponse.json()
    }

    // Add metadata
    reportData.metadata = {
      generated_at: new Date().toISOString(),
      timeframe,
      report_type,
      format,
      user_id: req.user.id
    }

    // Handle different formats
    if (format === 'pdf') {
      // Generate PDF report (implement PDF generation logic)
      // For now, return JSON with PDF generation flag
      reportData.pdf_generation = 'pending'
    } else if (format === 'csv') {
      // Generate CSV report (implement CSV generation logic)
      // For now, return JSON with CSV generation flag
      reportData.csv_generation = 'pending'
    }

    // Send email if requested
    if (email) {
      // Implement email sending logic
      reportData.email_sent = 'pending'
    }

    res.json({
      success: true,
      data: reportData,
      message: 'Report generated successfully'
    })
  } catch (error) {
    logger.error('Generate report error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Get analytics settings
router.get('/settings', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Get user's analytics settings
    const { data: creator } = await supabase
      .from('creators')
      .select('analytics_settings')
      .eq('profile_id', req.user.id)
      .single()

    const defaultSettings = {
      track_views: true,
      track_engagement: true,
      track_revenue: true,
      share_analytics: false,
      email_reports: false,
      report_frequency: 'monthly',
      privacy_level: 'private'
    }

    res.json({
      success: true,
      data: {
        settings: creator?.analytics_settings || defaultSettings
      }
    })
  } catch (error) {
    logger.error('Get analytics settings error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Update analytics settings
router.put('/settings', authMiddleware, validateRequest({
  body: Joi.object({
    track_views: Joi.boolean().optional(),
    track_engagement: Joi.boolean().optional(),
    track_revenue: Joi.boolean().optional(),
    share_analytics: Joi.boolean().optional(),
    email_reports: Joi.boolean().optional(),
    report_frequency: Joi.string().valid('weekly', 'monthly', 'quarterly').optional(),
    privacy_level: Joi.string().valid('private', 'followers', 'public').optional()
  })
}), async (req: Request, res: Response) => {
  try {
    const settings = req.body

    // Update creator analytics settings
    const { data: updatedCreator, error } = await supabase
      .from('creators')
      .update({
        analytics_settings: settings,
        updated_at: new Date().toISOString()
      })
      .eq('profile_id', req.user.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    res.json({
      success: true,
      data: updatedCreator,
      message: 'Analytics settings updated successfully'
    })
  } catch (error) {
    logger.error('Update analytics settings error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

export default router