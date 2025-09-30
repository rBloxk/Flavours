import { Router, Request, Response } from 'express'
import { supabase } from '../config/supabase'
import { authMiddleware } from '../middleware/auth'
import { validateRequest } from '../middleware/validation'
import { logger } from '../utils/logger'
import { redisManager } from '../config/redis'
import { z } from 'zod'

const router = Router()

// Validation schemas
const createDatingProfileSchema = z.object({
  age: z.number().min(18).max(100),
  height: z.string().min(1).max(10),
  weight: z.string().min(1).max(10).optional(),
  location: z.string().min(1).max(100),
  hometown: z.string().min(1).max(100).optional(),
  bio: z.string().min(10).max(500),
  gender: z.enum(['male', 'female', 'non-binary', 'other']),
  sexuality: z.enum(['straight', 'gay', 'lesbian', 'bisexual', 'pansexual', 'asexual', 'other']),
  relationshipStatus: z.enum(['single', 'divorced', 'widowed', 'separated']),
  education: z.string().min(1).max(100).optional(),
  occupation: z.string().min(1).max(100).optional(),
  college: z.string().min(1).max(100).optional(),
  work: z.string().min(1).max(100).optional(),
  jobTitle: z.string().min(1).max(100).optional(),
  interests: z.array(z.string()).min(1).max(20),
  photos: z.array(z.string().url()).min(1).max(6),
  pronouns: z.string().min(1).max(20).optional(),
  birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  ethnicity: z.string().min(1).max(50).optional(),
  children: z.enum(['no_children', 'has_children', 'wants_children']).optional(),
  familyPlans: z.enum(['wants_marriage', 'no_marriage', 'unsure']).optional(),
  pets: z.enum(['has_pets', 'no_pets', 'allergic']).optional(),
  religion: z.string().min(1).max(50).optional(),
  zodiac: z.string().min(1).max(20).optional(),
  politicalViews: z.enum(['liberal', 'conservative', 'moderate', 'other']).optional(),
  interestedIn: z.array(z.string()).min(1).max(10).optional(),
  hobbies: z.array(z.string()).min(1).max(10).optional(),
  marijuana: z.enum(['never', 'occasionally', 'regularly']).optional(),
  smoke: z.enum(['never', 'occasionally', 'regularly']).optional(),
  drinks: z.enum(['never', 'occasionally', 'regularly']).optional(),
  drugs: z.enum(['never', 'occasionally', 'regularly']).optional(),
  bodyCount: z.enum(['0', '1-5', '6-10', '11-20', '20+', 'prefer_not_to_say']).optional(),
  affairs: z.enum(['never', 'once', 'multiple']).optional(),
  sexualDesires: z.string().min(1).max(200).optional()
})

const updateDatingProfileSchema = createDatingProfileSchema.partial()

const swipeSchema = z.object({
  targetUserId: z.string().uuid(),
  action: z.enum(['like', 'pass', 'super_like']),
  message: z.string().max(200).optional()
})

const reportUserSchema = z.object({
  targetUserId: z.string().uuid(),
  reason: z.enum(['inappropriate', 'spam', 'harassment', 'underage', 'fake', 'other']),
  description: z.string().max(500).optional()
})

const blockUserSchema = z.object({
  targetUserId: z.string().uuid(),
  reason: z.string().max(200).optional()
})

// Create or update dating profile
router.post('/profile', authMiddleware, validateRequest(createDatingProfileSchema), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const profileData = req.body

    // Check if user already has a dating profile
    const { data: existingProfile } = await supabase
      .from('dating_profiles')
      .select('id')
      .eq('user_id', userId)
      .single()

    let profile
    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('dating_profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      profile = data
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('dating_profiles')
        .insert({
          user_id: userId,
          ...profileData
        })
        .select()
        .single()

      if (error) throw error
      profile = data
    }

    res.status(201).json({
      message: 'Dating profile updated successfully',
      profile
    })
  } catch (error) {
    logger.error('Create/update dating profile error:', error)
    res.status(500).json({
      error: 'Failed to update dating profile'
    })
  }
})

// Get dating profile
router.get('/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id

    const { data: profile, error } = await supabase
      .from('dating_profiles')
      .select(`
        *,
        profiles!dating_profiles_user_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          is_verified
        )
      `)
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    res.json({
      profile: profile || null
    })
  } catch (error) {
    logger.error('Get dating profile error:', error)
    res.status(500).json({
      error: 'Failed to fetch dating profile'
    })
  }
})

