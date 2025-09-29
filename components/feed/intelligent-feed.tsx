"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CreatePostModal } from './create-post-modal'
import { FlavourTube } from './flavour-tube'
import { FlavourLicks } from './flavour-licks'
import { PostOptionsOverlay } from '@/components/ui/post-options-overlay'
import { useAuth } from '@/components/providers/auth-provider'
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Lock,
  Crown,
  Shield,
  Plus,
  Image,
  Video,
  Smile,
  Globe,
  Users,
  TrendingUp,
  Clock,
  Star,
  Zap,
  Eye,
  Bookmark,
  Filter,
  RefreshCw,
  Sparkles,
  Target,
  Brain,
  Play
} from 'lucide-react'
import { toast } from 'sonner'

// Advanced Feed Algorithm Types
interface UserProfile {
  id: string
  username: string
  displayName: string
  avatarUrl: string
  isVerified: boolean
  followerCount: number
  engagementRate: number
  category: string[]
  trustScore: number
  isFollowing: boolean
}

interface PostMetrics {
  likesCount: number
  commentsCount: number
  sharesCount: number
  viewsCount: number
  engagementRate: number
  viralityScore: number
  freshnessScore: number
  relevanceScore: number
}

interface Post {
  id: string
  creator: UserProfile
  content: string
  mediaUrl?: string
  mediaType?: 'image' | 'video' | 'gif'
  isPaid: boolean
  price?: number
  privacy: 'public' | 'followers' | 'paid'
  metrics: PostMetrics
  createdAt: string
  createdAtTimestamp: number
  tags: string[]
  category: string
  isLiked: boolean
  isBookmarked: boolean
  isFavorited: boolean
  isViewed: boolean
  qualityScore: number
  trendingScore: number
}

interface UserPreferences {
  interests: string[]
  preferredCategories: string[]
  engagementHistory: {
    likedPosts: string[]
    commentedPosts: string[]
    sharedPosts: string[]
    viewedPosts: string[]
    bookmarkedPosts: string[]
  }
  timeSpentOnPosts: Record<string, number>
  followingList: string[]
  blockedUsers: string[]
  preferredContentTypes: ('image' | 'video' | 'text')[]
  preferredPostLength: 'short' | 'medium' | 'long'
  activityPattern: {
    peakHours: number[]
    averageSessionLength: number
    preferredDays: string[]
  }
}

interface FeedAlgorithm {
  calculateEngagementScore: (post: Post, userPrefs: UserPreferences) => number
  calculateRelevanceScore: (post: Post, userPrefs: UserPreferences) => number
  calculateTrendingScore: (post: Post) => number
  calculateQualityScore: (post: Post) => number
  calculateDiversityScore: (posts: Post[], userPrefs: UserPreferences) => number
  rankPosts: (posts: Post[], userPrefs: UserPreferences) => Post[]
}

