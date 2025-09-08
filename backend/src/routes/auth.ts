import { Router, Request, Response } from 'express'
import { supabase } from '../config/supabase'
import { authMiddleware } from '../middleware/auth'
import { validateRequest } from '../middleware/validation'
import { signUpSchema, signInSchema } from '../schemas/auth'
import { logger } from '../utils/logger'

const router = Router()

// Sign up
router.post('/signup', validateRequest(signUpSchema), async (req: Request, res: Response) => {
  try {
    const { email, password, username, displayName, isCreator } = req.body

    // Check if username exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single()

    if (existingProfile) {
      return res.status(400).json({
        error: 'Username already exists'
      })
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (authError) {
      logger.error('Auth signup error:', authError)
      return res.status(400).json({
        error: authError.message
      })
    }

    if (!authData.user) {
      return res.status(400).json({
        error: 'Failed to create user'
      })
    }

    // Create profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        username,
        display_name: displayName,
        is_creator: isCreator,
        age_verified: true // In real app, this would require verification
      })
      .select()
      .single()

    if (profileError) {
      logger.error('Profile creation error:', profileError)
      return res.status(400).json({
        error: 'Failed to create profile'
      })
    }

    // Create creator record if needed
    if (isCreator) {
      const { error: creatorError } = await supabase
        .from('creators')
        .insert({
          user_id: authData.user.id,
          profile_id: profileData.id,
          subscription_price: 0,
          verification_status: 'pending'
        })

      if (creatorError) {
        logger.error('Creator creation error:', creatorError)
      }
    }

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        profile: profileData
      }
    })
  } catch (error) {
    logger.error('Signup error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Sign in
router.post('/signin', validateRequest(signInSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return res.status(401).json({
        error: error.message
      })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', data.user.id)
      .single()

    res.json({
      message: 'Signed in successfully',
      user: data.user,
      session: data.session,
      profile
    })
  } catch (error) {
    logger.error('Signin error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Get current user
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id

    const { data: profile } = await supabase
      .from('profiles')
      .select(`
        *,
        creators (
          id,
          subscription_price,
          total_subscribers,
          total_earnings,
          verification_status
        )
      `)
      .eq('user_id', userId)
      .single()

    res.json({
      user: (req as any).user,
      profile
    })
  } catch (error) {
    logger.error('Get user error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Sign out
router.post('/signout', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      return res.status(400).json({
        error: error.message
      })
    }

    res.json({
      message: 'Signed out successfully'
    })
  } catch (error) {
    logger.error('Signout error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

export default router