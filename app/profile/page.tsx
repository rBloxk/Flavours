"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { QRCodeModal } from '@/components/ui/qr-code-modal'
import { useProfile } from '@/hooks/use-profile'
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Link as LinkIcon, 
  Edit, 
  Camera,
  Shield,
  Crown,
  Heart,
  MessageCircle,
  Share,
  Image,
  Video,
  Play,
  Clock,
  Globe,
  Users,
  Lock,
  Upload,
  X,
  RefreshCw,
  Bookmark,
  Eye
} from 'lucide-react'

// Mock data for posts - in a real app, this would come from an API
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
    stats: { likes: 24, comments: 8 },
    createdAt: '2h ago',
    privacy: 'public'
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
    stats: { likes: 156, comments: 23 },
    createdAt: '1d ago',
    privacy: 'followers'
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
    stats: { likes: 89, comments: 12 },
    createdAt: '2d ago',
    privacy: 'public'
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
    stats: { likes: 203, comments: 34 },
    createdAt: '3d ago',
    privacy: 'public'
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
    stats: { likes: 67, comments: 9 },
    createdAt: '4d ago',
    privacy: 'public'
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
    stats: { likes: 145, comments: 28 },
    createdAt: '5d ago',
    privacy: 'followers'
  }
]

export default function ProfilePage() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [activeContentTab, setActiveContentTab] = useState('all')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Use the profile hook - always use demo-user for now
  const {
    profile: apiProfile,
    posts,
    postsStats,
    loading: profileLoading,
    error: profileError,
    postsLoading,
    postsError,
    fetchProfile,
    fetchPosts,
    updateProfile,
    performAction,
    performPostAction
  } = useProfile('demo-user')
  
  // Form state for edit profile
  const [editForm, setEditForm] = useState({
    displayName: '',
    bio: '',
    location: '',
    website: '',
    interests: [] as string[]
  })

  // Load posts when tab changes
  useEffect(() => {
    if (apiProfile) {
      fetchPosts(activeContentTab)
    }
  }, [activeContentTab, apiProfile, fetchPosts])

  // Content classification functions
  const classifyContent = (post: any) => {
    if (!post.media || post.media.length === 0) return 'text'
    
    const media = post.media[0]
    if (media.type === 'image') return 'image'
    if (media.type === 'video') {
      // Short videos are 60 seconds or less
      return media.duration && media.duration <= 60 ? 'shortVideo' : 'video'
    }
    return 'other'
  }

  const getContentByType = (type: string) => {
    if (type === 'all') return posts
    return posts.filter(post => classifyContent(post) === type)
  }

  const getContentStats = () => {
    if (!postsStats) return { all: 0, image: 0, video: 0, shortVideo: 0 }
    return {
      all: postsStats.total,
      image: postsStats.images,
      video: postsStats.videos,
      shortVideo: postsStats.shortVideos
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`
  }

  const handlePostClick = async (postId: string) => {
    // Record view
    try {
      await performPostAction(postId, 'view')
    } catch (error) {
      console.error('Failed to record view:', error)
    }
    router.push(`/post/${postId}`)
  }

  const handleLikePost = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await performPostAction(postId, 'like')
    } catch (error) {
      console.error('Failed to like post:', error)
    }
  }

  const handleBookmarkPost = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await performPostAction(postId, 'bookmark')
    } catch (error) {
      console.error('Failed to bookmark post:', error)
    }
  }

  const handleSharePost = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await performPostAction(postId, 'share')
    } catch (error) {
      console.error('Failed to share post:', error)
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

  // Initialize edit form when modal opens
  const handleEditProfileOpen = () => {
    const currentProfile = apiProfile || demoProfile
    setEditForm({
      displayName: currentProfile.display_name,
      bio: currentProfile.bio || '',
      location: currentProfile.location || '',
      website: currentProfile.website || '',
      interests: currentProfile.interests || []
    })
    setIsEditModalOpen(true)
  }

  // Handle edit profile form submission
  const handleEditProfileSubmit = async () => {
    setIsLoading(true)
    try {
      const updates = {
        display_name: editForm.displayName,
        bio: editForm.bio,
        location: editForm.location,
        website: editForm.website,
        interests: editForm.interests
      }
      
      await updateProfile(updates)
      setIsEditModalOpen(false)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle interest tag removal
  const removeInterest = (interestToRemove: string) => {
    setEditForm(prev => ({
      ...prev,
      interests: prev.interests.filter(interest => interest !== interestToRemove)
    }))
  }

  // Handle adding new interest
  const addInterest = (newInterest: string) => {
    if (newInterest.trim() && !editForm.interests.includes(newInterest.trim())) {
      setEditForm(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }))
    }
  }


  // Demo mode - show profile even without authentication
  const demoProfile = {
    id: 'demo-user',
    user_id: 'demo-user',
    username: 'demo_user',
    display_name: 'Demo User',
    avatar_url: 'https://ui-avatars.com/api/?name=Demo+User&background=random',
    bio: 'Demo user bio',
    is_creator: true,
    is_verified: false,
    created_at: new Date().toISOString()
  }

  const demoUser = {
    id: 'demo-user',
    email: 'demo@example.com',
    user_metadata: {
      username: 'demo_user',
      display_name: 'Demo User',
      is_creator: true
    }
  }

  // Use API data if available, fallback to demo data
  const currentUser = user || demoUser
  const currentProfile = apiProfile || demoProfile

  // Show loading state
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Show error state
  if (profileError) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Error Loading Profile</h3>
          <p className="text-muted-foreground mb-4">{profileError}</p>
          <Button onClick={fetchProfile}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-4 lg:py-6 space-y-4 lg:space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative">
              <Avatar className="h-32 w-32">
                <AvatarImage src={currentProfile.avatar_url} alt={currentProfile.display_name} />
                <AvatarFallback className="text-8xl">
                  {currentProfile.display_name?.charAt(0) || currentUser.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full">
                <Camera className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <h1 className="text-3xl font-bold">{currentProfile.display_name}</h1>
                {currentProfile.is_verified && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {currentProfile.is_creator && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    <Crown className="h-3 w-3 mr-1" />
                    Creator
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">@{currentProfile.username}</p>
              {currentProfile.bio && (
                <p className="text-lg">{currentProfile.bio}</p>
              )}
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date(currentProfile.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Mail className="h-4 w-4" />
                  <span>{currentUser.email}</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleEditProfileOpen}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <QRCodeModal
                profileUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/profile/${currentProfile.username}`}
                profileData={{
                  displayName: currentProfile.display_name,
                  username: currentProfile.username,
                  avatarUrl: currentProfile.avatar_url,
                  isVerified: currentProfile.is_verified,
                  isCreator: currentProfile.is_creator,
                  bio: currentProfile.bio
                }}
              >
                <Button variant="outline">
                  <Share className="h-4 w-4 mr-2" />
                  Share Profile
                </Button>
              </QRCodeModal>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {currentProfile.followers_count >= 1000 
                  ? `${(currentProfile.followers_count / 1000).toFixed(1)}K`
                  : currentProfile.followers_count.toLocaleString()
                }
              </div>
              <div className="text-sm text-muted-foreground">Followers</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {currentProfile.following_count >= 1000 
                  ? `${(currentProfile.following_count / 1000).toFixed(1)}K`
                  : currentProfile.following_count.toLocaleString()
                }
              </div>
              <div className="text-sm text-muted-foreground">Following</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{currentProfile.posts_count}</div>
              <div className="text-sm text-muted-foreground">Posts</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {currentProfile.likes_received >= 1000 
                  ? `${(currentProfile.likes_received / 1000).toFixed(1)}K`
                  : currentProfile.likes_received.toLocaleString()
                }
              </div>
              <div className="text-sm text-muted-foreground">Likes</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Content Classification Tabs - 60% (3/5 columns) */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Posts ({getContentStats().all})</TabsTrigger>
              <TabsTrigger value="images" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Images ({getContentStats().image})
              </TabsTrigger>
              <TabsTrigger value="videos" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Videos ({getContentStats().video})
              </TabsTrigger>
              <TabsTrigger value="shortVideos" className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Short Videos ({getContentStats().shortVideo})
              </TabsTrigger>
            </TabsList>

        <TabsContent value="all" className="space-y-4">
          {postsLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : postsError ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{postsError}</p>
              <Button onClick={() => fetchPosts(activeContentTab)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground">Posts by {currentProfile.display_name} will appear here.</p>
            </div>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handlePostClick(post.id)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={post.avatar_url} alt={post.display_name} />
                        <AvatarFallback>
                          {post.display_name?.charAt(0) || post.username?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{post.display_name}</h3>
                          {currentProfile.is_verified && (
                            <Crown className="h-4 w-4 text-yellow-500" />
                          )}
                          <Badge variant="secondary" className="text-xs">
                            @{post.username}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            {getPrivacyIcon(post.privacy)}
                            <span className="capitalize">{post.privacy}</span>
                          </div>
                        </div>
                      </div>
                    </div>
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
                        <video
                          src={post.media[0].url}
                          poster={post.media[0].thumbnail}
                          controls
                          className="w-full max-h-96 rounded-lg"
                        />
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
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex items-center space-x-2"
                        onClick={(e) => handleSharePost(post.id, e)}
                      >
                        <Share className="h-4 w-4" />
                        <span>{post.stats.shares}</span>
                      </Button>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      <span>{post.stats.views}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="images">
          {getContentByType('image').length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {getContentByType('image').map((post) => (
                post.media?.map((media, index) => (
                  <div key={`${post.id}-${index}`} className="aspect-square rounded-lg overflow-hidden cursor-pointer group relative" onClick={() => handlePostClick(post.id)}>
                    <img
                      src={media.url}
                      alt={media.alt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center space-x-2 text-white">
                        <Heart className="h-4 w-4" />
                        <span className="text-sm font-medium">{post.stats.likes}</span>
                      </div>
                    </div>
                  </div>
                ))
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No images yet</h3>
              <p className="text-muted-foreground">Images posted by {currentProfile.display_name} will appear here.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="videos">
          {getContentByType('video').length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {getContentByType('video').map((post) => (
                post.media?.map((media, index) => (
                  <div key={`${post.id}-${index}`} className="aspect-square rounded-lg overflow-hidden cursor-pointer group relative" onClick={() => handlePostClick(post.id)}>
                    <video
                      src={media.url}
                      poster={media.thumbnail}
                      className="w-full h-full object-cover"
                      muted
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center space-x-2 text-white">
                        <Play className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {'duration' in media && media.duration ? formatDuration(media.duration as number) : ''}
                    </div>
                  </div>
                ))
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No videos yet</h3>
              <p className="text-muted-foreground">Videos posted by {currentProfile.display_name} will appear here.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="shortVideos">
          {getContentByType('shortVideo').length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {getContentByType('shortVideo').map((post) => (
                post.media?.map((media, index) => (
                  <div key={`${post.id}-${index}`} className="aspect-square rounded-lg overflow-hidden cursor-pointer group relative" onClick={() => handlePostClick(post.id)}>
                    <video
                      src={media.url}
                      poster={media.thumbnail}
                      className="w-full h-full object-cover"
                      muted
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center space-x-2 text-white">
                        <Play className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {'duration' in media && media.duration ? formatDuration(media.duration as number) : ''}
                    </div>
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-medium">
                      SHORT
                    </div>
                  </div>
                ))
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No short videos yet</h3>
              <p className="text-muted-foreground">Short videos posted by {currentProfile.display_name} will appear here.</p>
            </div>
          )}
        </TabsContent>
          </Tabs>
        </div>

        {/* About & Interests Sidebar - 40% (2/5 columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {currentProfile.location && (
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{currentProfile.location}</span>
                  </div>
                )}
                {currentProfile.website && (
                  <div className="flex items-center space-x-2 text-sm">
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={currentProfile.website.startsWith('http') ? currentProfile.website : `https://${currentProfile.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {currentProfile.website}
                    </a>
                  </div>
                )}
                {currentProfile.social_links && (
                  <div className="space-y-1">
                    {currentProfile.social_links.twitter && (
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-muted-foreground">Twitter:</span>
                        <span>{currentProfile.social_links.twitter}</span>
                      </div>
                    )}
                    {currentProfile.social_links.instagram && (
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-muted-foreground">Instagram:</span>
                        <span>{currentProfile.social_links.instagram}</span>
                      </div>
                    )}
                    {currentProfile.social_links.youtube && (
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-muted-foreground">YouTube:</span>
                        <span>{currentProfile.social_links.youtube}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {currentProfile.bio && (
                <>
                  <Separator />
                  <p className="text-sm text-muted-foreground">
                    {currentProfile.bio}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Interests */}
          <Card>
            <CardHeader>
              <CardTitle>Interests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {currentProfile.interests && currentProfile.interests.length > 0 ? (
                  currentProfile.interests.map((interest, index) => (
                    <Badge key={index} variant="secondary">{interest}</Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No interests added yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Creator Stats */}
          {currentProfile.is_creator && (
            <Card>
              <CardHeader>
                <CardTitle>Creator Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {currentProfile.subscription_count || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Subscribers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      ${currentProfile.total_earnings?.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Earnings</div>
                  </div>
                </div>
                {/* {currentProfile.subscription_price && (
                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      ${currentProfile.subscription_price}/month
                    </div>
                    <div className="text-sm text-muted-foreground">Subscription Price</div>
                  </div>
                )} */}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Profile
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Profile Image Upload */}
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={currentProfile.avatar_url} alt={currentProfile.display_name} />
                <AvatarFallback className="text-xl">
                  {currentProfile.display_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Change Photo
                </Button>
                <p className="text-sm text-muted-foreground mt-1">
                  JPG, PNG or GIF. Max size 2MB.
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={editForm.displayName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder="Enter your display name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={editForm.location}
                  onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="City, Country"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={editForm.website}
                onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={editForm.bio}
                onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself..."
                rows={4}
                maxLength={500}
              />
              <p className="text-sm text-muted-foreground">
                {editForm.bio.length}/500 characters
              </p>
            </div>

            {/* Interests */}
            <div className="space-y-2">
              <Label>Interests</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {editForm.interests.map((interest) => (
                  <Badge key={interest} variant="secondary" className="flex items-center gap-1">
                    {interest}
                    <button
                      onClick={() => removeInterest(interest)}
                      className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add an interest..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addInterest(e.currentTarget.value)
                      e.currentTarget.value = ''
                    }
                  }}
                />
                <Button
                  variant="outline"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement
                    addInterest(input.value)
                    input.value = ''
                  }}
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditProfileSubmit} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      </div>
  )
}
