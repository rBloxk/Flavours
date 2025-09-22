'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Shield, 
  BarChart3, 
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Eye,
  MessageCircle,
  Settings,
  Activity,
  UserCheck,
  FileText,
  CreditCard,
  Database,
  Clock,
  Zap,
  Globe,
  Server,
  Cpu,
  HardDrive
} from 'lucide-react'
import { DashboardStats } from '@/types/admin'
import { AdminLayout } from '../components/admin-layout'
import { AuthGuard } from '../components/auth-guard'
import { UserGrowthChart } from '@/components/analytics/user-growth-chart'
import { RevenueChart } from '@/components/analytics/revenue-chart'
import { ContentDistributionChart } from '@/components/analytics/content-distribution-chart'
import { ActivityHeatmap } from '@/components/analytics/activity-heatmap'
import { ContentScanner } from '@/components/moderation/content-scanner'
import { SafetyDashboard } from '@/components/moderation/safety-dashboard'

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>({
    totalUsers: 1247,
    totalCreators: 89,
    totalPosts: 3456,
    pendingModerations: 12,
    pendingReports: 8,
    newUsersToday: 23,
    newCreatorsToday: 3,
    activeUsers: 456,
    totalRevenue: 45680,
    monthlyRevenue: 12340
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  // Mock data for charts
  const userGrowthData = [
    { date: '2024-01-01', users: 1200, creators: 85 },
    { date: '2024-01-02', users: 1250, creators: 87 },
    { date: '2024-01-03', users: 1300, creators: 89 },
    { date: '2024-01-04', users: 1280, creators: 88 },
    { date: '2024-01-05', users: 1350, creators: 92 },
    { date: '2024-01-06', users: 1400, creators: 95 },
    { date: '2024-01-07', users: 1450, creators: 98 }
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

  const activityHeatmapData = [
    { day: 'Mon', hour: 9, activity: 45 },
    { day: 'Mon', hour: 10, activity: 67 },
    { day: 'Mon', hour: 11, activity: 89 },
    { day: 'Tue', hour: 9, activity: 52 },
    { day: 'Tue', hour: 10, activity: 71 },
    { day: 'Wed', hour: 14, activity: 78 },
    { day: 'Thu', hour: 15, activity: 82 },
    { day: 'Fri', hour: 16, activity: 95 },
    { day: 'Sat', hour: 20, activity: 88 },
    { day: 'Sun', hour: 21, activity: 76 }
  ]

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats')
      }
      
      const data = await response.json()
      setStats(data.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      // Fallback to empty stats
      setStats({
        totalUsers: 0,
        totalCreators: 0,
        totalPosts: 0,
        pendingModerations: 0,
        pendingReports: 0,
        newUsersToday: 0,
        newCreatorsToday: 0,
        activeUsers: 0,
        totalRevenue: 0,
        monthlyRevenue: 0
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <AuthGuard requiredRole="viewer">
      <AdminLayout>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive platform management and analytics</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +{stats?.newUsersToday} today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Creators</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalCreators.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +{stats?.newCreatorsToday} today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalPosts.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    All time
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.activeUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Last 24 hours
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Revenue & Moderation Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats?.totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    All time
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats?.monthlyRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    This month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Moderation</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{stats?.pendingModerations}</div>
                  <p className="text-xs text-muted-foreground">
                    Items awaiting review
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
                  <MessageCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats?.pendingReports}</div>
                  <p className="text-xs text-muted-foreground">
                    Reports to investigate
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <Shield className="h-6 w-6 mb-2" />
                    <span>Moderation Queue</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <Users className="h-6 w-6 mb-2" />
                    <span>User Management</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <BarChart3 className="h-6 w-6 mb-2" />
                    <span>Analytics</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <Settings className="h-6 w-6 mb-2" />
                    <span>Settings</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Charts */}
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

              {/* <Card>
                <CardHeader>
                  <CardTitle>User Activity Heatmap</CardTitle>
                  <CardDescription>Peak activity times by day and hour</CardDescription>
                </CardHeader>
                <CardContent>
                  <ActivityHeatmap data={activityHeatmapData} />
                </CardContent>
              </Card> */}
            </div>
          </TabsContent>

          <TabsContent value="moderation" className="space-y-6">
            <SafetyDashboard />
            <ContentScanner />
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            {/* System Health */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Server Status</CardTitle>
                  <Server className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">Online</div>
                  <p className="text-xs text-muted-foreground">
                    Uptime: 99.9%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                  <Cpu className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">23%</div>
                  <p className="text-xs text-muted-foreground">
                    Average load
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                  <HardDrive className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4.2GB</div>
                  <p className="text-xs text-muted-foreground">
                    Of 8GB total
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Database & Cache Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Database Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Connection Status</span>
                      <Badge variant="default" className="bg-green-600">Connected</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Response Time</span>
                      <span className="text-sm text-muted-foreground">12ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Active Connections</span>
                      <span className="text-sm text-muted-foreground">8/20</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Cache Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Redis Status</span>
                      <Badge variant="default" className="bg-green-600">Connected</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Hit Rate</span>
                      <span className="text-sm text-muted-foreground">94.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Memory Used</span>
                      <span className="text-sm text-muted-foreground">128MB</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Reports</CardTitle>
                <CardDescription>Generate and download platform reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <FileText className="h-6 w-6 mb-2" />
                    <span>User Report</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <BarChart3 className="h-6 w-6 mb-2" />
                    <span>Analytics Report</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <Shield className="h-6 w-6 mb-2" />
                    <span>Moderation Report</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </AdminLayout>
    </AuthGuard>
  )
}
