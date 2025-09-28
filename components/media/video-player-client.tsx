'use client'

import { useEffect, useRef, useState } from 'react'

interface VideoPlayerClientProps {
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

export default function VideoPlayerClient({
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
}: VideoPlayerClientProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedData = () => {
      setIsLoaded(true)
      onReady?.(video)
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
      console.error(errorMsg, e)
      onError?.(e)
    }

    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('error', handleError)

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('error', handleError)
    }
  }, [onReady, onPlay, onPause, onEnded, onError])

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
    <div className={`video-player-wrapper ${className}`}>
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