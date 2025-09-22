'use client'

import { useState } from 'react'
import { AdminLayout } from '../../components/admin-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertTriangle, CheckCircle, XCircle, Clock, Shield, Eye, Ban, AlertCircle } from 'lucide-react'
import { ContentScanner } from '@/components/moderation/content-scanner'
import { SafetyDashboard } from '@/components/moderation/safety-dashboard'

export default function ModerationPage() {
  const [activeTab, setActiveTab] = useState('overview')

  const mockItems = [
    { 
      id: 1, 
      type: 'post', 
      title: 'Potential Child Exploitation Content', 
      reportedBy: 'user123', 
      status: 'pending',
      createdAt: '2024-01-15T10:30:00Z',
      riskLevel: 'critical',
      categories: ['child_exploitation', 'explicit_content']
    },
    { 
      id: 2, 
      type: 'comment', 
      title: 'Violent Threats', 
      reportedBy: 'user456', 
      status: 'reviewed',
      createdAt: '2024-01-15T09:15:00Z',
      riskLevel: 'high',
      categories: ['violence', 'threats']
    },
    { 
      id: 3, 
      type: 'user', 
      title: 'Harassment Campaign', 
      reportedBy: 'user789', 
      status: 'pending',
      createdAt: '2024-01-15T08:45:00Z',
      riskLevel: 'medium',
      categories: ['harassment', 'bullying']
    },
    { 
      id: 4, 
      type: 'post', 
      title: 'Graphic Violence', 
      reportedBy: 'user101', 
      status: 'pending',
      createdAt: '2024-01-15T07:20:00Z',
      riskLevel: 'high',
      categories: ['violence', 'graphic_content']
    },
    { 
      id: 5, 
      type: 'comment', 
      title: 'Hate Speech', 
      reportedBy: 'user202', 
      status: 'reviewed',
      createdAt: '2024-01-15T06:30:00Z',
      riskLevel: 'medium',
      categories: ['hate_speech', 'discrimination']
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-500" />
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'reviewed':
        return <Eye className="h-4 w-4 text-blue-500" />
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
      case 'reviewed':
        return <Badge variant="default" className="bg-blue-600">Under Review</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return <Badge variant="destructive" className="bg-red-600">Critical</Badge>
      case 'high':
        return <Badge variant="outline" className="text-orange-600 border-orange-200">High Risk</Badge>
      case 'medium':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-200">Medium Risk</Badge>
      case 'low':
        return <Badge variant="outline" className="text-green-600 border-green-200">Low Risk</Badge>
      default:
        return <Badge variant="secondary">{riskLevel}</Badge>
    }
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Content Moderation</h1>
        <p className="text-muted-foreground">Advanced content moderation with AI-powered safety detection</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="safety">Safety Dashboard</TabsTrigger>
          <TabsTrigger value="scanner">AI Scanner</TabsTrigger>
          <TabsTrigger value="queue">Moderation Queue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Critical Alerts */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="font-medium text-red-800">Critical Safety Alert</h3>
            </div>
            <div className="text-sm text-red-700">
              {mockItems.filter(item => item.riskLevel === 'critical').length} critical content violations detected requiring immediate attention.
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {mockItems.filter(item => item.riskLevel === 'critical').length}
                </div>
                <p className="text-xs text-muted-foreground">Immediate action required</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Risk</CardTitle>
                <Ban className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {mockItems.filter(item => item.riskLevel === 'high').length}
                </div>
                <p className="text-xs text-muted-foreground">Priority review needed</p>
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

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common moderation tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Shield className="h-6 w-6 mb-2" />
                  <span>Review Critical</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Eye className="h-6 w-6 mb-2" />
                  <span>View Reports</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <AlertCircle className="h-6 w-6 mb-2" />
                  <span>Safety Alerts</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Ban className="h-6 w-6 mb-2" />
                  <span>Block Users</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="safety" className="space-y-6">
          <SafetyDashboard />
        </TabsContent>

        <TabsContent value="scanner" className="space-y-6">
          <ContentScanner />
        </TabsContent>

        <TabsContent value="queue" className="space-y-6">
          {/* Enhanced Moderation Queue */}
          <Card>
            <CardHeader>
              <CardTitle>Moderation Queue</CardTitle>
              <CardDescription>Review flagged content and take appropriate action</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockItems.map((item) => (
                  <div key={item.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        {getStatusIcon(item.status)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{item.title}</h3>
                            {getRiskBadge(item.riskLevel)}
                            {getStatusBadge(item.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {item.type} • Reported by {item.reportedBy} • {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {item.categories.map((category, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {category.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          Review
                        </Button>
                        {item.status === 'pending' && (
                          <>
                            <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                              <XCircle className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  )
}
