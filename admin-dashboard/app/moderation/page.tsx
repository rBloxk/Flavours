'use client'

import { AdminLayout } from '@/components/admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react'

export default function ModerationPage() {
  const mockItems = [
    { 
      id: 1, 
      type: 'post', 
      title: 'Inappropriate Content', 
      reportedBy: 'user123', 
      status: 'pending',
      createdAt: '2024-01-15T10:30:00Z'
    },
    { 
      id: 2, 
      type: 'comment', 
      title: 'Spam Comment', 
      reportedBy: 'user456', 
      status: 'reviewed',
      createdAt: '2024-01-15T09:15:00Z'
    },
    { 
      id: 3, 
      type: 'user', 
      title: 'Suspicious Activity', 
      reportedBy: 'user789', 
      status: 'pending',
      createdAt: '2024-01-15T08:45:00Z'
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-500" />
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-orange-600">Pending</Badge>
      case 'approved':
        return <Badge variant="default" className="bg-green-600">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Content Moderation</h1>
        <p className="text-muted-foreground">Review and moderate content on your platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Items awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviewed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Items processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.5h</div>
            <p className="text-xs text-muted-foreground">Review time</p>
          </CardContent>
        </Card>
      </div>

      {/* Moderation Queue */}
      <Card>
        <CardHeader>
          <CardTitle>Moderation Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(item.status)}
                  <div>
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.type} • Reported by {item.reportedBy} • {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(item.status)}
                  <Button variant="outline" size="sm">
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  )
}
