"use client"

import { StorageDashboard } from '@/components/storage/storage-dashboard'

export default function StoragePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Storage Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage your content files, view storage statistics, and monitor activity logs.
        </p>
      </div>
      
      <StorageDashboard />
    </div>
  )
}
