"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Heart, 
  MessageCircle, 
  Share, 
  Bookmark, 
  MoreHorizontal,
  ArrowLeft,
  Crown,
  Lock,
  Users,
  Globe,
  Send,
  Loader2
} from 'lucide-react'
import { PostOptionsOverlay } from '@/components/ui/post-options-overlay'
import { useAuth } from '@/components/providers/auth-provider'
import { useToast } from '@/hooks/use-toast'

// Mock data - in a real app, this would come from an API
const mockPosts = [
  {
    id: '1',
    content: 'Just finished an amazing photoshoot! The lighting was perfect and the results are incredible. Can\'t wait to share more behind-the-scenes content with you all! 📸✨',
    author: {
      id: 'creator1',
      username: 'photographer_sarah',
      display_name: 'Sarah Johnson',
      avatar_url: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=random',
      is_verified: true,
      is_creator: true
    },
    media: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        alt: 'Photography setup'
      },
      {
        type: 'image', 
        url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop',
        alt: 'Camera equipment'
      }
    ],
    stats: {
      likes: 1247,
      comments: 89,
      shares: 23,
      bookmarks: 156
    },
    privacy: 'public',
    createdAt: '2 hours ago',
    isLiked: false,
    isBookmarked: false
  },
  {
    id: '2',
    content: 'Behind the scenes of my latest cooking video! The secret ingredient that makes everything taste amazing... 🍳👨‍🍳',
    author: {
      id: 'creator2',
      username: 'chef_mike',
      display_name: 'Mike Chen',
      avatar_url: 'https://ui-avatars.com/api/?name=Mike+Chen&background=random',
      is_verified: true,
      is_creator: true
    },
    media: [
      {
        type: 'video',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop'
      }
    ],
    stats: {
      likes: 892,
      comments: 45,
      shares: 67,
      bookmarks: 234
    },
    privacy: 'followers',
    createdAt: '4 hours ago',
    isLiked: true,
    isBookmarked: false
  }
]

// Comment type
interface Comment {
  id: string
  content: string
  user_id: string
  post_id: string
  created_at: string
  profiles: {
    username: string
    display_name: string
    avatar_url: string
    is_verified: boolean
  }
}

export function PostPageClient() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const postId = params.id as string
  
  // State for comments
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  
  // Find the post by ID
  const post = mockPosts.find(p => p.id === postId)
  
  if (!post) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-6">The post you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const handleUserClick = () => {
    router.push(`/profile/${post.author.username}`)
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

  // Handler functions for post options overlay
  const handleDeletePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
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
      
      if (!response.ok) {
        throw new Error('Failed to save post')
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
      
      if (!response.ok) {
        throw new Error('Failed to add to favorites')
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
      
      if (!response.ok) {
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

  const handleShare = async (postId: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check out this post on Flavours',
          url: window.location.href
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
      }
    } catch (error) {
      console.error('Error sharing post:', error)
      throw error
    }
  }

  // Comment functions
  const fetchComments = async () => {
    if (!postId) return
    
    setIsLoadingComments(true)
    try {
      const response = await fetch(`/api/posts/comments?postId=${postId}`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments || [])
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
      toast({
        title: 'Error',
        description: 'Failed to load comments',
        variant: 'destructive'
      })
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
          postId,
          content: newComment.trim()
        })
      })

      if (response.ok) {
        const data = await response.json()
        setComments(prev => [data.comment, ...prev])
        setNewComment('')
        toast({
          title: 'Success',
          description: 'Comment posted successfully'
        })
      } else {
        throw new Error('Failed to post comment')
      }
    } catch (error) {
      console.error('Error posting comment:', error)
      toast({
        title: 'Error',
        description: 'Failed to post comment',
        variant: 'destructive'
      })
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

  // Load comments on mount
  useEffect(() => {
    fetchComments()
  }, [postId])

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 lg:py-6 space-y-4 lg:space-y-6">

      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Post Card */}
      <Card>
        <CardContent className="p-8">
          {/* Author Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12 cursor-pointer" onClick={handleUserClick}>
                <AvatarImage src={post.author.avatar_url} alt={post.author.display_name} />
                <AvatarFallback>
                  {post.author.display_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 
                    className="font-semibold cursor-pointer hover:underline"
                    onClick={handleUserClick}
                  >
                    {post.author.display_name}
                  </h3>
                  {post.author.is_verified && (
                    <Crown className="h-4 w-4 text-yellow-500" />
                  )}
                  <Badge variant="secondary" className="text-xs">
                    @{post.author.username}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>{post.createdAt}</span>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    {getPrivacyIcon(post.privacy)}
                    <span className="capitalize">{post.privacy}</span>
                  </div>
                </div>
              </div>
            </div>
            <PostOptionsOverlay
              postId={post.id}
              isOwnPost={user?.id === post.author.id}
              isBookmarked={post.isBookmarked}
              isFavorited={post.isLiked}
              onDelete={handleDeletePost}
              onEdit={handleEditPost}
              onSave={handleSavePost}
              onAddToFavorites={handleAddToFavorites}
              onReport={handleReportPost}
              onViewInsights={handleViewInsights}
              onShare={handleShare}
            />
          </div>

          {/* Post Content */}
          <div className="mb-4">
            <p className="text-base leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          {/* Media */}
          {post.media && post.media.length > 0 && (
            <div className="mb-4">
              {post.media.length === 1 ? (
                <div className="rounded-lg overflow-hidden h-[700px]">
                  {post.media[0].type === 'image' ? (
                    <img
                      src={post.media[0].url}
                      alt={'alt' in post.media[0] ? post.media[0].alt : ''}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <video
                      src={post.media[0].url}
                      poster={'thumbnail' in post.media[0] ? post.media[0].thumbnail : ''}
                      controls
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {post.media.map((media, index) => (
                    <div key={index} className="rounded-lg overflow-hidden">
                      {media.type === 'image' ? (
                        <img
                          src={media.url}
                          alt={'alt' in media ? media.alt : ''}
                          className="w-full h-64 object-contain"
                        />
                      ) : (
                        <video
                          src={media.url}
                          poster={'thumbnail' in media ? media.thumbnail : ''}
                          controls
                          className="w-full h-64 object-contain"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <Separator className="my-4" />

          {/* Engagement Stats */}
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <div className="flex items-center space-x-4">
              <span>{post.stats.likes.toLocaleString()} likes</span>
              <span>{post.stats.comments.toLocaleString()} comments</span>
              <span>{post.stats.shares.toLocaleString()} shares</span>
            </div>
            <span>{post.stats.bookmarks.toLocaleString()} bookmarks</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                <span>Like</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span>Comment</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <Share className="h-4 w-4" />
                <span>Share</span>
              </Button>
            </div>
            <Button variant="ghost" size="sm">
              <Bookmark className={`h-4 w-4 ${post.isBookmarked ? 'fill-blue-500 text-blue-500' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card className="mt-6">
        <CardContent className="p-8">
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
              comments.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-3">
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
                      <button className="hover:underline">Like</button>
                      <button className="hover:underline">Reply</button>
                    </div>
                  </div>
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
                  className="w-full px-2 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
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
