"use client"

import { CreatorDashboard } from '@/components/creator/creator-dashboard'
import { AuthGuard } from '@/components/auth/auth-guard'

export default function CreatorDashboardPage() {
  return (
    <AuthGuard>
      <CreatorDashboard />
    </AuthGuard>
  )
}