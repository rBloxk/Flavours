"use client"

import { StorageDashboard } from '@/components/storage/storage-dashboard'

export default function StoragePage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Storage Management</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Manage your content files, view storage statistics, and monitor activity logs.
        </p>
      </div>
      
      <StorageDashboard />
    </div>
  )
}
