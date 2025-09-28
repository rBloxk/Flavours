'use client'

import { useState } from 'react'

export function SimpleVideoTest() {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Simple HTML5 Video Test</h3>
      <video
        width="100%"
        height="300"
        controls
        poster="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="rounded-lg"
      >
        <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <p className="text-sm text-muted-foreground">
        Status: {isPlaying ? 'Playing' : 'Paused/Stopped'}
      </p>
    </div>
  )
}

