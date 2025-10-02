/**
 * Local SQLite Database Service for Development
 * This provides a local database solution when Supabase is not available
 */

import { Database } from './supabase-types'
import { v4 as uuidv4 } from 'uuid'

type Profile = Database['public']['Tables']['profiles']['Row']
type Post = Database['public']['Tables']['posts']['Row']
type Like = Database['public']['Tables']['likes']['Row']
type Comment = Database['public']['Tables']['comments']['Row']
type Follow = Database['public']['Tables']['follows']['Row']

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

// Local database service
export class LocalDatabase {
  private profiles: Database['public']['Tables']['profiles']['Row'][] = [...mockProfiles]
  private posts: Database['public']['Tables']['posts']['Row'][] = [...mockPosts]
  private comments: Database['public']['Tables']['comments']['Row'][] = [...mockComments]
  private likes: Database['public']['Tables']['likes']['Row'][] = [...mockLikes]
  private follows: Database['public']['Tables']['follows']['Row'][] = []

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
      .filter(c => c.post_id === postId && !c.parent_comment_id && !c.is_deleted)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(offset, offset + limit)

    // Get user profiles for comments and their replies
    const commentsWithProfiles = postComments.map(comment => {
      const profile = this.profiles.find(p => p.user_id === comment.user_id)
      
      // Get replies for this comment
      const replies = this.comments
        .filter(c => c.parent_comment_id === comment.id && !c.is_deleted)
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
    return this.comments.filter(c => c.post_id === postId && !c.parent_comment_id && !c.is_deleted).length
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

  // Search
  async searchPosts(query: string, limit = 20, offset = 0) {
    const searchTerm = query.toLowerCase()
    const filteredPosts = this.posts.filter(p => 
      p.content?.toLowerCase().includes(searchTerm) ||
      p.category?.toLowerCase().includes(searchTerm) ||
      p.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    )
    
    return filteredPosts.slice(offset, offset + limit)
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

  // Reset database (for testing)
  reset() {
    this.profiles = [...mockProfiles]
    this.posts = [...mockPosts]
    this.comments = [...mockComments]
    this.likes = [...mockLikes]
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