// Mock Data with Enhanced Metrics
const mockPosts: Post[] = [
  {
    id: '1',
    creator: {
      id: 'user_1',
      username: 'jane_fitness',
      displayName: 'Jane Smith',
      avatarUrl: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150',
      isVerified: true,
      followerCount: 125000,
      engagementRate: 8.5,
      category: ['fitness', 'wellness', 'motivation'],
      trustScore: 9.2,
      isFollowing: true
    },
    content: 'New workout video is live! 💪 Who\'s ready to sweat with me? This 30-minute HIIT session will challenge every muscle group. Perfect for beginners and advanced athletes alike! #FitnessMotivation #HIIT #Workout',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    mediaType: 'video',
    isPaid: false,
    privacy: 'public',
    metrics: {
      likesCount: 2340,
      commentsCount: 180,
      sharesCount: 95,
      viewsCount: 15600,
      engagementRate: 8.2,
      viralityScore: 7.8,
      freshnessScore: 9.5,
      relevanceScore: 8.9
    },
    createdAt: '2h',
    createdAtTimestamp: Date.now() - 2 * 60 * 60 * 1000,
    tags: ['fitness', 'workout', 'motivation', 'hiit'],
    category: 'fitness',
    isLiked: false,
    isBookmarked: false,
    isFavorited: false,
    isViewed: false,
    qualityScore: 9.1,
    trendingScore: 8.7
  },
  {
    id: '2',
    creator: {
      id: 'user_2',
      username: 'artist_maya',
      displayName: 'Maya Chen',
      avatarUrl: 'https://images.pexels.com/photos/1310522/pexels-photo-1310522.jpeg?auto=compress&cs=tinysrgb&w=150',
      isVerified: false,
      followerCount: 45000,
      engagementRate: 12.3,
      category: ['art', 'creativity', 'design'],
      trustScore: 8.7,
      isFollowing: false
    },
    content: 'Behind the scenes of my latest art piece 🎨✨ This took me 3 weeks to complete. The inspiration came from a dream I had about floating cities.',
    mediaUrl: 'https://images.pexels.com/photos/1047540/pexels-photo-1047540.jpeg?auto=compress&cs=tinysrgb&w=800',
    mediaType: 'image',
    isPaid: true,
    price: 15,
    privacy: 'paid',
    metrics: {
      likesCount: 890,
      commentsCount: 120,
      sharesCount: 45,
      viewsCount: 3200,
      engagementRate: 12.1,
      viralityScore: 6.2,
      freshnessScore: 8.8,
      relevanceScore: 7.5
    },
    createdAt: '4h',
    createdAtTimestamp: Date.now() - 4 * 60 * 60 * 1000,
    tags: ['art', 'creativity', 'behind-the-scenes', 'digital-art'],
    category: 'art',
    isLiked: false,
    isBookmarked: false,
    isFavorited: false,
    isViewed: false,
    qualityScore: 8.9,
    trendingScore: 7.2
  },
  {
    id: '3',
    creator: {
      id: 'user_3',
      username: 'chef_marco',
      displayName: 'Marco Rodriguez',
      avatarUrl: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150',
      isVerified: true,
      followerCount: 89000,
      engagementRate: 9.8,
      category: ['cooking', 'food', 'recipes'],
      trustScore: 9.5,
      isFollowing: true
    },
    content: 'Exclusive recipe reveal! My signature pasta dish that took me 5 years to perfect 🍝 The secret is in the sauce technique. Subscribers get the full video tutorial!',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    mediaType: 'video',
    isPaid: true,
    price: 25,
    privacy: 'followers',
    metrics: {
      likesCount: 1560,
      commentsCount: 230,
      sharesCount: 78,
      viewsCount: 8900,
      engagementRate: 9.6,
      viralityScore: 8.1,
      freshnessScore: 7.2,
      relevanceScore: 9.3
    },
    createdAt: '6h',
    createdAtTimestamp: Date.now() - 6 * 60 * 60 * 1000,
    tags: ['cooking', 'recipe', 'pasta', 'exclusive'],
    category: 'food',
    isLiked: true,
    isBookmarked: false,
    isFavorited: false,
    isViewed: false,
    qualityScore: 9.4,
    trendingScore: 8.9
  },
  {
    id: '4',
    creator: {
      id: 'user_4',
      username: 'tech_guru',
      displayName: 'Alex Kim',
      avatarUrl: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=150',
      isVerified: true,
      followerCount: 200000,
      engagementRate: 11.2,
      category: ['technology', 'programming', 'ai'],
      trustScore: 9.8,
      isFollowing: false
    },
    content: 'Just built an AI that can generate code from natural language! 🤖 The future of programming is here. Check out this demo...',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    mediaType: 'video',
    isPaid: false,
    privacy: 'public',
    metrics: {
      likesCount: 3200,
      commentsCount: 450,
      sharesCount: 180,
      viewsCount: 25000,
      engagementRate: 11.0,
      viralityScore: 9.2,
      freshnessScore: 9.8,
      relevanceScore: 9.7
    },
    createdAt: '1h',
    createdAtTimestamp: Date.now() - 1 * 60 * 60 * 1000,
    tags: ['ai', 'programming', 'technology', 'innovation'],
    category: 'technology',
    isLiked: false,
    isBookmarked: true,
    isFavorited: false,
    isViewed: false,
    qualityScore: 9.6,
    trendingScore: 9.5
  },
  {
    id: '5',
    creator: {
      id: 'user_5',
      username: 'travel_jenny',
      displayName: 'Jenny Walsh',
      avatarUrl: 'https://images.pexels.com/photos/1040882/pexels-photo-1040882.jpeg?auto=compress&cs=tinysrgb&w=150',
      isVerified: false,
      followerCount: 67000,
      engagementRate: 7.8,
      category: ['travel', 'photography', 'adventure'],
      trustScore: 8.9,
      isFollowing: true
    },
    content: 'Sunset in Santorini 🌅 This view never gets old. Sometimes you have to travel halfway around the world to find yourself.',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    mediaType: 'video',
    isPaid: false,
    privacy: 'public',
    metrics: {
      likesCount: 1200,
      commentsCount: 89,
      sharesCount: 34,
      viewsCount: 5600,
      engagementRate: 7.5,
      viralityScore: 5.8,
      freshnessScore: 8.5,
      relevanceScore: 8.1
    },
    createdAt: '8h',
    createdAtTimestamp: Date.now() - 8 * 60 * 60 * 1000,
    tags: ['travel', 'santorini', 'sunset', 'photography'],
    category: 'travel',
    isLiked: false,
    isBookmarked: false,
    isFavorited: false,
    isViewed: false,
    qualityScore: 8.7,
    trendingScore: 6.9
  }
]

