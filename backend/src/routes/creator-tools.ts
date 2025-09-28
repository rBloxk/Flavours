import { Router, Request, Response } from 'express'
import { supabase } from '../config/database'
import { authMiddleware } from '../middleware/auth'
import { validateRequest } from '../middleware/validation'
import { logger } from '../utils/logger'
import Joi from 'joi'
import Stripe from 'stripe'

const router = Router()

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

// =============================================
// CREATOR DASHBOARD ENDPOINTS
// =============================================

// Get creator dashboard overview
router.get('/dashboard', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { timeframe = '30d' } = req.query

    // Calculate date range
    const now = new Date()
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365
    const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000))

    // Get creator profile
    const { data: creator } = await supabase
      .from('creators')
      .select('*')
      .eq('profile_id', req.user.id)
      .single()

    if (!creator) {
      return res.status(404).json({
        error: 'Creator profile not found'
      })
    }

    // Get revenue data
    const [subscriptionsResult, tipsResult, postsResult] = await Promise.all([
      supabase
        .from('subscriptions')
        .select('price, created_at, status')
        .eq('creator_id', req.user.id)
        .gte('created_at', startDate.toISOString()),
      supabase
        .from('tips')
        .select('amount, created_at, payment_status')
        .eq('recipient_id', req.user.id)
        .gte('created_at', startDate.toISOString()),
      supabase
        .from('posts')
        .select('likes_count, comments_count, shares_count, views_count, created_at')
        .eq('author_id', req.user.id)
        .gte('created_at', startDate.toISOString())
    ])

    // Calculate metrics
    const subscriptionRevenue = subscriptionsResult.data?.reduce((sum, sub) => 
      sub.status === 'active' ? sum + sub.price : sum, 0) || 0

    const tipsRevenue = tipsResult.data?.reduce((sum, tip) => 
      tip.payment_status === 'completed' ? sum + tip.amount : sum, 0) || 0

    const totalRevenue = subscriptionRevenue + tipsRevenue

    const totalLikes = postsResult.data?.reduce((sum, post) => sum + post.likes_count, 0) || 0
    const totalComments = postsResult.data?.reduce((sum, post) => sum + post.comments_count, 0) || 0
    const totalShares = postsResult.data?.reduce((sum, post) => sum + post.shares_count, 0) || 0
    const totalViews = postsResult.data?.reduce((sum, post) => sum + post.views_count, 0) || 0

    // Get recent activity
    const { data: recentActivity } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        content_type,
        likes_count,
        comments_count,
        views_count,
        created_at,
        media (
          id,
          file_url,
          file_type,
          thumbnail_url
        )
      `)
      .eq('author_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    res.json({
      success: true,
      data: {
        timeframe,
        overview: {
          total_revenue: totalRevenue,
          subscription_revenue: subscriptionRevenue,
          tips_revenue: tipsRevenue,
          total_subscribers: creator.total_subscribers,
          total_posts: postsResult.data?.length || 0,
          total_likes: totalLikes,
          total_comments: totalComments,
          total_shares: totalShares,
          total_views: totalViews,
          engagement_rate: totalViews > 0 ? ((totalLikes + totalComments + totalShares) / totalViews) * 100 : 0
        },
        recent_activity: recentActivity || [],
        creator_settings: creator.creator_settings,
        analytics_settings: creator.analytics_settings
      }
    })
  } catch (error) {
    logger.error('Get creator dashboard error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// =============================================
// SUBSCRIPTION MANAGEMENT
// =============================================

// Get subscription tiers
router.get('/subscription-tiers', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { data: creator } = await supabase
      .from('creators')
      .select('subscription_tiers, subscription_price')
      .eq('profile_id', req.user.id)
      .single()

    const defaultTiers = [
      {
        id: 'basic',
        name: 'Basic',
        price: creator?.subscription_price || 9.99,
        description: 'Access to basic content',
        features: ['Access to posts', 'Basic support'],
        is_active: true
      },
      {
        id: 'premium',
        name: 'Premium',
        price: (creator?.subscription_price || 9.99) * 2,
        description: 'Access to premium content',
        features: ['Access to all posts', 'Priority support', 'Exclusive content'],
        is_active: false
      },
      {
        id: 'vip',
        name: 'VIP',
        price: (creator?.subscription_price || 9.99) * 3,
        description: 'VIP access with exclusive benefits',
        features: ['Access to all content', 'VIP support', 'Exclusive content', 'Direct messages'],
        is_active: false
      }
    ]

    res.json({
      success: true,
      data: {
        tiers: creator?.subscription_tiers || defaultTiers,
        current_price: creator?.subscription_price || 9.99
      }
    })
  } catch (error) {
    logger.error('Get subscription tiers error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Update subscription tiers
router.put('/subscription-tiers', authMiddleware, validateRequest({
  body: Joi.object({
    tiers: Joi.array().items(
      Joi.object({
        id: Joi.string().required(),
        name: Joi.string().required(),
        price: Joi.number().min(0.01).max(1000).required(),
        description: Joi.string().max(500).required(),
        features: Joi.array().items(Joi.string()).max(20).required(),
        is_active: Joi.boolean().required()
      })
    ).min(1).max(5).required()
  })
}), async (req: Request, res: Response) => {
  try {
    const { tiers } = req.body

    // Update creator subscription tiers
    const { data: updatedCreator, error } = await supabase
      .from('creators')
      .update({
        subscription_tiers: tiers,
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
      message: 'Subscription tiers updated successfully'
    })
  } catch (error) {
    logger.error('Update subscription tiers error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Get subscribers
router.get('/subscribers', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status = 'all',
      tier = 'all',
      search = ''
    } = req.query

    const offset = (Number(page) - 1) * Number(limit)

    // Build subscribers query
    let query = supabase
      .from('subscriptions')
      .select(`
        *,
        profiles!subscriptions_subscriber_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          is_verified,
          created_at
        )
      `)
      .eq('creator_id', req.user.id)

    // Apply status filter
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    // Apply tier filter
    if (tier !== 'all') {
      query = query.eq('tier', tier)
    }

    // Apply search filter
    if (search) {
      query = query.or(`profiles.display_name.ilike.%${search}%,profiles.username.ilike.%${search}%`)
    }

    // Apply pagination
    query = query.range(offset, offset + Number(limit) - 1)

    const { data: subscribers, error } = await query

    if (error) {
      throw error
    }

    // Get total count
    const { count: totalCount } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', req.user.id)

    res.json({
      success: true,
      data: {
        subscribers: subscribers || [],
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalCount || 0,
          pages: Math.ceil((totalCount || 0) / Number(limit))
        }
      }
    })
  } catch (error) {
    logger.error('Get subscribers error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// =============================================
// CONTENT MONETIZATION
// =============================================

// Create paid content
router.post('/paid-content', authMiddleware, validateRequest({
  body: Joi.object({
    content: Joi.string().min(1).max(2000).required(),
    price: Joi.number().min(0.01).max(1000).required(),
    preview_content: Joi.string().max(500).optional(),
    content_type: Joi.string().valid('text', 'image', 'video', 'short_video').default('text'),
    tags: Joi.array().items(Joi.string().max(50)).max(10).optional(),
    category: Joi.string().max(50).optional()
  })
}), async (req: Request, res: Response) => {
  try {
    const { content, price, preview_content, content_type, tags, category } = req.body

    // Create paid post
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        author_id: req.user.id,
        content,
        content_type,
        privacy: 'paid',
        is_paid: true,
        price,
        preview_content,
        tags: tags || [],
        category
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    res.status(201).json({
      success: true,
      data: post,
      message: 'Paid content created successfully'
    })
  } catch (error) {
    logger.error('Create paid content error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Get earnings analytics
router.get('/earnings', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { timeframe = '30d', group_by = 'day' } = req.query

    // Calculate date range
    const now = new Date()
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365
    const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000))

    // Get subscription earnings
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('price, created_at, status, tier')
      .eq('creator_id', req.user.id)
      .gte('created_at', startDate.toISOString())

    // Get tips earnings
    const { data: tips } = await supabase
      .from('tips')
      .select('amount, created_at, payment_status, context_type')
      .eq('recipient_id', req.user.id)
      .gte('created_at', startDate.toISOString())

    // Calculate earnings by period
    const earningsByPeriod: Record<string, any> = {}

    // Process subscription earnings
    subscriptions?.forEach(sub => {
      if (sub.status === 'active') {
        const date = new Date(sub.created_at).toISOString().split('T')[0]
        if (!earningsByPeriod[date]) {
          earningsByPeriod[date] = { subscriptions: 0, tips: 0, total: 0 }
        }
        earningsByPeriod[date].subscriptions += sub.price
        earningsByPeriod[date].total += sub.price
      }
    })

    // Process tips earnings
    tips?.forEach(tip => {
      if (tip.payment_status === 'completed') {
        const date = new Date(tip.created_at).toISOString().split('T')[0]
        if (!earningsByPeriod[date]) {
          earningsByPeriod[date] = { subscriptions: 0, tips: 0, total: 0 }
        }
        earningsByPeriod[date].tips += tip.amount
        earningsByPeriod[date].total += tip.amount
      }
    })

    // Convert to array format
    const earningsData = Object.entries(earningsByPeriod).map(([date, data]) => ({
      date,
      subscriptions: data.subscriptions,
      tips: data.tips,
      total: data.total
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Calculate totals
    const totalSubscriptions = subscriptions?.reduce((sum, sub) => 
      sub.status === 'active' ? sum + sub.price : sum, 0) || 0

    const totalTips = tips?.reduce((sum, tip) => 
      tip.payment_status === 'completed' ? sum + tip.amount : sum, 0) || 0

    const totalEarnings = totalSubscriptions + totalTips

    res.json({
      success: true,
      data: {
        timeframe,
        overview: {
          total_earnings: totalEarnings,
          subscription_earnings: totalSubscriptions,
          tips_earnings: totalTips,
          total_subscriptions: subscriptions?.length || 0,
          total_tips: tips?.length || 0
        },
        earnings_data: earningsData
      }
    })
  } catch (error) {
    logger.error('Get earnings analytics error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// =============================================
// PAYOUT MANAGEMENT
// =============================================

// Get payout settings
router.get('/payout-settings', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Get creator payout settings
    const { data: creator } = await supabase
      .from('creators')
      .select('payout_settings')
      .eq('profile_id', req.user.id)
      .single()

    const defaultSettings = {
      payout_method: 'bank_account', // bank_account, paypal, stripe_connect
      payout_threshold: 50.00,
      payout_schedule: 'weekly', // daily, weekly, monthly
      bank_account: {
        account_holder_name: '',
        account_number: '',
        routing_number: '',
        account_type: 'checking'
      },
      paypal_email: '',
      stripe_connect_account_id: '',
      tax_information: {
        tax_id: '',
        business_type: 'individual',
        address: {
          line1: '',
          line2: '',
          city: '',
          state: '',
          postal_code: '',
          country: ''
        }
      }
    }

    res.json({
      success: true,
      data: {
        settings: creator?.payout_settings || defaultSettings
      }
    })
  } catch (error) {
    logger.error('Get payout settings error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Update payout settings
router.put('/payout-settings', authMiddleware, validateRequest({
  body: Joi.object({
    payout_method: Joi.string().valid('bank_account', 'paypal', 'stripe_connect').required(),
    payout_threshold: Joi.number().min(10).max(10000).required(),
    payout_schedule: Joi.string().valid('daily', 'weekly', 'monthly').required(),
    bank_account: Joi.object({
      account_holder_name: Joi.string().required(),
      account_number: Joi.string().required(),
      routing_number: Joi.string().required(),
      account_type: Joi.string().valid('checking', 'savings').required()
    }).optional(),
    paypal_email: Joi.string().email().optional(),
    tax_information: Joi.object({
      tax_id: Joi.string().required(),
      business_type: Joi.string().valid('individual', 'business').required(),
      address: Joi.object({
        line1: Joi.string().required(),
        line2: Joi.string().optional(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        postal_code: Joi.string().required(),
        country: Joi.string().required()
      }).required()
    }).required()
  })
}), async (req: Request, res: Response) => {
  try {
    const settings = req.body

    // Update creator payout settings
    const { data: updatedCreator, error } = await supabase
      .from('creators')
      .update({
        payout_settings: settings,
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
      message: 'Payout settings updated successfully'
    })
  } catch (error) {
    logger.error('Update payout settings error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Get payout history
router.get('/payouts', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status = 'all' } = req.query

    const offset = (Number(page) - 1) * Number(limit)

    // Build payouts query (this would need a payouts table)
    // For now, return mock data
    const mockPayouts = [
      {
        id: 'payout_1',
        amount: 1250.00,
        status: 'completed',
        method: 'bank_account',
        created_at: '2024-01-15T10:00:00Z',
        processed_at: '2024-01-16T09:00:00Z',
        reference: 'PAYOUT_001'
      },
      {
        id: 'payout_2',
        amount: 890.50,
        status: 'pending',
        method: 'bank_account',
        created_at: '2024-01-22T10:00:00Z',
        processed_at: null,
        reference: 'PAYOUT_002'
      }
    ]

    res.json({
      success: true,
      data: {
        payouts: mockPayouts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: mockPayouts.length,
          pages: Math.ceil(mockPayouts.length / Number(limit))
        }
      }
    })
  } catch (error) {
    logger.error('Get payouts error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// =============================================
// CREATOR VERIFICATION
// =============================================

// Submit verification request
router.post('/verification', authMiddleware, validateRequest({
  body: Joi.object({
    verification_type: Joi.string().valid('individual', 'business').required(),
    documents: Joi.object({
      id_document: Joi.string().required(),
      selfie: Joi.string().required(),
      business_document: Joi.string().optional(),
      address_proof: Joi.string().optional()
    }).required(),
    personal_info: Joi.object({
      full_name: Joi.string().required(),
      date_of_birth: Joi.date().required(),
      address: Joi.object({
        line1: Joi.string().required(),
        line2: Joi.string().optional(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        postal_code: Joi.string().required(),
        country: Joi.string().required()
      }).required(),
      phone: Joi.string().required()
    }).required(),
    business_info: Joi.object({
      business_name: Joi.string().optional(),
      business_type: Joi.string().optional(),
      tax_id: Joi.string().optional(),
      business_address: Joi.object({
        line1: Joi.string().optional(),
        line2: Joi.string().optional(),
        city: Joi.string().optional(),
        state: Joi.string().optional(),
        postal_code: Joi.string().optional(),
        country: Joi.string().optional()
      }).optional()
    }).optional()
  })
}), async (req: Request, res: Response) => {
  try {
    const verificationData = req.body

    // Update creator verification status
    const { data: updatedCreator, error } = await supabase
      .from('creators')
      .update({
        verification_status: 'pending',
        verification_documents: verificationData.documents,
        verification_notes: 'Verification request submitted',
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
      message: 'Verification request submitted successfully'
    })
  } catch (error) {
    logger.error('Submit verification error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Get verification status
router.get('/verification', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { data: creator } = await supabase
      .from('creators')
      .select('verification_status, verification_documents, verification_notes')
      .eq('profile_id', req.user.id)
      .single()

    if (!creator) {
      return res.status(404).json({
        error: 'Creator profile not found'
      })
    }

    res.json({
      success: true,
      data: {
        status: creator.verification_status,
        documents: creator.verification_documents,
        notes: creator.verification_notes
      }
    })
  } catch (error) {
    logger.error('Get verification status error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

export default router
