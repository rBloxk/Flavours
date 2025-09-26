'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Users, 
  DollarSign, 
  Eye, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react'
import { UserGrowthChart } from '@/components/analytics/user-growth-chart'
import { RevenueChart } from '@/components/analytics/revenue-chart'
import { ContentDistributionChart } from '@/components/analytics/content-distribution-chart'
import { ActivityHeatmap } from '@/components/analytics/activity-heatmap'
import { AdminLayout } from '@/components/admin-layout'
import { AuthGuard } from '@/components/auth-guard'

interface AnalyticsData {
  totalUsers: number
  totalRevenue: number
  contentViews: number
  activeCreators: number
  userGrowth: number
  revenueGrowth: number
  engagementRate: number
  conversionRate: number
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalUsers: 12450,
    totalRevenue: 125600,
    contentViews: 234567,
    activeCreators: 1234,
    userGrowth: 12.5,
    revenueGrowth: 8.2,
    engagementRate: 68.4,
    conversionRate: 3.2
  })
  
  const [timeRange, setTimeRange] = useState('30d')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Mock data for charts
  const userGrowthData = [
    { date: '2024-01-01', users: 12000, creators: 1200 },
    { date: '2024-01-02', users: 12150, creators: 1210 },
    { date: '2024-01-03', users: 12300, creators: 1220 },
    { date: '2024-01-04', users: 12450, creators: 1230 },
    { date: '2024-01-05', users: 12600, creators: 1240 },
    { date: '2024-01-06', users: 12750, creators: 1250 },
    { date: '2024-01-07', users: 12900, creators: 1260 }
  ]

  const revenueData = [
    { month: 'Jan', revenue: 12000, subscriptions: 8000, tips: 4000 },
    { month: 'Feb', revenue: 15000, subscriptions: 10000, tips: 5000 },
    { month: 'Mar', revenue: 18000, subscriptions: 12000, tips: 6000 },
    { month: 'Apr', revenue: 22000, subscriptions: 15000, tips: 7000 },
    { month: 'May', revenue: 25000, subscriptions: 17000, tips: 8000 },
    { month: 'Jun', revenue: 28000, subscriptions: 19000, tips: 9000 }
  ]

  const contentDistributionData = [
    { type: 'Images', count: 1200, color: '#3b82f6' },
    { type: 'Videos', count: 800, color: '#ef4444' },
    { type: 'Text Posts', count: 600, color: '#10b981' },
    { type: 'Live Streams', count: 200, color: '#f59e0b' },
    { type: 'Audio', count: 150, color: '#8b5cf6' }
  ]

  // const activityHeatmapData = [
  //   { day: 'Mon', hour: 9, activity: 45 },
  //   { day: 'Mon', hour: 10, activity: 67 },
  //   { day: 'Mon', hour: 11, activity: 89 },
  //   { day: 'Tue', hour: 9, activity: 52 },
  //   { day: 'Tue', hour: 10, activity: 71 },
  //   { day: 'Wed', hour: 14, activity: 78 },
  //   { day: 'Thu', hour: 15, activity: 82 },
  //   { day: 'Fri', hour: 16, activity: 95 },
  //   { day: 'Sat', hour: 20, activity: 88 },
  //   { day: 'Sun', hour: 21, activity: 76 }
  // ]

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      // Update data based on time range
      setAnalyticsData(prev => ({
        ...prev,
        totalUsers: prev.totalUsers + Math.floor(Math.random() * 100),
        totalRevenue: prev.totalRevenue + Math.floor(Math.random() * 1000)
      }))
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    )
  }

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600'
  }

  return (
    <AuthGuard requiredRole="viewer">
      <AdminLayout>
        <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Platform performance and insights</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" onClick={fetchAnalytics} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalUsers.toLocaleString()}</div>
              <div className="flex items-center gap-1 text-xs">
                {getGrowthIcon(analyticsData.userGrowth)}
                <span className={getGrowthColor(analyticsData.userGrowth)}>
                  +{analyticsData.userGrowth}% from last period
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analyticsData.totalRevenue.toLocaleString()}</div>
              <div className="flex items-center gap-1 text-xs">
                {getGrowthIcon(analyticsData.revenueGrowth)}
                <span className={getGrowthColor(analyticsData.revenueGrowth)}>
                  +{analyticsData.revenueGrowth}% from last period
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Content Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.contentViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {analyticsData.engagementRate}% engagement rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Creators</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.activeCreators.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {analyticsData.conversionRate}% conversion rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>Daily user and creator registrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <UserGrowthChart data={userGrowthData} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trends</CardTitle>
                  <CardDescription>Monthly revenue breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <RevenueChart data={revenueData} />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content Distribution</CardTitle>
                  <CardDescription>Types of content on the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <ContentDistributionChart data={contentDistributionData} />
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Demographics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">18-24 years</span>
                      <Badge variant="secondary">45%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">25-34 years</span>
                      <Badge variant="secondary">35%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">35-44 years</span>
                      <Badge variant="secondary">15%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">45+ years</span>
                      <Badge variant="secondary">5%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Geographic Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">North America</span>
                      <Badge variant="secondary">40%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Europe</span>
                      <Badge variant="secondary">30%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Asia</span>
                      <Badge variant="secondary">20%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Other</span>
                      <Badge variant="secondary">10%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Daily Active Users</span>
                      <Badge variant="default">8,450</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Weekly Active Users</span>
                      <Badge variant="default">11,200</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Monthly Active Users</span>
                      <Badge variant="default">12,450</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Session Duration</span>
                      <Badge variant="default">24.5 min</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Subscriptions</span>
                      <span className="font-medium">$85,600 (68%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Tips & Donations</span>
                      <span className="font-medium">$25,400 (20%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Premium Features</span>
                      <span className="font-medium">$14,600 (12%)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Creators</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">@creator1</span>
                      <span className="font-medium">$12,450</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">@creator2</span>
                      <span className="font-medium">$9,800</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">@creator3</span>
                      <span className="font-medium">$7,200</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">@creator4</span>
                      <span className="font-medium">$5,600</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Average Views per Post</span>
                      <Badge variant="default">1,245</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Average Likes per Post</span>
                      <Badge variant="default">89</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Average Comments per Post</span>
                      <Badge variant="default">23</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Content Engagement Rate</span>
                      <Badge variant="default">4.2%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Content Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Entertainment</span>
                      <Badge variant="secondary">35%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Education</span>
                      <Badge variant="secondary">25%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Lifestyle</span>
                      <Badge variant="secondary">20%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Other</span>
                      <Badge variant="secondary">20%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}