'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { usePlatformAnalytics, useRealtimeAnalytics } from '@/lib/analytics-service'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Eye, 
  Heart, 
  MessageSquare,
  Activity,
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnalyticsDashboardProps {
  className?: string
  userRole?: 'admin' | 'creator' | 'viewer'
}

export function AnalyticsDashboard({ className, userRole = 'viewer' }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h')
  const [activeTab, setActiveTab] = useState('overview')
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const { data: platformData, loading: platformLoading, error: platformError } = usePlatformAnalytics(timeRange)
  const { data: realtimeData, loading: realtimeLoading } = useRealtimeAnalytics()

  // Update last updated time
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const refreshData = () => {
    setLastUpdated(new Date())
    // Trigger refetch in hooks
    window.location.reload()
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    )
  }

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600'
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time insights and performance metrics
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          </div>
          
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Real-time Status */}
      {realtimeData && (
        <Alert className={cn(
          "border-l-4",
          realtimeData.systemHealth === 'healthy' ? "border-green-500 bg-green-50 dark:bg-green-950/20" :
          realtimeData.systemHealth === 'warning' ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20" :
          "border-red-500 bg-red-50 dark:bg-red-950/20"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {realtimeData.systemHealth === 'healthy' ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : realtimeData.systemHealth === 'warning' ? (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
              <AlertDescription>
                System Status: <strong className="capitalize">{realtimeData.systemHealth}</strong>
              </AlertDescription>
            </div>
            
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>{realtimeData.onlineUsers} online</span>
              </div>
              <div className="flex items-center space-x-1">
                <Activity className="h-3 w-3" />
                <span>{realtimeData.activeStreams} streams</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-3 w-3" />
                <span>{realtimeData.liveChats} chats</span>
              </div>
            </div>
          </div>
        </Alert>
      )}

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          {platformData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                      <p className="text-2xl font-bold">{formatNumber(platformData.overview.totalUsers)}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    {getGrowthIcon(platformData.overview.revenueGrowth)}
                    <span className={cn("text-sm", getGrowthColor(platformData.overview.revenueGrowth))}>
                      {platformData.overview.revenueGrowth > 0 ? '+' : ''}{platformData.overview.revenueGrowth}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                      <p className="text-2xl font-bold">{formatNumber(platformData.overview.activeUsers)}</p>
                    </div>
                    <Activity className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="mt-2">
                    <Progress value={(platformData.overview.activeUsers / platformData.overview.totalUsers) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {((platformData.overview.activeUsers / platformData.overview.totalUsers) * 100).toFixed(1)}% of total users
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold">{formatCurrency(platformData.overview.totalRevenue)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    {getGrowthIcon(platformData.overview.revenueGrowth)}
                    <span className={cn("text-sm", getGrowthColor(platformData.overview.revenueGrowth))}>
                      {platformData.overview.revenueGrowth > 0 ? '+' : ''}{platformData.overview.revenueGrowth}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Engagement Rate</p>
                      <p className="text-2xl font-bold">{platformData.overview.engagementRate}%</p>
                    </div>
                    <Heart className="h-8 w-8 text-red-500" />
                  </div>
                  <div className="mt-2">
                    <Progress value={platformData.overview.engagementRate} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Above industry average
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Charts Placeholder */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>User Growth</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>User Growth Chart</p>
                    <p className="text-sm">Chart visualization would go here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5" />
                  <span>Revenue Sources</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Revenue Distribution</p>
                    <p className="text-sm">Pie chart visualization would go here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Content & Creators */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {platformData?.topContent.slice(0, 5).map((content: any, index: number) => (
                    <div key={content.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{index + 1}</Badge>
                        <div>
                          <p className="font-medium text-sm">{content.title}</p>
                          <p className="text-xs text-muted-foreground">by {content.creator}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatNumber(content.views)} views</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(content.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Creators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {platformData?.topCreators.slice(0, 5).map((creator: any, index: number) => (
                    <div key={creator.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{index + 1}</Badge>
                        <div>
                          <p className="font-medium text-sm">{creator.displayName}</p>
                          <p className="text-xs text-muted-foreground">@{creator.username}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatNumber(creator.followers)} followers</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(creator.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Detailed user analytics would be displayed here</p>
                <p className="text-sm">Including demographics, behavior patterns, and growth metrics</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Content performance analytics would be displayed here</p>
                <p className="text-sm">Including views, engagement, and viral content analysis</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Revenue analytics would be displayed here</p>
                <p className="text-sm">Including revenue trends, sources, and projections</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Loading State */}
      {(platformLoading || realtimeLoading) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg flex items-center space-x-3">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Loading analytics...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {platformError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load analytics data: {platformError.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

// Creator Analytics Dashboard
export function CreatorAnalyticsDashboard({ creatorId, className }: { creatorId: string; className?: string }) {
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h')
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Creator Analytics</h1>
          <p className="text-muted-foreground">
            Track your content performance and audience growth
          </p>
        </div>
        
        <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">Last Hour</SelectItem>
            <SelectItem value="24h">Last 24h</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Creator analytics overview would be displayed here</p>
            <p className="text-sm">Including views, engagement, and growth metrics</p>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="text-center py-8 text-muted-foreground">
            <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Content performance analytics would be displayed here</p>
            <p className="text-sm">Including individual post performance and trends</p>
          </div>
        </TabsContent>

        <TabsContent value="audience" className="space-y-6">
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Audience analytics would be displayed here</p>
            <p className="text-sm">Including demographics and behavior patterns</p>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Revenue analytics would be displayed here</p>
            <p className="text-sm">Including earnings breakdown and trends</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

