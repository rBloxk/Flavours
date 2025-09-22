'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '../../components/admin-layout'
import { AuthGuard } from '../../components/auth-guard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  MessageCircle, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Eye,
  User,
  FileText,
  Flag,
  Ban,
  Archive
} from 'lucide-react'

interface Report {
  id: string
  reporterId: string
  reporterName: string
  reportedUserId: string
  reportedUserName: string
  contentType: 'post' | 'profile' | 'message' | 'comment'
  contentId?: string
  reason: string
  description: string
  status: 'open' | 'investigating' | 'resolved' | 'dismissed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  createdAt: string
  resolvedAt?: string
  resolvedBy?: string
  resolutionNotes?: string
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      // Mock data for demo
      const mockReports: Report[] = [
        {
          id: '1',
          reporterId: 'user1',
          reporterName: 'John Doe',
          reportedUserId: 'user2',
          reportedUserName: 'Sarah Johnson',
          contentType: 'post',
          contentId: 'post123',
          reason: 'Inappropriate Content',
          description: 'This post contains explicit content that violates community guidelines.',
          status: 'open',
          priority: 'high',
          createdAt: '2024-01-20T10:30:00Z',
        },
        {
          id: '2',
          reporterId: 'user3',
          reporterName: 'Mike Chen',
          reportedUserId: 'user4',
          reportedUserName: 'Emma Davis',
          contentType: 'profile',
          reason: 'Spam',
          description: 'This profile appears to be fake and is posting spam content.',
          status: 'investigating',
          priority: 'medium',
          createdAt: '2024-01-19T15:45:00Z',
        },
        {
          id: '3',
          reporterId: 'user5',
          reporterName: 'Alex Rodriguez',
          reportedUserId: 'user6',
          reportedUserName: 'Lisa Wang',
          contentType: 'comment',
          contentId: 'comment456',
          reason: 'Harassment',
          description: 'This user is sending threatening messages and harassing other users.',
          status: 'resolved',
          priority: 'urgent',
          createdAt: '2024-01-18T09:15:00Z',
          resolvedAt: '2024-01-19T14:30:00Z',
          resolvedBy: 'admin1',
          resolutionNotes: 'User has been temporarily suspended for 7 days.'
        },
        {
          id: '4',
          reporterId: 'user7',
          reporterName: 'David Kim',
          reportedUserId: 'user8',
          reportedUserName: 'Jessica Brown',
          contentType: 'message',
          reason: 'Inappropriate Content',
          description: 'Received inappropriate messages from this user.',
          status: 'dismissed',
          priority: 'low',
          createdAt: '2024-01-17T16:20:00Z',
          resolvedAt: '2024-01-18T11:00:00Z',
          resolvedBy: 'mod1',
          resolutionNotes: 'No violation found. Messages were taken out of context.'
        }
      ]
      setReports(mockReports)
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'investigating':
        return <Clock className="h-4 w-4 text-orange-500" />
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'dismissed':
        return <Archive className="h-4 w-4 text-gray-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="destructive">Open</Badge>
      case 'investigating':
        return <Badge variant="outline" className="text-orange-600 border-orange-600">Investigating</Badge>
      case 'resolved':
        return <Badge variant="default" className="bg-green-600">Resolved</Badge>
      case 'dismissed':
        return <Badge variant="secondary">Dismissed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>
      case 'high':
        return <Badge variant="outline" className="text-red-600 border-red-600">High</Badge>
      case 'medium':
        return <Badge variant="outline" className="text-orange-600 border-orange-600">Medium</Badge>
      case 'low':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Low</Badge>
      default:
        return <Badge variant="secondary">{priority}</Badge>
    }
  }

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <FileText className="h-4 w-4" />
      case 'profile':
        return <User className="h-4 w-4" />
      case 'message':
        return <MessageCircle className="h-4 w-4" />
      case 'comment':
        return <MessageCircle className="h-4 w-4" />
      default:
        return <Flag className="h-4 w-4" />
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.reporterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reportedUserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || report.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const stats = {
    total: reports.length,
    open: reports.filter(r => r.status === 'open').length,
    investigating: reports.filter(r => r.status === 'investigating').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    urgent: reports.filter(r => r.priority === 'urgent').length,
    high: reports.filter(r => r.priority === 'high').length
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
          <h1 className="text-3xl font-bold">Reports Management</h1>
          <p className="text-muted-foreground">Review and manage user reports</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <Flag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">All reports</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.open}</div>
              <p className="text-xs text-muted-foreground">Needs attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Investigating</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.investigating}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgent</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
              <p className="text-xs text-muted-foreground">High priority</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reports by reporter, reported user, or reason..."
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
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle>Reports ({filteredReports.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <div key={report.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getContentTypeIcon(report.contentType)}
                      <div>
                        <h3 className="font-medium">{report.reason}</h3>
                        <p className="text-sm text-muted-foreground">
                          {report.contentType} • Reported by {report.reporterName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getPriorityBadge(report.priority)}
                      {getStatusBadge(report.status)}
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Reported User:</strong> {report.reportedUserName}
                    </p>
                    <p className="text-sm">{report.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Created: {new Date(report.createdAt).toLocaleDateString()}</span>
                    {report.resolvedAt && (
                      <span>Resolved: {new Date(report.resolvedAt).toLocaleDateString()}</span>
                    )}
                  </div>

                  {report.resolutionNotes && (
                    <div className="mt-3 p-3 bg-muted rounded-md">
                      <p className="text-sm">
                        <strong>Resolution:</strong> {report.resolutionNotes}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-end space-x-2 mt-3">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    {report.status === 'open' && (
                      <Button variant="default" size="sm">
                        <Clock className="h-4 w-4 mr-1" />
                        Start Investigation
                      </Button>
                    )}
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
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
