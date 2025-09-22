"use client"

import React from 'react'
import { FlavourTube } from '@/components/feed/flavour-tube'

export default function TubePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">FlavourTube</h1>
          <p className="text-muted-foreground mt-2">
            Discover amazing video content from creators
          </p>
        </div>
        <FlavourTube />
      </div>
    </div>
  )
}
