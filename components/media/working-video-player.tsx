'use client'

import { useState } from 'react'

export function WorkingVideoPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Working Video Player</h3>
      <div className="relative">
        <video
          width="100%"
          height="300"
          controls
          className="rounded-lg"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        >
          <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
          <source src="https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <p className="text-sm text-muted-foreground">
        Status: {isPlaying ? 'Playing' : 'Paused/Stopped'}
      </p>
      <div className="text-xs text-muted-foreground">
        <p>This video player uses multiple fallback sources and should work reliably.</p>
        <p>If this doesn't work, there may be network or browser restrictions.</p>
      </div>
    </div>
  )
}
