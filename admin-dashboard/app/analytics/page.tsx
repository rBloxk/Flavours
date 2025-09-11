'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin-layout'
import { AuthGuard } from '@/components/auth-guard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  DollarSign, 
  Eye,
  MessageCircle,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react'

interface AnalyticsData {
  period: string
  users: {
    total: number
    new: number
    active: number
    growth: number
  }
  revenue: {
    total: number
    monthly: number
    growth: number
  }
  content: {
    posts: number
    views: number
    engagement: number
  }
  creators: {
    total: number
    verified: number
    earnings: number
  }
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')

  useEffect(() => {
    fetchAnalytics()
  }, [selectedPeriod])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      // Mock data for demo
      const mockData: AnalyticsData = {
        period: selectedPeriod,
        users: {
          total: 12450,
          new: 234,
          active: 3456,
          growth: 12.5
        },
        revenue: {
          total: 125600,
          monthly: 15600,
          growth: 8.3
        },
        content: {
          posts: 2340,
          views: 1250000,
          engagement: 4.2
        },
        creators: {
          total: 89,
          verified: 67,
          earnings: 45600
        }
      }
      setData(mockData)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toLocaleString()
  }

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num)
  }

  if (loading) {
    return (
      <AuthGuard requiredRole="viewer">
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requiredRole="viewer">
      <AdminLayout>
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
              <p className="text-muted-foreground">Platform performance and insights</p>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <Button variant="outline" size="sm" onClick={fetchAnalytics}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(data?.users.total || 0)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {data?.users.growth && data.users.growth > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={data?.users.growth && data.users.growth > 0 ? 'text-green-600' : 'text-red-600'}>
                  {data?.users.growth || 0}% from last period
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(data?.revenue.monthly || 0)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {data?.revenue.growth && data.revenue.growth > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={data?.revenue.growth && data.revenue.growth > 0 ? 'text-green-600' : 'text-red-600'}>
                  {data?.revenue.growth || 0}% from last month
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
              <div className="text-2xl font-bold">{formatNumber(data?.content.views || 0)}</div>
              <p className="text-xs text-muted-foreground">
                {formatNumber(data?.content.posts || 0)} posts published
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Creators</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.creators.verified || 0}</div>
              <p className="text-xs text-muted-foreground">
                of {data?.creators.total || 0} total creators
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">New Users</span>
                  <span className="text-2xl font-bold">{formatNumber(data?.users.new || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Active Users</span>
                  <span className="text-2xl font-bold">{formatNumber(data?.users.active || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Growth Rate</span>
                  <span className={`text-lg font-bold ${data?.users.growth && data.users.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {data?.users.growth || 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Revenue</span>
                  <span className="text-2xl font-bold">{formatCurrency(data?.revenue.total || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Monthly Revenue</span>
                  <span className="text-2xl font-bold">{formatCurrency(data?.revenue.monthly || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Growth Rate</span>
                  <span className={`text-lg font-bold ${data?.revenue.growth && data.revenue.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {data?.revenue.growth || 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Content Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Posts</span>
                  <span className="text-xl font-bold">{formatNumber(data?.content.posts || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Views</span>
                  <span className="text-xl font-bold">{formatNumber(data?.content.views || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Engagement Rate</span>
                  <span className="text-xl font-bold">{data?.content.engagement || 0}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Creator Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Creators</span>
                  <span className="text-xl font-bold">{data?.creators.total || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Verified</span>
                  <span className="text-xl font-bold">{data?.creators.verified || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Earnings</span>
                  <span className="text-xl font-bold">{formatCurrency(data?.creators.earnings || 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Uptime</span>
                  <span className="text-xl font-bold text-green-600">99.9%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Response Time</span>
                  <span className="text-xl font-bold">120ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Error Rate</span>
                  <span className="text-xl font-bold text-green-600">0.1%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User Growth Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                  <p>Chart visualization would go here</p>
                  <p className="text-sm">Integration with charting library needed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                  <p>Chart visualization would go here</p>
                  <p className="text-sm">Integration with charting library needed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}
