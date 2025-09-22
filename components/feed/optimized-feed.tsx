'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LazyImage, LazyVideo, LazyContent, VirtualList } from '@/components/ui/lazy-loading'
import { useCachedAPI, cacheInvalidation } from '@/lib/api-cache'
import { usePerformanceMonitor } from '@/lib/performance-monitor'
import { useRealtimeContext } from '@/components/providers/realtime-provider'
import { Heart, MessageSquare, Share, MoreHorizontal, Play, Pause } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Post {
  id: string
  content: string
  media_url?: string
  media_type?: 'image' | 'video'
  created_at: string
  likes_count: number
  comments_count: number
  is_liked: boolean
  creator: {
    id: string
    username: string
    display_name: string
    avatar_url?: string
    is_verified: boolean
  }
}

interface OptimizedFeedProps {
  userId?: string
  className?: string
}

const ITEM_HEIGHT = 400 // Estimated height of each post
const CONTAINER_HEIGHT = 600 // Height of visible container

export function OptimizedFeed({ userId, className }: OptimizedFeedProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  
  const { measure, recordCustomMetric } = usePerformanceMonitor()
  const { togglePostLike, joinPostRoom, leavePostRoom } = useRealtimeContext()

  // Fetch posts with caching
  const { data: feedData, loading: feedLoading, error } = useCachedAPI<{
    posts: Post[]
    has_more: boolean
    next_page?: number
  }>(
    '/api/v1/content/feed',
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    },
    {
      ttl: 300000, // 5 minutes cache
      params: { page, user_id: userId },
      dependencies: [page, userId]
    }
  )

  // Update posts when data changes
  useEffect(() => {
    if (feedData) {
      measure('feed-update', () => {
        if (page === 1) {
          setPosts(feedData.posts)
        } else {
          setPosts(prev => [...prev, ...feedData.posts])
        }
        setHasMore(feedData.has_more)
        setLoading(false)
      })
    }
  }, [feedData, page])

  // Handle like toggle with optimistic updates
  const handleLikeToggle = useCallback(async (postId: string) => {
    const wasLiked = likedPosts.has(postId)
    
    // Optimistic update
    setLikedPosts(prev => {
      const newSet = new Set(prev)
      if (wasLiked) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })

    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            is_liked: !wasLiked,
            likes_count: wasLiked ? post.likes_count - 1 : post.likes_count + 1
          }
        : post
    ))

    try {
      // Send to real-time service
      togglePostLike(postId)
      
      // Record performance metric
      recordCustomMetric('post-like', Date.now(), { postId, action: wasLiked ? 'unlike' : 'like' })
    } catch (error) {
      // Revert optimistic update on error
      setLikedPosts(prev => {
        const newSet = new Set(prev)
        if (wasLiked) {
          newSet.add(postId)
        } else {
          newSet.delete(postId)
        }
        return newSet
      })
      
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              is_liked: wasLiked,
              likes_count: wasLiked ? post.likes_count + 1 : post.likes_count - 1
            }
          : post
      ))
      
      console.error('Failed to toggle like:', error)
    }
  }, [likedPosts, togglePostLike, recordCustomMetric])

  // Load more posts
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      measure('load-more-posts', () => {
        setPage(prev => prev + 1)
      })
    }
  }, [loading, hasMore, measure])

  // Join post room for real-time updates
  const handlePostView = useCallback((postId: string) => {
    joinPostRoom(postId)
  }, [joinPostRoom])

  // Leave post room
  const handlePostLeave = useCallback((postId: string) => {
    leavePostRoom(postId)
  }, [leavePostRoom])

  // Memoized post renderer for virtual scrolling
  const renderPost = useCallback((post: Post, index: number) => (
    <PostCard
      key={post.id}
      post={post}
      isLiked={likedPosts.has(post.id)}
      onLikeToggle={handleLikeToggle}
      onView={handlePostView}
      onLeave={handlePostLeave}
      index={index}
    />
  ), [likedPosts, handleLikeToggle, handlePostView, handlePostLeave])

  // Memoized posts for virtual scrolling
  const memoizedPosts = useMemo(() => posts, [posts])

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Failed to load feed
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {error.message}
          </p>
          <Button 
            onClick={() => {
              cacheInvalidation.feed()
              setPage(1)
              setLoading(true)
            }}
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Performance Stats (Development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 p-2 bg-gray-100 dark:bg-gray-800 rounded">
          Posts: {posts.length} | Loading: {loading ? 'Yes' : 'No'} | Has More: {hasMore ? 'Yes' : 'No'}
        </div>
      )}

      {/* Virtual List for Performance */}
      {posts.length > 10 ? (
        <VirtualList
          items={memoizedPosts}
          itemHeight={ITEM_HEIGHT}
          containerHeight={CONTAINER_HEIGHT}
          renderItem={renderPost}
          className="rounded-lg"
          overscan={3}
        />
      ) : (
        /* Regular rendering for small lists */
        <div className="space-y-4">
          {posts.map((post, index) => renderPost(post, index))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <LazyContent
          className="flex justify-center"
          placeholder={<div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />}
        >
          <Button
            onClick={loadMore}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        </LazyContent>
      )}

      {/* End of Feed */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          You've reached the end of the feed
        </div>
      )}
    </div>
  )
}

