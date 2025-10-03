/**
 * Local SQLite Database Service for Development
 * This provides a local database solution when Supabase is not available
 */

import { Database } from './supabase-types'
import { v4 as uuidv4 } from 'uuid'

type Profile = Database['public']['Tables']['profiles']['Row']
type Post = Database['public']['Tables']['posts']['Row']
type Like = Database['public']['Tables']['likes']['Row']
type Comment = Database['public']['Tables']['comments']['Row'] & {
  is_deleted?: boolean
}
type Follow = Database['public']['Tables']['follows']['Row']

interface Notification {
  id: string
  user_id: string
  type: 'like' | 'comment' | 'follow' | 'mention' | 'system'
  title: string
  message: string
  is_read: boolean
  read_at: string | null
  related_id?: string
  related_type?: 'post' | 'comment' | 'user'
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

interface Conversation {
  id: string
  user1_id: string
  user2_id: string
  last_message_id?: string
  last_message_at?: string
  created_at: string
  updated_at: string
}

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  recipient_id: string
  content: string
  type: 'text' | 'image' | 'video'
  media_url?: string
  is_read: boolean
  read_at?: string
  created_at: string
  updated_at: string
}

// Mock data for development
const mockProfiles = [
  {
    id: '1',
    user_id: 'demo-user-1759370026017',
    username: 'demo_user',
    display_name: 'Demo User',
    email: 'demo@example.com',
    avatar_url: 'https://ui-avatars.com/api/?name=Demo+User&background=random',
    bio: 'Demo user for development',
    website: null,
    location: 'San Francisco, CA',
    birth_date: null,
    is_verified: false,
    is_creator: false,
    role: 'user' as const,
    status: 'active',
    followers_count: 0,
    following_count: 0,
    posts_count: 1,
    total_earnings: 0,
    subscription_count: 0,
    last_active: new Date().toISOString(),
    last_login: new Date().toISOString(),
    admin_notes: null,
    tags: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    user_id: 'creator-1',
    username: 'jane_fitness',
    display_name: 'Jane Smith',
    email: 'jane@example.com',
    avatar_url: 'https://ui-avatars.com/api/?name=Jane+Smith&background=random',
    bio: 'Fitness enthusiast and content creator',
    website: null,
    location: 'Los Angeles, CA',
    birth_date: null,
    is_verified: true,
    is_creator: true,
    role: 'creator' as const,
    status: 'active',
    followers_count: 15600,
    following_count: 234,
    posts_count: 45,
    total_earnings: 2400.00,
    subscription_count: 1200,
    last_active: new Date().toISOString(),
    last_login: new Date().toISOString(),
    admin_notes: null,
    tags: ['fitness', 'lifestyle'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

const mockPosts = [
  {
    id: '1',
    user_id: 'demo-user-1759370026017',
    content: 'Testing the post creation functionality! This is a test post to see if the platform works correctly.',
    media_url: null,
    media_type: null,
    media_files: null,
    is_paid: false,
    price: 0,
    privacy: 'public' as const,
    tags: null,
    mentions: null,
    location: null,
    category: 'general',
    likes_count: 0,
    comments_count: 0,
    shares_count: 0,
    views_count: 0,
    engagement_rate: 0,
    virality_score: 5,
    freshness_score: 10,
    relevance_score: 5,
    quality_score: 5,
    trending_score: 5,
    is_featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    user_id: 'creator-1',
    content: 'New workout video is live! 💪 Who\'s ready to sweat with me? This 30-minute HIIT session will challenge every muscle group. Perfect for beginners and advanced athletes alike! #FitnessMotivation #HIIT #Workout',
    media_url: null,
    media_type: null,
    media_files: null,
    is_paid: false,
    price: 0,
    privacy: 'public' as const,
    tags: ['fitness', 'workout', 'HIIT'],
    mentions: null,
    location: null,
    category: 'fitness',
    likes_count: 180,
    comments_count: 95,
    shares_count: 23,
    views_count: 2340,
    engagement_rate: 12.5,
    virality_score: 8.7,
    freshness_score: 9.1,
    relevance_score: 8.5,
    quality_score: 9.0,
    trending_score: 8.8,
    is_featured: true,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  }
]

const mockComments = [
  {
    id: '1',
    post_id: '2',
    user_id: 'demo-user-1759370026017',
    parent_comment_id: null,
    content: 'Amazing workout! Can\'t wait to try this.',
    likes_count: 3,
    replies_count: 0,
    is_edited: false,
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  }
]

const mockLikes = [
  {
    id: '1',
    user_id: 'demo-user-1759370026017',
    post_id: '1',
    created_at: new Date().toISOString()
  }
]

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    user_id: 'demo-user-1759370026017',
    type: 'like',
    title: 'New Like',
    message: 'Jane Smith liked your post',
    is_read: false,
    read_at: null,
    related_id: '1',
    related_type: 'post',
    metadata: { actor_username: 'jane_fitness' },
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: 'notif-2',
    user_id: 'demo-user-1759370026017',
    type: 'comment',
    title: 'New Comment',
    message: 'John Doe commented on your post',
    is_read: false,
    read_at: null,
    related_id: '1',
    related_type: 'post',
    metadata: { actor_username: 'john_doe' },
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    updated_at: new Date(Date.now() - 1000 * 60 * 60).toISOString()
  },
  {
    id: 'notif-3',
    user_id: 'demo-user-1759370026017',
    type: 'follow',
    title: 'New Follower',
    message: 'Sarah Wilson started following you',
    is_read: true,
    read_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    related_id: 'creator-2',
    related_type: 'user',
    metadata: { actor_username: 'sarah_wilson' },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    updated_at: new Date(Date.now() - 1000 * 60 * 15).toISOString()
  }
]

// Mock conversations and messages data
const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    user1_id: 'demo-user-1759370026017',
    user2_id: 'creator-1',
    last_message_id: 'msg-1',
    last_message_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 15).toISOString()
  }
]