// Get potential matches
router.get('/matches', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { limit = 10, offset = 0 } = req.query

    // Get user's dating profile and preferences
    const { data: userProfile } = await supabase
      .from('dating_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!userProfile) {
      return res.status(400).json({
        error: 'Dating profile not found. Please create your profile first.'
      })
    }

    // Get users that the current user has already swiped on
    const { data: swipedUsers } = await supabase
      .from('dating_swipes')
      .select('target_user_id')
      .eq('user_id', userId)

    const swipedUserIds = swipedUsers?.map(s => s.target_user_id) || []

    // Build query for potential matches
    let query = supabase
      .from('dating_profiles')
      .select(`
        *,
        profiles!dating_profiles_user_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          is_verified,
          last_active
        )
      `)
      .neq('user_id', userId)
      .not('user_id', 'in', `(${swipedUserIds.join(',')})`)

    // Apply age filter
    if (userProfile.age) {
      const minAge = userProfile.age - 5
      const maxAge = userProfile.age + 5
      query = query.gte('age', minAge).lte('age', maxAge)
    }

    // Apply gender preference (simplified logic)
    if (userProfile.gender && userProfile.sexuality) {
      // This is a simplified matching logic - in production, you'd want more sophisticated matching
      if (userProfile.sexuality === 'straight') {
        query = query.neq('gender', userProfile.gender)
      } else if (userProfile.sexuality === 'gay' || userProfile.sexuality === 'lesbian') {
        query = query.eq('gender', userProfile.gender)
      }
    }

    // Apply location filter (if specified)
    if (userProfile.location) {
      query = query.ilike('location', `%${userProfile.location.split(',')[0]}%`)
    }

    // Apply pagination and get results
    query = query.range(Number(offset), Number(offset) + Number(limit) - 1)

    const { data: matches, error } = await query

    if (error) throw error

    res.json({
      matches: matches || [],
      pagination: {
        limit: Number(limit),
        offset: Number(offset),
        hasMore: matches?.length === Number(limit)
      }
    })
  } catch (error) {
    logger.error('Get matches error:', error)
    res.status(500).json({
      error: 'Failed to fetch matches'
    })
  }
})

// Swipe on a user
router.post('/swipe', authMiddleware, validateRequest(swipeSchema), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { targetUserId, action, message } = req.body

    // Check if user has already swiped on this target
    const { data: existingSwipe } = await supabase
      .from('dating_swipes')
      .select('*')
      .eq('user_id', userId)
      .eq('target_user_id', targetUserId)
      .single()

    if (existingSwipe) {
      return res.status(400).json({
        error: 'You have already swiped on this user'
      })
    }

    // Create swipe record
    const { data: swipe, error } = await supabase
      .from('dating_swipes')
      .insert({
        user_id: userId,
        target_user_id: targetUserId,
        action,
        message
      })
      .select()
      .single()

    if (error) throw error

    // Check if this creates a match
    if (action === 'like' || action === 'super_like') {
      const { data: mutualSwipe } = await supabase
        .from('dating_swipes')
        .select('*')
        .eq('user_id', targetUserId)
        .eq('target_user_id', userId)
        .eq('action', 'like')
        .single()

      if (mutualSwipe) {
        // Create match
        const { data: match, error: matchError } = await supabase
          .from('dating_matches')
          .insert({
            user1_id: userId,
            user2_id: targetUserId,
            matched_at: new Date().toISOString()
          })
          .select()
          .single()

        if (matchError) {
          logger.error('Create match error:', matchError)
        } else {
          // Store match in Redis for real-time notifications
          await redisManager.setex(`match:${match.id}`, 3600, JSON.stringify(match))
        }

        res.json({
          message: 'It\'s a match!',
          swipe,
          match: match || null,
          isMatch: true
        })
        return
      }
    }

    res.json({
      message: 'Swipe recorded successfully',
      swipe,
      isMatch: false
    })
  } catch (error) {
    logger.error('Swipe error:', error)
    res.status(500).json({
      error: 'Failed to record swipe'
    })
  }
})

// Get matches
router.get('/matches/list', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { limit = 20, offset = 0 } = req.query

    const { data: matches, error } = await supabase
      .from('dating_matches')
      .select(`
        *,
        user1:profiles!dating_matches_user1_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          is_verified
        ),
        user2:profiles!dating_matches_user2_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          is_verified
        )
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('matched_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1)

    if (error) throw error

    // Filter to show only the other user in each match
    const formattedMatches = matches?.map(match => ({
      ...match,
      matched_user: match.user1_id === userId ? match.user2 : match.user1
    })) || []

    res.json({
      matches: formattedMatches,
      pagination: {
        limit: Number(limit),
        offset: Number(offset),
        hasMore: matches?.length === Number(limit)
      }
    })
  } catch (error) {
    logger.error('Get matches list error:', error)
    res.status(500).json({
      error: 'Failed to fetch matches'
    })
  }
})

// Get match messages
router.get('/matches/:matchId/messages', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { matchId } = req.params
    const { limit = 50, offset = 0 } = req.query

    // Verify user is part of this match
    const { data: match } = await supabase
      .from('dating_matches')
      .select('*')
      .eq('id', matchId)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .single()

    if (!match) {
      return res.status(404).json({
        error: 'Match not found'
      })
    }

    const { data: messages, error } = await supabase
      .from('dating_messages')
      .select(`
        *,
        sender:profiles!dating_messages_sender_id_fkey (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('match_id', matchId)
      .order('created_at', { ascending: true })
      .range(Number(offset), Number(offset) + Number(limit) - 1)

    if (error) throw error

    res.json({
      messages: messages || [],
      pagination: {
        limit: Number(limit),
        offset: Number(offset),
        hasMore: messages?.length === Number(limit)
      }
    })
  } catch (error) {
    logger.error('Get match messages error:', error)
    res.status(500).json({
      error: 'Failed to fetch messages'
    })
  }
})

