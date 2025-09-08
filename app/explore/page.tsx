"use client"

import React, { useState } from 'react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Users, 
  Star, 
  Heart, 
  MessageCircle, 
  Share,
  Crown,
  Shield,
  Clock,
  Eye
} from 'lucide-react'

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', label: 'All', icon: TrendingUp },
    { id: 'fitness', label: 'Fitness', icon: Users },
    { id: 'art', label: 'Art', icon: Star },
    { id: 'music', label: 'Music', icon: Star },
    { id: 'food', label: 'Food', icon: Star },
    { id: 'travel', label: 'Travel', icon: Star },
  ]

  const trendingCreators = [
    {
      id: 1,
      name: 'Sarah Johnson',
      username: '@sarah_fitness',
      avatar: '/avatars/sarah.jpg',
      followers: '125K',
      category: 'Fitness',
      verified: true,
      isCreator: true,
      bio: 'Certified personal trainer helping you achieve your fitness goals 💪',
      recentPost: 'New HIIT workout routine is live!',
      engagement: '98%'
    },
    {
      id: 2,
      name: 'Alex Chen',
      username: '@alex_artist',
      avatar: '/avatars/alex.jpg',
      followers: '89K',
      category: 'Art',
      verified: true,
      isCreator: true,
      bio: 'Digital artist creating stunning visual experiences',
      recentPost: 'Behind the scenes of my latest digital painting',
      engagement: '94%'
    },
    {
      id: 3,
      name: 'Maya Rodriguez',
      username: '@maya_cooking',
      avatar: '/avatars/maya.jpg',
      followers: '156K',
      category: 'Food',
      verified: true,
      isCreator: true,
      bio: 'Chef sharing authentic recipes and cooking tips',
      recentPost: 'Traditional pasta recipe from my grandmother',
      engagement: '96%'
    }
  ]

  const trendingPosts = [
    {
      id: 1,
      creator: {
        name: 'Emma Wilson',
        username: '@emma_yoga',
        avatar: '/avatars/emma.jpg',
        verified: true
      },
      content: 'Morning yoga flow to start your day with positive energy 🧘‍♀️✨',
      media: '/images/yoga-flow.jpg',
      timestamp: '2 hours ago',
      likes: 1247,
      comments: 89,
      category: 'Fitness',
      isPremium: false
    },
    {
      id: 2,
      creator: {
        name: 'David Kim',
        username: '@david_photography',
        avatar: '/avatars/david.jpg',
        verified: true
      },
      content: 'Golden hour photography tips for stunning portraits 📸',
      media: '/images/photography-tips.jpg',
      timestamp: '4 hours ago',
      likes: 892,
      comments: 67,
      category: 'Photography',
      isPremium: true,
      price: 15
    },
    {
      id: 3,
      creator: {
        name: 'Lisa Thompson',
        username: '@lisa_music',
        avatar: '/avatars/lisa.jpg',
        verified: false
      },
      content: 'Original composition inspired by nature sounds 🎵',
      media: '/images/music-composition.jpg',
      timestamp: '6 hours ago',
      likes: 2156,
      comments: 134,
      category: 'Music',
      isPremium: false
    }
  ]

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-4 lg:py-6 space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="text-left space-y-2 lg:space-y-4">
        <h1 className="text-2xl lg:text-3xl font-bold">Explore</h1>
        <p className="text-sm lg:text-base text-muted-foreground">Discover amazing creators and trending content</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search creators, content, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center space-x-2"
            >
              <Icon className="h-4 w-4" />
              <span>{category.label}</span>
            </Button>
          )
        })}
      </div>

      {/* Trending Creators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Trending Creators</span>
          </CardTitle>
          <CardDescription>Top creators gaining momentum this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendingCreators.map((creator) => (
              <Card key={creator.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={creator.avatar} alt={creator.name} />
                      <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{creator.name}</span>
                        {creator.verified && (
                          <Shield className="h-4 w-4 text-blue-600" />
                        )}
                        {creator.isCreator && (
                          <Crown className="h-4 w-4 text-purple-600" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{creator.username}</p>
                      <p className="text-sm">{creator.bio}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{creator.followers} followers</span>
                        <span>{creator.engagement} engagement</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" className="flex-1">
                          Follow
                        </Button>
                        <Button size="sm" variant="outline">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trending Posts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Trending Posts</span>
          </CardTitle>
          <CardDescription>Most engaging content right now</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {trendingPosts.map((post) => (
            <div key={post.id} className="space-y-4">
              <div className="flex items-start space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.creator.avatar} alt={post.creator.name} />
                  <AvatarFallback>{post.creator.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{post.creator.name}</span>
                    <span className="text-sm text-muted-foreground">{post.creator.username}</span>
                    {post.creator.verified && (
                      <Shield className="h-4 w-4 text-blue-600" />
                    )}
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{post.timestamp}</span>
                  </div>
                  <p className="text-lg">{post.content}</p>
                  
                  {/* Media Preview */}
                  <div className="relative rounded-lg overflow-hidden bg-muted">
                    <div className="aspect-video bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Eye className="h-12 w-12 mx-auto mb-2" />
                        <p className="text-lg font-medium">Media Preview</p>
                        <p className="text-sm opacity-80">{post.category}</p>
                      </div>
                    </div>
                    {post.isPremium && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-center text-white">
                          <Crown className="h-8 w-8 mx-auto mb-2" />
                          <p className="font-medium">Premium Content</p>
                          <p className="text-sm">Unlock for ${post.price}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4" />
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.comments}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Share className="h-4 w-4" />
                        <span>Share</span>
                      </div>
                    </div>
                    <Badge variant="secondary">{post.category}</Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Discover More */}
      <Card>
        <CardHeader>
          <CardTitle>Discover More</CardTitle>
          <CardDescription>Explore different content types and creators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Users className="h-6 w-6" />
              <span>Communities</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <TrendingUp className="h-6 w-6" />
              <span>Trending</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Star className="h-6 w-6" />
              <span>Featured</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Clock className="h-6 w-6" />
              <span>Recent</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </AuthGuard>
  )
}
