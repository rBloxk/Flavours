import { Router, Request, Response } from 'express'
import { supabase } from '../config/supabase'
import { authMiddleware } from '../middleware/auth'
import { validateRequest } from '../middleware/validation'
import { signUpSchema, signInSchema } from '../schemas/auth'
import { logger } from '../utils/logger'
import { emailService } from '../services/emailService'
import { verificationService } from '../services/verificationService'

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

    // Create auth user (don't auto-confirm email)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false // Require email verification
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
        email_verified: false, // Will be set to true after email verification
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

    // Generate verification token and send email
    try {
      const verificationToken = await verificationService.generateVerificationToken(
        authData.user.id,
        email,
        'email_verification'
      )
      
      const verificationUrl = verificationService.generateVerificationUrl(verificationToken, 'email_verification')
      
      // Send verification email
      const emailSent = await emailService.sendVerificationEmail({
        email,
        username,
        verificationToken,
        verificationUrl
      })

      if (!emailSent) {
        logger.warn('Failed to send verification email to:', email)
      }
    } catch (error) {
      logger.error('Failed to send verification email:', error)
      // Don't fail registration if email sending fails
    }

    res.status(201).json({
      message: 'User created successfully. Please check your email to verify your account.',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        profile: profileData
      },
      emailVerificationRequired: true
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

// Verify email
router.post('/verify-email', async (req: Request, res: Response) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({
        error: 'Verification token is required'
      })
    }

    // Validate token
    const validation = await verificationService.validateVerificationToken(token, 'email_verification')
    
    if (!validation.valid) {
      return res.status(400).json({
        error: validation.error || 'Invalid verification token'
      })
    }

    const { userId, email } = validation

    // Update user email confirmation status in Supabase Auth
    const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
      email_confirm: true
    })

    if (authError) {
      logger.error('Failed to confirm email in auth:', authError)
      return res.status(500).json({
        error: 'Failed to verify email'
      })
    }

    // Update profile email_verified status
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ email_verified: true })
      .eq('user_id', userId)

    if (profileError) {
      logger.error('Failed to update profile email verification:', profileError)
    }

    // Mark token as used
    await verificationService.markTokenAsUsed(token)

    // Get user data for welcome email
    const userData = await verificationService.getUserByUserId(userId)
    
    if (userData) {
      // Send welcome email
      await emailService.sendWelcomeEmail({
        email: userData.email!,
        username: userData.username!,
        displayName: userData.displayName!
      })
    }

    res.json({
      message: 'Email verified successfully! Welcome to Flavours!',
      verified: true
    })
  } catch (error) {
    logger.error('Email verification error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Resend verification email
router.post('/resend-verification', async (req: Request, res: Response) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        error: 'Email is required'
      })
    }

    // Get user by email
    const userData = await verificationService.getUserByEmail(email)
    
    if (!userData) {
      return res.status(404).json({
        error: 'User not found'
      })
    }

    // Check if email is already verified
    const { data: profile } = await supabase
      .from('profiles')
      .select('email_verified')
      .eq('user_id', userData.userId)
      .single()

    if (profile?.email_verified) {
      return res.status(400).json({
        error: 'Email is already verified'
      })
    }

    // Generate new verification token
    const verificationToken = await verificationService.generateVerificationToken(
      userData.userId!,
      email,
      'email_verification'
    )
    
    const verificationUrl = verificationService.generateVerificationUrl(verificationToken, 'email_verification')
    
    // Send verification email
    const emailSent = await emailService.sendVerificationEmail({
      email,
      username: userData.username!,
      verificationToken,
      verificationUrl
    })

    if (!emailSent) {
      return res.status(500).json({
        error: 'Failed to send verification email'
      })
    }

    res.json({
      message: 'Verification email sent successfully'
    })
  } catch (error) {
    logger.error('Resend verification error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Request password reset
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        error: 'Email is required'
      })
    }

    // Get user by email
    const userData = await verificationService.getUserByEmail(email)
    
    if (!userData) {
      // Don't reveal if user exists or not for security
      return res.json({
        message: 'If an account with that email exists, a password reset link has been sent'
      })
    }

    // Generate password reset token
    const resetToken = await verificationService.generateVerificationToken(
      userData.userId!,
      email,
      'password_reset'
    )
    
    const resetUrl = verificationService.generateVerificationUrl(resetToken, 'password_reset')
    
    // Send password reset email
    const emailSent = await emailService.sendPasswordResetEmail(email, resetToken, resetUrl)

    if (!emailSent) {
      return res.status(500).json({
        error: 'Failed to send password reset email'
      })
    }

    res.json({
      message: 'If an account with that email exists, a password reset link has been sent'
    })
  } catch (error) {
    logger.error('Forgot password error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Reset password
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body

    if (!token || !newPassword) {
      return res.status(400).json({
        error: 'Token and new password are required'
      })
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters long'
      })
    }

    // Validate token
    const validation = await verificationService.validateVerificationToken(token, 'password_reset')
    
    if (!validation.valid) {
      return res.status(400).json({
        error: validation.error || 'Invalid or expired reset token'
      })
    }

    const { userId } = validation

    // Update password in Supabase Auth
    const { error: authError } = await supabase.auth.admin.updateUserById(userId!, {
      password: newPassword
    })

    if (authError) {
      logger.error('Failed to reset password:', authError)
      return res.status(500).json({
        error: 'Failed to reset password'
      })
    }

    // Mark token as used
    await verificationService.markTokenAsUsed(token)

    res.json({
      message: 'Password reset successfully'
    })
  } catch (error) {
    logger.error('Reset password error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

export default router