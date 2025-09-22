'use client'

import React from 'react'

export default function ContentPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Content Management</h1>
          <p className="text-muted-foreground">Manage and moderate platform content</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Pending Review</h3>
            <p className="text-2xl font-bold">23</p>
            <p className="text-xs text-yellow-600">Awaiting moderation</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Approved</h3>
            <p className="text-2xl font-bold">1,456</p>
            <p className="text-xs text-green-600">Published content</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Rejected</h3>
            <p className="text-2xl font-bold">89</p>
            <p className="text-xs text-red-600">Violation reports</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Total Views</h3>
            <p className="text-2xl font-bold">2.3M</p>
            <p className="text-xs text-muted-foreground">Across all content</p>
          </div>
        </div>
      </div>
    </div>
  )
}