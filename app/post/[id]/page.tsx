"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Lock,
  Crown,
  Globe,
  Users,
  ArrowLeft,
  Clock,
  Eye
} from 'lucide-react'
import { toast } from 'sonner'
import { PostOptionsOverlay } from '@/components/ui/post-options-overlay'
import { useAuth } from '@/components/providers/auth-provider'

interface Post {
  id: string
  creator: {
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
  content: string
  mediaUrl?: string
  mediaType?: 'image' | 'video' | 'gif'
  isPaid: boolean
  price?: number
  privacy: 'public' | 'followers' | 'paid'
  metrics: {
    likesCount: number
    commentsCount: number
    sharesCount: number
    viewsCount: number
    engagementRate: number
    viralityScore: number
    freshnessScore: number
    relevanceScore: number
  }
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

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        // In a real app, you'd fetch the specific post by ID
        const response = await fetch('/api/posts')
        const data = await response.json()
        
        if (data.success && data.posts.length > 0) {
          const foundPost = data.posts.find((p: Post) => p.id === params.id) || data.posts[0]
          setPost(foundPost)
          setIsLiked(foundPost.isLiked)
          setIsBookmarked(foundPost.isBookmarked)
          setLikesCount(foundPost.metrics.likesCount)
          
          // Mark as viewed
          await fetch(`/api/posts/${params.id}/interact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'view' })
          })
        }
      } catch (error) {
        console.error('Error fetching post:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [params.id])

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/posts/${params.id}/interact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like' })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setIsLiked(data.userInteractions.isLiked)
        setLikesCount(data.counts.likes)
      }
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const handleBookmark = async () => {
    try {
      const response = await fetch(`/api/posts/${params.id}/interact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'bookmark' })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setIsBookmarked(data.userInteractions.isBookmarked)
      }
    } catch (error) {
      console.error('Error bookmarking post:', error)
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check out this post on Flavours',
          url: window.location.href
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Link copied to clipboard!')
      }
    } catch (error) {
      console.error('Error sharing post:', error)
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
        toast.success('Post deleted successfully')
        router.push('/')
      } else {
        throw new Error('Failed to delete post')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      throw error
    }
  }

  const handleEditPost = (postId: string) => {
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
        setIsBookmarked(data.userInteractions.isBookmarked)
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
        // Update local state if needed
        toast.success(data.userInteractions.isFavorited ? 'Added to favorites' : 'Removed from favorites')
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
    router.push(`/post/${postId}/insights`)
  }

  const getPrivacyIcon = (privacy: string) => {
    switch (privacy) {
      case 'public':
        return <Globe className="h-4 w-4" />
      case 'followers':
        return <Users className="h-4 w-4" />
      case 'paid':
        return <Lock className="h-4 w-4" />
      default:
        return <Globe className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
          <span className="text-muted-foreground">Loading post...</span>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-6">The post you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push('/feed')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Feed
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => router.push('/feed')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Feed
      </Button>

      {/* Post Content */}
      <Card className="mb-6">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={post.creator.avatarUrl} alt={post.creator.displayName} />
              <AvatarFallback>{post.creator.displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h2 className="font-semibold">{post.creator.displayName}</h2>
                {post.creator.isVerified && (
                  <Crown className="h-4 w-4 text-yellow-500" />
                )}
                <span className="text-muted-foreground">@{post.creator.username}</span>
                <span className="text-muted-foreground">·</span>
                <div className="flex items-center space-x-1">
                  {getPrivacyIcon(post.privacy)}
                  <span className="text-muted-foreground text-sm capitalize">{post.privacy}</span>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{post.createdAt}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="h-3 w-3" />
                  <span>{post.metrics.viewsCount.toLocaleString()} views</span>
                </div>
              </div>
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
            />
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-lg whitespace-pre-wrap mb-4">{post.content}</p>
            
            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Media */}
          {post.mediaUrl && (
            <div className="mb-6">
              {post.mediaType === 'video' ? (
                <video
                  src={post.mediaUrl}
                  className="w-full h-[500px] object-contain rounded-lg"
                  controls
                  poster=""
                />
              ) : (
                <img
                  src={post.mediaUrl}
                  alt="Post media"
                  className="w-full h-[500px] object-contain rounded-lg"
                />
              )}
              {post.isPaid && (
                <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Lock className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-purple-800">Premium Content</span>
                  </div>
                  <p className="text-sm text-purple-700 mb-3">
                    This content is available to paid subscribers only.
                  </p>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    Unlock for ${post.price}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-6">
              <Button 
                variant="ghost" 
                onClick={handleLike}
                className={`flex items-center space-x-2 ${
                  isLiked ? 'text-red-600' : 'text-muted-foreground hover:text-red-600'
                }`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                <span>{likesCount}</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="flex items-center space-x-2 text-muted-foreground hover:text-blue-600"
              >
                <MessageCircle className="h-5 w-5" />
                <span>{post.metrics.commentsCount}</span>
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={handleShare}
                className="flex items-center space-x-2 text-muted-foreground hover:text-green-600"
              >
                <Share2 className="h-5 w-5" />
                <span>{post.metrics.sharesCount}</span>
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={handleBookmark}
                className={`flex items-center space-x-2 ${
                  isBookmarked ? 'text-yellow-600' : 'text-muted-foreground hover:text-yellow-600'
                }`}
              >
                <Heart className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {post.metrics.engagementRate.toFixed(1)}% engagement rate
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Comments</h3>
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Comments feature coming soon!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}