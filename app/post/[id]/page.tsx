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
  Eye,
  Send,
  Loader2
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

interface Comment {
  id: string
  content: string
  user_id: string
  post_id: string
  created_at: string
  likes_count: number
  parent_comment_id?: string | null
  profiles: {
    username: string
    display_name: string
    avatar_url: string
    is_verified: boolean
  }
  replies?: Comment[]
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
  
  // Comment state
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [commentLikes, setCommentLikes] = useState<Record<string, boolean>>({})
  
  // Reply state
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)

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

  // Comment functions
  const fetchComments = async () => {
    if (!params.id) return
    
    setIsLoadingComments(true)
    try {
      const response = await fetch(`/api/posts/comments?postId=${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments || [])
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
      toast.error('Failed to load comments')
    } finally {
      setIsLoadingComments(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return
    
    setIsSubmittingComment(true)
    try {
      const response = await fetch('/api/posts/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          postId: params.id,
          content: newComment.trim()
        })
      })

      if (response.ok) {
        const data = await response.json()
        setComments(prev => [data.comment, ...prev])
        setNewComment('')
        toast.success('Comment posted successfully')
      } else {
        throw new Error('Failed to post comment')
      }
    } catch (error) {
      console.error('Error posting comment:', error)
      toast.error('Failed to post comment')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmitComment()
    }
  }

  const handleCommentLike = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      })

      if (response.ok) {
        const data = await response.json()
        // Update the comment in the local state (including replies)
        setComments(prev => prev.map(comment => {
          if (comment.id === commentId) {
            return { ...comment, likes_count: data.likesCount }
          }
          // Check replies
          if (comment.replies) {
            const updatedReplies = comment.replies.map(reply => 
              reply.id === commentId 
                ? { ...reply, likes_count: data.likesCount }
                : reply
            )
            return { ...comment, replies: updatedReplies }
          }
          return comment
        }))
        // Update the like state for this comment
        setCommentLikes(prev => ({
          ...prev,
          [commentId]: data.liked
        }))
        toast.success(data.liked ? 'Comment liked!' : 'Comment unliked!')
      }
    } catch (error) {
      console.error('Error liking comment:', error)
      toast.error('Failed to like comment')
    }
  }

  const handleReply = async (commentId: string) => {
    if (!replyText.trim()) return
    
    setIsSubmittingReply(true)
    try {
      const response = await fetch(`/api/comments/${commentId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: replyText.trim()
        })
      })

      if (response.ok) {
        const data = await response.json()
        // Add the reply to the comment
        setComments(prev => prev.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), data.reply]
            }
          }
          return comment
        }))
        setReplyText('')
        setReplyingTo(null)
        toast.success('Reply posted successfully!')
      }
    } catch (error) {
      console.error('Error posting reply:', error)
      toast.error('Failed to post reply')
    } finally {
      setIsSubmittingReply(false)
    }
  }

  const handleReplyKeyPress = (e: React.KeyboardEvent, commentId: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleReply(commentId)
    }
  }

  // Load comments when post is loaded
  useEffect(() => {
    if (post) {
      fetchComments()
    }
  }, [post])

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
          <h3 className="font-semibold mb-4">Comments ({comments.length})</h3>
          
          {/* Comments List */}
          <div className="space-y-4">
            {isLoadingComments ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2 text-muted-foreground">Loading comments...</span>
              </div>
            ) : comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              comments
                .filter(comment => !comment.parent_comment_id) // Only show top-level comments
                .map((comment) => (
                  <div key={comment.id} className="space-y-3">
                    {/* Main Comment */}
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.profiles.avatar_url} alt={comment.profiles.display_name} />
                        <AvatarFallback>
                          {comment.profiles.display_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-muted rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="text-sm font-medium">{comment.profiles.display_name}</p>
                            {comment.profiles.is_verified && (
                              <Crown className="h-3 w-3 text-yellow-500" />
                            )}
                            <span className="text-xs text-muted-foreground">
                              @{comment.profiles.username}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          <span>{new Date(comment.created_at).toLocaleString()}</span>
                          <button 
                            className={`hover:underline ${commentLikes[comment.id] ? 'text-red-600 font-medium' : ''}`}
                            onClick={() => handleCommentLike(comment.id)}
                          >
                            {commentLikes[comment.id] ? 'Unlike' : 'Like'} ({comment.likes_count || 0})
                          </button>
                          <button 
                            className="hover:underline"
                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Reply Input - Nested under comment */}
                    {replyingTo === comment.id && (
                      <div className="ml-11">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={user?.avatar_url || "https://ui-avatars.com/api/?name=You&background=random"} />
                            <AvatarFallback>Y</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              onKeyPress={(e) => handleReplyKeyPress(e, comment.id)}
                              placeholder="Write a reply..."
                              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                              rows={2}
                              disabled={isSubmittingReply}
                            />
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setReplyingTo(null)
                                setReplyText('')
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleReply(comment.id)}
                              disabled={!replyText.trim() || isSubmittingReply}
                            >
                              {isSubmittingReply ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Replies - Nested under comment */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="ml-11 space-y-3">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start space-x-3">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={reply.profiles.avatar_url} alt={reply.profiles.display_name} />
                              <AvatarFallback>
                                {reply.profiles.display_name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="bg-muted rounded-lg p-3">
                                <div className="flex items-center space-x-2 mb-1">
                                  <p className="text-sm font-medium">{reply.profiles.display_name}</p>
                                  {reply.profiles.is_verified && (
                                    <Crown className="h-3 w-3 text-yellow-500" />
                                  )}
                                  <span className="text-xs text-muted-foreground">
                                    @{reply.profiles.username}
                                  </span>
                                </div>
                                <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
                              </div>
                              <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                                <span>{new Date(reply.created_at).toLocaleString()}</span>
                                <button 
                                  className={`hover:underline ${commentLikes[reply.id] ? 'text-red-600 font-medium' : ''}`}
                                  onClick={() => handleCommentLike(reply.id)}
                                >
                                  {commentLikes[reply.id] ? 'Unlike' : 'Like'} ({reply.likes_count || 0})
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
          
          {/* Comment Input */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar_url || "https://ui-avatars.com/api/?name=You&background=random"} />
                <AvatarFallback>Y</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Write a comment..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={2}
                  disabled={isSubmittingComment}
                />
              </div>
              <Button 
                size="sm" 
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmittingComment}
              >
                {isSubmittingComment ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}