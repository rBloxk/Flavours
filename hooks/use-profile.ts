import { useState, useEffect, useCallback } from 'react'

interface ProfileData {
  id: string
  username: string
  email: string
  display_name: string
  avatar_url: string
  bio?: string
  location?: string
  website?: string
  is_creator: boolean
  is_verified: boolean
  created_at: string
  last_active: string
  followers_count: number
  following_count: number
  posts_count: number
  likes_received: number
  total_views: number
  subscription_price?: number
  total_earnings?: number
  subscription_count?: number
  interests: string[]
  social_links?: {
    twitter?: string
    instagram?: string
    youtube?: string
    tiktok?: string
  }
  privacy_settings: {
    profile_visibility: 'public' | 'followers' | 'private'
    show_email: boolean
    show_location: boolean
    show_website: boolean
  }
  verification_status?: 'pending' | 'verified' | 'rejected'
  age_verified: boolean
  email_verified: boolean
  phone_verified: boolean
  two_factor_enabled: boolean
}

interface Post {
  id: string
  user_id: string
  username: string
  display_name: string
  avatar_url: string
  content: string
  media?: {
    type: 'image' | 'video'
    url: string
    alt: string
    thumbnail?: string
    duration?: number
  }[]
  stats: {
    likes: number
    comments: number
    shares: number
    views: number
  }
  created_at: string
  updated_at: string
  privacy: 'public' | 'followers' | 'paid'
  tags: string[]
  is_liked?: boolean
  is_bookmarked?: boolean
}

interface PostsResponse {
  posts: Post[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  stats: {
    total: number
    images: number
    videos: number
    shortVideos: number
    text: number
    totalLikes: number
    totalComments: number
    totalViews: number
  }
}

export function useProfile(userId?: string, username?: string) {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [postsStats, setPostsStats] = useState<PostsResponse['stats'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [postsLoading, setPostsLoading] = useState(false)
  const [postsError, setPostsError] = useState<string | null>(null)

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (userId) params.append('userId', userId)
      if (username) params.append('username', username)

      const response = await fetch(`/api/profile?${params}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status}`)
      }

      const data = await response.json()
      setProfile(data.profile)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [userId, username])

  // Fetch user posts
  const fetchPosts = useCallback(async (type: string = 'all', page: number = 1, limit: number = 10) => {
    try {
      setPostsLoading(true)
      setPostsError(null)

      const params = new URLSearchParams({
        type,
        page: page.toString(),
        limit: limit.toString()
      })
      if (userId) params.append('userId', userId)
      if (username) params.append('username', username)

      const response = await fetch(`/api/profile/posts?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch posts')
      }

      const data: PostsResponse = await response.json()
      setPosts(data.posts)
      setPostsStats(data.stats)
      return data
    } catch (err) {
      setPostsError(err instanceof Error ? err.message : 'An error occurred')
      return null
    } finally {
      setPostsLoading(false)
    }
  }, [userId, username])

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<ProfileData>) => {
    try {
      if (!userId) {
        throw new Error('User ID is required for updates')
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, updates })
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const data = await response.json()
      setProfile(data.profile)
      return data
    } catch (err) {
      throw err
    }
  }, [userId])

  // Perform profile actions (follow, like, etc.)
  const performAction = useCallback(async (action: string, data?: any) => {
    try {
      if (!userId) {
        throw new Error('User ID is required for actions')
      }

      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userId, data })
      })

      if (!response.ok) {
        throw new Error('Failed to perform action')
      }

      const result = await response.json()
      
      // Update local state if needed
      if (action === 'follow' || action === 'unfollow') {
        setProfile(prev => prev ? { ...prev, followers_count: result.followers_count } : null)
      } else if (action === 'subscribe' || action === 'unsubscribe') {
        setProfile(prev => prev ? { ...prev, subscription_count: result.subscription_count } : null)
      } else if (action === 'like_post' || action === 'unlike_post') {
        setProfile(prev => prev ? { ...prev, likes_received: result.likes_received } : null)
      } else if (action === 'add_interest' || action === 'remove_interest') {
        setProfile(prev => prev ? { ...prev, interests: result.interests } : null)
      }

      return result
    } catch (err) {
      throw err
    }
  }, [userId])

  // Perform post actions (like, bookmark, share, view)
  const performPostAction = useCallback(async (postId: string, action: string) => {
    try {
      if (!userId) {
        throw new Error('User ID is required for post actions')
      }

      const response = await fetch('/api/profile/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, postId, userId })
      })

      if (!response.ok) {
        throw new Error('Failed to perform post action')
      }

      const result = await response.json()
      
      // Update local posts state
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              stats: { 
                ...post.stats, 
                ...(action === 'like' && { likes: result.likes }),
                ...(action === 'share' && { shares: result.shares }),
                ...(action === 'view' && { views: result.views })
              },
              ...(action === 'like' && { is_liked: result.is_liked }),
              ...(action === 'bookmark' && { is_bookmarked: result.is_bookmarked })
            }
          : post
      ))

      return result
    } catch (err) {
      throw err
    }
  }, [userId])

  // Load profile on mount
  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return {
    profile,
    posts,
    postsStats,
    loading,
    error,
    postsLoading,
    postsError,
    fetchProfile,
    fetchPosts,
    updateProfile,
    performAction,
    performPostAction
  }
}
