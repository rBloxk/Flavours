import crypto from 'crypto'
import { supabase } from '../config/supabase'
import { logger } from '../utils/logger'
import { config } from '../config/environment'

export interface VerificationToken {
  token: string
  userId: string
  email: string
  type: 'email_verification' | 'password_reset'
  expiresAt: Date
  createdAt: Date
}

class VerificationService {
  private readonly TOKEN_EXPIRY_HOURS = {
    email_verification: 24,
    password_reset: 1
  }

  async generateVerificationToken(
    userId: string, 
    email: string, 
    type: 'email_verification' | 'password_reset' = 'email_verification'
  ): Promise<string> {
    try {
      // Generate a secure random token
      const token = crypto.randomBytes(32).toString('hex')
      
      // Calculate expiry time
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + this.TOKEN_EXPIRY_HOURS[type])
      
      // Store token in database
      const { error } = await supabase
        .from('verification_tokens')
        .insert({
          token,
          user_id: userId,
          email,
          type,
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString()
        })

      if (error) {
        logger.error('Failed to store verification token:', error)
        throw new Error('Failed to generate verification token')
      }

      logger.info(`Generated ${type} token for user ${userId}`)
      return token
    } catch (error) {
      logger.error('Error generating verification token:', error)
      throw error
    }
  }

  async validateVerificationToken(
    token: string, 
    type: 'email_verification' | 'password_reset' = 'email_verification'
  ): Promise<{ valid: boolean; userId?: string; email?: string; error?: string }> {
    try {
      // Get token from database
      const { data: tokenData, error } = await supabase
        .from('verification_tokens')
        .select('*')
        .eq('token', token)
        .eq('type', type)
        .eq('used', false)
        .single()

      if (error || !tokenData) {
        return { valid: false, error: 'Invalid or expired token' }
      }

      // Check if token is expired
      const now = new Date()
      const expiresAt = new Date(tokenData.expires_at)
      
      if (now > expiresAt) {
        // Mark token as expired
        await this.markTokenAsUsed(token)
        return { valid: false, error: 'Token has expired' }
      }

      return {
        valid: true,
        userId: tokenData.user_id,
        email: tokenData.email
      }
    } catch (error) {
      logger.error('Error validating verification token:', error)
      return { valid: false, error: 'Token validation failed' }
    }
  }

  async markTokenAsUsed(token: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('verification_tokens')
        .update({ used: true, used_at: new Date().toISOString() })
        .eq('token', token)

      if (error) {
        logger.error('Failed to mark token as used:', error)
      }
    } catch (error) {
      logger.error('Error marking token as used:', error)
    }
  }

  async cleanupExpiredTokens(): Promise<void> {
    try {
      const now = new Date().toISOString()
      
      const { error } = await supabase
        .from('verification_tokens')
        .delete()
        .lt('expires_at', now)

      if (error) {
        logger.error('Failed to cleanup expired tokens:', error)
      } else {
        logger.info('Cleaned up expired verification tokens')
      }
    } catch (error) {
      logger.error('Error cleaning up expired tokens:', error)
    }
  }

  generateVerificationUrl(token: string, type: 'email_verification' | 'password_reset' = 'email_verification'): string {
    const endpoint = type === 'email_verification' ? 'verify-email' : 'reset-password'
    return `${config.FRONTEND_URL}/auth/${endpoint}?token=${token}`
  }

  async getUserByEmail(email: string): Promise<{ userId?: string; username?: string } | null> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('user_id, username')
        .eq('email', email)
        .single()

      if (error || !profile) {
        return null
      }

      return {
        userId: profile.user_id,
        username: profile.username
      }
    } catch (error) {
      logger.error('Error getting user by email:', error)
      return null
    }
  }

  async getUserByUserId(userId: string): Promise<{ email?: string; username?: string; displayName?: string } | null> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('username, display_name')
        .eq('user_id', userId)
        .single()

      if (error || !profile) {
        return null
      }

      // Get email from auth users table
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId)
      
      if (authError || !authUser.user) {
        return null
      }

      return {
        email: authUser.user.email,
        username: profile.username,
        displayName: profile.display_name
      }
    } catch (error) {
      logger.error('Error getting user by user ID:', error)
      return null
    }
  }
}

export const verificationService = new VerificationService()