// Advanced Feed Algorithm Implementation
class IntelligentFeedAlgorithm implements FeedAlgorithm {
  calculateEngagementScore(post: Post, userPrefs: UserPreferences): number {
    const baseEngagement = post.metrics.engagementRate
    const viralityBonus = post.metrics.viralityScore * 0.3
    const creatorEngagement = post.creator.engagementRate * 0.2
    const followingBonus = userPrefs.followingList.includes(post.creator.id) ? 2.0 : 0
    
    return Math.min(10, baseEngagement + viralityBonus + creatorEngagement + followingBonus)
  }

  calculateRelevanceScore(post: Post, userPrefs: UserPreferences): number {
    let relevanceScore = 0
    
    // Interest matching
    const interestMatches = post.tags.filter(tag => 
      userPrefs.interests.some(interest => 
        interest.toLowerCase().includes(tag.toLowerCase()) || 
        tag.toLowerCase().includes(interest.toLowerCase())
      )
    ).length
    
    relevanceScore += (interestMatches / post.tags.length) * 4
    
    // Category preference
    if (userPrefs.preferredCategories.includes(post.category)) {
      relevanceScore += 3
    }
    
    // Content type preference
    if (post.mediaType && userPrefs.preferredContentTypes.includes(post.mediaType as any)) {
      relevanceScore += 2
    }
    
    // Creator trust score
    relevanceScore += post.creator.trustScore * 0.5
    
    return Math.min(10, relevanceScore)
  }

  calculateTrendingScore(post: Post): number {
    const timeDecay = Math.max(0, 1 - (Date.now() - post.createdAtTimestamp) / (24 * 60 * 60 * 1000))
    const engagementVelocity = post.metrics.likesCount / Math.max(1, (Date.now() - post.createdAtTimestamp) / (60 * 1000))
    const viralityFactor = post.metrics.viralityScore
    
    return Math.min(10, (timeDecay * 3) + (engagementVelocity * 0.01) + (viralityFactor * 0.7))
  }

  calculateQualityScore(post: Post): number {
    const creatorScore = post.creator.trustScore * 0.4
    const engagementQuality = Math.min(10, post.metrics.engagementRate * 0.8)
    const contentLength = Math.min(10, post.content.length / 50) // Longer content generally higher quality
    const mediaBonus = post.mediaUrl ? 1 : 0
    
    return Math.min(10, creatorScore + engagementQuality + contentLength + mediaBonus)
  }

  calculateDiversityScore(posts: Post[], userPrefs: UserPreferences): number {
    if (posts.length <= 1) return 10
    
    const categories = new Set(posts.map(p => p.category))
    const creators = new Set(posts.map(p => p.creator.id))
    const contentTypes = new Set(posts.map(p => p.mediaType).filter(Boolean))
    
    const categoryDiversity = categories.size / Math.min(posts.length, userPrefs.preferredCategories.length)
    const creatorDiversity = creators.size / posts.length
    const contentTypeDiversity = contentTypes.size / userPrefs.preferredContentTypes.length
    
    return (categoryDiversity + creatorDiversity + contentTypeDiversity) / 3 * 10
  }

