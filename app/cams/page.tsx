"use client"

import React, { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Users, 
  MessageCircle, 
  Gift, 
  Lock, 
  Camera, 
  Settings,
  Play,
  Pause,
  Volume2,
  VolumeX,
  MoreHorizontal,
  Heart,
  Star,
  Zap,
  Crown,
  Shield,
  Eye,
  EyeOff,
  Download,
  Share2,
  Bookmark,
  Flag,
  TrendingUp,
  BarChart3,
  Clock,
  DollarSign,
  Filter,
  Search,
  Grid,
  List,
  Maximize,
  Minimize,
  RotateCcw,
  Save,
  Trash2,
  Edit,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  X,
  RefreshCw,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  Signal,
  SignalHigh,
  SignalLow,
  SignalZero
} from 'lucide-react'
import { toast } from 'sonner'

interface LiveStream {
  id: string
  creator: {
    id: string
    username: string
    displayName: string
    avatarUrl: string
    isVerified: boolean
    followerCount: number
  }
  title: string
  thumbnail: string
  viewerCount: number
  isLive: boolean
  isPrivate: boolean
  price?: number
  category: string
  tags: string[]
  startTime: string
}

interface ChatMessage {
  id: string
  username: string
  message: string
  timestamp: string
  isGift?: boolean
  giftType?: string
  isModerator?: boolean
  isSubscriber?: boolean
}

interface StreamAnalytics {
  totalViews: number
  peakViewers: number
  totalEarnings: number
  avgWatchTime: number
  engagementRate: number
  newFollowers: number
}

interface StreamSettings {
  title: string
  description: string
  category: string
  tags: string[]
  privacy: 'public' | 'followers' | 'paid'
  price?: number
  quality: '480p' | '720p' | '1080p' | '4K'
  bitrate: number
  fps: number
  audioQuality: 'low' | 'medium' | 'high'
}

interface Recording {
  id: string
  title: string
  duration: string
  size: string
  thumbnail: string
  createdAt: string
  views: number
}

interface Viewer {
  id: string
  username: string
  avatar: string
  isSubscriber: boolean
  isModerator: boolean
  joinTime: string
  watchTime: number
}

