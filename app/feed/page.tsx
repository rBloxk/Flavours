"use client"

import { IntelligentFeed } from '@/components/feed/intelligent-feed'
import { AuthGuard } from '@/components/auth/auth-guard'

export default function FeedPage() {
  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto px-4 lg:px-0">
        <IntelligentFeed />
      </div>
    </AuthGuard>
  )
}