"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import VideoPlayer from '@/components/media/video-player'
import { Play, Crown } from 'lucide-react'

// Mock data for FlavourTube videos
const mockVideos = [
  {
    id: 1,
    title: 'Ultimate Workout Routine for Beginners',
    creator: {
      name: 'Sarah Johnson',
      username: '@sarah_fitness',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=random',
      verified: true
    },
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: '12:34',
    views: '125K',
    timestamp: '2 hours ago',
    category: 'Fitness'
  },
  {
    id: 2,
    title: 'Secret Recipe: Perfect Pasta Every Time',
    creator: {
      name: 'Mike Chen',
      username: '@chef_mike',
      avatar: 'https://ui-avatars.com/api/?name=Mike+Chen&background=random',
      verified: true
    },
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration: '8:45',
    views: '89K',
    timestamp: '4 hours ago',
    category: 'Food'
  },
  {
    id: 3,
    title: 'Digital Art Tutorial: Creating Stunning Landscapes',
    creator: {
      name: 'Alex Rivera',
      username: '@alex_artist',
      avatar: 'https://ui-avatars.com/api/?name=Alex+Rivera&background=random',
      verified: false
    },
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: '15:22',
    views: '67K',
    timestamp: '6 hours ago',
    category: 'Art'
  },
  {
    id: 4,
    title: 'Tech Review: Latest Smartphone Features',
    creator: {
      name: 'Emma Wilson',
      username: '@tech_emma',
      avatar: 'https://ui-avatars.com/api/?name=Emma+Wilson&background=random',
      verified: true
    },
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    duration: '10:15',
    views: '156K',
    timestamp: '1 day ago',
    category: 'Technology'
  },
  {
    id: 5,
    title: 'Travel Vlog: Hidden Gems in Tokyo',
    creator: {
      name: 'David Park',
      username: '@travel_david',
      avatar: 'https://ui-avatars.com/api/?name=David+Park&background=random',
      verified: false
    },
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    duration: '18:30',
    views: '78K',
    timestamp: '3 days ago',
    category: 'Travel'
  },
  {
    id: 6,
    title: 'Music Production: Creating Beats from Scratch',
    creator: {
      name: 'Lisa Chen',
      username: '@music_lisa',
      avatar: 'https://ui-avatars.com/api/?name=Lisa+Chen&background=random',
      verified: true
    },
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    duration: '22:45',
    views: '203K',
    timestamp: '5 days ago',
    category: 'Music'
  },
  {
    id: 7,
    title: 'Photography Masterclass: Golden Hour Techniques',
    creator: {
      name: 'James Rodriguez',
      username: '@photo_james',
      avatar: 'https://ui-avatars.com/api/?name=James+Rodriguez&background=random',
      verified: true
    },
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerMeltdowns.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    duration: '14:20',
    views: '92K',
    timestamp: '1 day ago',
    category: 'Photography'
  },
  {
    id: 8,
    title: 'Gaming Setup Tour: Ultimate Streaming Station',
    creator: {
      name: 'Maya Patel',
      username: '@gaming_maya',
      avatar: 'https://ui-avatars.com/api/?name=Maya+Patel&background=random',
      verified: false
    },
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    duration: '16:45',
    views: '134K',
    timestamp: '2 days ago',
    category: 'Gaming'
  },
  {
    id: 9,
    title: 'DIY Home Decor: Transform Your Space',
    creator: {
      name: 'Sophie Kim',
      username: '@diy_sophie',
      avatar: 'https://ui-avatars.com/api/?name=Sophie+Kim&background=random',
      verified: true
    },
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    duration: '11:30',
    views: '87K',
    timestamp: '3 days ago',
    category: 'DIY'
  },
  {
    id: 10,
    title: 'Fashion Haul: Summer Collection 2024',
    creator: {
      name: 'Isabella Torres',
      username: '@fashion_bella',
      avatar: 'https://ui-avatars.com/api/?name=Isabella+Torres&background=random',
      verified: true
    },
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/VolkswagenGTIReview.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
    duration: '13:15',
    views: '156K',
    timestamp: '4 days ago',
    category: 'Fashion'
  },
  {
    id: 11,
    title: 'Coding Tutorial: Building a React App',
    creator: {
      name: 'Ryan Chen',
      username: '@code_ryan',
      avatar: 'https://ui-avatars.com/api/?name=Ryan+Chen&background=random',
      verified: false
    },
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/WeAreGoingOnBullrun.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    duration: '25:40',
    views: '78K',
    timestamp: '5 days ago',
    category: 'Programming'
  },
  {
    id: 12,
    title: 'Pet Care Tips: Training Your Dog',
    creator: {
      name: 'Amanda Foster',
      username: '@pet_amanda',
      avatar: 'https://ui-avatars.com/api/?name=Amanda+Foster&background=random',
      verified: true
    },
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/WhatCarCanYouGetForAGrand.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
    duration: '9:25',
    views: '112K',
    timestamp: '6 days ago',
    category: 'Pets'
  },
  {
    id: 13,
    title: 'Book Review: Must-Read Novels of 2024',
    creator: {
      name: 'Thomas Anderson',
      username: '@book_thomas',
      avatar: 'https://ui-avatars.com/api/?name=Thomas+Anderson&background=random',
      verified: false
    },
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: '18:50',
    views: '65K',
    timestamp: '1 week ago',
    category: 'Books'
  },
  {
    id: 14,
    title: 'Meditation Guide: Finding Inner Peace',
    creator: {
      name: 'Priya Sharma',
      username: '@meditation_priya',
      avatar: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=random',
      verified: true
    },
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration: '12:10',
    views: '98K',
    timestamp: '1 week ago',
    category: 'Wellness'
  },
  {
    id: 15,
    title: 'Car Review: Electric Vehicles Comparison',
    creator: {
      name: 'Marcus Johnson',
      username: '@auto_marcus',
      avatar: 'https://ui-avatars.com/api/?name=Marcus+Johnson&background=random',
      verified: true
    },
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: '20:35',
    views: '145K',
    timestamp: '1 week ago',
    category: 'Automotive'
  }
]

