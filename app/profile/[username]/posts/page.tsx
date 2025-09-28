'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  Search, 
  Image, 
  Video, 
  Play, 
  Clock,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Eye,
  Globe,
  Users,
  Lock,
  Edit,
  Trash2,
  MoreHorizontal,
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
  TrendingUp,
  BarChart3
} from 'lucide-react'

// Mock data for posts
const mockPosts = [
  {
    id: '1',
    content: 'Just finished an amazing workout session! 💪 The energy today was incredible.',
    media: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
        alt: 'Workout session',
        thumbnail: '',
        duration: null
      }
    ],
    stats: { 
      likes: 1247, 
      comments: 89, 
      shares: 23, 
      views: 3456,
      bookmarks: 12
    },
    createdAt: '2024-01-15T10:30:00Z',
    privacy: 'public',
    is_liked: false,
    is_bookmarked: false,
    category: 'Fitness',
    tags: ['workout', 'fitness', 'motivation']
  },
  {
    id: '2',
    content: 'Sharing some behind-the-scenes content from my latest project! 🎬',
    media: [
      {
        type: 'video',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        alt: 'Behind the scenes',
        thumbnail: 'https://images.unsplash.com/photo-1489599804349-5b0b0b0b0b0b?w=800&h=600&fit=crop',
        duration: 120
      }
    ],
    stats: { 
      likes: 2156, 
      comments: 134, 
      shares: 45, 
      views: 7890,
      bookmarks: 28
    },
    createdAt: '2024-01-14T15:45:00Z',
    privacy: 'followers',
    is_liked: true,
    is_bookmarked: true,
    category: 'Content Creation',
    tags: ['behind-the-scenes', 'project', 'video']
  },
  {
    id: '3',
    content: 'Quick photography tip: Golden hour magic ✨',
    media: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop',
        alt: 'Golden hour photography',
        thumbnail: '',
        duration: null
      }
    ],
    stats: { 
      likes: 892, 
      comments: 67, 
      shares: 18, 
      views: 2345,
      bookmarks: 8
    },
    createdAt: '2024-01-13T18:20:00Z',
    privacy: 'public',
    is_liked: false,
    is_bookmarked: false,
    category: 'Photography',
    tags: ['photography', 'tips', 'golden-hour']
  },
  {
    id: '4',
    content: 'Short video tutorial on perfect lighting!',
    media: [
      {
        type: 'video',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        alt: 'Lighting tutorial',
        thumbnail: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop',
        duration: 45
      }
    ],
    stats: { 
      likes: 1456, 
      comments: 98, 
      shares: 32, 
      views: 4567,
      bookmarks: 15
    },
    createdAt: '2024-01-12T12:15:00Z',
    privacy: 'public',
    is_liked: true,
    is_bookmarked: false,
    category: 'Tutorial',
    tags: ['tutorial', 'lighting', 'video']
  },
  {
    id: '5',
    content: 'Another beautiful sunset captured today 🌅',
    media: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        alt: 'Sunset photography',
        thumbnail: '',
        duration: null
      }
    ],
    stats: { 
      likes: 678, 
      comments: 45, 
      shares: 12, 
      views: 1890,
      bookmarks: 5
    },
    createdAt: '2024-01-11T19:30:00Z',
    privacy: 'public',
    is_liked: false,
    is_bookmarked: true,
    category: 'Photography',
    tags: ['sunset', 'nature', 'photography']
  },
  {
    id: '6',
    content: 'Quick 30-second cooking tip!',
    media: [
      {
        type: 'video',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        alt: 'Cooking tip',
        thumbnail: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
        duration: 30
      }
    ],
    stats: { 
      likes: 1123, 
      comments: 76, 
      shares: 28, 
      views: 3456,
      bookmarks: 19
    },
    createdAt: '2024-01-10T14:00:00Z',
    privacy: 'followers',
    is_liked: false,
    is_bookmarked: false,
    category: 'Cooking',
    tags: ['cooking', 'tips', 'quick']
  }
]

