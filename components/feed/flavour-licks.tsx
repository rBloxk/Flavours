"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { VideoPlayer } from '@/components/media/video-player'
import { Play, Heart, MessageCircle, Crown, Share2, MoreHorizontal, Volume2, VolumeX } from 'lucide-react'

// Mock data for Flavour Licks (shorts)
const mockShorts = [
  {
    id: 1,
    title: 'Quick 30-second workout tip!',
    creator: {
      name: 'Sarah Johnson',
      username: '@sarah_fitness',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=random',
      verified: true
    },
    likes: '12K',
    comments: '234',
    timestamp: '2 hours ago',
    duration: '0:30'
  },
  {
    id: 2,
    title: 'Amazing cooking hack you need to try',
    creator: {
      name: 'Mike Chen',
      username: '@chef_mike',
      avatar: 'https://ui-avatars.com/api/?name=Mike+Chen&background=random',
      verified: true
    },
    likes: '8.5K',
    comments: '156',
    timestamp: '4 hours ago',
    duration: '0:45'
  },
  {
    id: 3,
    title: 'Digital art technique in 60 seconds',
    creator: {
      name: 'Alex Rivera',
      username: '@alex_artist',
      avatar: 'https://ui-avatars.com/api/?name=Alex+Rivera&background=random',
      verified: false
    },
    likes: '6.2K',
    comments: '89',
    timestamp: '6 hours ago',
    duration: '1:00'
  },
  {
    id: 4,
    title: 'Tech tip: Hidden smartphone feature',
    creator: {
      name: 'Emma Wilson',
      username: '@tech_emma',
      avatar: 'https://ui-avatars.com/api/?name=Emma+Wilson&background=random',
      verified: true
    },
    likes: '15.3K',
    comments: '412',
    timestamp: '1 day ago',
    duration: '0:25'
  },
  {
    id: 5,
    title: 'Travel hack: Packing like a pro',
    creator: {
      name: 'David Park',
      username: '@travel_david',
      avatar: 'https://ui-avatars.com/api/?name=David+Park&background=random',
      verified: false
    },
    likes: '9.7K',
    comments: '178',
    timestamp: '3 days ago',
    duration: '0:40'
  },
  {
    id: 6,
    title: 'Music production: Quick beat making',
    creator: {
      name: 'Lisa Chen',
      username: '@music_lisa',
      avatar: 'https://ui-avatars.com/api/?name=Lisa+Chen&background=random',
      verified: true
    },
    likes: '20.1K',
    comments: '567',
    timestamp: '5 days ago',
    duration: '0:55'
  },
  {
    id: 7,
    title: 'Photography: Golden hour secrets',
    creator: {
      name: 'James Rodriguez',
      username: '@photo_james',
      avatar: 'https://ui-avatars.com/api/?name=James+Rodriguez&background=random',
      verified: true
    },
    likes: '11.8K',
    comments: '298',
    timestamp: '1 day ago',
    duration: '0:35'
  },
  {
    id: 8,
    title: 'Gaming setup: RGB lighting tips',
    creator: {
      name: 'Maya Patel',
      username: '@gaming_maya',
      avatar: 'https://ui-avatars.com/api/?name=Maya+Patel&background=random',
      verified: false
    },
    likes: '7.4K',
    comments: '134',
    timestamp: '2 days ago',
    duration: '0:50'
  },
  {
    id: 9,
    title: 'DIY: Transform your space in minutes',
    creator: {
      name: 'Sophie Kim',
      username: '@diy_sophie',
      avatar: 'https://ui-avatars.com/api/?name=Sophie+Kim&background=random',
      verified: true
    },
    likes: '13.6K',
    comments: '345',
    timestamp: '3 days ago',
    duration: '0:42'
  },
  {
    id: 10,
    title: 'Fashion: Style hack for any outfit',
    creator: {
      name: 'Isabella Torres',
      username: '@fashion_bella',
      avatar: 'https://ui-avatars.com/api/?name=Isabella+Torres&background=random',
      verified: true
    },
    likes: '16.9K',
    comments: '423',
    timestamp: '4 days ago',
    duration: '0:38'
  }
]

