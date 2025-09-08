"use client"

import React from 'react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Users, Heart, MessageCircle, Eye, DollarSign } from 'lucide-react'

export default function StatisticsPage() {
  const stats = [
    {
      title: 'Total Views',
      value: '125.4K',
      change: '+12.5%',
      icon: Eye,
      color: 'text-blue-600'
    },
    {
      title: 'Followers',
      value: '8.2K',
      change: '+8.3%',
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: 'Likes',
      value: '45.7K',
      change: '+15.2%',
      icon: Heart,
      color: 'text-red-600'
    },
    {
      title: 'Comments',
      value: '3.2K',
      change: '+6.7%',
      icon: MessageCircle,
      color: 'text-purple-600'
    },
    {
      title: 'Earnings',
      value: '$2.4K',
      change: '+18.9%',
      icon: DollarSign,
      color: 'text-yellow-600'
    },
    {
      title: 'Engagement Rate',
      value: '4.2%',
      change: '+2.1%',
      icon: TrendingUp,
      color: 'text-orange-600'
    }
  ]

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Statistics</h1>
          <p className="text-muted-foreground">Track your performance and growth</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">Last 7 days</Button>
          <Button variant="outline">Last 30 days</Button>
          <Button>All time</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                    <Badge variant="secondary" className="text-xs">
                      {stat.change}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Views Over Time</CardTitle>
            <CardDescription>Daily view count for the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Chart visualization would go here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement Breakdown</CardTitle>
            <CardDescription>Distribution of engagement types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Pie chart visualization would go here</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Content */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Content</CardTitle>
          <CardDescription>Your most engaging posts this month</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-medium">Morning Workout Routine</h3>
                  <p className="text-sm text-muted-foreground">Posted 3 days ago</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">2.4K views</p>
                <p className="text-sm text-muted-foreground">156 likes</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-medium">Art Process Tutorial</h3>
                  <p className="text-sm text-muted-foreground">Posted 1 week ago</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">1.8K views</p>
                <p className="text-sm text-muted-foreground">89 likes</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-400 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-medium">Healthy Recipe Share</h3>
                  <p className="text-sm text-muted-foreground">Posted 2 weeks ago</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">1.5K views</p>
                <p className="text-sm text-muted-foreground">67 likes</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </AuthGuard>
  )
}
