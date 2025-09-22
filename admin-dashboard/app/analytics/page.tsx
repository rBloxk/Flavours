'use client'

import React from 'react'

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Platform performance and insights</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Total Users</h3>
            <p className="text-2xl font-bold">12,450</p>
            <p className="text-xs text-green-600">+12.5% from last period</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Revenue</h3>
            <p className="text-2xl font-bold">$125,600</p>
            <p className="text-xs text-green-600">+8.2% from last period</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Content Views</h3>
            <p className="text-2xl font-bold">234,567</p>
            <p className="text-xs text-muted-foreground">5,678 posts published</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Active Creators</h3>
            <p className="text-2xl font-bold">1,234</p>
            <p className="text-xs text-muted-foreground">567 verified creators</p>
          </div>
        </div>
      </div>
    </div>
  )
}