export function FlavourLicks() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [touchStartY, setTouchStartY] = useState(0)
  const [touchEndY, setTouchEndY] = useState(0)

  const currentShort = mockShorts[currentIndex]

  const handleVideoClick = () => {
    router.push(`/video/${currentShort.id}`)
  }

  // Handle swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.targetTouches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndY(e.targetTouches[0].clientY)
  }

  const handleTouchEnd = () => {
    if (!touchStartY || !touchEndY) return
    
    const distance = touchStartY - touchEndY
    const isUpSwipe = distance > 50
    const isDownSwipe = distance < -50

    if (isUpSwipe && currentIndex < mockShorts.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
    if (isDownSwipe && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1)
      } else if (e.key === 'ArrowDown' && currentIndex < mockShorts.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else if (e.key === ' ') {
        e.preventDefault()
        setIsPlaying(!isPlaying)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, isPlaying])

  return (
    <div className="relative w-xl bg-black overflow-hidden">
      {/* Single Video Display */}
      <div 
        className="relative w-full h-screen flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Video Player */}
        <div className="relative w-full h-full">
          <VideoPlayer
            src={currentShort.videoUrl}
            poster={currentShort.thumbnail}
            autoplay={isPlaying}
            controls={false}
            muted={isMuted}
            loop={true}
            width="100%"
            height="100%"
            className="w-full h-full object-cover"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          
          {/* Play/Pause Overlay */}
          {!isPlaying && (
            <div 
              className="absolute inset-0 flex items-center justify-center cursor-pointer"
              onClick={handleVideoClick}
            >
              <div className="text-center text-white">
                <Play className="h-12 w-12 mx-auto mb-4 opacity-80" />
                <p className="text-xl font-medium mb-2">Short Video</p>
                <p className="text-base opacity-80">{currentShort.title}</p>
                <p className="text-sm opacity-60 mt-2">{currentShort.duration}</p>
              </div>
            </div>
          )}
        </div>

        {/* Top Controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <div className="flex items-center space-x-2">
            <span className="text-white text-sm font-medium">Flavour Licks</span>
            <span className="text-white/60 text-xs">{currentIndex + 1} / {mockShorts.length}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-white/80 p-2"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-white/80 p-2"
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Play/Pause Button */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Button
            variant="ghost"
            size="lg"
            className="text-white hover:text-white/80 p-6"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            <Play className="h-12 w-12 opacity-60 hover:opacity-100 transition-opacity" />
          </Button>
        </div>

        {/* Right Side Actions */}
        <div className="absolute right-4 bottom-20 flex flex-col space-y-4 z-10">
          {/* Creator Avatar */}
          <div className="flex flex-col items-center space-y-2">
            <Avatar className="h-12 w-12 border-2 border-white">
              <AvatarImage src={currentShort.creator.avatar} alt={currentShort.creator.name} />
              <AvatarFallback className="text-sm">{currentShort.creator.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-white/80 p-1 bg-red-500 hover:bg-red-600 rounded-full"
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col items-center space-y-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-white/80 p-2 flex flex-col items-center space-y-1"
            >
              <Heart className="h-6 w-6" />
              <span className="text-xs font-medium">{currentShort.likes}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-white/80 p-2 flex flex-col items-center space-y-1"
            >
              <MessageCircle className="h-6 w-6" />
              <span className="text-xs font-medium">{currentShort.comments}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-white/80 p-2 flex flex-col items-center space-y-1"
            >
              <Share2 className="h-6 w-6" />
              <span className="text-xs font-medium">Share</span>
            </Button>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="absolute bottom-4 left-4 right-20 z-10">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-white font-medium text-sm">{currentShort.creator.name}</span>
            {currentShort.creator.verified && (
              <Crown className="h-4 w-4 text-yellow-500" />
            )}
          </div>
          <p className="text-white text-sm mb-1">{currentShort.title}</p>
          <p className="text-white/60 text-xs">{currentShort.creator.username}</p>
          <p className="text-white/60 text-xs">{currentShort.timestamp}</p>
        </div>

        {/* Progress Indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-10">
          <div 
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / mockShorts.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Swipe Instructions */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-10">
        <p className="text-white/60 text-xs text-center">
          Swipe up for next • Swipe down for previous
        </p>
      </div>
    </div>
  )
}
