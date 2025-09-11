import { supabase } from '../config/database'
import { logger } from '../utils/logger'
import { redisManager } from '../config/redis'
import { v4 as uuidv4 } from 'uuid'

export interface UserProfile {
  id: string
  username: string
  display_name: string
  bio?: string
  avatar_url?: string
  cover_url?: string
  website?: string
  location?: string
  birth_date?: string
  is_verified: boolean
  is_private: boolean
  followers_count: number
  following_count: number
  posts_count: number
  created_at: string
  updated_at: string
}

export interface UserStats {
  followers_count: number
  following_count: number
  posts_count: number
  likes_received: number
  comments_received: number
  shares_received: number
}

export interface FollowResult {
  following: boolean
  followersCount: number
}

export interface BlockResult {
  blocked: boolean
}

export interface PaginationOptions {
  page: number
  limit: number
}

export class UserService {
  private readonly CACHE_TTL = 3600 // 1 hour

  async getProfileByUsername(username: string): Promise<UserProfile | null> {
    try {
      const cacheKey = `profile:username:${username}`
      
      // Try cache first
      const cached = await redisManager.get<UserProfile>(cacheKey)
      if (cached) {
        return cached
      }

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          display_name,
          bio,
          avatar_url,
          is_verified,
          created_at,
          updated_at
        `)
        .eq('username', username)
        .single()

      if (error) {
        logger.error('Error fetching profile by username:', error)
        return null
      }

      // Cache the result
      await redisManager.set(cacheKey, data, this.CACHE_TTL)
      
      return data
    } catch (error) {
      logger.error('Error in getProfileByUsername:', error)
      return null
    }
  }

  async getProfileByUserId(userId: string): Promise<UserProfile | null> {
    try {
      const cacheKey = `profile:user:${userId}`
      
      // Try cache first
      const cached = await redisManager.get<UserProfile>(cacheKey)
      if (cached) {
        return cached
      }

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          display_name,
          bio,
          avatar_url,
          is_verified,
          created_at,
          updated_at
        `)
        .eq('id', userId)
        .single()

      if (error) {
        logger.error('Error fetching profile by user ID:', error)
        return null
      }

      // Cache the result
      await redisManager.set(cacheKey, data, this.CACHE_TTL)
      
      return data
    } catch (error) {
      logger.error('Error in getProfileByUserId:', error)
      return null
    }
  }

  async updateProfile(userId: string, updateData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        logger.error('Error updating profile:', error)
        throw new Error('Failed to update profile')
      }

      // Invalidate cache
      await redisManager.del(`profile:user:${userId}`)
      await redisManager.del(`profile:username:${data.username}`)

      return data
    } catch (error) {
      logger.error('Error in updateProfile:', error)
      throw error
    }
  }

  async uploadProfilePicture(userId: string, file: Express.Multer.File): Promise<string> {
    try {
      // In a real implementation, you would upload to a cloud storage service
      // For now, we'll just return a placeholder URL
      const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`
      
      // Update the profile with the new avatar URL
      await this.updateProfile(userId, { avatar_url: avatarUrl })
      
      return avatarUrl
    } catch (error) {
      logger.error('Error uploading profile picture:', error)
      throw new Error('Failed to upload profile picture')
    }
  }

  async toggleFollow(userId: string, followerId: string): Promise<FollowResult> {
    try {
      // Check if already following
      const { data: existingFollow, error: checkError } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', followerId)
        .eq('following_id', userId)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      let following = false
      let followersCount = 0

      if (existingFollow) {
        // Unfollow
        const { error: unfollowError } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', followerId)
          .eq('following_id', userId)

        if (unfollowError) {
          throw unfollowError
        }

        following = false
      } else {
        // Follow
        const { error: followError } = await supabase
          .from('follows')
          .insert({
            id: uuidv4(),
            follower_id: followerId,
            following_id: userId,
            created_at: new Date().toISOString()
          })

        if (followError) {
          throw followError
        }

        following = true
      }

      // Update followers count
      const { count } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId)

      followersCount = count || 0

      // Update the profile's followers count
      await supabase
        .from('profiles')
        .update({ followers_count: followersCount })
        .eq('id', userId)

      // Invalidate cache
      await redisManager.del(`profile:user:${userId}`)

      return { following, followersCount }
    } catch (error) {
      logger.error('Error in toggleFollow:', error)
      throw error
    }
  }

  async getFollowers(userId: string, options: PaginationOptions): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          profiles!follows_follower_id_fkey (
            id,
            username,
            display_name,
            bio,
            avatar_url,
            is_verified,
            is_private,
            followers_count,
            following_count,
            posts_count,
            created_at
          )
        `)
        .eq('following_id', userId)
        .range(
          (options.page - 1) * options.limit,
          options.page * options.limit - 1
        )

      if (error) {
        logger.error('Error fetching followers:', error)
        return []
      }

      return data?.map(follow => follow.profiles).filter(Boolean) || []
    } catch (error) {
      logger.error('Error in getFollowers:', error)
      return []
    }
  }

  async getFollowing(userId: string, options: PaginationOptions): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          profiles!follows_following_id_fkey (
            id,
            username,
            display_name,
            bio,
            avatar_url,
            is_verified,
            is_private,
            followers_count,
            following_count,
            posts_count,
            created_at
          )
        `)
        .eq('follower_id', userId)
        .range(
          (options.page - 1) * options.limit,
          options.page * options.limit - 1
        )

      if (error) {
        logger.error('Error fetching following:', error)
        return []
      }

      return data?.map(follow => follow.profiles).filter(Boolean) || []
    } catch (error) {
      logger.error('Error in getFollowing:', error)
      return []
    }
  }

  async toggleBlock(userId: string, blockerId: string): Promise<BlockResult> {
    try {
      // Check if already blocked
      const { data: existingBlock, error: checkError } = await supabase
        .from('blocks')
        .select('id')
        .eq('blocker_id', blockerId)
        .eq('blocked_id', userId)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      let blocked = false

      if (existingBlock) {
        // Unblock
        const { error: unblockError } = await supabase
          .from('blocks')
          .delete()
          .eq('blocker_id', blockerId)
          .eq('blocked_id', userId)

        if (unblockError) {
          throw unblockError
        }

        blocked = false
      } else {
        // Block
        const { error: blockError } = await supabase
          .from('blocks')
          .insert({
            id: uuidv4(),
            blocker_id: blockerId,
            blocked_id: userId,
            created_at: new Date().toISOString()
          })

        if (blockError) {
          throw blockError
        }

        blocked = true
      }

      return { blocked }
    } catch (error) {
      logger.error('Error in toggleBlock:', error)
      throw error
    }
  }

  async getBlockedUsers(userId: string, options: PaginationOptions): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('blocks')
        .select(`
          profiles!blocks_blocked_id_fkey (
            id,
            username,
            display_name,
            bio,
            avatar_url,
            is_verified,
            is_private,
            followers_count,
            following_count,
            posts_count,
            created_at
          )
        `)
        .eq('blocker_id', userId)
        .range(
          (options.page - 1) * options.limit,
          options.page * options.limit - 1
        )

      if (error) {
        logger.error('Error fetching blocked users:', error)
        return []
      }

      return data?.map(block => block.profiles).filter(Boolean) || []
    } catch (error) {
      logger.error('Error in getBlockedUsers:', error)
      return []
    }
  }

  async searchUsers(query: string, options: PaginationOptions): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          display_name,
          bio,
          avatar_url,
          is_verified,
          is_private,
          followers_count,
          following_count,
          posts_count,
          created_at
        `)
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .range(
          (options.page - 1) * options.limit,
          options.page * options.limit - 1
        )

      if (error) {
        logger.error('Error searching users:', error)
        return []
      }

      return data || []
    } catch (error) {
      logger.error('Error in searchUsers:', error)
      return []
    }
  }

  async getUserStats(userId: string): Promise<UserStats> {
    try {
      const cacheKey = `stats:user:${userId}`
      
      // Try cache first
      const cached = await redisManager.get<UserStats>(cacheKey)
      if (cached) {
        return cached
      }

      // Get basic stats from profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('followers_count, following_count, posts_count')
        .eq('id', userId)
        .single()

      if (profileError) {
        logger.error('Error fetching user stats:', profileError)
        return {
          followers_count: 0,
          following_count: 0,
          posts_count: 0,
          likes_received: 0,
          comments_received: 0,
          shares_received: 0
        }
      }

      // Get additional stats (likes, comments, shares received)
      const [likesResult, commentsResult, sharesResult] = await Promise.all([
        supabase
          .from('post_likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_author_id', userId),
        supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_author_id', userId),
        supabase
          .from('post_shares')
          .select('*', { count: 'exact', head: true })
          .eq('post_author_id', userId)
      ])

      const stats: UserStats = {
        followers_count: profile.followers_count || 0,
        following_count: profile.following_count || 0,
        posts_count: profile.posts_count || 0,
        likes_received: likesResult.count || 0,
        comments_received: commentsResult.count || 0,
        shares_received: sharesResult.count || 0
      }

      // Cache the result
      await redisManager.set(cacheKey, stats, this.CACHE_TTL)

      return stats
    } catch (error) {
      logger.error('Error in getUserStats:', error)
      return {
        followers_count: 0,
        following_count: 0,
        posts_count: 0,
        likes_received: 0,
        comments_received: 0,
        shares_received: 0
      }
    }
  }

  async updateUserSettings(userId: string, settings: any): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          ...settings,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        logger.error('Error updating user settings:', error)
        throw new Error('Failed to update settings')
      }

      return data
    } catch (error) {
      logger.error('Error in updateUserSettings:', error)
      throw error
    }
  }

  async getNotifications(userId: string, options: PaginationOptions & { unreadOnly?: boolean }): Promise<any[]> {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (options.unreadOnly) {
        query = query.eq('is_read', false)
      }

      const { data, error } = await query
        .range(
          (options.page - 1) * options.limit,
          options.page * options.limit - 1
        )

      if (error) {
        logger.error('Error fetching notifications:', error)
        return []
      }

      return data || []
    } catch (error) {
      logger.error('Error in getNotifications:', error)
      return []
    }
  }

  async markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', userId)

      if (error) {
        logger.error('Error marking notification as read:', error)
        throw new Error('Failed to mark notification as read')
      }
    } catch (error) {
      logger.error('Error in markNotificationAsRead:', error)
      throw error
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) {
        logger.error('Error marking all notifications as read:', error)
        throw new Error('Failed to mark all notifications as read')
      }
    } catch (error) {
      logger.error('Error in markAllNotificationsAsRead:', error)
      throw error
    }
  }
}