export default function CamsPage() {
  const [activeTab, setActiveTab] = useState<'discover' | 'live' | 'private' | 'analytics' | 'recordings'>('discover')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamSettings, setStreamSettings] = useState<StreamSettings>({
    title: '',
    description: '',
    category: 'general',
    tags: [],
    privacy: 'public',
    price: 0,
    quality: '720p',
    bitrate: 2500,
    fps: 30,
    audioQuality: 'medium'
  })
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showViewerList, setShowViewerList] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [streamAnalytics, setStreamAnalytics] = useState<StreamAnalytics>({
    totalViews: 0,
    peakViewers: 0,
    totalEarnings: 0,
    avgWatchTime: 0,
    engagementRate: 0,
    newFollowers: 0
  })
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [viewers, setViewers] = useState<Viewer[]>([])
  const [streamDuration, setStreamDuration] = useState(0)
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good')

  // Mock live streams data
  const [liveStreams] = useState<LiveStream[]>([
    {
      id: '1',
      creator: {
        id: 'user_1',
        username: 'jane_fitness',
        displayName: 'Jane Smith',
        avatarUrl: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150',
        isVerified: true,
        followerCount: 125000
      },
      title: 'Morning Workout Session 💪',
      thumbnail: 'https://images.pexels.com/photos/416809/pexels-photo-416809.jpeg?auto=compress&cs=tinysrgb&w=800',
      viewerCount: 1247,
      isLive: true,
      isPrivate: false,
      category: 'fitness',
      tags: ['workout', 'fitness', 'motivation'],
      startTime: '2h ago'
    },
    {
      id: '2',
      creator: {
        id: 'user_2',
        username: 'artist_maya',
        displayName: 'Maya Chen',
        avatarUrl: 'https://images.pexels.com/photos/1310522/pexels-photo-1310522.jpeg?auto=compress&cs=tinysrgb&w=150',
        isVerified: false,
        followerCount: 45000
      },
      title: 'Digital Art Creation Process 🎨',
      thumbnail: 'https://images.pexels.com/photos/1047540/pexels-photo-1047540.jpeg?auto=compress&cs=tinysrgb&w=800',
      viewerCount: 89,
      isLive: true,
      isPrivate: false,
      category: 'art',
      tags: ['art', 'digital', 'creative'],
      startTime: '1h ago'
    },
    {
      id: '3',
      creator: {
        id: 'user_3',
        username: 'chef_marco',
        displayName: 'Marco Rodriguez',
        avatarUrl: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150',
        isVerified: true,
        followerCount: 89000
      },
      title: 'Exclusive Cooking Class 🍝',
      thumbnail: 'https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg?auto=compress&cs=tinysrgb&w=800',
      viewerCount: 156,
      isLive: true,
      isPrivate: true,
      price: 25,
      category: 'food',
      tags: ['cooking', 'recipe', 'exclusive'],
      startTime: '30m ago'
    },
    {
      id: '4',
      creator: {
        id: 'user_4',
        username: 'gamer_pro',
        displayName: 'Alex Johnson',
        avatarUrl: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=150',
        isVerified: true,
        followerCount: 200000
      },
      title: 'Epic Gaming Session - New Release! 🎮',
      thumbnail: 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=800',
      viewerCount: 3421,
      isLive: true,
      isPrivate: false,
      category: 'gaming',
      tags: ['gaming', 'new-release', 'epic'],
      startTime: '45m ago'
    },
    {
      id: '5',
      creator: {
        id: 'user_5',
        username: 'music_queen',
        displayName: 'Sarah Wilson',
        avatarUrl: 'https://images.pexels.com/photos/1040882/pexels-photo-1040882.jpeg?auto=compress&cs=tinysrgb&w=150',
        isVerified: false,
        followerCount: 67000
      },
      title: 'Acoustic Session - Requests Welcome! 🎵',
      thumbnail: 'https://images.pexels.com/photos/1047541/pexels-photo-1047541.jpeg?auto=compress&cs=tinysrgb&w=800',
      viewerCount: 234,
      isLive: true,
      isPrivate: false,
      category: 'music',
      tags: ['music', 'acoustic', 'requests'],
      startTime: '1h 15m ago'
    }
  ])

  // Mock recordings data
  const mockRecordings: Recording[] = [
    {
      id: '1',
      title: 'Morning Workout Highlights',
      duration: '15:32',
      size: '245 MB',
      thumbnail: 'https://images.pexels.com/photos/416809/pexels-photo-416809.jpeg?auto=compress&cs=tinysrgb&w=300',
      createdAt: '2024-01-15',
      views: 1250
    },
    {
      id: '2',
      title: 'Art Creation Process',
      duration: '28:45',
      size: '456 MB',
      thumbnail: 'https://images.pexels.com/photos/1047540/pexels-photo-1047540.jpeg?auto=compress&cs=tinysrgb&w=300',
      createdAt: '2024-01-14',
      views: 890
    },
    {
      id: '3',
      title: 'Cooking Class - Pasta Making',
      duration: '42:18',
      size: '678 MB',
      thumbnail: 'https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg?auto=compress&cs=tinysrgb&w=300',
      createdAt: '2024-01-13',
      views: 2100
    }
  ]

  // Mock viewers data
  const mockViewers: Viewer[] = [
    {
      id: '1',
      username: 'fitness_fan_123',
      avatar: 'https://images.pexels.com/photos/1040883/pexels-photo-1040883.jpeg?auto=compress&cs=tinysrgb&w=150',
      isSubscriber: true,
      isModerator: false,
      joinTime: '2h ago',
      watchTime: 120
    },
    {
      id: '2',
      username: 'workout_buddy',
      avatar: 'https://images.pexels.com/photos/1040884/pexels-photo-1040884.jpeg?auto=compress&cs=tinysrgb&w=150',
      isSubscriber: false,
      isModerator: true,
      joinTime: '1h 30m ago',
      watchTime: 90
    },
    {
      id: '3',
      username: 'health_enthusiast',
      avatar: 'https://images.pexels.com/photos/1040885/pexels-photo-1040885.jpeg?auto=compress&cs=tinysrgb&w=150',
      isSubscriber: true,
      isModerator: false,
      joinTime: '45m ago',
      watchTime: 45
    }
  ]

  // Initialize mock data
  useEffect(() => {
    setRecordings(mockRecordings)
    setViewers(mockViewers)
    setStreamAnalytics({
      totalViews: 15420,
      peakViewers: 3421,
      totalEarnings: 1250.75,
      avgWatchTime: 18.5,
      engagementRate: 85.2,
      newFollowers: 127
    })
  }, [])

  const handleGoLive = () => {
    setIsStreaming(true)
    toast.success('Going live! Your stream is now active.')
  }

  const handleStopStream = () => {
    setIsStreaming(false)
    toast.success('Stream ended successfully.')
  }

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        username: 'You',
        message: newMessage,
        timestamp: new Date().toLocaleTimeString()
      }
      setChatMessages(prev => [...prev, message])
      setNewMessage('')
    }
  }

  const handleSendGift = (giftType: string) => {
    const giftMessage: ChatMessage = {
      id: Date.now().toString(),
      username: 'You',
      message: `sent a ${giftType}`,
      timestamp: new Date().toLocaleTimeString(),
      isGift: true,
      giftType
    }
    setChatMessages(prev => [...prev, giftMessage])
    toast.success(`Sent ${giftType} to the creator!`)
  }

  // New enhanced functionality handlers
  const handleStartRecording = () => {
    setIsRecording(true)
    toast.success('Recording started!')
  }

  const handleStopRecording = () => {
    setIsRecording(false)
    toast.success('Recording saved!')
  }

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const handleToggleSettings = () => {
    setShowSettings(!showSettings)
  }

  const handleToggleViewerList = () => {
    setShowViewerList(!showViewerList)
  }

  const handleToggleAnalytics = () => {
    setShowAnalytics(!showAnalytics)
  }

  const handleSearchStreams = (query: string) => {
    setSearchQuery(query)
  }

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category)
  }

  const handleToggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid')
  }

  const handleDeleteRecording = (recordingId: string) => {
    setRecordings(prev => prev.filter(r => r.id !== recordingId))
    toast.success('Recording deleted!')
  }

  const handleDownloadRecording = (recordingId: string) => {
    toast.success('Download started!')
  }

  const handleShareRecording = (recordingId: string) => {
    toast.success('Recording shared!')
  }

  const handleBanViewer = (viewerId: string) => {
    setViewers(prev => prev.filter(v => v.id !== viewerId))
    toast.success('Viewer banned!')
  }

  const handleMakeModerator = (viewerId: string) => {
    setViewers(prev => prev.map(v => 
      v.id === viewerId ? { ...v, isModerator: true } : v
    ))
    toast.success('User promoted to moderator!')
  }

  const handleUpdateStreamSettings = (newSettings: Partial<StreamSettings>) => {
    setStreamSettings(prev => ({ ...prev, ...newSettings }))
    toast.success('Stream settings updated!')
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getConnectionQualityIcon = () => {
    switch (connectionQuality) {
      case 'excellent': return <SignalHigh className="h-4 w-4 text-green-500" />
      case 'good': return <Signal className="h-4 w-4 text-blue-500" />
      case 'fair': return <SignalLow className="h-4 w-4 text-yellow-500" />
      case 'poor': return <SignalZero className="h-4 w-4 text-red-500" />
      default: return <Signal className="h-4 w-4 text-blue-500" />
    }
  }

  const getConnectionQualityColor = () => {
    switch (connectionQuality) {
      case 'excellent': return 'text-green-500'
      case 'good': return 'text-blue-500'
      case 'fair': return 'text-yellow-500'
      case 'poor': return 'text-red-500'
      default: return 'text-blue-500'
    }
  }

  const renderDiscoverTab = () => (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Discover Live Streams
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search streams, creators, or tags..."
                value={searchQuery}
                onChange={(e) => handleSearchStreams(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedCategory} onValueChange={handleCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="gaming">Gaming</SelectItem>
                <SelectItem value="fitness">Fitness</SelectItem>
                <SelectItem value="art">Art</SelectItem>
                <SelectItem value="music">Music</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="lifestyle">Lifestyle</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleToggleViewMode}>
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Go Live Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Go Live
          </CardTitle>
          <CardDescription>Start your own live stream and connect with your audience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isStreaming ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Ready to Go Live?</h3>
              <p className="text-muted-foreground mb-6">
                Start streaming and connect with your audience in real-time
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={handleGoLive} size="lg">
                  <Play className="h-4 w-4 mr-2" />
                  Go Live
                </Button>
                <Button variant="outline" size="lg" onClick={handleToggleSettings}>
                  <Settings className="h-4 w-4 mr-2" />
                  Stream Settings
                </Button>
              </div>

              {/* Stream Settings Panel */}
              {showSettings && (
                <div className="mt-6 p-4 bg-muted rounded-lg space-y-4">
                  <h4 className="font-semibold">Stream Settings</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Stream Title</label>
                      <Input
                        placeholder="Enter stream title..."
                        value={streamSettings.title}
                        onChange={(e) => handleUpdateStreamSettings({ title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Category</label>
                      <Select value={streamSettings.category} onValueChange={(value) => handleUpdateStreamSettings({ category: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gaming">Gaming</SelectItem>
                          <SelectItem value="fitness">Fitness</SelectItem>
                          <SelectItem value="art">Art</SelectItem>
                          <SelectItem value="music">Music</SelectItem>
                          <SelectItem value="food">Food</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="lifestyle">Lifestyle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Quality</label>
                      <Select value={streamSettings.quality} onValueChange={(value) => handleUpdateStreamSettings({ quality: value as any })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="480p">480p</SelectItem>
                          <SelectItem value="720p">720p</SelectItem>
                          <SelectItem value="1080p">1080p</SelectItem>
                          <SelectItem value="4K">4K</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Privacy</label>
                      <Select value={streamSettings.privacy} onValueChange={(value) => handleUpdateStreamSettings({ privacy: value as any })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="followers">Followers Only</SelectItem>
                          <SelectItem value="paid">Paid Access</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {streamSettings.privacy === 'paid' && (
                    <div>
                      <label className="text-sm font-medium">Price ($)</label>
                      <Input
                        type="number"
                        placeholder="Enter price..."
                        value={streamSettings.price || ''}
                        onChange={(e) => handleUpdateStreamSettings({ price: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-red-600">You're Live!</h3>
              <p className="text-muted-foreground mb-6">
                Your stream is active and viewers can join
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="destructive" onClick={handleStopStream} size="lg">
                  <Pause className="h-4 w-4 mr-2" />
                  End Stream
                </Button>
                <Button variant="outline" size="lg" onClick={handleToggleSettings}>
                  <Settings className="h-4 w-4 mr-2" />
                  Stream Settings
                </Button>
              </div>

              {/* Live Stream Controls */}
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">Live for {formatDuration(streamDuration)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getConnectionQualityIcon()}
                      <span className={`text-sm font-medium ${getConnectionQualityColor()}`}>
                        {connectionQuality.charAt(0).toUpperCase() + connectionQuality.slice(1)} Connection
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={isRecording ? "destructive" : "outline"}
                      size="sm"
                      onClick={isRecording ? handleStopRecording : handleStartRecording}
                    >
                      {isRecording ? <Pause className="h-4 w-4 mr-1" /> : <Camera className="h-4 w-4 mr-1" />}
                      {isRecording ? 'Stop Recording' : 'Start Recording'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleToggleFullscreen}>
                      {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Streams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {liveStreams.map((stream) => (
          <Card key={stream.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            <div className="relative">
              <img
                src={stream.thumbnail}
                alt={stream.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 left-2 flex gap-2">
                <Badge variant="destructive" className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  LIVE
                </Badge>
                {stream.isPrivate && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Private
                  </Badge>
                )}
              </div>
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 text-white px-2 py-1 rounded">
                <Eye className="h-3 w-3" />
                {stream.viewerCount.toLocaleString()}
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={stream.creator.avatarUrl} alt={stream.creator.displayName} />
                  <AvatarFallback>{stream.creator.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-sm">{stream.creator.displayName}</span>
                    {stream.creator.isVerified && (
                      <Crown className="h-3 w-3 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">@{stream.creator.username}</p>
                </div>
              </div>
              <h3 className="font-semibold text-sm mb-2 line-clamp-2">{stream.title}</h3>
              <div className="flex flex-wrap gap-1 mb-3">
                {stream.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{stream.startTime}</span>
                {stream.isPrivate && stream.price && (
                  <Badge variant="secondary" className="text-xs">
                    ${stream.price}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderLiveTab = () => (
    <div className="space-y-6">
      {/* Stream Player */}
      <Card>
        <CardContent className="p-0">
          <div className="relative bg-black rounded-t-lg">
            <div className="aspect-video bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center">
              <div className="text-center text-white">
                <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">Live Stream Player</h3>
                <p className="text-gray-300">Select a stream to watch</p>
              </div>
            </div>
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge variant="destructive" className="flex items-center gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                LIVE
              </Badge>
            </div>
            <div className="absolute top-4 right-4 flex gap-2">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={handleToggleViewerList}>
                <Users className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={handleToggleAnalytics}>
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Volume2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Viewer List Panel */}
      {showViewerList && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Active Viewers ({viewers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {viewers.map((viewer) => (
                <div key={viewer.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={viewer.avatar} alt={viewer.username} />
                      <AvatarFallback>{viewer.username.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{viewer.username}</span>
                        {viewer.isSubscriber && <Crown className="h-3 w-3 text-yellow-500" />}
                        {viewer.isModerator && <Shield className="h-3 w-3 text-blue-500" />}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Joined {viewer.joinTime} • Watched {viewer.watchTime}min
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {!viewer.isModerator && (
                      <Button variant="outline" size="sm" onClick={() => handleMakeModerator(viewer.id)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleBanViewer(viewer.id)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Panel */}
      {showAnalytics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Stream Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{streamAnalytics.totalViews.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Views</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">{streamAnalytics.peakViewers.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Peak Viewers</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">${streamAnalytics.totalEarnings}</div>
                <div className="text-sm text-muted-foreground">Total Earnings</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{streamAnalytics.avgWatchTime}min</div>
                <div className="text-sm text-muted-foreground">Avg Watch Time</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{streamAnalytics.engagementRate}%</div>
                <div className="text-sm text-muted-foreground">Engagement Rate</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-pink-600">{streamAnalytics.newFollowers}</div>
                <div className="text-sm text-muted-foreground">New Followers</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Live Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-64 overflow-y-auto space-y-2">
                {chatMessages.map((message) => (
                  <div key={message.id} className="flex items-start gap-2 p-2 rounded">
                    <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                    <span className="font-medium text-sm">{message.username}:</span>
                    <span className={`text-sm ${message.isGift ? 'text-yellow-600' : ''}`}>
                      {message.message}
                    </span>
                    {message.isGift && (
                      <Gift className="h-3 w-3 text-yellow-600" />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage}>
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gifts & Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Send Gifts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => handleSendGift('Heart')}>
                  <Heart className="h-4 w-4 mr-1" />
                  Heart
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleSendGift('Star')}>
                  <Star className="h-4 w-4 mr-1" />
                  Star
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleSendGift('Crown')}>
                  <Crown className="h-4 w-4 mr-1" />
                  Crown
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleSendGift('Zap')}>
                  <Zap className="h-4 w-4 mr-1" />
                  Zap
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Viewers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <div className="text-2xl font-bold text-primary mb-2">1,247</div>
                <p className="text-sm text-muted-foreground">Active viewers</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  const renderPrivateTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Private Cams
          </CardTitle>
          <CardDescription>One-on-one private sessions with creators</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-10 w-10 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Private Cam Sessions</h3>
            <p className="text-muted-foreground mb-6">
              Connect with creators for exclusive one-on-one sessions
            </p>
            <div className="flex gap-3 justify-center">
              <Button size="lg">
                <Video className="h-4 w-4 mr-2" />
                Start Private Session
              </Button>
              <Button variant="outline" size="lg">
                <Users className="h-4 w-4 mr-2" />
                Browse Creators
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Streams</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{streamAnalytics.totalViews.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">${streamAnalytics.totalEarnings}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Watch Time</p>
                <p className="text-2xl font-bold">{streamAnalytics.avgWatchTime}min</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Peak Viewers</span>
              <span className="font-bold">{streamAnalytics.peakViewers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Engagement Rate</span>
              <span className="font-bold">{streamAnalytics.engagementRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">New Followers</span>
              <span className="font-bold">{streamAnalytics.newFollowers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Conversion Rate</span>
              <span className="font-bold">12.5%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Growth Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Views Growth</span>
              <span className="font-bold text-green-600">+23.5%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Earnings Growth</span>
              <span className="font-bold text-green-600">+18.2%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Follower Growth</span>
              <span className="font-bold text-green-600">+15.7%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Engagement Growth</span>
              <span className="font-bold text-green-600">+8.3%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderRecordingsTab = () => (
    <div className="space-y-6">
      {/* Recording Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Recording Management
          </CardTitle>
          <CardDescription>Manage your recorded streams and highlights</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button onClick={handleStartRecording} disabled={isRecording}>
              <Camera className="h-4 w-4 mr-2" />
              Start Recording
            </Button>
            <Button variant="outline" onClick={handleStopRecording} disabled={!isRecording}>
              <Pause className="h-4 w-4 mr-2" />
              Stop Recording
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Recording Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recordings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recordings.map((recording) => (
          <Card key={recording.id} className="overflow-hidden">
            <div className="relative">
              <img
                src={recording.thumbnail}
                alt={recording.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                {recording.duration}
              </div>
              <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                {recording.size}
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-2 line-clamp-2">{recording.title}</h3>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <span>{recording.createdAt}</span>
                <span>{recording.views} views</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleDownloadRecording(recording.id)}>
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleShareRecording(recording.id)}>
                  <Share2 className="h-3 w-3 mr-1" />
                  Share
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDeleteRecording(recording.id)}>
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Cams</h1>
            <p className="text-muted-foreground">Live streaming and real-time interaction</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 p-1 bg-muted rounded-lg">
          {[
            { key: 'discover', label: 'Discover', icon: Video },
            { key: 'live', label: 'Live', icon: Play },
            { key: 'private', label: 'Private', icon: Lock },
            { key: 'analytics', label: 'Analytics', icon: BarChart3 },
            { key: 'recordings', label: 'Recordings', icon: Camera }
          ].map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.key as any)}
              className="flex-1"
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'discover' && renderDiscoverTab()}
        {activeTab === 'live' && renderLiveTab()}
        {activeTab === 'private' && renderPrivateTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
        {activeTab === 'recordings' && renderRecordingsTab()}
      </div>
    </AuthGuard>
  )
}
