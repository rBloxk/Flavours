import { supabase } from '../config/supabase'
import { logger } from '../utils/logger'
import { v4 as uuidv4 } from 'uuid'

export interface CreatePostData {
  content: string
  isPaid: boolean
  price?: number
  isPreview: boolean
  tags?: string[]
  scheduledAt?: string
  creatorId: string
  files?: any[]
}

export interface GetPostsParams {
  page: number
  limit: number
  creatorId?: string
  isPaid?: boolean
  search?: string
}

export interface GetCommentsParams {
  page: number
  limit: number
}

export class ContentService {
  /**
   * Create a new post
   */
  async createPost(data: CreatePostData) {
    try {
      // Upload media files if any
      const mediaAssets = []
      if (data.files && data.files.length > 0) {
        for (const file of data.files) {
          const mediaAsset = await this.uploadMedia(file, data.creatorId)
          mediaAssets.push(mediaAsset)
        }
      }

      // Create post
      const { data: post, error } = await supabase
        .from('posts')
        .insert({
          creator_id: data.creatorId,
          content: data.content,
          is_paid: data.isPaid,
          price: data.price,
          is_preview: data.isPreview,
          tags: data.tags,
          scheduled_at: data.scheduledAt,
          media_assets: mediaAssets.map(asset => asset.id)
        })
        .select(`
          *,
          creators (
            id,
            profiles (
              id,
              username,
              display_name,
              avatar_url
            )
          )
        `)
        .single()

      if (error) {
        logger.error('Create post error:', error)
        throw new Error('Failed to create post')
      }

      return post
    } catch (error) {
      logger.error('Create post service error:', error)
      throw error
    }
  }

