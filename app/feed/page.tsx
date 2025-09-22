"use client"

import { IntelligentFeed } from '@/components/feed/intelligent-feed'
import { AuthGuard } from '@/components/auth/auth-guard'

export default function FeedPage() {
  return (
    <AuthGuard>
      <div className="container mx-auto max-w-6xl px-4 py-4 lg:py-6 space-y-4 lg:space-y-6">
        <IntelligentFeed />
      </div>
    </AuthGuard>
  )
}