const mockMessages: Message[] = [
  {
    id: 'msg-1',
    conversation_id: 'conv-1',
    sender_id: 'creator-1',
    recipient_id: 'demo-user-1759370026017',
    content: 'Hey! Thanks for following me. How are you doing?',
    type: 'text',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 15).toISOString()
  },
  {
    id: 'msg-2',
    conversation_id: 'conv-1',
    sender_id: 'demo-user-1759370026017',
    recipient_id: 'creator-1',
    content: 'Hi! I\'m doing great, thanks for asking. Love your fitness content!',
    type: 'text',
    is_read: true,
    read_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 10).toISOString()
  }
]

// Local database service
export class LocalDatabase {
  private profiles: Database['public']['Tables']['profiles']['Row'][] = [...mockProfiles]
  private posts: Database['public']['Tables']['posts']['Row'][] = [...mockPosts]
  private comments: Database['public']['Tables']['comments']['Row'][] = [...mockComments]
  private likes: Database['public']['Tables']['likes']['Row'][] = [...mockLikes]
  private follows: Database['public']['Tables']['follows']['Row'][] = []
  private notifications: Notification[] = [...mockNotifications]
  private conversations: Conversation[] = [...mockConversations]
  private messages: Message[] = [...mockMessages]

  // Profiles
  async getProfiles(limit = 20, offset = 0) {
    return this.profiles.slice(offset, offset + limit)
  }

  async getProfileById(id: string) {
    return this.profiles.find(p => p.id === id || p.user_id === id)
  }

  async getProfileByUsername(username: string) {
    return this.profiles.find(p => p.username === username)
  }

  async createProfile(profile: Database['public']['Tables']['profiles']['Insert']) {
    const newProfile: Database['public']['Tables']['profiles']['Row'] = {
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...profile
    } as Database['public']['Tables']['profiles']['Row']
    
    this.profiles.push(newProfile)
    return newProfile
  }

  async updateProfile(id: string, updates: Database['public']['Tables']['profiles']['Update']) {
    const index = this.profiles.findIndex(p => p.id === id || p.user_id === id)
    if (index === -1) return null

    this.profiles[index] = {
      ...this.profiles[index],
      ...updates,
      updated_at: new Date().toISOString()
    }
    return this.profiles[index]
  }

  // Posts
  async getPosts(limit = 20, offset = 0, userId?: string) {
    let filteredPosts = this.posts
    if (userId) {
      filteredPosts = this.posts.filter(p => p.user_id === userId)
    }
    return filteredPosts.slice(offset, offset + limit)
  }

  async getPostById(id: string) {
    return this.posts.find(p => p.id === id)
  }

