"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { CreatePostModal } from './create-post-modal'
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
  Users
} from 'lucide-react'

export function ContentFeed() {
  const router = useRouter()
  const [newPost, setNewPost] = useState('')

  const handlePostClick = (postId: string) => {
    router.push(`/post/${postId}`)
  }

  const handleUserClick = (username: string) => {
    router.push(`/profile/${username}`)
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
  
  // Mock data - in real app, this would come from API
  const posts = [
    {
      id: '1',
      creator: {
        id: 'user_1',
        username: 'jane_fitness',
        displayName: 'Jane Smith',
        avatarUrl: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150',
        isVerified: true,
      },
      content: 'New workout video is live! 💪 Who\'s ready to sweat with me? #FitnessMotivation',
      mediaUrl: 'https://images.pexels.com/photos/416809/pexels-photo-416809.jpeg?auto=compress&cs=tinysrgb&w=800',
      isPaid: false,
      price: null,
      privacy: 'public',
      likesCount: 234,
      commentsCount: 18,
      createdAt: '2h',
      isLiked: false,
    },
    {
      id: '2',
      creator: {
        id: 'user_2',
        username: 'artist_maya',
        displayName: 'Maya Chen',
        avatarUrl: 'https://images.pexels.com/photos/1310522/pexels-photo-1310522.jpeg?auto=compress&cs=tinysrgb&w=150',
        isVerified: false,
      },
      content: 'Behind the scenes of my latest art piece 🎨✨',
      mediaUrl: 'https://images.pexels.com/photos/1047540/pexels-photo-1047540.jpeg?auto=compress&cs=tinysrgb&w=800',
      isPaid: true,
      price: 15,
      privacy: 'paid',
      likesCount: 89,
      commentsCount: 12,
      createdAt: '4h',
      isLiked: false,
    },
    {
      id: '3',
      creator: {
        id: 'user_3',
        username: 'chef_marco',
        displayName: 'Marco Rodriguez',
        avatarUrl: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150',
        isVerified: true,
      },
      content: 'Exclusive recipe reveal! My signature pasta dish that took me 5 years to perfect 🍝',
      mediaUrl: 'https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg?auto=compress&cs=tinysrgb&w=800',
      isPaid: true,
      price: 25,
      privacy: 'followers',
      likesCount: 156,
      commentsCount: 23,
      createdAt: '6h',
      isLiked: true,
    }
  ]

  const handleLike = (postId: string) => {
    // Handle like functionality
    console.log('Liked post:', postId)
  }

  const handleComment = (postId: string) => {
    // Handle comment functionality
    console.log('Comment on post:', postId)
  }

  const handleShare = (postId: string) => {
    // Handle share functionality
    console.log('Share post:', postId)
  }

  const handleUnlock = (postId: string, price: number) => {
    // Handle premium content unlock
    console.log('Unlock post:', postId, 'for $', price)
  }

  return (
    <div className="max-w-2xl mx-auto"> <br/>
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

      {/* Posts Feed */}
      <div className="divide-y divide-border">
        {posts.map((post) => (
          <div key={post.id} className="p-4 hover:bg-muted/50 transition-colors">
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
                  <Button variant="ghost" size="sm" className="ml-auto h-6 w-6 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
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
                    <div className="aspect-video bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Image className="h-12 w-12 mx-auto mb-2" />
                        <p className="text-lg font-medium">Media Preview</p>
                        <p className="text-sm opacity-80">Click to view</p>
                      </div>
                    </div>
                    {post.isPaid && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-center text-white">
                          <Lock className="h-8 w-8 mx-auto mb-2" />
                          <p className="font-medium">Premium Content</p>
                          <Button 
                            onClick={() => handleUnlock(post.id, post.price!)}
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
                <div className="flex items-center justify-between max-w-md">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleComment(post.id)}
                    className="flex items-center space-x-2 text-muted-foreground hover:text-blue-600"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm">{post.commentsCount}</span>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center space-x-2 ${
                      post.isLiked 
                        ? 'text-red-600' 
                        : 'text-muted-foreground hover:text-red-600'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                    <span className="text-sm">{post.likesCount}</span>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleShare(post.id)}
                    className="flex items-center space-x-2 text-muted-foreground hover:text-green-600"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
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
    </div>
  )
}