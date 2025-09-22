"use client"

import React from 'react'
import { FlavourLicks } from '@/components/feed/flavour-licks'

export default function LicksPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">FlavourLicks</h1>
          <p className="text-muted-foreground mt-2">
            Explore trending content and popular posts
          </p>
        </div>
        <FlavourLicks />
      </div>
    </div>
  )
}