// Optimized Post Card Component
interface PostCardProps {
  post: Post
  isLiked: boolean
  onLikeToggle: (postId: string) => void
  onView: (postId: string) => void
  onLeave: (postId: string) => void
  index: number
}

function PostCard({ post, isLiked, onLikeToggle, onView, onLeave, index }: PostCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Intersection observer for visibility tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
        if (entry.isIntersecting) {
          onView(post.id)
        } else {
          onLeave(post.id)
        }
      },
      { threshold: 0.5 }
    )

    const element = document.getElementById(`post-${post.id}`)
    if (element) {
      observer.observe(element)
      return () => observer.unobserve(element)
    }
  }, [post.id, onView, onLeave])

  const handleVideoToggle = () => {
    setIsPlaying(!isPlaying)
  }

  return (
    <Card id={`post-${post.id}`} className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.creator.avatar_url} alt={post.creator.display_name} />
            <AvatarFallback>
              {post.creator.display_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p className="font-semibold text-sm truncate">
                {post.creator.display_name}
              </p>
              {post.creator.is_verified && (
                <Badge variant="secondary" className="text-xs">
                  Verified
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              @{post.creator.username} • {new Date(post.created_at).toLocaleDateString()}
            </p>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Post Content */}
        <LazyContent
          className="text-sm leading-relaxed"
          placeholder={<div className="space-y-2"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" /><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" /></div>}
        >
          <p className="whitespace-pre-wrap">{post.content}</p>
        </LazyContent>

        {/* Media */}
        {post.media_url && (
          <div className="relative">
            {post.media_type === 'video' ? (
              <LazyVideo
                src={post.media_url}
                className="w-full rounded-lg"
                controls={isPlaying}
                poster={`${post.media_url}?thumbnail=true`}
              />
            ) : (
              <LazyImage
                src={post.media_url}
                alt={post.content}
                className="w-full rounded-lg"
                placeholder={`${post.media_url}?thumbnail=true`}
              />
            )}
            
            {post.media_type === 'video' && !isPlaying && (
              <Button
                onClick={handleVideoToggle}
                className="absolute inset-0 m-auto"
                size="lg"
                variant="secondary"
              >
                <Play className="h-8 w-8" />
              </Button>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLikeToggle(post.id)}
              className={cn(
                "flex items-center space-x-2",
                isLiked && "text-red-500 hover:text-red-600"
              )}
            >
              <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
              <span>{post.likes_count}</span>
            </Button>
            
            <Button variant="ghost" size="sm" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>{post.comments_count}</span>
            </Button>
            
            <Button variant="ghost" size="sm">
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