  /**
   * Get posts with filtering and pagination
   */
  async getPosts(params: GetPostsParams) {
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          creators (
            id,
            profiles (
              id,
              username,
              display_name,
              avatar_url
            )
          ),
          media_assets (
            id,
            type,
            url,
            thumbnail_url,
            duration,
            size
          )
        `)
        .order('created_at', { ascending: false })

      if (params.creatorId) {
        query = query.eq('creator_id', params.creatorId)
      }

      if (params.isPaid !== undefined) {
        query = query.eq('is_paid', params.isPaid)
      }

      if (params.search) {
        query = query.or(`content.ilike.%${params.search}%,tags.cs.{${params.search}}`)
      }

      const { data: posts, error } = await query
        .range(
          (params.page - 1) * params.limit,
          params.page * params.limit - 1
        )

      if (error) {
        logger.error('Get posts error:', error)
        throw new Error('Failed to fetch posts')
      }

      return posts || []
    } catch (error) {
      logger.error('Get posts service error:', error)
      throw error
    }
  }

  /**
   * Get single post by ID
   */
  async getPost(id: string) {
    try {
      const { data: post, error } = await supabase
        .from('posts')
        .select(`
          *,
          creators (
            id,
            profiles (
              id,
              username,
              display_name,
              avatar_url
            )
          ),
          media_assets (
            id,
            type,
            url,
            thumbnail_url,
            duration,
            size
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        logger.error('Get post error:', error)
        return null
      }

      return post
    } catch (error) {
      logger.error('Get post service error:', error)
      throw error
    }
  }

  /**
   * Update post
   */
  async updatePost(id: string, updateData: any) {
    try {
      // Handle new media uploads if any
      if (updateData.files && updateData.files.length > 0) {
        const mediaAssets = []
        for (const file of updateData.files) {
          const mediaAsset = await this.uploadMedia(file, updateData.creatorId)
          mediaAssets.push(mediaAsset)
        }
        updateData.media_assets = mediaAssets.map(asset => asset.id)
      }

      // Remove files from updateData before database update
      delete updateData.files

      const { data: post, error } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          creators (
            id,
            profiles (
              id,
              username,
              display_name,
              avatar_url
            )
          )
        `)
        .single()

      if (error) {
        logger.error('Update post error:', error)
        throw new Error('Failed to update post')
      }

      return post
    } catch (error) {
      logger.error('Update post service error:', error)
      throw error
    }
  }

  /**
   * Delete post
   */
  async deletePost(id: string) {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)

      if (error) {
        logger.error('Delete post error:', error)
        throw new Error('Failed to delete post')
      }
    } catch (error) {
      logger.error('Delete post service error:', error)
      throw error
    }
  }

  /**
   * Toggle like on post
   */
  async toggleLike(postId: string, userId: string) {
    try {
      // Check if user already liked the post
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single()

      if (existingLike) {
        // Unlike the post
        await supabase
          .from('likes')
          .delete()
          .eq('id', existingLike.id)

        // Update likes count
        await supabase.rpc('decrement_likes_count', { post_id: postId })

        return { liked: false, likesCount: await this.getLikesCount(postId) }
      } else {
        // Like the post
        await supabase
          .from('likes')
          .insert({
            post_id: postId,
            user_id: userId
          })

        // Update likes count
        await supabase.rpc('increment_likes_count', { post_id: postId })

        return { liked: true, likesCount: await this.getLikesCount(postId) }
      }
    } catch (error) {
      logger.error('Toggle like error:', error)
      throw error
    }
  }

  /**
   * Add comment to post
   */
  async addComment(postId: string, userId: string, content: string) {
    try {
      const { data: comment, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: userId,
          content
        })
        .select(`
          *,
          profiles (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .single()

      if (error) {
        logger.error('Add comment error:', error)
        throw new Error('Failed to add comment')
      }

      // Update comments count
      await supabase.rpc('increment_comments_count', { post_id: postId })

      return comment
    } catch (error) {
      logger.error('Add comment service error:', error)
      throw error
    }
  }

  /**
   * Get comments for post
   */
  async getComments(postId: string, params: GetCommentsParams) {
    try {
      const { data: comments, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false })
        .range(
          (params.page - 1) * params.limit,
          params.page * params.limit - 1
        )

      if (error) {
        logger.error('Get comments error:', error)
        throw new Error('Failed to fetch comments')
      }

      return comments || []
    } catch (error) {
      logger.error('Get comments service error:', error)
      throw error
    }
  }

  /**
   * Delete comment
   */
  async deleteComment(commentId: string, userId: string) {
    try {
      // Verify ownership
      const { data: comment } = await supabase
        .from('comments')
        .select('post_id')
        .eq('id', commentId)
        .eq('user_id', userId)
        .single()

      if (!comment) {
        throw new Error('Comment not found or not authorized')
      }

      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

      if (error) {
        logger.error('Delete comment error:', error)
        throw new Error('Failed to delete comment')
      }

      // Update comments count
      await supabase.rpc('decrement_comments_count', { post_id: comment.post_id })
    } catch (error) {
      logger.error('Delete comment service error:', error)
      throw error
    }
  }

  /**
   * Report post
   */
  async reportPost(postId: string, userId: string, reason: string, description?: string) {
    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          post_id: postId,
          user_id: userId,
          reason,
          description
        })

      if (error) {
        logger.error('Report post error:', error)
        throw new Error('Failed to report post')
      }
    } catch (error) {
      logger.error('Report post service error:', error)
      throw error
    }
  }

  /**
   * Get creator's posts
   */
  async getCreatorPosts(creatorId: string, params: GetPostsParams) {
    return this.getPosts({
      ...params,
      creatorId
    })
  }

  /**
   * Get trending posts
   */
  async getTrendingPosts(params: GetPostsParams) {
    try {
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          *,
          creators (
            id,
            profiles (
              id,
              username,
              display_name,
              avatar_url
            )
          )
        `)
        .order('likes_count', { ascending: false })
        .order('created_at', { ascending: false })
        .range(
          (params.page - 1) * params.limit,
          params.page * params.limit - 1
        )

      if (error) {
        logger.error('Get trending posts error:', error)
        throw new Error('Failed to fetch trending posts')
      }

      return posts || []
    } catch (error) {
      logger.error('Get trending posts service error:', error)
      throw error
    }
  }

  /**
   * Upload media file
   */
  private async uploadMedia(file: Express.Multer.File, creatorId: string) {
    try {
      // Generate unique filename
      const fileExtension = file.originalname.split('.').pop()
      const fileName = `${uuidv4()}.${fileExtension}`
      
      // In a real implementation, you would upload to S3 or similar
      // For now, we'll simulate the upload
      const mediaAsset = {
        id: uuidv4(),
        type: file.mimetype.startsWith('image/') ? 'image' : 
              file.mimetype.startsWith('video/') ? 'video' : 'audio',
        url: `https://storage.example.com/media/${fileName}`,
        thumbnail_url: file.mimetype.startsWith('image/') ? 
                      `https://storage.example.com/media/${fileName}` : 
                      `https://storage.example.com/thumbnails/${fileName}`,
        size: file.size,
        duration: file.mimetype.startsWith('video/') ? 120 : null, // Simulate duration
        content_hash: 'simulated_hash',
        is_processed: true
      }

      // Save to database
      const { data, error } = await supabase
        .from('media_assets')
        .insert(mediaAsset)
        .select()
        .single()

      if (error) {
        logger.error('Upload media error:', error)
        throw new Error('Failed to upload media')
      }

      return data
    } catch (error) {
      logger.error('Upload media service error:', error)
      throw error
    }
  }

  /**
   * Get likes count for post
   */
  private async getLikesCount(postId: string): Promise<number> {
    try {
      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact' })
        .eq('post_id', postId)

      return count || 0
    } catch (error) {
      logger.error('Get likes count error:', error)
      return 0
    }
  }

  /**
   * Search posts
   */
  async searchPosts(params: { query: string; page: number; limit: number; category?: string }) {
    try {
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_creator_id_fkey (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .textSearch('content', params.query)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .range(
          (params.page - 1) * params.limit,
          params.page * params.limit - 1
        )

      if (error) {
        logger.error('Search posts error:', error)
        throw new Error('Failed to search posts')
      }

      return posts || []
    } catch (error) {
      logger.error('Search posts service error:', error)
      throw error
    }
  }

  /**
   * Get post interactions
   */
  async getPostInteractions(postId: string, userId: string) {
    try {
      const [likes, comments, shares] = await Promise.all([
        this.getLikesCount(postId),
        this.getCommentsCount(postId),
        this.getSharesCount(postId)
      ])

      // Check if user has liked the post
      const { data: userLike } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single()

      return {
        likes,
        comments,
        shares,
        isLiked: !!userLike
      }
    } catch (error) {
      logger.error('Get post interactions error:', error)
      throw error
    }
  }

  /**
   * Share post
   */
  async sharePost(postId: string, userId: string, platform: string, message?: string) {
    try {
      const { data, error } = await supabase
        .from('shares')
        .insert({
          post_id: postId,
          user_id: userId,
          platform,
          message
        })
        .select()
        .single()

      if (error) {
        logger.error('Share post error:', error)
        throw new Error('Failed to share post')
      }

      return data
    } catch (error) {
      logger.error('Share post service error:', error)
      throw error
    }
  }

  /**
   * Get content analytics
   */
  async getContentAnalytics(userId: string, period: string) {
    try {
      const dateRange = this.getDateRange(period)
      
      const [posts, likes, comments, shares] = await Promise.all([
        this.getPostsCount(userId, dateRange),
        this.getLikesReceived(userId, dateRange),
        this.getCommentsReceived(userId, dateRange),
        this.getSharesReceived(userId, dateRange)
      ])

      return {
        posts,
        likes,
        comments,
        shares,
        engagement: likes + comments + shares,
        period
      }
    } catch (error) {
      logger.error('Get content analytics error:', error)
      throw error
    }
  }

  /**
   * Get posts count for user
   */
  private async getPostsCount(userId: string, dateRange: { start: Date; end: Date }): Promise<number> {
    try {
      const { count } = await supabase
        .from('posts')
        .select('*', { count: 'exact' })
        .eq('creator_id', userId)
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString())

      return count || 0
    } catch (error) {
      logger.error('Get posts count error:', error)
      return 0
    }
  }

  /**
   * Get likes received by user
   */
  private async getLikesReceived(userId: string, dateRange: { start: Date; end: Date }): Promise<number> {
    try {
      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact' })
        .eq('posts.creator_id', userId)
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString())

      return count || 0
    } catch (error) {
      logger.error('Get likes received error:', error)
      return 0
    }
  }

  /**
   * Get comments received by user
   */
  private async getCommentsReceived(userId: string, dateRange: { start: Date; end: Date }): Promise<number> {
    try {
      const { count } = await supabase
        .from('comments')
        .select('*', { count: 'exact' })
        .eq('posts.creator_id', userId)
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString())

      return count || 0
    } catch (error) {
      logger.error('Get comments received error:', error)
      return 0
    }
  }

  /**
   * Get shares received by user
   */
  private async getSharesReceived(userId: string, dateRange: { start: Date; end: Date }): Promise<number> {
    try {
      const { count } = await supabase
        .from('shares')
        .select('*', { count: 'exact' })
        .eq('posts.creator_id', userId)
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString())

      return count || 0
    } catch (error) {
      logger.error('Get shares received error:', error)
      return 0
    }
  }

  /**
   * Get comments count for post
   */
  private async getCommentsCount(postId: string): Promise<number> {
    try {
      const { count } = await supabase
        .from('comments')
        .select('*', { count: 'exact' })
        .eq('post_id', postId)

      return count || 0
    } catch (error) {
      logger.error('Get comments count error:', error)
      return 0
    }
  }

  /**
   * Get shares count for post
   */
  private async getSharesCount(postId: string): Promise<number> {
    try {
      const { count } = await supabase
        .from('shares')
        .select('*', { count: 'exact' })
        .eq('post_id', postId)

      return count || 0
    } catch (error) {
      logger.error('Get shares count error:', error)
      return 0
    }
  }

  /**
   * Get date range for analytics
   */
  private getDateRange(period: string): { start: Date; end: Date } {
    const end = new Date()
    const start = new Date()

    switch (period) {
      case '7d':
        start.setDate(end.getDate() - 7)
        break
      case '30d':
        start.setDate(end.getDate() - 30)
        break
      case '90d':
        start.setDate(end.getDate() - 90)
        break
      case '1y':
        start.setFullYear(end.getFullYear() - 1)
        break
      default:
        start.setDate(end.getDate() - 30)
    }

    return { start, end }
  }

  /**
   * Toggle save post
   */
  async toggleSave(postId: string, userId: string) {
    try {
      // Check if already saved
      const { data: existingSave } = await supabase
        .from('saved_posts')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single()

      if (existingSave) {
        // Remove from saved
        await supabase
          .from('saved_posts')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId)
        
        return { saved: false }
      } else {
        // Add to saved
        await supabase
          .from('saved_posts')
          .insert({
            post_id: postId,
            user_id: userId
          })
        
        return { saved: true }
      }
    } catch (error) {
      logger.error('Toggle save error:', error)
      throw error
    }
  }

  /**
   * Toggle favorite post
   */
  async toggleFavorite(postId: string, userId: string) {
    try {
      // Check if already favorited
      const { data: existingFavorite } = await supabase
        .from('favorite_posts')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single()

      if (existingFavorite) {
        // Remove from favorites
        await supabase
          .from('favorite_posts')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId)
        
        return { favorited: false }
      } else {
        // Add to favorites
        await supabase
          .from('favorite_posts')
          .insert({
            post_id: postId,
            user_id: userId
          })
        
        return { favorited: true }
      }
    } catch (error) {
      logger.error('Toggle favorite error:', error)
      throw error
    }
  }

  /**
   * Get saved posts
   */
  async getSavedPosts(userId: string, params: { page: number; limit: number }) {
    try {
      const { data: posts, error } = await supabase
        .from('saved_posts')
        .select(`
          *,
          posts!saved_posts_post_id_fkey (
            *,
            profiles!posts_creator_id_fkey (
              id,
              username,
              display_name,
              avatar_url
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(
          (params.page - 1) * params.limit,
          params.page * params.limit - 1
        )

      if (error) {
        logger.error('Get saved posts error:', error)
        throw new Error('Failed to fetch saved posts')
      }

      return posts?.map(item => item.posts).filter(Boolean) || []
    } catch (error) {
      logger.error('Get saved posts service error:', error)
      throw error
    }
  }

  /**
   * Get favorite posts
   */
  async getFavoritePosts(userId: string, params: { page: number; limit: number }) {
    try {
      const { data: posts, error } = await supabase
        .from('favorite_posts')
        .select(`
          *,
          posts!favorite_posts_post_id_fkey (
            *,
            profiles!posts_creator_id_fkey (
              id,
              username,
              display_name,
              avatar_url
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(
          (params.page - 1) * params.limit,
          params.page * params.limit - 1
        )

      if (error) {
        logger.error('Get favorite posts error:', error)
        throw new Error('Failed to fetch favorite posts')
      }

      return posts?.map(item => item.posts).filter(Boolean) || []
    } catch (error) {
      logger.error('Get favorite posts service error:', error)
      throw error
    }
  }

  /**
   * Get post insights
   */
  async getPostInsights(postId: string) {
    try {
      const [likes, comments, shares, views] = await Promise.all([
        this.getLikesCount(postId),
        this.getCommentsCount(postId),
        this.getSharesCount(postId),
        this.getViewsCount(postId)
      ])

      return {
        likes,
        comments,
        shares,
        views,
        engagement: likes + comments + shares,
        engagementRate: views > 0 ? ((likes + comments + shares) / views) * 100 : 0
      }
    } catch (error) {
      logger.error('Get post insights error:', error)
      throw error
    }
  }

  /**
   * Get views count for post
   */
  private async getViewsCount(postId: string): Promise<number> {
    try {
      const { count } = await supabase
        .from('post_views')
        .select('*', { count: 'exact' })
        .eq('post_id', postId)

      return count || 0
    } catch (error) {
      logger.error('Get views count error:', error)
      return 0
    }
  }

  /**
   * Get personalized feed
   */
  async getPersonalizedFeed(userId: string, params: { page: number; limit: number }) {
    try {
      // Get posts from followed users and trending posts
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_creator_id_fkey (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('is_public', true)
        .order('likes_count', { ascending: false })
        .order('created_at', { ascending: false })
        .range(
          (params.page - 1) * params.limit,
          params.page * params.limit - 1
        )

      if (error) {
        logger.error('Get personalized feed error:', error)
        throw new Error('Failed to fetch personalized feed')
      }

      return posts || []
    } catch (error) {
      logger.error('Get personalized feed service error:', error)
      throw error
    }
  }
}
