"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { 
  Heart, 
  MessageCircle, 
  Share, 
  Crown, 
  Shield, 
  MoreVertical,
  Filter,
  Search,
  SortAsc,
  SortDesc,
  Calendar,
  Eye,
  Bookmark,
  Trash2,
  ExternalLink,
  Download,
  Copy,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  Star,
  Zap,
  Lock,
  Unlock,
  X
} from 'lucide-react'

export default function FavoritesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [favoritePosts, setFavoritePosts] = useState([
    {
      id: 1,
      creator: {
        id: 'creator-1',
        name: 'Sarah Johnson',
        username: 'sarah_fitness',
        avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=random',
        verified: true,
        isCreator: true
      },
      content: 'Morning yoga flow to start your day with positive energy 🧘‍♀️✨',
      media: '/images/yoga-flow.jpg',
      mediaType: 'image',
      timestamp: '2 hours ago',
      likes: 1247,
      comments: 89,
      shares: 45,
      category: 'Fitness',
      isPremium: false,
      favoritedAt: '1 hour ago',
      favoritedAtDate: new Date(Date.now() - 60 * 60 * 1000),
      isLiked: true,
      isBookmarked: true,
      tags: ['yoga', 'fitness', 'morning'],
      views: 3456
    },
    {
      id: 2,
      creator: {
        id: 'creator-2',
        name: 'Alex Chen',
        username: 'alex_artist',
        avatar: 'https://ui-avatars.com/api/?name=Alex+Chen&background=random',
        verified: true,
        isCreator: true
      },
      content: 'Golden hour photography tips for stunning portraits 📸',
      media: '/images/photography-tips.jpg',
      mediaType: 'image',
      timestamp: '4 hours ago',
      likes: 892,
      comments: 67,
      shares: 23,
      category: 'Photography',
      isPremium: true,
      price: 15,
      favoritedAt: '3 hours ago',
      favoritedAtDate: new Date(Date.now() - 3 * 60 * 60 * 1000),
      isLiked: false,
      isBookmarked: true,
      tags: ['photography', 'tips', 'portraits'],
      views: 2890
    },
    {
      id: 3,
      creator: {
        id: 'creator-3',
        name: 'Maya Rodriguez',
        username: 'maya_cooking',
        avatar: 'https://ui-avatars.com/api/?name=Maya+Rodriguez&background=random',
        verified: true,
        isCreator: true
      },
      content: 'Traditional pasta recipe from my grandmother 👵🍝',
      media: '/images/pasta-recipe.jpg',
      mediaType: 'image',
      timestamp: '6 hours ago',
      likes: 2156,
      comments: 134,
      shares: 78,
      category: 'Food',
      isPremium: false,
      favoritedAt: '5 hours ago',
      favoritedAtDate: new Date(Date.now() - 5 * 60 * 60 * 1000),
      isLiked: true,
      isBookmarked: true,
      tags: ['cooking', 'recipe', 'pasta'],
      views: 5678
    },
    {
      id: 4,
      creator: {
        id: 'creator-4',
        name: 'David Kim',
        username: 'david_photography',
        avatar: 'https://ui-avatars.com/api/?name=David+Kim&background=random',
        verified: false,
        isCreator: false
      },
      content: 'Sunset landscape photography from my recent trip 🌅',
      media: '/images/sunset-landscape.jpg',
      mediaType: 'image',
      timestamp: '1 day ago',
      likes: 567,
      comments: 23,
      shares: 12,
      category: 'Photography',
      isPremium: false,
      favoritedAt: '12 hours ago',
      favoritedAtDate: new Date(Date.now() - 12 * 60 * 60 * 1000),
      isLiked: false,
      isBookmarked: true,
      tags: ['photography', 'landscape', 'sunset'],
      views: 1234
    },
    {
      id: 5,
      creator: {
        id: 'creator-5',
        name: 'Emma Wilson',
        username: 'emma_fitness',
        avatar: 'https://ui-avatars.com/api/?name=Emma+Wilson&background=random',
        verified: true,
        isCreator: true
      },
      content: 'High-intensity interval training workout for maximum results 💪',
      media: '/videos/hiit-workout.mp4',
      mediaType: 'video',
      timestamp: '3 hours ago',
      likes: 1890,
      comments: 156,
      shares: 89,
      category: 'Fitness',
      isPremium: true,
      price: 25,
      favoritedAt: '2 hours ago',
      favoritedAtDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isLiked: true,
      isBookmarked: true,
      tags: ['hiit', 'workout', 'fitness'],
      views: 4567
    }
  ])

  const categories = [
    { id: 'all', label: 'All', count: favoritePosts.length },
    { id: 'fitness', label: 'Fitness', count: favoritePosts.filter(p => p.category === 'Fitness').length },
    { id: 'photography', label: 'Photography', count: favoritePosts.filter(p => p.category === 'Photography').length },
    { id: 'food', label: 'Food', count: favoritePosts.filter(p => p.category === 'Food').length },
  ]

  // Filter and sort posts
  const filteredAndSortedPosts = () => {
    let posts = favoritePosts

    // Apply category filter
    if (filter !== 'all') {
      posts = posts.filter(post => post.category.toLowerCase() === filter)
    }

    // Apply search filter
    if (searchQuery) {
      posts = posts.filter(post => 
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.creator.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Apply sorting
    switch (sortBy) {
      case 'recent':
        posts = posts.sort((a, b) => b.favoritedAtDate.getTime() - a.favoritedAtDate.getTime())
        break
      case 'oldest':
        posts = posts.sort((a, b) => a.favoritedAtDate.getTime() - b.favoritedAtDate.getTime())
        break
      case 'likes':
        posts = posts.sort((a, b) => b.likes - a.likes)
        break
      case 'views':
        posts = posts.sort((a, b) => b.views - a.views)
        break
      case 'alphabetical':
        posts = posts.sort((a, b) => a.creator.name.localeCompare(b.creator.name))
        break
      default:
        break
    }

    return posts
  }

  const filteredPosts = filteredAndSortedPosts()

  // Interactive functions
  const handleLike = (postId: number) => {
    setFavoritePosts(posts => 
      posts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1
            }
          : post
      )
    )
    toast({
      title: "Like updated",
      description: "Your like has been updated.",
    })
  }

  const handleRemoveFavorite = (postId: number) => {
    setFavoritePosts(posts => posts.filter(post => post.id !== postId))
    toast({
      title: "Removed from favorites",
      description: "Post has been removed from your favorites.",
    })
  }

  const handleShare = (postId: number) => {
    const post = favoritePosts.find(p => p.id === postId)
    if (navigator.share) {
      navigator.share({
        title: `Post by ${post?.creator.name}`,
        text: post?.content,
        url: `/post/${postId}`
      })
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`)
      toast({
        title: "Link copied",
        description: "Post link has been copied to clipboard.",
      })
    }
  }

  const handleViewPost = (postId: number) => {
    router.push(`/post/${postId}`)
  }

  const handleViewCreator = (creatorId: string) => {
    router.push(`/profile/${creatorId}`)
  }

  const handleUnlockPremium = (postId: number) => {
    const post = favoritePosts.find(p => p.id === postId)
    toast({
      title: "Premium Content",
      description: `Unlock this content for $${post?.price}`,
      action: (
        <Button size="sm" onClick={() => console.log('Purchase premium content:', postId)}>
          Unlock
        </Button>
      ),
    })
  }

  const handleDownload = (postId: number) => {
    toast({
      title: "Download started",
      description: "Your download will begin shortly.",
    })
  }

  const handleCopyLink = (postId: number) => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`)
    toast({
      title: "Link copied",
      description: "Post link has been copied to clipboard.",
    })
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setShowSearch(false)
  }

  const handleClearFilters = () => {
    setFilter('all')
    setSortBy('recent')
    setSearchQuery('')
    setShowSearch(false)
    setShowFilter(false)
  }

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-4 lg:py-6 space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Favorites</h1>
          <p className="text-sm lg:text-base text-muted-foreground">
            {filteredPosts.length} of {favoritePosts.length} saved posts
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowSearch(!showSearch)}
            className={showSearch ? 'bg-primary text-primary-foreground' : ''}
          >
            <Search className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Search</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowFilter(!showFilter)}
            className={showFilter ? 'bg-primary text-primary-foreground' : ''}
          >
            <Filter className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      {(showSearch || showFilter) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {showSearch && (
                <div className="flex-1">
                  <Input
                    placeholder="Search favorites..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
              )}
              {showFilter && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="likes">Most Liked</SelectItem>
                      <SelectItem value="views">Most Viewed</SelectItem>
                      <SelectItem value="alphabetical">Alphabetical</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={handleClearFilters}>
                    Clear
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={filter === category.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(category.id)}
            className="flex items-center space-x-2"
          >
            <span>{category.label}</span>
            <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {category.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Favorites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <Avatar 
                  className="h-10 w-10 cursor-pointer" 
                  onClick={() => handleViewCreator(post.creator.id)}
                >
                  <AvatarImage src={post.creator.avatar} alt={post.creator.name} />
                  <AvatarFallback>{post.creator.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span 
                      className="font-medium truncate cursor-pointer hover:text-primary"
                      onClick={() => handleViewCreator(post.creator.id)}
                    >
                      {post.creator.name}
                    </span>
                    {post.creator.verified && (
                      <Shield className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    )}
                    {post.creator.isCreator && (
                      <Crown className="h-4 w-4 text-purple-600 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">@{post.creator.username}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewPost(post.id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Post
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleViewCreator(post.creator.id)}>
                      <Users className="h-4 w-4 mr-2" />
                      View Creator
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCopyLink(post.id)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload(post.id)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleRemoveFavorite(post.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove from Favorites
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p 
                className="text-sm cursor-pointer hover:text-primary"
                onClick={() => handleViewPost(post.id)}
              >
                {post.content}
              </p>
              
              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* Media Preview */}
              <div 
                className="relative rounded-lg overflow-hidden bg-muted cursor-pointer"
                onClick={() => handleViewPost(post.id)}
              >
                <div className="aspect-video bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                  <div className="text-center text-white">
                    {post.mediaType === 'video' ? (
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
                          <div className="w-0 h-0 border-l-[8px] border-l-white border-y-[6px] border-y-transparent ml-1"></div>
                        </div>
                        <p className="text-lg font-medium">Video Content</p>
                        <p className="text-sm opacity-80">{post.category}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Heart className="h-12 w-12 mx-auto mb-2" />
                        <p className="text-lg font-medium">Media Preview</p>
                        <p className="text-sm opacity-80">{post.category}</p>
                      </div>
                    )}
                  </div>
                </div>
                {post.isPremium && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Crown className="h-8 w-8 mx-auto mb-2" />
                      <p className="font-medium">Premium Content</p>
                      <Button 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleUnlockPremium(post.id)
                        }}
                        className="mt-2"
                      >
                        Unlock for ${post.price}
                      </Button>
                    </div>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-xs">
                    {post.views.toLocaleString()} views
                  </Badge>
                </div>
              </div>
              
              {/* Engagement Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center space-x-1 p-1 ${
                      post.isLiked ? 'text-red-600' : 'hover:text-red-600'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                    <span>{post.likes.toLocaleString()}</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleViewPost(post.id)}
                    className="flex items-center space-x-1 p-1 hover:text-blue-600"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.comments.toLocaleString()}</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleShare(post.id)}
                    className="flex items-center space-x-1 p-1 hover:text-green-600"
                  >
                    <Share className="h-4 w-4" />
                    <span>{post.shares.toLocaleString()}</span>
                  </Button>
                </div>
                <Badge variant="secondary">{post.category}</Badge>
              </div>
              
              {/* Favorited Info */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Bookmark className="h-3 w-3" />
                  <span>Favorited {post.favoritedAt}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{post.timestamp}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredPosts.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {searchQuery ? 'No matching favorites' : 'No favorites yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? `No favorites match "${searchQuery}". Try a different search term.`
                : filter === 'all' 
                  ? "Start saving posts you love by clicking the heart icon on any post."
                  : `No ${filter} posts in your favorites yet.`
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button onClick={() => router.push('/explore')}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Explore Content
              </Button>
              {searchQuery && (
                <Button variant="outline" onClick={handleClearSearch}>
                  Clear Search
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Your Favorites Analytics
          </CardTitle>
          <CardDescription>Summary of your saved content and engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-primary">{favoritePosts.length}</div>
              <div className="text-sm text-muted-foreground">Total Saved</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-blue-600">
                {favoritePosts.filter(p => p.category === 'Fitness').length}
              </div>
              <div className="text-sm text-muted-foreground">Fitness</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-purple-600">
                {favoritePosts.filter(p => p.category === 'Photography').length}
              </div>
              <div className="text-sm text-muted-foreground">Photography</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-green-600">
                {favoritePosts.filter(p => p.category === 'Food').length}
              </div>
              <div className="text-sm text-muted-foreground">Food</div>
            </div>
          </div>
          
          {/* Additional Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg border">
              <div className="text-xl font-bold">
                {favoritePosts.reduce((sum, post) => sum + post.likes, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Likes</div>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <div className="text-xl font-bold">
                {favoritePosts.reduce((sum, post) => sum + post.views, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Views</div>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <div className="text-xl font-bold">
                {favoritePosts.filter(p => p.isPremium).length}
              </div>
              <div className="text-sm text-muted-foreground">Premium Posts</div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </AuthGuard>
  )
}
