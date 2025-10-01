"use client"

import React, { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  Users, 
  Heart, 
  MessageCircle, 
  Eye, 
  DollarSign, 
  Calendar,
  Download,
  Filter,
  BarChart3,
  Activity,
  Target,
  Clock,
  Share2,
  Bookmark,
  ThumbsUp,
  Crown,
  Star
} from 'lucide-react'

export default function StatisticsPage() {
  const [timeRange, setTimeRange] = useState('30')
  const [loading, setLoading] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState('views')

  // Mock data - in real app, this would come from API
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalViews: 125400,
      followers: 8200,
      likes: 45700,
      comments: 3200,
      earnings: 2400,
      engagementRate: 4.2,
      subscribers: 1200,
      revenue: 2400,
      avgWatchTime: 2.5,
      clickThroughRate: 3.8
    },
    trends: {
      views: '+12.5%',
      followers: '+8.3%',
      likes: '+15.2%',
      comments: '+6.7%',
      earnings: '+18.9%',
      engagementRate: '+2.1%',
      subscribers: '+5.4%',
      revenue: '+18.9%',
      avgWatchTime: '+0.3%',
      clickThroughRate: '+1.2%'
    }
  })

  // Chart data
  const viewsData = [
    { date: '2024-01-01', views: 1200, likes: 85, comments: 12 },
    { date: '2024-01-02', views: 1500, likes: 95, comments: 18 },
    { date: '2024-01-03', views: 1800, likes: 120, comments: 25 },
    { date: '2024-01-04', views: 2200, likes: 150, comments: 32 },
    { date: '2024-01-05', views: 1900, likes: 130, comments: 28 },
    { date: '2024-01-06', views: 2500, likes: 180, comments: 35 },
    { date: '2024-01-07', views: 2800, likes: 200, comments: 42 },
    { date: '2024-01-08', views: 3200, likes: 240, comments: 50 },
    { date: '2024-01-09', views: 2900, likes: 210, comments: 45 },
    { date: '2024-01-10', views: 3500, likes: 280, comments: 58 },
    { date: '2024-01-11', views: 3800, likes: 320, comments: 65 },
    { date: '2024-01-12', views: 4200, likes: 350, comments: 72 },
    { date: '2024-01-13', views: 3900, likes: 310, comments: 68 },
    { date: '2024-01-14', views: 4500, likes: 380, comments: 80 },
    { date: '2024-01-15', views: 4800, likes: 420, comments: 88 }
  ]

  const engagementData = [
    { name: 'Likes', value: 45700, color: '#ef4444', percentage: 85 },
    { name: 'Comments', value: 3200, color: '#8b5cf6', percentage: 6 },
    { name: 'Shares', value: 1800, color: '#06b6d4', percentage: 3 },
    { name: 'Saves', value: 1200, color: '#10b981', percentage: 2 },
    { name: 'Clicks', value: 950, color: '#f59e0b', percentage: 2 }
  ]

  const revenueData = [
    { month: 'Jan', revenue: 1200, subscribers: 45 },
    { month: 'Feb', revenue: 1500, subscribers: 52 },
    { month: 'Mar', revenue: 1800, subscribers: 68 },
    { month: 'Apr', revenue: 2200, subscribers: 78 },
    { month: 'May', revenue: 2400, subscribers: 85 },
    { month: 'Jun', revenue: 2800, subscribers: 92 }
  ]

  const topContent = [
    {
      id: 1,
      title: 'Morning Workout Routine',
      type: 'Video',
      views: 2400,
      likes: 156,
      comments: 23,
      shares: 12,
      earnings: 45.50,
      postedAt: '3 days ago',
      thumbnail: '/api/placeholder/300/200'
    },
    {
      id: 2,
      title: 'Art Process Tutorial',
      type: 'Video',
      views: 1800,
      likes: 89,
      comments: 15,
      shares: 8,
      earnings: 32.20,
      postedAt: '1 week ago',
      thumbnail: '/api/placeholder/300/200'
    },
    {
      id: 3,
      title: 'Healthy Recipe Share',
      type: 'Post',
      views: 1500,
      likes: 67,
      comments: 12,
      shares: 5,
      earnings: 18.75,
      postedAt: '2 weeks ago',
      thumbnail: '/api/placeholder/300/200'
    },
    {
      id: 4,
      title: 'Behind the Scenes',
      type: 'Video',
      views: 1200,
      likes: 45,
      comments: 8,
      shares: 3,
      earnings: 15.30,
      postedAt: '3 weeks ago',
      thumbnail: '/api/placeholder/300/200'
    },
    {
      id: 5,
      title: 'Q&A Session',
      type: 'Live',
      views: 3200,
      likes: 180,
      comments: 45,
      shares: 20,
      earnings: 68.90,
      postedAt: '1 month ago',
      thumbnail: '/api/placeholder/300/200'
    }
  ]

  const audienceData = [
    { age: '18-24', percentage: 35, count: 2870 },
    { age: '25-34', percentage: 28, count: 2296 },
    { age: '35-44', percentage: 20, count: 1640 },
    { age: '45-54', percentage: 12, count: 984 },
    { age: '55+', percentage: 5, count: 410 }
  ]

  const deviceData = [
    { device: 'Mobile', percentage: 65, count: 5330 },
    { device: 'Desktop', percentage: 25, count: 2050 },
    { device: 'Tablet', percentage: 10, count: 820 }
  ]

  const stats = [
    {
      title: 'Total Views',
      value: analyticsData.overview.totalViews.toLocaleString(),
      change: analyticsData.trends.views,
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Followers',
      value: analyticsData.overview.followers.toLocaleString(),
      change: analyticsData.trends.followers,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Subscribers',
      value: analyticsData.overview.subscribers.toLocaleString(),
      change: analyticsData.trends.subscribers,
      icon: Crown,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Likes',
      value: analyticsData.overview.likes.toLocaleString(),
      change: analyticsData.trends.likes,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Comments',
      value: analyticsData.overview.comments.toLocaleString(),
      change: analyticsData.trends.comments,
      icon: MessageCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Earnings',
      value: `$${analyticsData.overview.earnings.toLocaleString()}`,
      change: analyticsData.trends.earnings,
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Engagement Rate',
      value: `${analyticsData.overview.engagementRate}%`,
      change: analyticsData.trends.engagementRate,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Avg Watch Time',
      value: `${analyticsData.overview.avgWatchTime}m`,
      change: analyticsData.trends.avgWatchTime,
      icon: Clock,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50'
    },
    {
      title: 'Click Through Rate',
      value: `${analyticsData.overview.clickThroughRate}%`,
      change: analyticsData.trends.clickThroughRate,
      icon: Target,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    }
  ]

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const exportData = () => {
    const data = {
      overview: analyticsData.overview,
      timeRange,
      exportDate: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${timeRange}days-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const SimpleChart = ({ data, type = 'line' }: { data: any[], type?: 'line' | 'bar' }) => {
    const maxValue = Math.max(...data.map(d => d.views || d.revenue || 0))
    
    return (
      <div className="h-64 w-full">
        <div className="flex items-end justify-between h-full space-x-1">
          {data.map((item, index) => {
            const height = ((item.views || item.revenue || 0) / maxValue) * 100
            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="bg-blue-500 rounded-t w-full transition-all duration-300 hover:bg-blue-600"
                  style={{ height: `${height}%` }}
                />
                <div className="text-xs text-muted-foreground mt-2 text-center">
                  {item.date ? item.date.split('-')[2] : item.month}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const SimplePieChart = ({ data }: { data: any[] }) => {
    return (
      <div className="h-64 w-full flex items-center justify-center">
        <div className="grid grid-cols-2 gap-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <div className="text-sm">
                <div className="font-medium">{item.name}</div>
                <div className="text-muted-foreground">{item.percentage}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Statistics</h1>
            <p className="text-muted-foreground">Track your performance and growth metrics</p>
          </div>
          <div className="flex items-center space-x-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <Badge variant="secondary" className="text-xs">
                        {stat.change}
                      </Badge>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="audience">Audience</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Views Over Time</CardTitle>
                  <CardDescription>Daily view count for the selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  <SimpleChart data={viewsData} type="bar" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Engagement Breakdown</CardTitle>
                  <CardDescription>Distribution of engagement types</CardDescription>
                </CardHeader>
                <CardContent>
                  <SimplePieChart data={engagementData} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Content</CardTitle>
                <CardDescription>Your most engaging posts for the selected period</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {topContent.map((content, index) => (
                  <div key={content.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">{index + 1}</span>
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-medium">{content.title}</h3>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {content.type}
                          </Badge>
                          <span>{content.postedAt}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {formatNumber(content.views)}
                        </span>
                        <span className="flex items-center">
                          <Heart className="h-4 w-4 mr-1" />
                          {content.likes}
                        </span>
                        <span className="flex items-center">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {content.comments}
                        </span>
                        <span className="flex items-center font-medium text-green-600">
                          <DollarSign className="h-4 w-4 mr-1" />
                          ${content.earnings}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audience" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Age Distribution</CardTitle>
                  <CardDescription>Your audience by age group</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {audienceData.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{item.age}</span>
                        <span>{item.percentage}% ({item.count.toLocaleString()})</span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Device Usage</CardTitle>
                  <CardDescription>How your audience accesses your content</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {deviceData.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{item.device}</span>
                        <span>{item.percentage}% ({item.count.toLocaleString()})</span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Growth</CardTitle>
                <CardDescription>Monthly revenue and subscriber growth</CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleChart data={revenueData} type="bar" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Engagement Metrics</CardTitle>
                  <CardDescription>Detailed engagement breakdown</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <ThumbsUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold">4.2%</p>
                      <p className="text-sm text-muted-foreground">Like Rate</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <MessageCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold">0.8%</p>
                      <p className="text-sm text-muted-foreground">Comment Rate</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Share2 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold">0.3%</p>
                      <p className="text-sm text-muted-foreground">Share Rate</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Bookmark className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold">0.2%</p>
                      <p className="text-sm text-muted-foreground">Save Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Engagement Trends</CardTitle>
                  <CardDescription>Engagement over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <SimpleChart data={viewsData} type="line" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Additional Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Goals</CardTitle>
              <CardDescription>Track your progress towards goals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Monthly Views Goal</span>
                  <span>75%</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subscriber Goal</span>
                  <span>60%</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Revenue Goal</span>
                  <span>90%</span>
                </div>
                <Progress value={90} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Best Performing Times</CardTitle>
              <CardDescription>When your audience is most active</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Monday 6-8 PM</span>
                  <Badge variant="secondary">Peak</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Wednesday 7-9 PM</span>
                  <Badge variant="outline">High</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Friday 5-7 PM</span>
                  <Badge variant="outline">High</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Sunday 2-4 PM</span>
                  <Badge variant="outline">Medium</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content Insights</CardTitle>
              <CardDescription>Key insights about your content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Videos perform 3x better than posts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Fitness content has highest engagement</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Average watch time increased 15%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">New followers up 25% this month</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}