  rankPosts(posts: Post[], userPrefs: UserPreferences): Post[] {
    return posts.map(post => ({
      ...post,
      finalScore: this.calculateFinalScore(post, userPrefs, posts)
    })).sort((a, b) => b.finalScore - a.finalScore)
  }

  // Trending algorithm - prioritize posts with high engagement velocity
  rankPostsByTrending(posts: Post[]): Post[] {
    return posts.map(post => ({
      ...post,
      trendingScore: this.calculateTrendingScore(post),
      finalScore: this.calculateTrendingScore(post)
    })).sort((a, b) => b.finalScore - a.finalScore)
  }

  // Following algorithm - show only posts from followed users
  rankPostsByFollowing(posts: Post[], followingList: string[]): Post[] {
    const followingPosts = posts.filter(post => followingList.includes(post.creator.id))
    return followingPosts.map(post => ({
      ...post,
      finalScore: this.calculateTrendingScore(post) // Use trending score for recency
    })).sort((a, b) => b.finalScore - a.finalScore)
  }

  // Discovery algorithm - find new and diverse content
  rankPostsByDiscovery(posts: Post[], userPrefs: UserPreferences): Post[] {
    // Filter out posts from followed users and already engaged content
    const discoveryPosts = posts.filter(post => 
      !userPrefs.followingList.includes(post.creator.id) &&
      !userPrefs.engagementHistory.likedPosts.includes(post.id) &&
      !userPrefs.engagementHistory.viewedPosts.includes(post.id)
    )

    return discoveryPosts.map(post => ({
      ...post,
      discoveryScore: this.calculateDiscoveryScore(post, userPrefs),
      finalScore: this.calculateDiscoveryScore(post, userPrefs)
    })).sort((a, b) => b.finalScore - a.finalScore)
  }

  private calculateDiscoveryScore(post: Post, userPrefs: UserPreferences): number {
    // Discovery focuses on new creators and diverse content
    const creatorNovelty = post.creator.followerCount < 10000 ? 3 : 0 // Boost smaller creators
    const categoryNovelty = !userPrefs.preferredCategories.includes(post.category) ? 2 : 0
    const contentNovelty = post.mediaType && !userPrefs.preferredContentTypes.includes(post.mediaType as any) ? 1 : 0
    const engagementPotential = post.metrics.engagementRate * 0.5
    const qualityScore = this.calculateQualityScore(post) * 0.3
    
    return Math.min(10, creatorNovelty + categoryNovelty + contentNovelty + engagementPotential + qualityScore)
  }

  private calculateFinalScore(post: Post, userPrefs: UserPreferences, allPosts: Post[]): number {
    const engagementScore = this.calculateEngagementScore(post, userPrefs) * 0.3
    const relevanceScore = this.calculateRelevanceScore(post, userPrefs) * 0.25
    const trendingScore = this.calculateTrendingScore(post) * 0.2
    const qualityScore = this.calculateQualityScore(post) * 0.15
    const diversityScore = this.calculateDiversityScore(allPosts, userPrefs) * 0.1
    
    return engagementScore + relevanceScore + trendingScore + qualityScore + diversityScore
  }
}

