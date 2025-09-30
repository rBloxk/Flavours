'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
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
  Share2,
  Crown,
  Shield,
  Clock,
  Eye,
  UserPlus,
  UserMinus,
  MoreHorizontal,
  Bookmark,
  BookmarkCheck,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Loader2
} from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'
import { useToast } from '@/hooks/use-toast'

// Types
interface Creator {
  id: string
  name: string
  username: string
  avatar: string
  followers: number
  category: string
  verified: boolean
  isCreator: boolean
  bio: string
  recentPost: string
  engagement: number
  isFollowing?: boolean
  isLiked?: boolean
}

interface Post {
  id: string
  creator: {
    id: string
    name: string
    username: string
    avatar: string
    verified: boolean
  }
  content: string
  media: string
  timestamp: string
  likes: number
  comments: number
  shares: number
  category: string
  isPremium: boolean
  price?: number
  isLiked?: boolean
  isBookmarked?: boolean
  isShared?: boolean
}

interface SearchResult {
  users: Creator[]
  posts: Post[]
  total: number
}

export default function ExplorePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  
  // State management
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('trending')
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null)
  const [trendingCreators, setTrendingCreators] = useState<Creator[]>([])
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([])
  const [followingList, setFollowingList] = useState<Set<string>>(new Set())
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    verified: false,
    premium: false,
    minFollowers: 0,
    maxFollowers: 1000000,
    dateRange: 'all'
  })

  const categories = [
    { id: 'all', label: 'All', icon: TrendingUp },
    { id: 'fitness', label: 'Fitness', icon: Users },
    { id: 'art', label: 'Art', icon: Star },
    { id: 'music', label: 'Music', icon: Star },
    { id: 'food', label: 'Food', icon: Star },
    { id: 'travel', label: 'Travel', icon: Star },
    { id: 'photography', label: 'Photography', icon: Star },
    { id: 'gaming', label: 'Gaming', icon: Star },
    { id: 'education', label: 'Education', icon: Star },
    { id: 'lifestyle', label: 'Lifestyle', icon: Star },
  ]

  // API functions
  const searchContent = useCallback(async (query: string, category: string = 'all') => {
    if (!query.trim()) return null
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/v1/search?q=${encodeURIComponent(query)}&type=all&category=${category}`)
      if (!response.ok) throw new Error('Search failed')
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Search error:', error)
      toast({
        title: 'Search Error',
        description: 'Failed to search content. Please try again.',
        variant: 'destructive'
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const fetchTrendingData = useCallback(async () => {
    setIsLoading(true)
    try {
      // Fetch trending creators and posts
      const [creatorsResponse, postsResponse] = await Promise.all([
        fetch('/api/v1/trending/creators'),
        fetch('/api/v1/posts?sort=trending&limit=10')
      ])

      if (creatorsResponse.ok) {
        const creatorsData = await creatorsResponse.json()
        setTrendingCreators(creatorsData.creators || [])
      }

      if (postsResponse.ok) {
        const postsData = await postsResponse.json()
        setTrendingPosts(postsData.posts || [])
      }
    } catch (error) {
      console.error('Error fetching trending data:', error)
      // Fallback to mock data
      setTrendingCreators(getMockCreators())
      setTrendingPosts(getMockPosts())
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Mock data functions
  const getMockCreators = (): Creator[] => [
    {
      id: '1',
      name: 'Sarah Johnson',
      username: '@sarah_fitness',
      avatar: '/avatars/sarah.jpg',
      followers: 125000,
      category: 'Fitness',
      verified: true,
      isCreator: true,
      bio: 'Certified personal trainer helping you achieve your fitness goals 💪',
      recentPost: 'New HIIT workout routine is live!',
      engagement: 98,
      isFollowing: false
    },
    {
      id: '2',
      name: 'Alex Chen',
      username: '@alex_artist',
      avatar: '/avatars/alex.jpg',
      followers: 89000,
      category: 'Art',
      verified: true,
      isCreator: true,
      bio: 'Digital artist creating stunning visual experiences',
      recentPost: 'Behind the scenes of my latest digital painting',
      engagement: 94,
      isFollowing: false
    },
    {
      id: '3',
      name: 'Maya Rodriguez',
      username: '@maya_cooking',
      avatar: '/avatars/maya.jpg',
      followers: 156000,
      category: 'Food',
      verified: true,
      isCreator: true,
      bio: 'Chef sharing authentic recipes and cooking tips',
      recentPost: 'Traditional pasta recipe from my grandmother',
      engagement: 96,
      isFollowing: false
    }
  ]

  const getMockPosts = (): Post[] => [
    {
      id: '1',
      creator: {
        id: '4',
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
      shares: 23,
      category: 'Fitness',
      isPremium: false,
      isLiked: false,
      isBookmarked: false
    },
    {
      id: '2',
      creator: {
        id: '5',
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
      shares: 15,
      category: 'Photography',
      isPremium: true,
      price: 15,
      isLiked: false,
      isBookmarked: false
    },
    {
      id: '3',
      creator: {
        id: '6',
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
      shares: 45,
      category: 'Music',
      isPremium: false,
      isLiked: false,
      isBookmarked: false
    }
  ]

  // Interaction functions
  const handleFollow = useCallback(async (creatorId: string) => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to follow creators.',
        variant: 'destructive'
      })
      return
    }

    try {
      const isFollowing = followingList.has(creatorId)
      const response = await fetch(`/api/v1/users/${creatorId}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const newFollowingList = new Set(followingList)
        if (isFollowing) {
          newFollowingList.delete(creatorId)
        } else {
          newFollowingList.add(creatorId)
        }
        setFollowingList(newFollowingList)

        // Update trending creators
        setTrendingCreators(prev => prev.map(creator => 
          creator.id === creatorId 
            ? { ...creator, isFollowing: !isFollowing }
            : creator
        ))

        toast({
          title: isFollowing ? 'Unfollowed' : 'Following',
          description: isFollowing ? 'You unfollowed this creator' : 'You are now following this creator'
        })
      }
    } catch (error) {
      console.error('Follow error:', error)
      toast({
        title: 'Error',
        description: 'Failed to update follow status. Please try again.',
        variant: 'destructive'
      })
    }
  }, [user, followingList, toast])

  const handleLike = useCallback(async (postId: string) => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to like posts.',
        variant: 'destructive'
      })
      return
    }

    try {
      const isLiked = likedPosts.has(postId)
      const response = await fetch(`/api/v1/posts/${postId}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const newLikedPosts = new Set(likedPosts)
        if (isLiked) {
          newLikedPosts.delete(postId)
        } else {
          newLikedPosts.add(postId)
        }
        setLikedPosts(newLikedPosts)

        // Update trending posts
        setTrendingPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                isLiked: !isLiked,
                likes: isLiked ? post.likes - 1 : post.likes + 1
              }
            : post
        ))

        toast({
          title: isLiked ? 'Unliked' : 'Liked',
          description: isLiked ? 'You unliked this post' : 'You liked this post'
        })
      }
    } catch (error) {
      console.error('Like error:', error)
      toast({
        title: 'Error',
        description: 'Failed to update like status. Please try again.',
        variant: 'destructive'
      })
    }
  }, [user, likedPosts, toast])

  const handleBookmark = useCallback(async (postId: string) => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to bookmark posts.',
        variant: 'destructive'
      })
      return
    }

    try {
      const isBookmarked = bookmarkedPosts.has(postId)
      const response = await fetch(`/api/v1/posts/${postId}/bookmark`, {
        method: isBookmarked ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const newBookmarkedPosts = new Set(bookmarkedPosts)
        if (isBookmarked) {
          newBookmarkedPosts.delete(postId)
        } else {
          newBookmarkedPosts.add(postId)
        }
        setBookmarkedPosts(newBookmarkedPosts)

        // Update trending posts
        setTrendingPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, isBookmarked: !isBookmarked }
            : post
        ))

        toast({
          title: isBookmarked ? 'Removed from bookmarks' : 'Bookmarked',
          description: isBookmarked ? 'Post removed from your bookmarks' : 'Post added to your bookmarks'
        })
      }
    } catch (error) {
      console.error('Bookmark error:', error)
      toast({
        title: 'Error',
        description: 'Failed to update bookmark status. Please try again.',
        variant: 'destructive'
      })
    }
  }, [user, bookmarkedPosts, toast])

  const handleShare = useCallback(async (postId: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check out this post on Flavours',
          url: `${window.location.origin}/post/${postId}`
        })
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`)
        toast({
          title: 'Link Copied',
          description: 'Post link copied to clipboard'
        })
      }

      // Update share count
      setTrendingPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, shares: post.shares + 1 }
          : post
      ))
    } catch (error) {
      console.error('Share error:', error)
    }
  }, [toast])

  const handleUserClick = useCallback((username: string) => {
    router.push(`/profile/${username.replace('@', '')}`)
  }, [router])

  const handlePostClick = useCallback((postId: string) => {
    router.push(`/post/${postId}`)
  }, [router])

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchContent(searchQuery, selectedCategory).then(setSearchResults)
      } else {
        setSearchResults(null)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, selectedCategory, searchContent])

  // Load initial data
  useEffect(() => {
    fetchTrendingData()
  }, [fetchTrendingData])

  // Filtered data
  const filteredCreators = useMemo(() => {
    let creators = searchResults?.users || trendingCreators

    if (selectedCategory !== 'all') {
      creators = creators.filter(creator => 
        creator.category.toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    if (filters.verified) {
      creators = creators.filter(creator => creator.verified)
    }

    if (filters.minFollowers > 0 || filters.maxFollowers < 1000000) {
      creators = creators.filter(creator => 
        creator.followers >= filters.minFollowers && 
        creator.followers <= filters.maxFollowers
      )
    }

    return creators
  }, [searchResults, trendingCreators, selectedCategory, filters])

  const filteredPosts = useMemo(() => {
    let posts = searchResults?.posts || trendingPosts

    if (selectedCategory !== 'all') {
      posts = posts.filter(post => 
        post.category.toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    if (filters.premium) {
      posts = posts.filter(post => post.isPremium)
    }

    return posts
  }, [searchResults, trendingPosts, selectedCategory, filters])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Page Title */}
          <div className="text-left space-y-2">
            <h1 className="text-3xl font-bold">Explore</h1>
            <p className="text-muted-foreground">Discover amazing creators and trending content</p>
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  {isLoading && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
              
              {/* Advanced Filters */}
              {showFilters && (
                <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Verified Only</label>
                      <input
                        type="checkbox"
                        checked={filters.verified}
                        onChange={(e) => setFilters(prev => ({ ...prev, verified: e.target.checked }))}
                        className="rounded"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Premium Content</label>
                      <input
                        type="checkbox"
                        checked={filters.premium}
                        onChange={(e) => setFilters(prev => ({ ...prev, premium: e.target.checked }))}
                        className="rounded"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sort By</label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="trending">Trending</option>
                        <option value="recent">Recent</option>
                        <option value="popular">Most Popular</option>
                        <option value="engagement">High Engagement</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
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
            <span>{searchQuery ? 'Search Results' : 'Trending Creators'}</span>
          </CardTitle>
          <CardDescription>
            {searchQuery ? `Found ${filteredCreators.length} creators` : 'Top creators gaining momentum this week'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCreators.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No creators found</p>
              {searchQuery && <p className="text-sm">Try adjusting your search or filters</p>}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCreators.map((creator) => (
                <Card key={creator.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-3">
                      <Avatar 
                        className="h-12 w-12 cursor-pointer"
                        onClick={() => handleUserClick(creator.username)}
                      >
                        <AvatarImage src={creator.avatar} alt={creator.name} />
                        <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <span 
                            className="font-medium cursor-pointer hover:underline"
                            onClick={() => handleUserClick(creator.username)}
                          >
                            {creator.name}
                          </span>
                          {creator.verified && (
                            <Shield className="h-4 w-4 text-blue-600" />
                          )}
                          {creator.isCreator && (
                            <Crown className="h-4 w-4 text-purple-600" />
                          )}
                        </div>
                        <p 
                          className="text-sm text-muted-foreground cursor-pointer hover:underline"
                          onClick={() => handleUserClick(creator.username)}
                        >
                          {creator.username}
                        </p>
                        <p className="text-sm">{creator.bio}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{formatNumber(creator.followers)} followers</span>
                          <span>{creator.engagement}% engagement</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            className="flex-1"
                            variant={creator.isFollowing ? "outline" : "default"}
                            onClick={() => handleFollow(creator.id)}
                          >
                            {creator.isFollowing ? (
                              <>
                                <UserMinus className="h-4 w-4 mr-1" />
                                Following
                              </>
                            ) : (
                              <>
                                <UserPlus className="h-4 w-4 mr-1" />
                                Follow
                              </>
                            )}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUserClick(creator.username)}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trending Posts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>{searchQuery ? 'Search Results' : 'Trending Posts'}</span>
          </CardTitle>
          <CardDescription>
            {searchQuery ? `Found ${filteredPosts.length} posts` : 'Most engaging content right now'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No posts found</p>
              {searchQuery && <p className="text-sm">Try adjusting your search or filters</p>}
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post.id} className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Avatar 
                    className="h-10 w-10 cursor-pointer"
                    onClick={() => handleUserClick(post.creator.username)}
                  >
                    <AvatarImage src={post.creator.avatar} alt={post.creator.name} />
                    <AvatarFallback>{post.creator.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <span 
                        className="font-medium cursor-pointer hover:underline"
                        onClick={() => handleUserClick(post.creator.username)}
                      >
                        {post.creator.name}
                      </span>
                      <span 
                        className="text-sm text-muted-foreground cursor-pointer hover:underline"
                        onClick={() => handleUserClick(post.creator.username)}
                      >
                        {post.creator.username}
                      </span>
                      {post.creator.verified && (
                        <Shield className="h-4 w-4 text-blue-600" />
                      )}
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{post.timestamp}</span>
                    </div>
                    <p 
                      className="text-lg cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors"
                      onClick={() => handlePostClick(post.id)}
                    >
                      {post.content}
                    </p>
                    
                    {/* Media Preview */}
                    <div 
                      className="relative rounded-lg overflow-hidden bg-muted cursor-pointer"
                      onClick={() => handlePostClick(post.id)}
                    >
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
                        <button
                          className="flex items-center space-x-1 hover:text-red-500 transition-colors"
                          onClick={() => handleLike(post.id)}
                        >
                          <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                          <span>{formatNumber(post.likes)}</span>
                        </button>
                        <button
                          className="flex items-center space-x-1 hover:text-blue-500 transition-colors"
                          onClick={() => handlePostClick(post.id)}
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span>{formatNumber(post.comments)}</span>
                        </button>
                        <button
                          className="flex items-center space-x-1 hover:text-green-500 transition-colors"
                          onClick={() => handleShare(post.id)}
                        >
                          <Share2 className="h-4 w-4" />
                          <span>{formatNumber(post.shares)}</span>
                        </button>
                        <button
                          className="flex items-center space-x-1 hover:text-yellow-500 transition-colors"
                          onClick={() => handleBookmark(post.id)}
                        >
                          {post.isBookmarked ? (
                            <BookmarkCheck className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          ) : (
                            <Bookmark className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                        {post.isPremium && (
                          <Badge variant="outline" className="text-xs text-purple-600">
                            <Crown className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Discover More */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Discover More</CardTitle>
          <CardDescription>Explore different content types and creators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => router.push('/communities')}
            >
              <Users className="h-6 w-6" />
              <span>Communities</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => setSortBy('trending')}
            >
              <TrendingUp className="h-6 w-6" />
              <span>Trending</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => setFilters(prev => ({ ...prev, verified: true }))}
            >
              <Star className="h-6 w-6" />
              <span>Featured</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => setSortBy('recent')}
            >
              <Clock className="h-6 w-6" />
              <span>Recent</span>
            </Button>
          </div>
        </CardContent>
      </Card> */}
        </div>
      </div>
    </AuthGuard>
  )
}
