"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  Search,
  Filter,
  Eye,
  Flag,
  User,
  Image as ImageIcon,
  MessageSquare
} from 'lucide-react'

export function ModerationDashboard() {
  const [filter, setFilter] = useState('all')
  
  // Mock data - in real app, this would come from API
  const moderationItems = [
    {
      id: '1',
      type: 'post',
      contentId: 'post_123',
      reason: 'Inappropriate content',
      status: 'pending',
      reportedBy: 'user_456',
      createdAt: '2 minutes ago',
      content: {
        preview: 'Photo post with questionable content...',
        creator: 'jane_doe',
      }
    },
    {
      id: '2',
      type: 'profile',
      contentId: 'profile_789',
      reason: 'Fake identity',
      status: 'under_review',
      reportedBy: 'user_321',
      createdAt: '1 hour ago',
      content: {
        preview: 'Profile claiming to be celebrity...',
        creator: 'fake_celeb',
      }
    },
    {
      id: '3',
      type: 'message',
      contentId: 'msg_456',
      reason: 'Harassment',
      status: 'approved',
      reportedBy: 'user_789',
      reviewedBy: 'mod_001',
      createdAt: '3 hours ago',
      reviewedAt: '30 minutes ago',
      content: {
        preview: 'Direct message with threatening language...',
        creator: 'angry_user',
      }
    },
    {
      id: '4',
      type: 'post',
      contentId: 'post_789',
      reason: 'Copyright violation',
      status: 'rejected',
      reportedBy: 'user_654',
      reviewedBy: 'mod_002',
      createdAt: '5 hours ago',
      reviewedAt: '2 hours ago',
      content: {
        preview: 'Video content using copyrighted music...',
        creator: 'music_lover',
      }
    },
  ]

  const stats = {
    total: 156,
    pending: 23,
    underReview: 8,
    approved: 89,
    rejected: 36,
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'under_review':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: 'secondary',
      under_review: 'default',
      approved: 'default',
      rejected: 'destructive',
    }
    return <Badge variant={variants[status] || 'outline'}>{status.replace('_', ' ')}</Badge>
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <ImageIcon className="h-4 w-4" />
      case 'profile':
        return <User className="h-4 w-4" />
      case 'message':
        return <MessageSquare className="h-4 w-4" />
      default:
        return <Flag className="h-4 w-4" />
    }
  }

  const handleAction = (itemId: string, action: 'approve' | 'reject' | 'escalate') => {
    // Handle moderation action
    console.log(`${action} item ${itemId}`)
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Moderation Dashboard</h1>
          <p className="text-muted-foreground">
            Review reported content and manage platform safety
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.underReview}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="queue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="queue">Review Queue</TabsTrigger>
          <TabsTrigger value="appeals">Appeals</TabsTrigger>
          <TabsTrigger value="reports">Report History</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
        </TabsList>
        
        <TabsContent value="queue" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search reports..."
                    className="max-w-sm"
                  />
                </div>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Moderation Items */}
          <div className="space-y-4">
            {moderationItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between space-x-4">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="p-2 bg-muted rounded-lg">
                        {getContentIcon(item.type)}
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{item.type}</Badge>
                          {getStatusBadge(item.status)}
                          {getStatusIcon(item.status)}
                        </div>
                        <div>
                          <h3 className="font-medium">Reason: {item.reason}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.content.preview}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Creator: @{item.content.creator}</span>
                          <span>Reported by: {item.reportedBy}</span>
                          <span>Created: {item.createdAt}</span>
                          {item.reviewedAt && <span>Reviewed: {item.reviewedAt}</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      {item.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleAction(item.id, 'approve')}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAction(item.id, 'reject')}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction(item.id, 'escalate')}
                          >
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Escalate
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="appeals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Appeals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <p>No active appeals</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Report History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <p>Historical reports view coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Policies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Adult Content Policy</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Guidelines for acceptable adult content on the platform
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Harassment & Bullying</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Zero tolerance policy for harassment and bullying
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Copyright & IP</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Protection of intellectual property rights
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}