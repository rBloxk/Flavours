'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  FileText, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  Shield,
  Users,
  Calendar,
  MoreHorizontal,
  ThumbsUp,
  MessageCircle,
  Share
} from 'lucide-react'
import { AdminLayout } from '@/components/admin-layout'
import { AuthGuard } from '@/components/auth-guard'

interface ContentItem {
  id: string
  title: string
  creator: string
  type: 'image' | 'video' | 'text' | 'audio'
  status: 'pending' | 'approved' | 'rejected' | 'flagged'
  views: number
  likes: number
  comments: number
  createdAt: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
}

export default function ContentPage() {
  const [contentData, setContentData] = useState<ContentItem[]>([
    {
      id: '1',
      title: 'Amazing sunset photography',
      creator: '@photographer1',
      type: 'image',
      status: 'pending',
      views: 1250,
      likes: 89,
      comments: 23,
      createdAt: '2024-01-15T10:30:00Z',
      category: 'Photography',
      priority: 'medium'
    },
    {
      id: '2',
      title: 'Cooking tutorial: Pasta Carbonara',
      creator: '@chef_mario',
      type: 'video',
      status: 'approved',
      views: 5670,
      likes: 234,
      comments: 45,
      createdAt: '2024-01-14T15:20:00Z',
      category: 'Food',
      priority: 'low'
    },
    {
      id: '3',
      title: 'Inappropriate content detected',
      creator: '@user123',
      type: 'image',
      status: 'flagged',
      views: 45,
      likes: 2,
      comments: 1,
      createdAt: '2024-01-15T09:15:00Z',
      category: 'Other',
      priority: 'critical'
    },
    {
      id: '4',
      title: 'Music production tips',
      creator: '@producer_jane',
      type: 'audio',
      status: 'approved',
      views: 890,
      likes: 67,
      comments: 12,
      createdAt: '2024-01-13T20:45:00Z',
      category: 'Music',
      priority: 'low'
    },
    {
      id: '5',
      title: 'Fitness workout routine',
      creator: '@fitness_guru',
      type: 'video',
      status: 'rejected',
      views: 234,
      likes: 15,
      comments: 3,
      createdAt: '2024-01-12T14:30:00Z',
      category: 'Fitness',
      priority: 'high'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  const stats = {
    pending: contentData.filter(item => item.status === 'pending').length,
    approved: contentData.filter(item => item.status === 'approved').length,
    rejected: contentData.filter(item => item.status === 'rejected').length,
    flagged: contentData.filter(item => item.status === 'flagged').length,
    totalViews: contentData.reduce((sum, item) => sum + item.views, 0),
    totalLikes: contentData.reduce((sum, item) => sum + item.likes, 0),
    totalComments: contentData.reduce((sum, item) => sum + item.comments, 0)
  }

  const filteredContent = contentData.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.creator.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    const matchesType = typeFilter === 'all' || item.type === typeFilter
    const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesType && matchesPriority
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-200">Pending</Badge>
      case 'approved':
        return <Badge variant="default" className="bg-green-600">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'flagged':
        return <Badge variant="destructive" className="bg-red-600">Flagged</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="destructive" className="bg-red-600">Critical</Badge>
      case 'high':
        return <Badge variant="destructive" className="bg-orange-600">High</Badge>
      case 'medium':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-200">Medium</Badge>
      case 'low':
        return <Badge variant="secondary">Low</Badge>
      default:
        return <Badge variant="secondary">{priority}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <FileText className="h-4 w-4 text-blue-600" />
      case 'video':
        return <FileText className="h-4 w-4 text-red-600" />
      case 'audio':
        return <FileText className="h-4 w-4 text-purple-600" />
      case 'text':
        return <FileText className="h-4 w-4 text-green-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const handleContentAction = (id: string, action: 'approve' | 'reject' | 'flag') => {
    setContentData(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'flagged' }
          : item
      )
    )
  }

  const fetchContent = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      // In real app, fetch from API
    } catch (error) {
      console.error('Failed to fetch content:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContent()
  }, [])

  return (
    <AuthGuard requiredRole="viewer">
      <AdminLayout>
        <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Content Management</h1>
            <p className="text-muted-foreground">Manage and moderate platform content</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={fetchContent} disabled={loading}>
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
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-yellow-600">Awaiting moderation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approved}</div>
              <p className="text-xs text-green-600">Published content</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rejected}</div>
              <p className="text-xs text-red-600">Violation reports</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats.totalViews / 1000).toFixed(1)}K</div>
              <p className="text-xs text-muted-foreground">Across all content</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Content Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search content or creators..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All Content</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="flagged">Flagged</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            <div className="space-y-4">
              {filteredContent
                .filter(item => activeTab === 'all' || item.status === activeTab)
                .map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getTypeIcon(item.type)}
                          <h3 className="font-semibold">{item.title}</h3>
                          {getStatusBadge(item.status)}
                          {getPriorityBadge(item.priority)}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span>By {item.creator}</span>
                          <span>•</span>
                          <span>{item.category}</span>
                          <span>•</span>
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{item.views.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4" />
                            <span>{item.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>{item.comments}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {item.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() => handleContentAction(item.id, 'approve')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleContentAction(item.id, 'reject')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        
                        {item.status === 'flagged' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-orange-600 border-orange-200 hover:bg-orange-50"
                            onClick={() => handleContentAction(item.id, 'reject')}
                          >
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Review
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
              
              {filteredContent.filter(item => activeTab === 'all' || item.status === activeTab).length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No content found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all'
                        ? 'Try adjusting your filters to see more content.'
                        : 'No content has been uploaded yet.'}
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