"use client"

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { QRCodeModal } from '@/components/ui/qr-code-modal'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { 
  ArrowLeft,
  Crown,
  Users,
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  MoreHorizontal,
  Calendar,
  MapPin,
  Link,
  Settings,
  Bell,
  Shield,
  DollarSign,
  Globe,
  Lock,
  Image,
  Video,
  Play,
  Clock,
  Mail
} from 'lucide-react'

// Mock data - in a real app, this would come from an API
const mockProfiles = [
  {
    id: 'creator1',
    username: 'photographer_sarah',
    display_name: 'Sarah Johnson',
    avatar_url: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=random',
    cover_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop',
    bio: 'Professional photographer capturing life\'s beautiful moments 📸 | Available for weddings, portraits & events | DM for bookings',
    location: 'Los Angeles, CA',
    website: 'sarahjohnson.photo',
    joinDate: 'March 2023',
    is_verified: true,
    is_creator: true,
    stats: {
      followers: 12500,
      following: 342,
      posts: 156,
      likes: 89400
    },
    subscription: {
      price: 9.99,
      currency: 'USD',
      subscribers: 1200
    },
    posts: [
      {
        id: '1',
        content: 'Just finished an amazing photoshoot! The lighting was perfect and the results are incredible.',
        media: [
          {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
            alt: 'Photography setup',
            thumbnail: '',
            duration: null
          }
        ],
        stats: { likes: 1247, comments: 89 },
        createdAt: '2 hours ago',
        privacy: 'public'
      },
      {
        id: '2',
        content: 'Behind the scenes of my latest portrait session. The connection between photographer and subject is everything.',
        media: [
          {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop',
            alt: 'Portrait session',
            thumbnail: '',
            duration: null
          }
        ],
        stats: { likes: 892, comments: 45 },
        createdAt: '1 day ago',
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
        stats: { likes: 654, comments: 23 },
        createdAt: '2 days ago',
        privacy: 'public'
      },
      {
        id: '4',
        content: 'Photography tutorial: Mastering composition',
        media: [
          {
            type: 'video',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            thumbnail: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800&h=600&fit=crop',
            alt: 'Photography tutorial',
            duration: 180 // 3 minutes
          }
        ],
        stats: { likes: 1203, comments: 67 },
        createdAt: '3 days ago',
        privacy: 'followers'
      },
      {
        id: '5',
        content: 'Quick editing tip!',
        media: [
          {
            type: 'video',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            thumbnail: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800&h=600&fit=crop',
            alt: 'Quick editing tip',
            duration: 30 // 30 seconds - short video
          }
        ],
        stats: { likes: 456, comments: 12 },
        createdAt: '4 days ago',
        privacy: 'public'
      },
      {
        id: '6',
        content: 'Another beautiful sunset captured',
        media: [
          {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
            alt: 'Sunset photography',
            thumbnail: '',
            duration: null
          }
        ],
        stats: { likes: 789, comments: 34 },
        createdAt: '5 days ago',
        privacy: 'public'
      }
    ]
  },
  {
    id: 'creator2',
    username: 'jane_fitness',
    display_name: 'Jane Smith',
    avatar_url: 'https://ui-avatars.com/api/?name=Jane+Smith&background=random',
    cover_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=400&fit=crop',
    bio: 'Fitness enthusiast and certified trainer 💪 | Sharing workout routines, nutrition tips, and motivation | Let\'s achieve our goals together!',
    location: 'Miami, FL',
    website: 'janesmithfitness.com',
    joinDate: 'February 2023',
    is_verified: true,
    is_creator: true,
    stats: {
      followers: 23400,
      following: 892,
      posts: 245,
      likes: 156800
    },
    subscription: {
      price: 19.99,
      currency: 'USD',
      subscribers: 2100
    },
    posts: [
      {
        id: 'fitness1',
        content: 'New workout video is live! 💪 Who\'s ready to sweat with me? This 30-minute HIIT session will challenge every muscle group. Perfect for beginners and advanced athletes alike! #FitnessMotivation #HIIT #Workout',
        media: [
          {
            type: 'video',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
            alt: 'HIIT workout session',
            duration: 1800 // 30 minutes
          }
        ],
        stats: { likes: 2340, comments: 156 },
        createdAt: '2 hours ago',
        privacy: 'public'
      },
      {
        id: 'fitness2',
        content: 'Nutrition tip of the day: Hydration is key! 💧 Make sure you\'re drinking enough water throughout your workout. Your body will thank you! #Hydration #FitnessTips',
        media: [
          {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
            alt: 'Water bottle during workout',
            thumbnail: '',
            duration: null
          }
        ],
        stats: { likes: 892, comments: 45 },
        createdAt: '1 day ago',
        privacy: 'public'
      },
      {
        id: 'fitness3',
        content: 'Morning motivation: Every expert was once a beginner. Every pro was once an amateur. Every icon was once an unknown. Don\'t be afraid to start! 🌟 #MotivationMonday',
        media: [],
        stats: { likes: 1456, comments: 78 },
        createdAt: '2 days ago',
        privacy: 'public'
      }
    ]
  }
]