export function FlavourTube() {
  const router = useRouter()

  const handleVideoClick = (videoId: number) => {
    router.push(`/video/${videoId}`)
  }

  return (
    <div className="w-full bg-background">
      {/* YouTube-style Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 w-full">
        {mockVideos.map((video) => (
          <div key={video.id} className="group cursor-pointer" onClick={() => handleVideoClick(video.id)}>
            {/* Video Thumbnail */}
            <div className="relative w-full aspect-video bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg overflow-hidden mb-3">
              <VideoPlayer
                src={video.videoUrl}
                poster={video.thumbnail}
                autoplay={false}
                controls={false}
                muted={true}
                loop={false}
                width="100%"
                height="100%"
                className="w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
              
              {/* Static Preview Overlay */}
              <div className="absolute inset-0 flex items-center justify-center group-hover:opacity-0 transition-opacity duration-300">
                <div className="text-center text-white">
                  <Play className="h-12 w-12 mx-auto mb-2 opacity-80 group-hover:opacity-100 transition-opacity" />
                  <p className="text-sm font-medium opacity-80">Video Preview</p>
                </div>
              </div>
              
              {/* Duration Badge */}
              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                {video.duration}
              </div>
              {/* Featured Badge for first few videos */}
              {video.id <= 3 && (
                <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded font-semibold">
                  FEATURED
                </div>
              )}
            </div>
            
            {/* Video Info */}
            <div className="flex gap-3">
              {/* Creator Avatar */}
              <Avatar className="h-9 w-9 flex-shrink-0">
                <AvatarImage src={video.creator.avatar} alt={video.creator.name} />
                <AvatarFallback className="text-xs">{video.creator.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              
              {/* Video Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm leading-5 mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                  {video.title}
                </h3>
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-xs text-muted-foreground">{video.creator.name}</span>
                  {video.creator.verified && (
                    <Crown className="h-3 w-3 text-yellow-500" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  <span>{video.views} views</span>
                  <span className="mx-1">•</span>
                  <span>{video.timestamp}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
