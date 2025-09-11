'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin-layout'
import { AuthGuard } from '@/components/auth-guard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'

interface Creator {
  id: string
  name: string
  email: string
  username: string
  avatar?: string
  status: 'pending' | 'verified' | 'rejected' | 'suspended'
  subscribers: number
  earnings: number
  subscriptionPrice: number
  joinDate: string
  lastActive: string
  totalPosts: number
  totalViews: number
}

export default function CreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchCreators()
  }, [])

  const fetchCreators = async () => {
    try {
      setLoading(true)
      // Mock data for demo
      const mockCreators: Creator[] = [
        {
          id: '1',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          username: 'sarah_creator',
          status: 'verified',
          subscribers: 1250,
          earnings: 12500,
          subscriptionPrice: 9.99,
          joinDate: '2024-01-15',
          lastActive: '2024-01-20',
          totalPosts: 45,
          totalViews: 125000
        },
        {
          id: '2',
          name: 'Mike Chen',
          email: 'mike@example.com',
          username: 'mike_art',
          status: 'pending',
          subscribers: 890,
          earnings: 8900,
          subscriptionPrice: 7.99,
          joinDate: '2024-01-10',
          lastActive: '2024-01-19',
          totalPosts: 32,
          totalViews: 89000
        },
        {
          id: '3',
          name: 'Emma Davis',
          email: 'emma@example.com',
          username: 'emma_photography',
          status: 'verified',
          subscribers: 2100,
          earnings: 21000,
          subscriptionPrice: 12.99,
          joinDate: '2024-01-05',
          lastActive: '2024-01-20',
          totalPosts: 78,
          totalViews: 210000
        },
        {
          id: '4',
          name: 'Alex Rodriguez',
          email: 'alex@example.com',
          username: 'alex_gaming',
          status: 'suspended',
          subscribers: 0,
          earnings: 0,
          subscriptionPrice: 5.99,
          joinDate: '2024-01-12',
          lastActive: '2024-01-18',
          totalPosts: 12,
          totalViews: 12000
        }
      ]
      setCreators(mockCreators)
    } catch (error) {
      console.error('Failed to fetch creators:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'suspended':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="default" className="bg-green-600">Verified</Badge>
      case 'pending':
        return <Badge variant="outline" className="text-orange-600 border-orange-600">Pending</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredCreators = creators.filter(creator => {
    const matchesSearch = creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         creator.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         creator.username.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || creator.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: creators.length,
    verified: creators.filter(c => c.status === 'verified').length,
    pending: creators.filter(c => c.status === 'pending').length,
    suspended: creators.filter(c => c.status === 'suspended').length,
    totalEarnings: creators.reduce((sum, c) => sum + c.earnings, 0),
    totalSubscribers: creators.reduce((sum, c) => sum + c.subscribers, 0)
  }

  if (loading) {
    return (
      <AuthGuard requiredRole="moderator">
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requiredRole="moderator">
      <AdminLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Creator Management</h1>
          <p className="text-muted-foreground">Manage creators and their verification status</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Creators</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">All creators</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
              <p className="text-xs text-muted-foreground">Active creators</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalEarnings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search creators by name, email, or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Status</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {/* Creators Table */}
        <Card>
          <CardHeader>
            <CardTitle>Creators ({filteredCreators.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredCreators.map((creator) => (
                <div key={creator.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-lg font-medium text-primary-foreground">
                        {creator.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{creator.name}</h3>
                        {getStatusIcon(creator.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">@{creator.username}</p>
                      <p className="text-sm text-muted-foreground">{creator.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm font-medium">{creator.subscribers.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Subscribers</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">${creator.earnings.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Earnings</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{creator.totalPosts}</p>
                      <p className="text-xs text-muted-foreground">Posts</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(creator.status)}
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    </AuthGuard>
  )
}