export function ProfilePageClient() {
  const params = useParams()
  const router = useRouter()
  const username = params.username as string
  const { toast } = useToast()
  const [isFollowing, setIsFollowing] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [activeContentTab, setActiveContentTab] = useState('all')
  
  // Find the profile by username
  const profile = mockProfiles.find(p => p.username === username)

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
    if (type === 'all') return profile?.posts || []
    return profile?.posts.filter(post => classifyContent(post) === type) || []
  }

  const getContentStats = () => {
    const posts = profile?.posts || []
    return {
      all: posts.length,
      image: posts.filter(post => classifyContent(post) === 'image').length,
      video: posts.filter(post => classifyContent(post) === 'video').length,
      shortVideo: posts.filter(post => classifyContent(post) === 'shortVideo').length
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`
  }
  
  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-muted-foreground mb-6">The user you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const handlePostClick = (postId: string) => {
    router.push(`/post/${postId}`)
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

  return (
    <div className="max-w-6xl mx-auto"><br/>
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="p-0">
          {/* Cover Photo Section */}
          <div className="relative h-48 w-full rounded-t-lg overflow-hidden">
            <img
              src={profile.cover_url}
              alt="Cover photo"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
          
          {/* Profile Info Section */}
          <div className="p-6 -mt-16 relative">
            {/* Avatar positioned properly */}
            <div className="flex flex-col items-center mb-6">
              <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
                <AvatarFallback className="text-3xl">
                  {profile.display_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            
            {/* Profile Details */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <h1 className="text-3xl font-bold">{profile.display_name}</h1>
                {profile.is_verified && (
                  <Crown className="h-6 w-6 text-yellow-500" />
                )}
              </div>
              <Badge variant="secondary" className="mb-3">@{profile.username}</Badge>
              
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-4">
                {profile.bio}
              </p>
              
              {/* Profile Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground mb-4">
                {profile.location && (
                  <div className="flex items-center justify-center space-x-2">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span>{profile.location}</span>
                  </div>
                )}
                <div className="flex items-center justify-center space-x-2">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span>jane.fitness@example.com</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>Joined {profile.joinDate}</span>
                </div>
              </div>
              
              {/* Website Link */}
              {profile.website && (
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <Link className="h-4 w-4 flex-shrink-0" />
                  <a href={`https://${profile.website}`} className="hover:underline text-blue-600">
                    {profile.website}
                  </a>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  // Toggle notification settings for this user
                  toast({
                    title: "Notification Settings",
                    description: `Notifications for @${profile.username} ${isFollowing ? 'enabled' : 'disabled'}`,
                  });
                }}
              >
                <Bell className="mr-2 h-4 w-4" />
                {isFollowing ? 'Notifications' : 'Turn On'}
              </Button>
              <QRCodeModal
                profileUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/profile/${profile.username}`}
                profileData={{
                  displayName: profile.display_name,
                  username: profile.username,
                  avatarUrl: profile.avatar_url,
                  isVerified: profile.is_verified,
                  isCreator: profile.is_creator,
                  bio: profile.bio
                }}
              >
                <Button variant="outline" size="sm">
                  <Share className="mr-2 h-4 w-4" />
                  Share Profile
                </Button>
              </QRCodeModal>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/profile/${profile.username}`);
                    toast({
                      title: "Copied!",
                      description: "Profile link copied to clipboard",
                    });
                  }}>
                    <Share className="mr-2 h-4 w-4" />
                    Copy Link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    toast({
                      title: "Report Profile",
                      description: "Profile reported successfully",
                    });
                  }}>
                    <Shield className="mr-2 h-4 w-4" />
                    Report Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    toast({
                      title: "Block User",
                      description: `@${profile.username} has been blocked`,
                    });
                  }}>
                    <Lock className="mr-2 h-4 w-4" />
                    Block User
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {profile.is_creator && (
                <>
                  <Button 
                    variant={isFollowing ? "secondary" : "default"}
                    onClick={() => {
                      setIsFollowing(!isFollowing)
                      toast({
                        title: isFollowing ? "Unfollowed" : "Following",
                        description: `You ${isFollowing ? 'unfollowed' : 'are now following'} @${profile.username}`,
                      });
                    }}
                    size="sm"
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                  <Button 
                    variant={isSubscribed ? "secondary" : "default"}
                    onClick={() => {
                      setIsSubscribed(!isSubscribed)
                      toast({
                        title: isSubscribed ? "Unsubscribed" : "Subscribed",
                        description: `You ${isSubscribed ? 'unsubscribed from' : 'subscribed to'} @${profile.username} for $${profile.subscription.price}/month`,
                      });
                    }}
                    size="sm"
                  >
                    <DollarSign className="mr-2 h-4 w-4" />
                    {isSubscribed ? 'Subscribed' : `Subscribe $${profile.subscription.price}`}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
          toast({
            title: "Followers",
            description: `@${profile.username} has ${profile.stats.followers.toLocaleString()} followers`,
          });
        }}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{profile.stats.followers.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Followers</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
          toast({
            title: "Following",
            description: `@${profile.username} is following ${profile.stats.following.toLocaleString()} users`,
          });
        }}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{profile.stats.following.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Following</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
          toast({
            title: "Posts",
            description: `@${profile.username} has ${profile.stats.posts.toLocaleString()} posts`,
          });
        }}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{profile.stats.posts.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Posts</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
          toast({
            title: "Total Likes",
            description: `@${profile.username} has received ${profile.stats.likes.toLocaleString()} likes`,
          });
        }}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{profile.stats.likes.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Likes</div>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="posts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="posts">Posts</TabsTrigger>
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
          {profile.is_creator && (
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {profile.posts.map((post) => (
            <Card key={post.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handlePostClick(post.id)}>
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
                      <AvatarFallback>
                        {profile.display_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{profile.display_name}</h3>
                        {profile.is_verified && (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        )}
                        <Badge variant="secondary" className="text-xs">
                          @{profile.username}
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
                        toast({
                          title: "Copied!",
                          description: "Post link copied to clipboard",
                        });
                      }}>
                        <Share className="mr-2 h-4 w-4" />
                        Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        toast({
                          title: "Saved",
                          description: "Post saved to your collection",
                        });
                      }}>
                        <Bookmark className="mr-2 h-4 w-4" />
                        Save Post
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        toast({
                          title: "Reported",
                          description: "Post reported successfully",
                        });
                      }}>
                        <Shield className="mr-2 h-4 w-4" />
                        Report Post
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                      className="flex items-center space-x-2 hover:text-red-500 transition-colors"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        toast({
                          title: "Liked",
                          description: "Post liked successfully",
                        });
                      }}
                    >
                      <Heart className="h-4 w-4" />
                      <span>{post.stats.likes}</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center space-x-2 hover:text-blue-500 transition-colors"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        toast({
                          title: "Comments",
                          description: "Opening comments section",
                        });
                      }}
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.stats.comments}</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center space-x-2 hover:text-green-500 transition-colors"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
                        toast({
                          title: "Shared",
                          description: "Post link copied to clipboard",
                        });
                      }}
                    >
                      <Share className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="hover:text-yellow-500 transition-colors"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      toast({
                        title: "Bookmarked",
                        description: "Post saved to your bookmarks",
                      });
                    }}
                  >
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
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
              <p className="text-muted-foreground">Images posted by {profile.display_name} will appear here.</p>
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
              <p className="text-muted-foreground">Videos posted by {profile.display_name} will appear here.</p>
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
              <p className="text-muted-foreground">Short videos posted by {profile.display_name} will appear here.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="likes">
          <div className="text-center py-8">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No liked posts yet</h3>
            <p className="text-muted-foreground">Posts that {profile.display_name} likes will appear here.</p>
          </div>
        </TabsContent>

        {profile.is_creator && (
          <TabsContent value="subscription">
            <Card>
              <CardHeader className="p-8 pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Subscription Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-8 pt-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Monthly Subscription</span>
                  <span className="text-2xl font-bold">${profile.subscription.price}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subscribers</span>
                  <span className="font-medium">{profile.subscription.subscribers.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Monthly Revenue</span>
                  <span className="font-medium">
                    ${(profile.subscription.price * profile.subscription.subscribers).toLocaleString()}
                  </span>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium">Subscription Benefits</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Access to exclusive content</li>
                    <li>• Behind-the-scenes photos and videos</li>
                    <li>• Direct messaging with {profile.display_name}</li>
                    <li>• Early access to new posts</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
