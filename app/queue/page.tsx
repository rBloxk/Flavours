"use client"

import React from 'react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Plus, Clock, Edit, Trash2 } from 'lucide-react'

export default function QueuePage() {
  const scheduledPosts = [
    {
      id: 1,
      title: 'Morning Workout Motivation',
      scheduledFor: '2024-01-15 08:00',
      status: 'scheduled',
      type: 'post'
    },
    {
      id: 2,
      title: 'Art Process Behind the Scenes',
      scheduledFor: '2024-01-16 14:30',
      status: 'scheduled',
      type: 'post'
    },
    {
      id: 3,
      title: 'Weekly Recipe Share',
      scheduledFor: '2024-01-17 12:00',
      status: 'scheduled',
      type: 'post'
    }
  ]

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Queue</h1>
          <p className="text-muted-foreground">Manage your scheduled content</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Post
        </Button>
      </div>

      <div className="space-y-4">
        {scheduledPosts.map((post) => (
          <Card key={post.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{post.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Scheduled for {new Date(post.scheduledFor).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{post.status}</Badge>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {scheduledPosts.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No scheduled posts</h3>
            <p className="text-muted-foreground mb-4">Schedule your content to maintain consistent posting</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Your First Post
            </Button>
          </CardContent>
        </Card>
      )}
      </div>
    </AuthGuard>
  )
}
