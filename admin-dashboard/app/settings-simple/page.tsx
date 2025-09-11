'use client'

import { AdminLayout } from '@/components/admin-layout'
import { AuthGuard } from '@/components/auth-guard'

export default function SettingsSimplePage() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings (Simple)</h1>
          <p className="text-muted-foreground">Simple settings page for testing</p>
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}
