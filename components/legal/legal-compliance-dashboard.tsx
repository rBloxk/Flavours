"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  FileText, 
  Eye,
  Ban,
  Flag,
  Lock,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Settings
} from 'lucide-react'

interface LegalComplianceDashboardProps {
  className?: string
}

export function LegalComplianceDashboard({ className = '' }: LegalComplianceDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    criticalViolations: 0,
    verifiedUsers: 0,
    blockedUsers: 0,
    dmcaRequests: 0,
    averageResponseTime: 0
  })

  useEffect(() => {
    // In production, fetch real data from APIs
    setStats({
      totalReports: 1247,
      pendingReports: 23,
      resolvedReports: 1189,
      criticalViolations: 5,
      verifiedUsers: 15420,
      blockedUsers: 89,
      dmcaRequests: 156,
      averageResponseTime: 4.2
    })
  }, [])

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Flag className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reports</p>
                <p className="text-2xl font-bold">{stats.totalReports.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pendingReports}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold">{stats.criticalViolations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold">{stats.resolvedReports}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>5 critical violations</strong> detected in the last 24 hours. Immediate action required.
        </AlertDescription>
      </Alert>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium">Child exploitation content detected</p>
                  <p className="text-sm text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <Badge variant="destructive">Critical</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Flag className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium">DMCA takedown request received</p>
                  <p className="text-sm text-muted-foreground">4 hours ago</p>
                </div>
              </div>
              <Badge variant="secondary">High</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Age verification completed</p>
                  <p className="text-sm text-muted-foreground">6 hours ago</p>
                </div>
              </div>
              <Badge variant="outline">Resolved</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderContentModeration = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Content Moderation</h3>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Violation Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Child Exploitation</span>
                <Badge variant="destructive">5</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Copyright Infringement</span>
                <Badge variant="secondary">23</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Inappropriate Content</span>
                <Badge variant="outline">45</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Spam</span>
                <Badge variant="outline">67</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Moderation Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Content Removed</span>
                <span className="font-medium">89</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Users Warned</span>
                <span className="font-medium">34</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Users Suspended</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Users Banned</span>
                <span className="font-medium">3</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { id: '1', type: 'Child Exploitation', severity: 'Critical', status: 'Under Review', time: '2 hours ago' },
              { id: '2', type: 'Copyright Infringement', severity: 'High', status: 'Pending', time: '4 hours ago' },
              { id: '3', type: 'Inappropriate Content', severity: 'Medium', status: 'Resolved', time: '6 hours ago' },
              { id: '4', type: 'Spam', severity: 'Low', status: 'Resolved', time: '8 hours ago' }
            ].map((report) => (
              <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Flag className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{report.type}</p>
                    <p className="text-sm text-muted-foreground">{report.time}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={
                    report.severity === 'Critical' ? 'destructive' :
                    report.severity === 'High' ? 'secondary' :
                    report.severity === 'Medium' ? 'outline' : 'outline'
                  }>
                    {report.severity}
                  </Badge>
                  <Badge variant="outline">{report.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderDMCACompliance = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">DMCA Compliance</h3>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Submit Request
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold">144</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-bold">{stats.averageResponseTime}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>DMCA Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { id: 'DMCA-001', type: 'Takedown', status: 'Under Review', priority: 'High', submitted: '2 hours ago' },
              { id: 'DMCA-002', type: 'Counter Notice', status: 'Pending', priority: 'Medium', submitted: '4 hours ago' },
              { id: 'DMCA-003', type: 'Takedown', status: 'Resolved', priority: 'Low', submitted: '6 hours ago' }
            ].map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{request.id}</p>
                    <p className="text-sm text-muted-foreground">{request.type} • {request.submitted}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={
                    request.priority === 'High' ? 'destructive' :
                    request.priority === 'Medium' ? 'secondary' : 'outline'
                  }>
                    {request.priority}
                  </Badge>
                  <Badge variant="outline">{request.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderAgeVerification = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Age Verification</h3>
        <Button>
          <Users className="h-4 w-4 mr-2" />
          Manage Users
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Verified Users</p>
                <p className="text-2xl font-bold">{stats.verifiedUsers.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Ban className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Blocked Users</p>
                <p className="text-2xl font-bold">{stats.blockedUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">23</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Verification Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">ID Scan</span>
              <span className="font-medium">8,234 (53%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Credit Card</span>
              <span className="font-medium">4,567 (29%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Government ID</span>
              <span className="font-medium">2,345 (15%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Manual Review</span>
              <span className="font-medium">274 (3%)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center space-x-2">
        <Shield className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Legal Compliance Dashboard</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="moderation">Content Moderation</TabsTrigger>
          <TabsTrigger value="dmca">DMCA Compliance</TabsTrigger>
          <TabsTrigger value="verification">Age Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="moderation" className="space-y-6">
          {renderContentModeration()}
        </TabsContent>

        <TabsContent value="dmca" className="space-y-6">
          {renderDMCACompliance()}
        </TabsContent>

        <TabsContent value="verification" className="space-y-6">
          {renderAgeVerification()}
        </TabsContent>
      </Tabs>
    </div>
  )
}
