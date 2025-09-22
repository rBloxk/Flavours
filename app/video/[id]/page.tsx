"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Heart, 
  MessageCircle, 
  Share, 
  Bookmark,
  Crown,
  MoreHorizontal,
  Clock,
  Eye
} from 'lucide-react'

interface VideoData {
  id: string
  title: string
  description: string
  duration: string
  views: string
  timestamp: string
  creator: {
    id: string
    name: string
    username: string
    avatar: string
    verified: boolean
    subscribers: string
  }
  tags: string[]
  likes: number
  comments: number
  isLiked: boolean
  isBookmarked: boolean
}

export default function VideoDetailPage() {
  const router = useRouter()
  const params = useParams()
  const videoId = params.id as string
  
  const [video, setVideo] = useState<VideoData | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Mock video data - in real app, fetch from API
  useEffect(() => {
    const mockVideo: VideoData = {
      id: videoId,
      title: `Amazing Video Content ${videoId}`,
      description: "This is a detailed description of the video content. It includes information about what the video covers, key points, and additional context for viewers.",
      duration: "5:30",
      views: "1.2M",
      timestamp: "2 days ago",
      creator: {
        id: "creator1",
        name: "Creative Creator",
        username: "creativecreator",
        avatar: "/api/placeholder/100/100",
        verified: true,
        subscribers: "500K"
      },
      tags: ["tutorial", "creative", "amazing", "content"],
      likes: 12500,
      comments: 342,
      isLiked: false,
      isBookmarked: false
    }
    
    setVideo(mockVideo)
    setIsLoading(false)
  }, [videoId])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleMuteToggle = () => {
    setIsMuted(!isMuted)
  }

  const handleLike = () => {
    if (video) {
      setVideo({
        ...video,
        isLiked: !video.isLiked,
        likes: video.isLiked ? video.likes - 1 : video.likes + 1
      })
    }
  }

  const handleBookmark = () => {
    if (video) {
      setVideo({
        ...video,
        isBookmarked: !video.isBookmarked
      })
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: video?.title,
        text: video?.description,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      // Show toast notification
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Video Not Found</h1>
          <Button onClick={() => router.push('/feed')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Feed
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Area */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-4">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="mb-4">
                    {isPlaying ? (
                      <Pause className="h-16 w-16 mx-auto opacity-80" />
                    ) : (
                      <Play className="h-16 w-16 mx-auto opacity-80" />
                    )}
                  </div>
                  <p className="text-lg font-medium">Video Player</p>
                  <p className="text-sm opacity-60 mt-2">{video.duration}</p>
                </div>
              </div>
              
              {/* Video Controls Overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePlayPause}
                    className="text-white hover:text-white/80"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMuteToggle}
                    className="text-white hover:text-white/80"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-white text-sm">
                    {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')} / {video.duration}
                  </span>
                </div>
              </div>
            </div>

            {/* Video Info */}
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{video.views} views</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{video.timestamp}</span>
                  </div>
                </div>
              </div>

              {/* Creator Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12 cursor-pointer">
                    <AvatarImage src={video.creator.avatar} alt={video.creator.name} />
                    <AvatarFallback>{video.creator.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{video.creator.name}</h3>
                      {video.creator.verified && (
                        <Crown className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{video.creator.subscribers} subscribers</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Subscribe
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-4 mb-6">
                <Button
                  variant={video.isLiked ? "default" : "outline"}
                  onClick={handleLike}
                  className="flex items-center space-x-2"
                >
                  <Heart className={`h-4 w-4 ${video.isLiked ? 'fill-current' : ''}`} />
                  <span>{video.likes.toLocaleString()}</span>
                </Button>
                
                <Button variant="outline" className="flex items-center space-x-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>{video.comments}</span>
                </Button>
                
                <Button variant="outline" onClick={handleShare} className="flex items-center space-x-2">
                  <Share className="h-4 w-4" />
                  <span>Share</span>
                </Button>
                
                <Button
                  variant={video.isBookmarked ? "default" : "outline"}
                  onClick={handleBookmark}
                  className="flex items-center space-x-2"
                >
                  <Bookmark className={`h-4 w-4 ${video.isBookmarked ? 'fill-current' : ''}`} />
                  <span>Save</span>
                </Button>
              </div>

              {/* Description */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <p className="text-sm leading-relaxed">{video.description}</p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {video.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Comments Section */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-4">{video.comments} Comments</h3>
                  
                  {/* Comment Input */}
                  <div className="flex space-x-3 mb-6">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/api/placeholder/32/32" alt="User" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <textarea
                        placeholder="Add a comment..."
                        className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        rows={3}
                      />
                      <div className="flex justify-end mt-2">
                        <Button size="sm">Comment</Button>
                      </div>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/api/placeholder/32/32" alt="User" />
                          <AvatarFallback>U{i}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm">User {i}</span>
                            <span className="text-xs text-muted-foreground">2 days ago</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            This is a sample comment. Great video content! Really enjoyed watching this.
                          </p>
                          <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="sm" className="h-6 px-2">
                              <Heart className="h-3 w-3 mr-1" />
                              <span className="text-xs">12</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 px-2">
                              <MessageCircle className="h-3 w-3 mr-1" />
                              <span className="text-xs">Reply</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar Actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">

              {/* Related Videos */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Related Videos</h3>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex space-x-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg">
                        <div className="w-24 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center">
                          <Play className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium line-clamp-2">Related Video {i}</h4>
                          <p className="text-xs text-muted-foreground mt-1">Creator Name</p>
                          <p className="text-xs text-muted-foreground">1.2K views • 2 days ago</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
