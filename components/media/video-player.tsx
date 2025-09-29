'use client'

import { useEffect, useRef, useState } from 'react'

interface VideoPlayerProps {
  src: string
  poster?: string
  autoplay?: boolean
  controls?: boolean
  muted?: boolean
  loop?: boolean
  preload?: 'auto' | 'metadata' | 'none'
  width?: number | string
  height?: number | string
  className?: string
  onReady?: (player: any) => void
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
  onError?: (error: any) => void
}

export function VideoPlayer({
  src,
  poster,
  autoplay = false,
  controls = true,
  muted = false,
  loop = false,
  preload = 'metadata',
  width = '100%',
  height = 'auto',
  className = '',
  onReady,
  onPlay,
  onPause,
  onEnded,
  onError
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !videoRef.current) return

    const video = videoRef.current

    const handleCanPlay = () => {
      console.log('Video can play:', src)
      setIsLoaded(true)
      onReady?.(video)
    }

    const handleLoadStart = () => {
      console.log('Video load started:', src)
    }

    const handleLoadedData = () => {
      console.log('Video data loaded:', src)
    }

    const handleLoadedMetadata = () => {
      console.log('Video metadata loaded:', src)
    }

    const handlePlay = () => {
      onPlay?.()
    }

    const handlePause = () => {
      onPause?.()
    }

    const handleEnded = () => {
      onEnded?.()
    }

    const handleError = (e: any) => {
      const errorMsg = `Video error: ${video.error?.message || 'Unknown error'}`
      setError(errorMsg)
      console.error('Video error:', errorMsg, e, 'Source:', src)
      console.error('Video element:', video)
      console.error('Video network state:', video.networkState)
      console.error('Video ready state:', video.readyState)
      onError?.(e)
    }

    // Use canplay event instead of loadeddata for better compatibility
    video.addEventListener('loadstart', handleLoadStart)
    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('error', handleError)

    return () => {
      video.removeEventListener('loadstart', handleLoadStart)
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('error', handleError)
    }
  }, [mounted, onReady, onPlay, onPause, onEnded, onError, src])

  if (!mounted) {
    return (
      <div className="video-player-loading" style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px'
      }}>
        <div className="text-white">Loading video player...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`video-player-wrapper ${className}`} style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        color: 'white',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div>
          <p className="text-red-400 mb-2">Video Error</p>
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-2 opacity-70">Source: {src}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`video-player-wrapper ${className}`} style={{ position: 'relative' }}>
      <video
        ref={videoRef}
        width={typeof width === 'number' ? width : undefined}
        height={typeof height === 'number' ? height : undefined}
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height
        }}
        controls={controls}
        autoPlay={autoplay}
        muted={muted}
        loop={loop}
        preload={preload}
        poster={poster}
        className="w-full h-full rounded-lg"
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {!isLoaded && !error && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-sm">Loading video...</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Enhanced VideoPlayer with additional features
export function EnhancedVideoPlayer({
  src,
  poster,
  autoplay = false,
  controls = true,
  muted = false,
  loop = false,
  preload = 'metadata',
  width = '100%',
  height = 'auto',
  className = '',
  showTitle = false,
  title,
  showProgress = true,
  onReady,
  onPlay,
  onPause,
  onEnded,
  onError
}: VideoPlayerProps & {
  showTitle?: boolean
  title?: string
  showProgress?: boolean
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)

  const handlePlay = () => {
    setIsPlaying(true)
    onPlay?.()
  }

  const handlePause = () => {
    setIsPlaying(false)
    onPause?.()
  }

  const handleReady = (player: any) => {
    onReady?.(player)
    
    // Set up additional event listeners for HTML5 video
    if (player && player.addEventListener) {
      player.addEventListener('timeupdate', () => {
        setCurrentTime(player.currentTime || 0)
      })
      
      player.addEventListener('loadedmetadata', () => {
        setDuration(player.duration || 0)
      })
      
      player.addEventListener('volumechange', () => {
        setVolume(player.volume || 1)
      })
    }
  }

  return (
    <div className={`enhanced-video-player ${className}`}>
      {showTitle && title && (
        <div className="video-title mb-2">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      )}
      
      <VideoPlayer
        src={src}
        poster={poster}
        autoplay={autoplay}
        controls={controls}
        muted={muted}
        loop={loop}
        preload={preload}
        width={width}
        height={height}
        onReady={handleReady}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={onEnded}
        onError={onError}
      />
      
      {showProgress && (
        <div className="video-progress mt-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1 mt-1">
            <div 
              className="bg-primary h-1 rounded-full transition-all duration-200"
              style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Utility function to format time
function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00'
  
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}