  async createPost(post: Database['public']['Tables']['posts']['Insert']) {
    const newPost: Database['public']['Tables']['posts']['Row'] = {
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...post
    } as Database['public']['Tables']['posts']['Row']
    
    this.posts.unshift(newPost) // Add to beginning for feed order
    return newPost
  }

  async updatePost(id: string, updates: Database['public']['Tables']['posts']['Update']) {
    const index = this.posts.findIndex(p => p.id === id)
    if (index === -1) return null

    this.posts[index] = {
      ...this.posts[index],
      ...updates,
      updated_at: new Date().toISOString()
    }
    return this.posts[index]
  }

  async deletePost(id: string) {
    const index = this.posts.findIndex(p => p.id === id)
    if (index === -1) return false

    this.posts.splice(index, 1)
    return true
  }

  // Comments
  async createComment(commentData: Omit<Comment, 'id' | 'created_at' | 'updated_at'>) {
    const newComment: Comment = {
      id: uuidv4(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...commentData,
      parent_comment_id: commentData.parent_comment_id || null,
      likes_count: 0,
      replies_count: 0,
      is_edited: false,
      is_deleted: false
    }
    this.comments.push(newComment)
    
    // Update comment count on post
    const post = this.posts.find(p => p.id === commentData.post_id)
    if (post) {
      post.comments_count = (post.comments_count || 0) + 1
    }
    
    return newComment
  }

  async getComments(postId: string, limit = 20, offset = 0) {
    const postComments = this.comments
      .filter(c => c.post_id === postId && !c.parent_comment_id && !(c as any).is_deleted)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(offset, offset + limit)

    // Get user profiles for comments and their replies
    const commentsWithProfiles = postComments.map(comment => {
      const profile = this.profiles.find(p => p.user_id === comment.user_id)
      
      // Get replies for this comment
      const replies = this.comments
        .filter(c => c.parent_comment_id === comment.id && !(c as any).is_deleted)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map(reply => {
          const replyProfile = this.profiles.find(p => p.user_id === reply.user_id)
          return {
            ...reply,
            profiles: {
              username: replyProfile?.username || 'unknown',
              display_name: replyProfile?.display_name || 'Unknown User',
              avatar_url: replyProfile?.avatar_url || 'https://ui-avatars.com/api/?name=Unknown&background=random',
              is_verified: replyProfile?.is_verified || false
            }
          }
        })

      return {
        ...comment,
        profiles: {
          username: profile?.username || 'unknown',
          display_name: profile?.display_name || 'Unknown User',
          avatar_url: profile?.avatar_url || 'https://ui-avatars.com/api/?name=Unknown&background=random',
          is_verified: profile?.is_verified || false
        },
        replies
      }
    })

    return commentsWithProfiles
  }

  async getCommentCount(postId: string) {
    return this.comments.filter(c => c.post_id === postId && !c.parent_comment_id && !(c as any).is_deleted).length
  }

  async getCommentById(commentId: string) {
    return this.comments.find(c => c.id === commentId)
  }

  // Follows
  async toggleFollow(followerId: string, followingId: string) {
    const existingFollow = this.follows.find(
      f => f.follower_id === followerId && f.following_id === followingId
    )

    if (existingFollow) {
      // Unfollow
      this.follows = this.follows.filter(f => f.id !== existingFollow.id)
      
      // Update follower counts
      const follower = this.profiles.find(p => p.user_id === followerId)
      const following = this.profiles.find(p => p.user_id === followingId)
      
      if (follower) follower.following_count = Math.max(0, (follower.following_count || 0) - 1)
      if (following) following.followers_count = Math.max(0, (following.followers_count || 0) - 1)
      
      return { isFollowing: false }
    } else {
      // Follow
      const newFollow: Follow = {
        id: uuidv4(),
        follower_id: followerId,
        following_id: followingId,
        created_at: new Date().toISOString()
      }
      this.follows.push(newFollow)
      
      // Update follower counts
      const follower = this.profiles.find(p => p.user_id === followerId)
      const following = this.profiles.find(p => p.user_id === followingId)
      
      if (follower) follower.following_count = (follower.following_count || 0) + 1
      if (following) following.followers_count = (following.followers_count || 0) + 1
      
      return { isFollowing: true }
    }
  }

  async isFollowing(followerId: string, followingId: string) {
    return this.follows.some(
      f => f.follower_id === followerId && f.following_id === followingId
    )
  }

  async getFollowers(userId: string, limit = 20, offset = 0) {
    const followerIds = this.follows
      .filter(f => f.following_id === userId)
      .map(f => f.follower_id)
      .slice(offset, offset + limit)
    
    return this.profiles.filter(p => followerIds.includes(p.user_id))
  }

  async getFollowing(userId: string, limit = 20, offset = 0) {
    const followingIds = this.follows
      .filter(f => f.follower_id === userId)
      .map(f => f.following_id)
      .slice(offset, offset + limit)
    
    return this.profiles.filter(p => followingIds.includes(p.user_id))
  }

  // Search
  async searchUsers(query: string, limit = 20, offset = 0) {
    const searchTerm = query.toLowerCase()
    const filteredProfiles = this.profiles.filter(profile => 
      profile.username?.toLowerCase().includes(searchTerm) ||
      profile.display_name?.toLowerCase().includes(searchTerm) ||
      profile.bio?.toLowerCase().includes(searchTerm)
    )
    
    return filteredProfiles.slice(offset, offset + limit)
  }

  async searchPosts(query: string, limit = 20, offset = 0) {
    const searchTerm = query.toLowerCase()
    const filteredPosts = this.posts.filter(post => 
      post.content?.toLowerCase().includes(searchTerm) ||
      post.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    )
    
    return filteredPosts.slice(offset, offset + limit)
  }

  async getTrendingCreators(limit = 10) {
    // Sort by follower count and recent activity
    return this.profiles
      .filter(p => p.is_creator)
      .sort((a, b) => (b.followers_count || 0) - (a.followers_count || 0))
      .slice(0, limit)
  }

  async getTrendingPosts(limit = 10) {
    // Sort by engagement metrics
    return this.posts
      .sort((a, b) => {
        const scoreA = (a.likes_count || 0) + (a.comments_count || 0) * 2
        const scoreB = (b.likes_count || 0) + (b.comments_count || 0) * 2
        return scoreB - scoreA
      })
      .slice(0, limit)
  }


  // Likes
  async getLikes(postId: string) {
    return this.likes.filter(l => l.post_id === postId)
  }

  async getUserLikes(userId: string) {
    return this.likes.filter(l => l.user_id === userId)
  }

  // Comment Likes
  async toggleCommentLike(userId: string, commentId: string) {
    const comment = this.comments.find(c => c.id === commentId)
    
    if (!comment) {
      throw new Error('Comment not found')
    }
    
    // Check if user already liked this comment
    // For now, we'll use a simple approach - in real implementation, you'd have a comment_likes table
    // We'll simulate this by checking if the user_id is in a "liked_by" array or similar
    // For demo purposes, let's use a simple approach with the comment's metadata
    
    const currentLikes = comment.likes_count || 0
    const isLiked = (comment as any).liked_by?.includes(userId) || false
    
    if (isLiked) {
      // Unlike: remove like
      comment.likes_count = Math.max(0, currentLikes - 1)
      // Remove user from liked_by array
      if ((comment as any).liked_by) {
        (comment as any).liked_by = (comment as any).liked_by.filter((id: string) => id !== userId)
      }
      return { 
        liked: false, 
        likesCount: comment.likes_count 
      }
    } else {
      // Like: add like
      comment.likes_count = currentLikes + 1
      // Add user to liked_by array
      if (!(comment as any).liked_by) {
        (comment as any).liked_by = []
      }
      (comment as any).liked_by.push(userId)
      return { 
        liked: true, 
        likesCount: comment.likes_count 
      }
    }
  }

  async toggleLike(userId: string, postId: string) {
    const existingLike = this.likes.find(l => l.user_id === userId && l.post_id === postId)
    
    if (existingLike) {
      // Remove like
      const index = this.likes.findIndex(l => l.id === existingLike.id)
      this.likes.splice(index, 1)
      
      // Update post likes count
      const post = this.posts.find(p => p.id === postId)
      if (post) {
        post.likes_count = Math.max(0, post.likes_count - 1)
      }
      
      return { liked: false, likesCount: post?.likes_count || 0 }
    } else {
      // Add like
      const newLike: Database['public']['Tables']['likes']['Row'] = {
        id: Date.now().toString(),
        user_id: userId,
        post_id: postId,
        created_at: new Date().toISOString()
      }
      
      this.likes.push(newLike)
      
      // Update post likes count
      const post = this.posts.find(p => p.id === postId)
      if (post) {
        post.likes_count += 1
      }
      
      return { liked: true, likesCount: post?.likes_count || 1 }
    }
  }


  async searchProfiles(query: string, limit = 20, offset = 0) {
    const searchTerm = query.toLowerCase()
    const filteredProfiles = this.profiles.filter(p => 
      p.username.toLowerCase().includes(searchTerm) ||
      p.display_name.toLowerCase().includes(searchTerm) ||
      p.bio?.toLowerCase().includes(searchTerm)
    )
    
    return filteredProfiles.slice(offset, offset + limit)
  }

  // Statistics
  async getStats() {
    return {
      totalUsers: this.profiles.length,
      totalPosts: this.posts.length,
      totalComments: this.comments.length,
      totalLikes: this.likes.length,
      activeUsers: this.profiles.filter(p => p.status === 'active').length,
      creators: this.profiles.filter(p => p.is_creator).length
    }
  }

  // Notifications
  async getNotifications(userId: string, options: { unreadOnly?: boolean; limit?: number; offset?: number } = {}) {
    let filteredNotifications = this.notifications.filter(n => n.user_id === userId)
    
    if (options.unreadOnly) {
      filteredNotifications = filteredNotifications.filter(n => !n.is_read)
    }
    
    // Sort by created_at descending (newest first)
    filteredNotifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    
    const limit = options.limit || 20
    const offset = options.offset || 0
    
    return filteredNotifications.slice(offset, offset + limit)
  }

  async getNotificationById(id: string) {
    return this.notifications.find(n => n.id === id)
  }

  async createNotification(notification: Omit<Notification, 'id' | 'created_at' | 'updated_at'>) {
    const newNotification: Notification = {
      id: uuidv4(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...notification
    }
    
    this.notifications.unshift(newNotification)
    return newNotification
  }

  async updateNotification(id: string, updates: Partial<Notification>) {
    const index = this.notifications.findIndex(n => n.id === id)
    if (index === -1) return null

    this.notifications[index] = {
      ...this.notifications[index],
      ...updates,
      updated_at: new Date().toISOString()
    }
    return this.notifications[index]
  }

  async deleteNotification(id: string) {
    const index = this.notifications.findIndex(n => n.id === id)
    if (index === -1) return false

    this.notifications.splice(index, 1)
    return true
  }

  async getUnreadNotificationCount(userId: string) {
    return this.notifications.filter(n => n.user_id === userId && !n.is_read).length
  }

  async markNotificationsAsRead(notificationIds: string[]) {
    notificationIds.forEach(id => {
      const index = this.notifications.findIndex(n => n.id === id)
      if (index !== -1) {
        this.notifications[index] = {
          ...this.notifications[index],
          is_read: true,
          read_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
    })
  }

  async markAllNotificationsAsRead(userId: string) {
    this.notifications.forEach((notification, index) => {
      if (notification.user_id === userId && !notification.is_read) {
        this.notifications[index] = {
          ...notification,
          is_read: true,
          read_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
    })
  }

  // Statistics
  async getUserStatistics(userId: string, options: { timeRange?: string; metric?: string; type?: string } = {}) {
    const profile = await this.getProfileById(userId)
    if (!profile) return null

    const timeRange = options.timeRange || '30d'
    const daysBack = this.getDaysFromTimeRange(timeRange)
    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000)

    // Get user's posts
    const userPosts = this.posts.filter(p => p.user_id === userId)
    const recentPosts = userPosts.filter(p => new Date(p.created_at) >= startDate)

    // Calculate basic metrics
    const totalViews = userPosts.reduce((sum, post) => sum + (post.views_count || 0), 0)
    const totalLikes = userPosts.reduce((sum, post) => sum + (post.likes_count || 0), 0)
    const totalComments = userPosts.reduce((sum, post) => sum + (post.comments_count || 0), 0)
    const totalShares = userPosts.reduce((sum, post) => sum + (post.shares_count || 0), 0)

    // Calculate engagement rate
    const totalEngagement = totalLikes + totalComments + totalShares
    const engagementRate = totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0

    // Get followers count
    const followersCount = this.follows.filter(f => f.following_id === userId).length

    // Calculate trends (mock data for now)
    const trends = {
      views: this.calculateTrend(totalViews, 0.12), // +12%
      likes: this.calculateTrend(totalLikes, 0.15), // +15%
      comments: this.calculateTrend(totalComments, 0.08), // +8%
      followers: this.calculateTrend(followersCount, 0.05), // +5%
      engagement: this.calculateTrend(engagementRate, 0.03) // +3%
    }

    // Content breakdown
    const contentBreakdown = {
      totalPosts: userPosts.length,
      recentPosts: recentPosts.length,
      images: userPosts.filter(p => p.media_type === 'image').length,
      videos: userPosts.filter(p => p.media_type === 'video').length,
      textPosts: userPosts.filter(p => !p.media_type).length
    }

    // Audience insights (mock data)
    const audienceInsights = {
      topCountries: [
        { country: 'United States', percentage: 45 },
        { country: 'Canada', percentage: 20 },
        { country: 'United Kingdom', percentage: 15 },
        { country: 'Australia', percentage: 12 },
        { country: 'Germany', percentage: 8 }
      ],
      ageGroups: [
        { range: '18-24', percentage: 25 },
        { range: '25-34', percentage: 35 },
        { range: '35-44', percentage: 22 },
        { range: '45-54', percentage: 12 },
        { range: '55+', percentage: 6 }
      ],
      genderDistribution: {
        male: 52,
        female: 45,
        other: 3
      }
    }

    return {
      overview: {
        totalViews,
        totalLikes,
        totalComments,
        totalShares,
        followersCount,
        followingCount: profile.following_count || 0,
        engagementRate: Math.round(engagementRate * 100) / 100,
        totalPosts: userPosts.length,
        avgWatchTime: 2.5, // Mock data
        clickThroughRate: 3.8 // Mock data
      },
      trends,
      contentBreakdown,
      audienceInsights,
      timeRange,
      period: `${daysBack} days`
    }
  }

  private getDaysFromTimeRange(timeRange: string): number {
    switch (timeRange) {
      case '7d': return 7
      case '30d': return 30
      case '90d': return 90
      case '1y': return 365
      default: return 30
    }
  }

  private calculateTrend(current: number, percentage: number): string {
    if (current === 0) {
      return '+0.0%'
    }
    const change = current * percentage
    const sign = change >= 0 ? '+' : ''
    return `${sign}${(percentage * 100).toFixed(1)}%`
  }

  // Messaging
  async getUserConversations(userId: string, options: { limit?: number; offset?: number } = {}) {
    const userConversations = this.conversations.filter(
      c => c.user1_id === userId || c.user2_id === userId
    )

    // Sort by last_message_at descending
    userConversations.sort((a, b) => {
      const timeA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0
      const timeB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0
      return timeB - timeA
    })

    const limit = options.limit || 20
    const offset = options.offset || 0

    return userConversations.slice(offset, offset + limit)
  }

  async getConversationById(id: string) {
    return this.conversations.find(c => c.id === id)
  }

  async getConversationByUsers(user1Id: string, user2Id: string) {
    return this.conversations.find(
      c => (c.user1_id === user1Id && c.user2_id === user2Id) ||
           (c.user1_id === user2Id && c.user2_id === user1Id)
    )
  }

  async createConversation(conversation: Omit<Conversation, 'id' | 'created_at' | 'updated_at'>) {
    const newConversation: Conversation = {
      id: uuidv4(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...conversation
    }

    this.conversations.unshift(newConversation)
    return newConversation
  }

  async getConversationMessages(conversationId: string, options: { limit?: number; offset?: number } = {}) {
    const conversationMessages = this.messages.filter(m => m.conversation_id === conversationId)

    // Sort by created_at ascending (oldest first)
    conversationMessages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    const limit = options.limit || 50
    const offset = options.offset || 0

    return conversationMessages.slice(offset, offset + limit)
  }

  async createMessage(message: Omit<Message, 'id' | 'created_at' | 'updated_at'>) {
    const newMessage: Message = {
      id: uuidv4(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...message
    }

    this.messages.push(newMessage)

    // Update conversation's last message
    const conversationIndex = this.conversations.findIndex(c => c.id === message.conversation_id)
    if (conversationIndex !== -1) {
      this.conversations[conversationIndex] = {
        ...this.conversations[conversationIndex],
        last_message_id: newMessage.id,
        last_message_at: newMessage.created_at,
        updated_at: new Date().toISOString()
      }
    }

    return newMessage
  }

  async markMessageAsRead(messageId: string) {
    const messageIndex = this.messages.findIndex(m => m.id === messageId)
    if (messageIndex !== -1) {
      this.messages[messageIndex] = {
        ...this.messages[messageIndex],
        is_read: true,
        read_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
  }

  async getUnreadMessageCount(userId: string) {
    return this.messages.filter(m => m.recipient_id === userId && !m.is_read).length
  }

  // Reset database (for testing)
  reset() {
    this.profiles = [...mockProfiles]
    this.posts = [...mockPosts]
    this.comments = [...mockComments]
    this.likes = [...mockLikes]
    this.notifications = [...mockNotifications]
    this.conversations = [...mockConversations]
    this.messages = [...mockMessages]
  }
}

// Singleton instance
export const localDatabase = new LocalDatabase()

// Mock Supabase client interface
export const createMockSupabaseClient = () => {
  return {
    from: (table: string) => ({
      select: (columns = '*') => ({
        eq: (column: string, value: any) => ({
          single: async () => {
            if (table === 'profiles') {
              const profile = await localDatabase.getProfileById(value)
              return { data: profile, error: profile ? null : { message: 'Not found' } }
            }
            if (table === 'posts') {
              const post = await localDatabase.getPostById(value)
              return { data: post, error: post ? null : { message: 'Not found' } }
            }
            return { data: null, error: { message: 'Table not found' } }
          },
          limit: (count: number) => ({
            order: (column: string, options: any) => ({
              range: (start: number, end: number) => ({
                then: async (resolve: any) => {
                  if (table === 'profiles') {
                    const profiles = await localDatabase.getProfiles(count, start)
                    resolve({ data: profiles, error: null })
                  }
                  if (table === 'posts') {
                    const posts = await localDatabase.getPosts(count, start)
                    resolve({ data: posts, error: null })
                  }
                  resolve({ data: [], error: null })
                }
              })
            })
          })
        }),
        limit: (count: number) => ({
          order: (column: string, options: any) => ({
            range: (start: number, end: number) => ({
              then: async (resolve: any) => {
                if (table === 'profiles') {
                  const profiles = await localDatabase.getProfiles(count, start)
                  resolve({ data: profiles, error: null })
                }
                if (table === 'posts') {
                  const posts = await localDatabase.getPosts(count, start)
                  resolve({ data: posts, error: null })
                }
                resolve({ data: [], error: null })
              }
            })
          })
        }),
        order: (column: string, options: any) => ({
          range: (start: number, end: number) => ({
            then: async (resolve: any) => {
              if (table === 'profiles') {
                const profiles = await localDatabase.getProfiles(20, start)
                resolve({ data: profiles, error: null })
              }
              if (table === 'posts') {
                const posts = await localDatabase.getPosts(20, start)
                resolve({ data: posts, error: null })
              }
              resolve({ data: [], error: null })
            }
          })
        })
      }),
      insert: (data: any) => ({
        select: () => ({
          then: async (resolve: any) => {
            if (table === 'profiles') {
              const profile = await localDatabase.createProfile(data)
              resolve({ data: [profile], error: null })
            }
            if (table === 'posts') {
              const post = await localDatabase.createPost(data)
              resolve({ data: [post], error: null })
            }
            resolve({ data: [], error: null })
          }
        })
      }),
      update: (updates: any) => ({
        eq: (column: string, value: any) => ({
          select: () => ({
            then: async (resolve: any) => {
              if (table === 'profiles') {
                const profile = await localDatabase.updateProfile(value, updates)
                resolve({ data: profile ? [profile] : [], error: null })
              }
              if (table === 'posts') {
                const post = await localDatabase.updatePost(value, updates)
                resolve({ data: post ? [post] : [], error: null })
              }
              resolve({ data: [], error: null })
            }
          })
        })
      }),
      delete: () => ({
        eq: (column: string, value: any) => ({
          then: async (resolve: any) => {
            if (table === 'posts') {
              const success = await localDatabase.deletePost(value)
              resolve({ data: success ? [{ id: value }] : [], error: null })
            }
            resolve({ data: [], error: null })
          }
        })
      })
    }),
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signUp: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => ({ data: { user: null }, error: null }),
      signOut: async () => ({ error: null })
    }
  }
}

export default localDatabase
