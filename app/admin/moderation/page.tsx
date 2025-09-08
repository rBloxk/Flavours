"use client"

import { ModerationDashboard } from '@/components/moderation/moderation-dashboard'
import { AuthGuard } from '@/components/auth/auth-guard'

export default function ModerationPage() {
  return (
    <AuthGuard>
      <ModerationDashboard />
    </AuthGuard>
  )
}