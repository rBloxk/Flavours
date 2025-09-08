"use client"

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ProtectedMediaPlayer } from '@/components/media/protected-media-player'
import { contentProtection } from '@/lib/content-protection'
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Lock,
  Crown,
  Shield,
  Eye,
  DollarSign
} from 'lucide-react'

interface SecurePostCardProps {
  post: {
    id: string
    creator: {
      name: string
      username: string
      avatar: string
      verified: boolean
    }
    content: string
    media?: {
      type: 'image' | 'video' | 'audio'
      url: string
      thumbnail?: string
    }
    isPaid: boolean
    price?: number
    isPreview: boolean
    likes: number
    comments: number
    timestamp: string
    tags?: string[]
  }
  onLike?: (postId: string) => void
  onComment?: (postId: string) => void
  onShare?: (postId: string) => void
  onPurchase?: (postId: string) => void
}

export function SecurePostCard({ 
  post, 
  onLike, 
  onComment, 
  onShare, 
  onPurchase 
}: SecurePostCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [showFullContent, setShowFullContent] = useState(false)

  const handleLike = () => {
    setIsLiked(!isLiked)
    onLike?.(post.id)
  }

  const handlePurchase = () => {
    onPurchase?.(post.id)
  }

  const handleAccessGranted = () => {
    // Initialize content protection when access is granted
    contentProtection.initialize(
      `FLAVOURS-${post.id}-${Date.now()}`,
      `token-${post.id}`
    )
  }

  const handleAccessDenied = () => {
    console.log('Access denied for post:', post.id)
  }

  const renderMediaContent = () => {
    if (!post.media) return null

    if (post.isPaid && !showFullContent) {
      // Show preview for paid content
      return (
        <div className="relative">
          <ProtectedMediaPlayer
            mediaId={post.id}
            mediaType={post.media.type}
            isPaid={true}
            price={post.price || 0}
            onAccessGranted={handleAccessGranted}
            onAccessDenied={handleAccessDenied}
            className="aspect-video"
          />
          
          {/* Preview overlay */}
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center text-white">
              <Lock className="h-12 w-12 mx-auto mb-4 opacity-75" />
              <h3 className="text-xl font-semibold mb-2">Premium Content</h3>
              <p className="text-sm opacity-90 mb-4">
                Unlock this {post.media.type} for ${post.price?.toFixed(2)}
              </p>
              <Button 
                onClick={handlePurchase}
                className="bg-primary hover:bg-primary/90"
              >
                <Crown className="h-4 w-4 mr-2" />
                Unlock Content
              </Button>
            </div>
          </div>
        </div>
      )
    }

    // Show full content for free or unlocked content
    return (
      <ProtectedMediaPlayer
        mediaId={post.id}
        mediaType={post.media.type}
        src={post.media.url}
        isPaid={post.isPaid}
        price={post.price}
        onAccessGranted={handleAccessGranted}
        onAccessDenied={handleAccessDenied}
        className="aspect-video"
      />
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Post Header */}
        <div className="p-4 border-b">
          <div className="flex items-start space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.creator.avatar} alt={post.creator.name} />
              <AvatarFallback>{post.creator.name.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm">{post.creator.name}</span>
                <span className="text-muted-foreground text-sm">@{post.creator.username}</span>
                {post.creator.verified && (
                  <Shield className="h-4 w-4 text-blue-600" />
                )}
                {post.isPaid && (
                  <Crown className="h-4 w-4 text-purple-600" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">{post.timestamp}</p>
            </div>
            
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Post Content */}
        <div className="p-4">
          <p className="text-sm mb-3 whitespace-pre-wrap">
            {post.content}
          </p>
          
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Media Content */}
        {renderMediaContent()}

        {/* Post Actions */}
        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={isLiked ? 'text-red-500' : ''}
              >
                <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-sm">{post.likes + (isLiked ? 1 : 0)}</span>
              </Button>
              
              <Button variant="ghost" size="sm" onClick={() => onComment?.(post.id)}>
                <MessageCircle className="h-4 w-4 mr-1" />
                <span className="text-sm">{post.comments}</span>
              </Button>
              
              <Button variant="ghost" size="sm" onClick={() => onShare?.(post.id)}>
                <Share2 className="h-4 w-4 mr-1" />
                <span className="text-sm">Share</span>
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {post.isPaid ? 'Premium' : 'Free'}
              </span>
              {post.isPaid && (
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-3 w-3 text-green-600" />
                  <span className="text-xs font-medium text-green-600">
                    ${post.price?.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