export default function PostsPage() {
  const params = useParams()
  const router = useRouter()
  const username = params.username as string
  
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [filterBy, setFilterBy] = useState('all')
  const [viewMode, setViewMode] = useState('list')
  const [posts, setPosts] = useState(mockPosts)
  const [isLoading, setIsLoading] = useState(false)

  // Filter and search posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesFilter = filterBy === 'all' || 
                         (filterBy === 'images' && post.media[0].type === 'image') ||
                         (filterBy === 'videos' && post.media[0].type === 'video') ||
                         (filterBy === 'public' && post.privacy === 'public') ||
                         (filterBy === 'followers' && post.privacy === 'followers') ||
                         (filterBy === 'liked' && post.is_liked) ||
                         (filterBy === 'bookmarked' && post.is_bookmarked)
    
    return matchesSearch && matchesFilter
  })

  // Sort posts
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'popular':
        return b.stats.likes - a.stats.likes
      case 'views':
        return b.stats.views - a.stats.views
      case 'comments':
        return b.stats.comments - a.stats.comments
      default:
        return 0
    }
  })

  const handlePostClick = (postId: string) => {
    router.push(`/post/${postId}`)
  }

  const handleLikePost = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              is_liked: !post.is_liked,
              stats: {
                ...post.stats,
                likes: post.is_liked ? post.stats.likes - 1 : post.stats.likes + 1
              }
            }
          : post
      ))
    } catch (error) {
      console.error('Error liking post:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookmarkPost = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              is_bookmarked: !post.is_bookmarked,
              stats: {
                ...post.stats,
                bookmarks: post.is_bookmarked ? post.stats.bookmarks - 1 : post.stats.bookmarks + 1
              }
            }
          : post
      ))
    } catch (error) {
      console.error('Error bookmarking post:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSharePost = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              stats: {
                ...post.stats,
                shares: post.stats.shares + 1
              }
            }
          : post
      ))
    } catch (error) {
      console.error('Error sharing post:', error)
    }
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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d ago`
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Posts</h1>
            <p className="text-muted-foreground">@{username}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Create Post
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Tabs value={filterBy} onValueChange={setFilterBy}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="images">Images</TabsTrigger>
                  <TabsTrigger value="videos">Videos</TabsTrigger>
                  <TabsTrigger value="public">Public</TabsTrigger>
                  <TabsTrigger value="followers">Followers</TabsTrigger>
                  <TabsTrigger value="liked">Liked</TabsTrigger>
                  <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
                </TabsList>
              </Tabs>
              <Tabs value={sortBy} onValueChange={setSortBy}>
                <TabsList>
                  <TabsTrigger value="recent">Recent</TabsTrigger>
                  <TabsTrigger value="popular">Popular</TabsTrigger>
                  <TabsTrigger value="views">Views</TabsTrigger>
                  <TabsTrigger value="comments">Comments</TabsTrigger>
                </TabsList>
              </Tabs>
              <Tabs value={viewMode} onValueChange={setViewMode}>
                <TabsList>
                  <TabsTrigger value="list">List</TabsTrigger>
                  <TabsTrigger value="grid">Grid</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts List/Grid */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
        {sortedPosts.length === 0 ? (
          <Card className={viewMode === 'grid' ? 'col-span-full' : ''}>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No posts found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try adjusting your search terms' : 'No posts to display'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          sortedPosts.map((post) => (
            <Card 
              key={post.id} 
              className={`cursor-pointer hover:shadow-md transition-shadow ${viewMode === 'grid' ? 'h-fit' : ''}`}
              onClick={() => handlePostClick(post.id)}
            >
              <CardContent className={viewMode === 'grid' ? 'p-4' : 'p-6'}>
                {viewMode === 'list' ? (
                  // List View
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            {post.category}
                          </Badge>
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            {getPrivacyIcon(post.privacy)}
                            <span className="capitalize">{post.privacy}</span>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(post.createdAt)}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>

                    <p className="mb-4 text-base leading-relaxed">{post.content}</p>

                    {post.media && post.media.length > 0 && (
                      <div className="mb-4">
                        {post.media[0].type === 'image' ? (
                          <img
                            src={post.media[0].url}
                            alt={post.media[0].alt}
                            className="w-full max-h-96 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="relative">
                            <video
                              src={post.media[0].url}
                              poster={post.media[0].thumbnail}
                              className="w-full max-h-96 rounded-lg"
                              muted
                            />
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {post.media[0].duration ? formatDuration(post.media[0].duration) : ''}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <Separator className="my-4" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`flex items-center space-x-2 ${post.is_liked ? 'text-red-500' : ''}`}
                          onClick={(e) => handleLikePost(post.id, e)}
                        >
                          <Heart className={`h-4 w-4 ${post.is_liked ? 'fill-current' : ''}`} />
                          <span>{post.stats.likes}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.stats.comments}</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`flex items-center space-x-2 ${post.is_bookmarked ? 'text-blue-500' : ''}`}
                          onClick={(e) => handleBookmarkPost(post.id, e)}
                        >
                          <Bookmark className={`h-4 w-4 ${post.is_bookmarked ? 'fill-current' : ''}`} />
                          <span>{post.stats.bookmarks}</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex items-center space-x-2"
                          onClick={(e) => handleSharePost(post.id, e)}
                        >
                          <Share2 className="h-4 w-4" />
                          <span>{post.stats.shares}</span>
                        </Button>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        <span>{post.stats.views}</span>
                      </div>
                    </div>

                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {post.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  // Grid View
                  <>
                    <div className="relative mb-3">
                      {post.media[0].type === 'image' ? (
                        <img
                          src={post.media[0].url}
                          alt={post.media[0].alt}
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                      ) : (
                        <div className="relative">
                          <video
                            src={post.media[0].url}
                            poster={post.media[0].thumbnail}
                            className="w-full aspect-square object-cover rounded-lg"
                            muted
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Play className="h-8 w-8 text-white opacity-80" />
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {post.media[0].duration ? formatDuration(post.media[0].duration) : ''}
                          </div>
                        </div>
                      )}
                      <div className="absolute top-2 left-2 flex space-x-1">
                        <Badge variant="secondary" className="text-xs">
                          {post.category}
                        </Badge>
                        <div className="flex items-center space-x-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {getPrivacyIcon(post.privacy)}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm line-clamp-2 mb-2">{post.content}</p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatDate(post.createdAt)}</span>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <Heart className="h-3 w-3" />
                          <span>{post.stats.likes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-3 w-3" />
                          <span>{post.stats.comments}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{post.stats.views}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Stats Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{posts.length}</div>
              <div className="text-sm text-muted-foreground">Total Posts</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {posts.reduce((sum, post) => sum + post.stats.likes, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Likes</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {posts.reduce((sum, post) => sum + post.stats.comments, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Comments</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {posts.reduce((sum, post) => sum + post.stats.views, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Views</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {posts.filter(post => post.is_liked).length}
              </div>
              <div className="text-sm text-muted-foreground">Liked Posts</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {posts.filter(post => post.is_bookmarked).length}
              </div>
              <div className="text-sm text-muted-foreground">Bookmarked</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
