'use client'

import React from 'react'

export default function CreatorsPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Creator Management</h1>
          <p className="text-muted-foreground">Manage creators and their content</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Total Creators</h3>
            <p className="text-2xl font-bold">1,234</p>
            <p className="text-xs text-blue-600">Active creators</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Verified</h3>
            <p className="text-2xl font-bold">567</p>
            <p className="text-xs text-green-600">Verified creators</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Pending</h3>
            <p className="text-2xl font-bold">89</p>
            <p className="text-xs text-yellow-600">Awaiting verification</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Total Earnings</h3>
            <p className="text-2xl font-bold">$45.6K</p>
            <p className="text-xs text-muted-foreground">This month</p>
          </div>
        </div>
      </div>
    </div>
  )
}