// Send message in match
router.post('/matches/:matchId/messages', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { matchId } = req.params
    const { message, messageType = 'text' } = req.body

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Message is required'
      })
    }

    // Verify user is part of this match
    const { data: match } = await supabase
      .from('dating_matches')
      .select('*')
      .eq('id', matchId)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .single()

    if (!match) {
      return res.status(404).json({
        error: 'Match not found'
      })
    }

    const { data: newMessage, error } = await supabase
      .from('dating_messages')
      .insert({
        match_id: matchId,
        sender_id: userId,
        message: message.trim(),
        message_type: messageType
      })
      .select(`
        *,
        sender:profiles!dating_messages_sender_id_fkey (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .single()

    if (error) throw error

    // Store message in Redis for real-time delivery
    await redisManager.setex(`dating_message:${newMessage.id}`, 3600, JSON.stringify(newMessage))

    res.status(201).json({
      message: 'Message sent successfully',
      newMessage
    })
  } catch (error) {
    logger.error('Send match message error:', error)
    res.status(500).json({
      error: 'Failed to send message'
    })
  }
})

// Report user
router.post('/report', authMiddleware, validateRequest(reportUserSchema), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { targetUserId, reason, description } = req.body

    const { data: report, error } = await supabase
      .from('dating_reports')
      .insert({
        reporter_id: userId,
        reported_user_id: targetUserId,
        reason,
        description
      })
      .select()
      .single()

    if (error) throw error

    res.status(201).json({
      message: 'User reported successfully',
      report
    })
  } catch (error) {
    logger.error('Report user error:', error)
    res.status(500).json({
      error: 'Failed to report user'
    })
  }
})

// Block user
router.post('/block', authMiddleware, validateRequest(blockUserSchema), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { targetUserId, reason } = req.body

    const { data: block, error } = await supabase
      .from('dating_blocks')
      .insert({
        blocker_id: userId,
        blocked_user_id: targetUserId,
        reason
      })
      .select()
      .single()

    if (error) throw error

    res.status(201).json({
      message: 'User blocked successfully',
      block
    })
  } catch (error) {
    logger.error('Block user error:', error)
    res.status(500).json({
      error: 'Failed to block user'
    })
  }
})

// Get blocked users
router.get('/blocked', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id

    const { data: blockedUsers, error } = await supabase
      .from('dating_blocks')
      .select(`
        *,
        blocked_user:profiles!dating_blocks_blocked_user_id_fkey (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('blocker_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({
      blockedUsers: blockedUsers || []
    })
  } catch (error) {
    logger.error('Get blocked users error:', error)
    res.status(500).json({
      error: 'Failed to fetch blocked users'
    })
  }
})

// Unblock user
router.delete('/block/:targetUserId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { targetUserId } = req.params

    const { error } = await supabase
      .from('dating_blocks')
      .delete()
      .eq('blocker_id', userId)
      .eq('blocked_user_id', targetUserId)

    if (error) throw error

    res.json({
      message: 'User unblocked successfully'
    })
  } catch (error) {
    logger.error('Unblock user error:', error)
    res.status(500).json({
      error: 'Failed to unblock user'
    })
  }
})

// Get dating statistics
router.get('/stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id

    const [likesResult, passesResult, matchesResult, messagesResult] = await Promise.all([
      supabase
        .from('dating_swipes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('action', 'like'),
      supabase
        .from('dating_swipes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('action', 'pass'),
      supabase
        .from('dating_matches')
        .select('*', { count: 'exact', head: true })
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`),
      supabase
        .from('dating_messages')
        .select('*', { count: 'exact', head: true })
        .eq('sender_id', userId)
    ])

    const stats = {
      likes: likesResult.count || 0,
      passes: passesResult.count || 0,
      matches: matchesResult.count || 0,
      messages: messagesResult.count || 0
    }

    res.json({ stats })
  } catch (error) {
    logger.error('Get dating stats error:', error)
    res.status(500).json({
      error: 'Failed to fetch dating statistics'
    })
  }
})

// Get dating preferences
router.get('/preferences', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id

    const { data: preferences, error } = await supabase
      .from('dating_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    const defaultPreferences = {
      age_range: { min: 18, max: 100 },
      max_distance: 50,
      interested_in: ['male', 'female'],
      deal_breakers: [],
      must_haves: [],
      nice_to_haves: []
    }

    res.json({
      preferences: preferences || { user_id: userId, ...defaultPreferences }
    })
  } catch (error) {
    logger.error('Get dating preferences error:', error)
    res.status(500).json({
      error: 'Failed to fetch dating preferences'
    })
  }
})

// Update dating preferences
router.put('/preferences', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const preferences = req.body

    const { data: updatedPreferences, error } = await supabase
      .from('dating_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    res.json({
      message: 'Dating preferences updated successfully',
      preferences: updatedPreferences
    })
  } catch (error) {
    logger.error('Update dating preferences error:', error)
    res.status(500).json({
      error: 'Failed to update dating preferences'
    })
  }
})

export default router