export function IntelligentFeed() {
  const router = useRouter()
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    interests: ['fitness', 'technology', 'art', 'cooking', 'travel'],
    preferredCategories: ['fitness', 'technology', 'food'],
    engagementHistory: {
      likedPosts: ['3'],
      commentedPosts: [],
      sharedPosts: [],
      viewedPosts: [],
      bookmarkedPosts: ['4']
    },
    timeSpentOnPosts: {},
    followingList: ['user_1', 'user_3', 'user_5'],
    blockedUsers: [],
    preferredContentTypes: ['video', 'image'],
    preferredPostLength: 'medium',
    activityPattern: {
      peakHours: [9, 12, 18, 21],
      averageSessionLength: 15,
      preferredDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    }
  })
  
  const [feedMode, setFeedMode] = useState<'intelligent' | 'trending' | 'following' | 'discover'>('intelligent')
  const [isLoading, setIsLoading] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)
  const [isPullToRefresh, setIsPullToRefresh] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [algorithm] = useState(new IntelligentFeedAlgorithm())
  // Removed activeTab state - tabs moved to sidebar


  // Fetch posts from API with different algorithms based on feed mode
  const fetchPosts = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/posts')
      const data = await response.json()
      
      let postsToRank = data.success ? data.posts : mockPosts
      
      // Apply different algorithms based on feed mode
      let rankedPosts: Post[]
      
      switch (feedMode) {
        case 'trending':
          rankedPosts = algorithm.rankPostsByTrending(postsToRank)
          break
        case 'following':
          rankedPosts = algorithm.rankPostsByFollowing(postsToRank, userPreferences.followingList)
          break
        case 'discover':
          rankedPosts = algorithm.rankPostsByDiscovery(postsToRank, userPreferences)
          break
        case 'intelligent':
        default:
          rankedPosts = algorithm.rankPosts(postsToRank, userPreferences)
          break
      }
      
      setPosts(rankedPosts)
      setLastRefreshed(new Date())
    } catch (error) {
      console.error('Error fetching posts:', error)
      // Fallback to mock data with current feed mode
      let rankedPosts: Post[]
      switch (feedMode) {
        case 'trending':
          rankedPosts = algorithm.rankPostsByTrending(mockPosts)
          break
        case 'following':
          rankedPosts = algorithm.rankPostsByFollowing(mockPosts, userPreferences.followingList)
          break
        case 'discover':
          rankedPosts = algorithm.rankPostsByDiscovery(mockPosts, userPreferences)
          break
        case 'intelligent':
        default:
          rankedPosts = algorithm.rankPosts(mockPosts, userPreferences)
          break
      }
      setPosts(rankedPosts)
      setLastRefreshed(new Date())
    } finally {
      setIsLoading(false)
    }
  }, [userPreferences, feedMode, algorithm])

  // Initialize feed with intelligent ranking
  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  // Add keyboard shortcut for refresh (Ctrl+R or Cmd+R)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault()
        handleRefreshFeed()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Pull-to-refresh functionality
  useEffect(() => {
    let startY = 0
    let currentY = 0
    let isPulling = false

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY
      isPulling = false
    }

    const handleTouchMove = (e: TouchEvent) => {
      currentY = e.touches[0].clientY
      const distance = currentY - startY

      if (distance > 0 && window.scrollY === 0) {
        isPulling = true
        setPullDistance(Math.min(distance, 100))
        
        if (distance > 60) {
          setIsPullToRefresh(true)
        } else {
          setIsPullToRefresh(false)
        }
      }
    }

    const handleTouchEnd = () => {
      if (isPulling && isPullToRefresh) {
        handleRefreshFeed()
      }
      
      setPullDistance(0)
      setIsPullToRefresh(false)
      isPulling = false
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: true })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isPullToRefresh])

  // Listen for new posts
  useEffect(() => {
    const handlePostCreated = (event: CustomEvent) => {
      const newPost = event.detail
      setPosts(prev => {
        const updatedPosts = [newPost, ...prev]
        return algorithm.rankPosts(updatedPosts, userPreferences)
      })
    }

    window.addEventListener('postCreated', handlePostCreated as EventListener)
    
    return () => {
      window.removeEventListener('postCreated', handlePostCreated as EventListener)
    }
  }, [algorithm, userPreferences])

  const handlePostClick = (postId: string) => {
    router.push(`/post/${postId}`)
  }

  const handleUserClick = (username: string) => {
    router.push(`/profile/${username}`)
  }

  const handleLike = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/interact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'like' })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                isLiked: data.userInteractions.isLiked,
                metrics: {
                  ...post.metrics,
                  likesCount: data.counts.likes
                }
              }
            : post
        ))
        
        // Update user preferences
        setUserPreferences(prev => ({
          ...prev,
          engagementHistory: {
            ...prev.engagementHistory,
            likedPosts: data.userInteractions.isLiked
              ? [...prev.engagementHistory.likedPosts, postId]
              : prev.engagementHistory.likedPosts.filter(id => id !== postId)
          }
        }))
      }
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const handleBookmark = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/interact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'bookmark' })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, isBookmarked: data.userInteractions.isBookmarked }
            : post
        ))
        
        setUserPreferences(prev => ({
          ...prev,
          engagementHistory: {
            ...prev.engagementHistory,
            bookmarkedPosts: data.userInteractions.isBookmarked
              ? [...prev.engagementHistory.bookmarkedPosts, postId]
              : prev.engagementHistory.bookmarkedPosts.filter(id => id !== postId)
          }
        }))
      }
    } catch (error) {
      console.error('Error bookmarking post:', error)
    }
  }

  const handleComment = async (postId: string) => {
    try {
      // In a real app, this would open a comment modal or navigate to post detail
      const response = await fetch(`/api/posts/${postId}/interact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'view' })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                isViewed: data.userInteractions.isViewed,
                metrics: {
                  ...post.metrics,
                  viewsCount: data.counts.views
                }
              }
            : post
        ))
      }
      
      // Navigate to post detail page for comments
      router.push(`/post/${postId}`)
    } catch (error) {
      console.error('Error viewing post:', error)
      router.push(`/post/${postId}`)
    }
  }

  const handleShare = async (postId: string) => {
    try {
      // Update share count
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              metrics: {
                ...post.metrics,
                sharesCount: post.metrics.sharesCount + 1
              }
            }
          : post
      ))
      
      // In a real app, this would open a share modal
      if (navigator.share) {
        await navigator.share({
          title: 'Check out this post on Flavours',
          url: `${window.location.origin}/post/${postId}`
        })
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`)
        toast.success('Link copied to clipboard!')
      }
    } catch (error) {
      console.error('Error sharing post:', error)
    }
  }

  const handleRefreshFeed = async () => {
    try {
      await fetchPosts()
      toast.success('Feed refreshed successfully!')
    } catch (error) {
      console.error('Error refreshing feed:', error)
      toast.error('Failed to refresh feed')
    }
  }

  // New handlers for post options overlay
  const handleDeletePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        setPosts(prev => prev.filter(post => post.id !== postId))
        toast.success('Post deleted successfully')
      } else {
        throw new Error('Failed to delete post')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      throw error
    }
  }

  const handleEditPost = (postId: string) => {
    // Navigate to edit page or open edit modal
    router.push(`/post/${postId}/edit`)
  }

  const handleSavePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/interact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'save' })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, isBookmarked: data.userInteractions.isBookmarked }
            : post
        ))
      }
    } catch (error) {
      console.error('Error saving post:', error)
      throw error
    }
  }

  const handleAddToFavorites = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/interact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'favorite' })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, isFavorited: data.userInteractions.isFavorited }
            : post
        ))
      }
    } catch (error) {
      console.error('Error adding to favorites:', error)
      throw error
    }
  }

  const handleReportPost = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: 'inappropriate' })
      })
      
      if (response.ok) {
        toast.success('Post reported successfully')
      } else {
        throw new Error('Failed to report post')
      }
    } catch (error) {
      console.error('Error reporting post:', error)
      throw error
    }
  }

  const handleViewInsights = (postId: string) => {
    // Navigate to insights page
    router.push(`/post/${postId}/insights`)
  }

  const getPrivacyIcon = (privacy: string) => {
    switch (privacy) {
      case 'public':
        return <Globe className="h-3 w-3" />
      case 'followers':
        return <Users className="h-3 w-3" />
      case 'paid':
        return <Lock className="h-3 w-3" />
      default:
        return <Globe className="h-3 w-3" />
    }
  }

  const getFeedModeIcon = (mode: string) => {
    switch (mode) {
      case 'intelligent':
        return <Brain className="h-4 w-4" />
      case 'trending':
        return <TrendingUp className="h-4 w-4" />
      case 'following':
        return <Users className="h-4 w-4" />
      case 'discover':
        return <Sparkles className="h-4 w-4" />
      default:
        return <Brain className="h-4 w-4" />
    }
  }

  return (
    <div className="w-full">

      {/* Pull-to-refresh indicator */}
      {pullDistance > 0 && (
        <div 
          className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b transition-all duration-200"
          style={{ transform: `translateY(${Math.max(0, pullDistance - 60)}px)` }}
        >
          <div className="flex items-center justify-center py-4">
            <RefreshCw className={`h-6 w-6 mr-2 ${isPullToRefresh ? 'animate-spin text-primary' : 'text-muted-foreground'}`} />
            <span className={`text-sm ${isPullToRefresh ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              {isPullToRefresh ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          </div>
        </div>
      )}

      {/* Tab Navigation removed - moved to sidebar */}

      {/* Feed Content - Only Feeds tab content remains */}
      <>
        {/* Feed Header with Algorithm Controls */}
      <Card className="mb-6">
        <CardContent className="p-4">

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Intelligent Feed</h2>
              <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800">
                <Target className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              
              {lastRefreshed && (
                <span className="text-xs text-muted-foreground">
                  Last refreshed: {lastRefreshed.toLocaleTimeString()}
                </span>
              )}

            <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshFeed}
                disabled={isLoading}
                title="Refresh feed (Ctrl+R)"
               >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
          
          {/* Feed Mode Selector */}
          <div className="flex space-x-1 mt-3 p-1 bg-muted rounded-lg">
            {[
              { key: 'intelligent', label: 'Smart', icon: Brain, description: 'AI-powered personalized feed' },
              { key: 'trending', label: 'Trending', icon: TrendingUp, description: 'Most popular content now' },
              { key: 'following', label: 'Following', icon: Users, description: 'Posts from people you follow' },
              { key: 'discover', label: 'Discover', icon: Sparkles, description: 'Find new creators & content' }
            ].map((mode) => (
              <Button
                key={mode.key}
                variant={feedMode === mode.key ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFeedMode(mode.key as any)}
                className="flex-1 relative group"
                title={mode.description}
              >
                <mode.icon className="h-4 w-4 mr-1" />
                {mode.label}
                {feedMode === mode.key && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {mode.description}
                  </div>
                )}
              </Button>
            ))}
          </div>
          
          {/* Feed Mode Description */}
          <div className="mt-2 text-xs text-muted-foreground text-center">
            {feedMode === 'intelligent' && '🤖 Personalized content based on your interests and behavior'}
            {feedMode === 'trending' && '🔥 Posts gaining momentum and high engagement'}
            {feedMode === 'following' && '👥 Latest posts from creators you follow'}
            {feedMode === 'discover' && '✨ New creators and diverse content to explore'}
          </div>
        </CardContent>
      </Card>

      {/* Compose Post */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6 shadow-sm">
        <CreatePostModal>
          <div className="flex space-x-4 cursor-pointer group">
            <Avatar className="h-12 w-12 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
              <AvatarFallback className="text-lg font-semibold">DU</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="bg-muted/50 rounded-xl p-4 text-muted-foreground hover:bg-muted transition-all duration-200 group-hover:shadow-sm">
                <span className="text-base">What's happening? Share your thoughts...</span>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <Image className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Photo</span>
                  </div>
                  <div className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <Video className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Video</span>
                  </div>
                  <div className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <Smile className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Emoji</span>
                  </div>
                </div>
                <Button className="rounded-full px-8 py-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all shadow-lg hover:shadow-xl">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Post
                </Button>
              </div>
            </div>
          </div>
        </CreatePostModal>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
          <span className="text-muted-foreground">Optimizing your feed...</span>
        </div>
      )}

      {/* Intelligent Posts Feed */}
      <div className="divide-y divide-border">
        {posts.map((post, index) => (
          <div key={post.id} className="p-4 hover:bg-muted/50 transition-colors">
            {/* Algorithm Score Indicator */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  #{index + 1} Rank
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {post.trendingScore.toFixed(1)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  {post.qualityScore.toFixed(1)}
                </Badge>
              </div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Eye className="h-3 w-3" />
                 {post.metrics.viewsCount.toLocaleString()}
              </div>
            </div>

            <div className="flex space-x-3">
              {/* Avatar */}
              <Avatar 
                className="h-10 w-10 cursor-pointer" 
                onClick={() => handleUserClick(post.creator.username)}
              >
                <AvatarImage src={post.creator.avatarUrl} alt={post.creator.displayName} />
                <AvatarFallback>{post.creator.displayName.charAt(0)}</AvatarFallback>
              </Avatar>

              {/* Post Content */}
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center space-x-2 mb-1">
                  <span 
                    className="font-semibold text-sm cursor-pointer hover:underline"
                    onClick={() => handleUserClick(post.creator.username)}
                  >
                    {post.creator.displayName}
                  </span>
                  {post.creator.isVerified && (
                    <Crown className="h-4 w-4 text-yellow-500" />
                  )}
                  <span 
                    className="text-muted-foreground text-sm cursor-pointer hover:underline"
                    onClick={() => handleUserClick(post.creator.username)}
                  >
                    @{post.creator.username}
                  </span>
                  <span className="text-muted-foreground text-sm">·</span>
                  <span className="text-muted-foreground text-sm">{post.createdAt}</span>
                  <span className="text-muted-foreground text-sm">·</span>
                  <div className="flex items-center space-x-1">
                    {getPrivacyIcon(post.privacy)}
                    <span className="text-muted-foreground text-sm capitalize">{post.privacy}</span>
                  </div>
                  <PostOptionsOverlay
                    postId={post.id}
                    isOwnPost={user?.id === post.creator.id}
                    isBookmarked={post.isBookmarked}
                    isFavorited={post.isFavorited}
                    onDelete={handleDeletePost}
                    onEdit={handleEditPost}
                    onSave={handleSavePost}
                    onAddToFavorites={handleAddToFavorites}
                    onReport={handleReportPost}
                    onViewInsights={handleViewInsights}
                    onShare={handleShare}
                    className="ml-auto"
                  />
                </div>

                {/* Text Content */}
                <p 
                  className="text-sm mb-3 whitespace-pre-wrap cursor-pointer"
                  onClick={() => handlePostClick(post.id)}
                >
                  {post.content}
                </p>

                {/* Media */}
                {post.mediaUrl && (
                  <div 
                    className="relative mb-3 rounded-2xl overflow-hidden cursor-pointer"
                    onClick={() => handlePostClick(post.id)}
                  >
                    {post.mediaType === 'video' ? (
                      <video
                        src={post.mediaUrl}
                        className="w-full aspect-video object-cover"
                        controls
                        poster="/api/placeholder/800/450"
                      />
                    ) : (
                      <img
                        src={post.mediaUrl}
                        alt="Post media"
                        className="w-full aspect-video object-cover"
                      />
                    )}
                    {post.isPaid && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-center text-white">
                          <Lock className="h-8 w-8 mx-auto mb-2" />
                          <p className="font-medium">Premium Content</p>
                          <Button 
                            onClick={() => console.log('Unlock post:', post.id, 'for $', post.price)}
                            className="mt-2 bg-white text-black hover:bg-white/90"
                          >
                            Unlock for ${post.price}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleComment(post.id)}
                      className="flex items-center space-x-1 sm:space-x-2 text-muted-foreground hover:text-blue-600 p-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm hidden sm:inline">{post.metrics.commentsCount}</span>
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center space-x-1 sm:space-x-2 p-2 ${
                        post.isLiked 
                          ? 'text-red-600' 
                          : 'text-muted-foreground hover:text-red-600'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                      <span className="text-sm hidden sm:inline">{post.metrics.likesCount}</span>
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleBookmark(post.id)}
                      className={`flex items-center space-x-1 sm:space-x-2 p-2 ${
                        post.isBookmarked 
                          ? 'text-yellow-600' 
                          : 'text-muted-foreground hover:text-yellow-600'
                      }`}
                    >
                      <Bookmark className={`h-4 w-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleShare(post.id)}
                      className="flex items-center space-x-1 sm:space-x-2 text-muted-foreground hover:text-green-600 p-2"
                    >
                      <Share2 className="h-4 w-4" />
                      <span className="text-sm hidden sm:inline">{post.metrics.sharesCount}</span>
                    </Button>
                  </div>
                  
                  {/* Post options overlay - visible on all screen sizes */}
                  <PostOptionsOverlay
                    postId={post.id}
                    isOwnPost={user?.id === post.creator.id}
                    isBookmarked={post.isBookmarked}
                    isFavorited={post.isFavorited}
                    onDelete={handleDeletePost}
                    onEdit={handleEditPost}
                    onSave={handleSavePost}
                    onAddToFavorites={handleAddToFavorites}
                    onReport={handleReportPost}
                    onViewInsights={handleViewInsights}
                    onShare={handleShare}
                  />
                </div>

                {/* Premium Badge */}
                {post.isPaid && (
                  <div className="mt-2">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      </>
    </div>
  )
}

