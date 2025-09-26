'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Users, 
  Shield, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Search,
  Filter,
  Download,
  RefreshCw,
  Star,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  MoreHorizontal,
  UserCheck,
  UserX,
  AlertTriangle,
  Calendar,
  Award,
  Target
} from 'lucide-react'
import { AdminLayout } from '@/components/admin-layout'
import { AuthGuard } from '@/components/auth-guard'

interface Creator {
  id: string
  username: string
  displayName: string
  email: string
  avatar?: string
  status: 'active' | 'suspended' | 'pending' | 'banned'
  verificationStatus: 'verified' | 'pending' | 'rejected' | 'unverified'
  subscribers: number
  totalEarnings: number
  monthlyEarnings: number
  totalViews: number
  totalLikes: number
  totalComments: number
  joinDate: string
  lastActive: string
  category: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  complianceScore: number
}

export default function CreatorsPage() {
  const [creatorsData, setCreatorsData] = useState<Creator[]>([
    {
      id: '1',
      username: '@photographer_pro',
      displayName: 'Sarah Johnson',
      email: 'sarah@example.com',
      status: 'active',
      verificationStatus: 'verified',
      subscribers: 12500,
      totalEarnings: 45600,
      monthlyEarnings: 3200,
      totalViews: 234000,
      totalLikes: 18900,
      totalComments: 3400,
      joinDate: '2023-06-15',
      lastActive: '2024-01-15T10:30:00Z',
      category: 'Photography',
      tier: 'gold',
      complianceScore: 95
    },
    {
      id: '2',
      username: '@chef_mario',
      displayName: 'Mario Rossi',
      email: 'mario@example.com',
      status: 'active',
      verificationStatus: 'verified',
      subscribers: 8900,
      totalEarnings: 28900,
      monthlyEarnings: 2100,
      totalViews: 156000,
      totalLikes: 12300,
      totalComments: 2100,
      joinDate: '2023-08-22',
      lastActive: '2024-01-15T09:15:00Z',
      category: 'Food & Cooking',
      tier: 'silver',
      complianceScore: 88
    },
    {
      id: '3',
      username: '@fitness_guru',
      displayName: 'Alex Chen',
      email: 'alex@example.com',
      status: 'pending',
      verificationStatus: 'pending',
      subscribers: 3400,
      totalEarnings: 8900,
      monthlyEarnings: 650,
      totalViews: 67000,
      totalLikes: 5600,
      totalComments: 890,
      joinDate: '2024-01-05',
      lastActive: '2024-01-14T16:45:00Z',
      category: 'Fitness',
      tier: 'bronze',
      complianceScore: 92
    },
    {
      id: '4',
      username: '@music_producer',
      displayName: 'Jane Smith',
      email: 'jane@example.com',
      status: 'active',
      verificationStatus: 'verified',
      subscribers: 15600,
      totalEarnings: 67800,
      monthlyEarnings: 4800,
      totalViews: 345000,
      totalLikes: 28900,
      totalComments: 5600,
      joinDate: '2023-04-10',
      lastActive: '2024-01-15T11:20:00Z',
      category: 'Music',
      tier: 'platinum',
      complianceScore: 98
    },
    {
      id: '5',
      username: '@art_creator',
      displayName: 'David Wilson',
      email: 'david@example.com',
      status: 'suspended',
      verificationStatus: 'verified',
      subscribers: 7800,
      totalEarnings: 23400,
      monthlyEarnings: 0,
      totalViews: 123000,
      totalLikes: 9800,
      totalComments: 1800,
      joinDate: '2023-09-18',
      lastActive: '2024-01-10T14:30:00Z',
      category: 'Art & Design',
      tier: 'silver',
      complianceScore: 45
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [verificationFilter, setVerificationFilter] = useState('all')
  const [tierFilter, setTierFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  const stats = {
    total: creatorsData.length,
    active: creatorsData.filter(creator => creator.status === 'active').length,
    verified: creatorsData.filter(creator => creator.verificationStatus === 'verified').length,
    pending: creatorsData.filter(creator => creator.verificationStatus === 'pending').length,
    suspended: creatorsData.filter(creator => creator.status === 'suspended').length,
    totalEarnings: creatorsData.reduce((sum, creator) => sum + creator.totalEarnings, 0),
    monthlyEarnings: creatorsData.reduce((sum, creator) => sum + creator.monthlyEarnings, 0),
    totalSubscribers: creatorsData.reduce((sum, creator) => sum + creator.subscribers, 0)
  }

  const filteredCreators = creatorsData.filter(creator => {
    const matchesSearch = creator.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         creator.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         creator.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || creator.status === statusFilter
    const matchesVerification = verificationFilter === 'all' || creator.verificationStatus === verificationFilter
    const matchesTier = tierFilter === 'all' || creator.tier === tierFilter
    
    return matchesSearch && matchesStatus && matchesVerification && matchesTier
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-600">Active</Badge>
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-200">Pending</Badge>
      case 'suspended':
        return <Badge variant="destructive" className="bg-orange-600">Suspended</Badge>
      case 'banned':
        return <Badge variant="destructive">Banned</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="default" className="bg-blue-600">Verified</Badge>
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-200">Pending</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'unverified':
        return <Badge variant="secondary">Unverified</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return <Badge variant="default" className="bg-purple-600">Platinum</Badge>
      case 'gold':
        return <Badge variant="default" className="bg-yellow-600">Gold</Badge>
      case 'silver':
        return <Badge variant="secondary">Silver</Badge>
      case 'bronze':
        return <Badge variant="outline">Bronze</Badge>
      default:
        return <Badge variant="secondary">{tier}</Badge>
    }
  }

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const handleCreatorAction = (id: string, action: 'verify' | 'suspend' | 'activate' | 'reject') => {
    setCreatorsData(prev => 
      prev.map(creator => {
        if (creator.id === id) {
          switch (action) {
            case 'verify':
              return { ...creator, verificationStatus: 'verified' }
            case 'suspend':
              return { ...creator, status: 'suspended' }
            case 'activate':
              return { ...creator, status: 'active' }
            case 'reject':
              return { ...creator, verificationStatus: 'rejected' }
            default:
              return creator
          }
        }
        return creator
      })
    )
  }

  const fetchCreators = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      // In real app, fetch from API
    } catch (error) {
      console.error('Failed to fetch creators:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCreators()
  }, [])

  return (
    <AuthGuard requiredRole="viewer">
      <AdminLayout>
        <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Creator Management</h1>
            <p className="text-muted-foreground">Manage creators and their content</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={fetchCreators} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Creators</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-blue-600">{stats.active} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
              <Shield className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.verified}</div>
              <p className="text-xs text-green-600">Verified creators</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-yellow-600">Awaiting verification</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(stats.totalEarnings / 1000).toFixed(0)}K</div>
              <p className="text-xs text-muted-foreground">${(stats.monthlyEarnings / 1000).toFixed(1)}K this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSubscribers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across all creators</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suspended</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.suspended}</div>
              <p className="text-xs text-red-600">Require attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Compliance</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(creatorsData.reduce((sum, creator) => sum + creator.complianceScore, 0) / creatorsData.length)}%
              </div>
              <p className="text-xs text-muted-foreground">Platform compliance score</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Creator Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search creators..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>

              <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Verification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Verification</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>

              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="platinum">Platinum</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="bronze">Bronze</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Creators Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All Creators</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="verified">Verified</TabsTrigger>
            <TabsTrigger value="suspended">Suspended</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            <div className="space-y-4">
              {filteredCreators
                .filter(creator => {
                  if (activeTab === 'all') return true
                  if (activeTab === 'active') return creator.status === 'active'
                  if (activeTab === 'pending') return creator.verificationStatus === 'pending'
                  if (activeTab === 'verified') return creator.verificationStatus === 'verified'
                  if (activeTab === 'suspended') return creator.status === 'suspended'
                  return true
                })
                .map((creator) => (
                <Card key={creator.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-foreground">
                              {creator.displayName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold">{creator.displayName}</h3>
                            <p className="text-sm text-muted-foreground">{creator.username}</p>
                          </div>
                          {getStatusBadge(creator.status)}
                          {getVerificationBadge(creator.verificationStatus)}
                          {getTierBadge(creator.tier)}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span>{creator.email}</span>
                          <span>•</span>
                          <span>{creator.category}</span>
                          <span>•</span>
                          <span>Joined {new Date(creator.joinDate).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{creator.subscribers.toLocaleString()} subs</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span>${creator.monthlyEarnings.toLocaleString()}/mo</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{creator.totalViews.toLocaleString()} views</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            <span className={getComplianceColor(creator.complianceScore)}>
                              {creator.complianceScore}% compliance
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {creator.verificationStatus === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() => handleCreatorAction(creator.id, 'verify')}
                            >
                              <UserCheck className="h-4 w-4 mr-1" />
                              Verify
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleCreatorAction(creator.id, 'reject')}
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        
                        {creator.status === 'active' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-orange-600 border-orange-200 hover:bg-orange-50"
                            onClick={() => handleCreatorAction(creator.id, 'suspend')}
                          >
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Suspend
                          </Button>
                        )}
                        
                        {creator.status === 'suspended' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => handleCreatorAction(creator.id, 'activate')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Activate
                          </Button>
                        )}
                        
                        <Button size="sm" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredCreators.filter(creator => {
                if (activeTab === 'all') return true
                if (activeTab === 'active') return creator.status === 'active'
                if (activeTab === 'pending') return creator.verificationStatus === 'pending'
                if (activeTab === 'verified') return creator.verificationStatus === 'verified'
                if (activeTab === 'suspended') return creator.status === 'suspended'
                return true
              }).length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No creators found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm || statusFilter !== 'all' || verificationFilter !== 'all' || tierFilter !== 'all'
                        ? 'Try adjusting your filters to see more creators.'
                        : 'No creators have joined yet.'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}