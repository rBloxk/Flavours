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
  FileText, 
  Image, 
  Video,
  Music,
  Eye,
  ThumbsUp,
  MessageCircle,
  Share,
  Flag,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'

interface Content {
  id: string
  type: 'post' | 'image' | 'video' | 'audio'
  title: string
  creator: string
  creatorId: string
  status: 'published' | 'draft' | 'pending' | 'rejected' | 'archived'
  views: number
  likes: number
  comments: number
  shares: number
  createdAt: string
  publishedAt?: string
  tags: string[]
  thumbnail?: string
}

export default function ContentPage() {
  const [content, setContent] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      setLoading(true)
      // Mock data for demo
      const mockContent: Content[] = [
        {
          id: '1',
          type: 'video',
          title: 'Amazing Art Tutorial - Watercolor Techniques',
          creator: 'Sarah Johnson',
          creatorId: 'creator1',
          status: 'published',
          views: 12500,
          likes: 890,
          comments: 45,
          shares: 23,
          createdAt: '2024-01-20T10:30:00Z',
          publishedAt: '2024-01-20T10:30:00Z',
          tags: ['art', 'tutorial', 'watercolor'],
          thumbnail: '/placeholder-video.jpg'
        },
        {
          id: '2',
          type: 'image',
          title: 'Sunset Photography Collection',
          creator: 'Mike Chen',
          creatorId: 'creator2',
          status: 'pending',
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          createdAt: '2024-01-19T15:45:00Z',
          tags: ['photography', 'sunset', 'nature'],
          thumbnail: '/placeholder-image.jpg'
        },
        {
          id: '3',
          type: 'post',
          title: 'Weekly Update: Behind the Scenes',
          creator: 'Emma Davis',
          creatorId: 'creator3',
          status: 'published',
          views: 3400,
          likes: 156,
          comments: 12,
          shares: 8,
          createdAt: '2024-01-18T09:15:00Z',
          publishedAt: '2024-01-18T09:15:00Z',
          tags: ['update', 'behind-the-scenes', 'personal']
        },
        {
          id: '4',
          type: 'audio',
          title: 'Relaxing Music Mix - Study Session',
          creator: 'Alex Rodriguez',
          creatorId: 'creator4',
          status: 'rejected',
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          createdAt: '2024-01-17T16:20:00Z',
          tags: ['music', 'study', 'relaxing']
        },
        {
          id: '5',
          type: 'video',
          title: 'Gaming Highlights - Epic Moments',
          creator: 'David Kim',
          creatorId: 'creator5',
          status: 'published',
          views: 8900,
          likes: 234,
          comments: 18,
          shares: 15,
          createdAt: '2024-01-16T14:30:00Z',
          publishedAt: '2024-01-16T14:30:00Z',
          tags: ['gaming', 'highlights', 'funny'],
          thumbnail: '/placeholder-video2.jpg'
        }
      ]
      setContent(mockContent)
    } catch (error) {
      console.error('Failed to fetch content:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />
      case 'image':
        return <Image className="h-4 w-4" />
      case 'audio':
        return <Music className="h-4 w-4" />
      case 'post':
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'draft':
        return <Edit className="h-4 w-4 text-gray-500" />
      case 'archived':
        return <Archive className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default" className="bg-green-600">Published</Badge>
      case 'pending':
        return <Badge variant="outline" className="text-orange-600 border-orange-600">Pending</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>
      case 'archived':
        return <Badge variant="secondary">Archived</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.creator.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = typeFilter === 'all' || item.type === typeFilter
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const stats = {
    total: content.length,
    published: content.filter(c => c.status === 'published').length,
    pending: content.filter(c => c.status === 'pending').length,
    rejected: content.filter(c => c.status === 'rejected').length,
    totalViews: content.reduce((sum, c) => sum + c.views, 0),
    totalLikes: content.reduce((sum, c) => sum + c.likes, 0)
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
          <h1 className="text-3xl font-bold">Content Management</h1>
          <p className="text-muted-foreground">Manage and moderate platform content</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Content</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">All content</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.published}</div>
              <p className="text-xs text-muted-foreground">Live content</p>
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
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
              <ThumbsUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLikes.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content by title, creator, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Types</option>
            <option value="video">Video</option>
            <option value="image">Image</option>
            <option value="audio">Audio</option>
            <option value="post">Post</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Content List */}
        <Card>
          <CardHeader>
            <CardTitle>Content ({filteredContent.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredContent.map((item) => (
                <div key={item.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                  {/* Thumbnail/Icon */}
                  <div className="flex-shrink-0">
                    {item.thumbnail ? (
                      <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                        <Image className="h-6 w-6 text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                        {getTypeIcon(item.type)}
                      </div>
                    )}
                  </div>

                  {/* Content Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium truncate">{item.title}</h3>
                        {getStatusIcon(item.status)}
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(item.status)}
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">
                      by {item.creator} • {new Date(item.createdAt).toLocaleDateString()}
                    </p>

                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{item.views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ThumbsUp className="h-3 w-3" />
                        <span>{item.likes.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="h-3 w-3" />
                        <span>{item.comments.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Share className="h-3 w-3" />
                        <span>{item.shares.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {item.status === 'pending' && (
                      <Button variant="default" size="sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    )}
                    {item.status === 'pending' && (
                      <Button variant="destructive" size="sm">
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      <Flag className="h-4 w-4 mr-1" />
                      Flag
                    </Button>
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
