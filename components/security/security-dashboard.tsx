'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { useSecurity } from '@/lib/security-service'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Lock,
  Activity,
  Users,
  Globe,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SecurityDashboardProps {
  className?: string
  userRole?: 'admin' | 'security' | 'viewer'
}

export function SecurityDashboard({ className, userRole = 'viewer' }: SecurityDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const { threatLevel, securityEvents } = useSecurity()

  const refreshData = async () => {
    setIsRefreshing(true)
    // Simulate data refresh
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50 dark:bg-red-950/20'
      case 'high': return 'text-orange-600 bg-orange-50 dark:bg-orange-950/20'
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20'
      case 'low': return 'text-green-600 bg-green-50 dark:bg-green-950/20'
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-950/20'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />
      default: return <Eye className="h-4 w-4 text-gray-500" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const recentEvents = securityEvents.slice(-10).reverse()
  const criticalEvents = securityEvents.filter(e => e.severity === 'critical')
  const highEvents = securityEvents.filter(e => e.severity === 'high')
  const mediumEvents = securityEvents.filter(e => e.severity === 'medium')
  const lowEvents = securityEvents.filter(e => e.severity === 'low')

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Security Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor security events and threat levels
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={cn("w-3 h-3 rounded-full", 
              threatLevel === 'critical' ? 'bg-red-500' :
              threatLevel === 'high' ? 'bg-orange-500' :
              threatLevel === 'medium' ? 'bg-yellow-500' :
              'bg-green-500'
            )} />
            <span className="text-sm font-medium capitalize">{threatLevel} Threat</span>
          </div>
          
          <Button onClick={refreshData} variant="outline" size="sm" disabled={isRefreshing}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Threat Level Alert */}
      {threatLevel === 'critical' && (
        <Alert className="border-red-500 bg-red-50 dark:bg-red-950/20">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            <strong>Critical Threat Detected!</strong> Immediate action required. 
            Multiple security violations detected in the last hour.
          </AlertDescription>
        </Alert>
      )}

      {threatLevel === 'high' && (
        <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            <strong>High Threat Level</strong> - Increased security monitoring active. 
            Review recent security events.
          </AlertDescription>
        </Alert>
      )}

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{securityEvents.length}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2">
              <div className="flex items-center space-x-1 text-sm">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-600">+12%</span>
                <span className="text-muted-foreground">from last hour</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Events</p>
                <p className="text-2xl font-bold text-red-600">{criticalEvents.length}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <div className="mt-2">
              <Progress value={(criticalEvents.length / securityEvents.length) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {securityEvents.length > 0 ? ((criticalEvents.length / securityEvents.length) * 100).toFixed(1) : 0}% of total events
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold text-orange-600">{highEvents.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-2">
              <div className="flex items-center space-x-1 text-sm">
                <TrendingDown className="h-3 w-3 text-green-500" />
                <span className="text-green-600">-5%</span>
                <span className="text-muted-foreground">from last hour</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Security Score</p>
                <p className="text-2xl font-bold">
                  {threatLevel === 'low' ? '95' : 
                   threatLevel === 'medium' ? '75' : 
                   threatLevel === 'high' ? '45' : '15'}
                </p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2">
              <Progress 
                value={threatLevel === 'low' ? 95 : 
                       threatLevel === 'medium' ? 75 : 
                       threatLevel === 'high' ? 45 : 15} 
                className="h-2" 
              />
              <p className="text-xs text-muted-foreground mt-1">
                {threatLevel === 'low' ? 'Excellent' : 
                 threatLevel === 'medium' ? 'Good' : 
                 threatLevel === 'high' ? 'Poor' : 'Critical'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="threats">Threats</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Recent Security Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {recentEvents.map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getSeverityIcon(event.severity)}
                        <div>
                          <p className="font-medium text-sm">{event.type.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-muted-foreground">
                            {event.userId ? `User: ${event.userId}` : 'System Event'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          event.severity === 'critical' ? 'destructive' :
                          event.severity === 'high' ? 'secondary' :
                          event.severity === 'medium' ? 'outline' : 'default'
                        }>
                          {event.severity}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTimestamp(event.metadata.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Security Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="h-5 w-5" />
                  <span>Authentication Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">MFA Enabled</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Device Trust</span>
                  <Badge variant="default">Trusted</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Session Security</span>
                  <Badge variant="default">Secure</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Risk Score</span>
                  <Badge variant={threatLevel === 'low' ? 'default' : 'destructive'}>
                    {threatLevel === 'low' ? 'Low' : 'High'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Network Security</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">HTTPS</span>
                  <Badge variant="default">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">CSP</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Rate Limiting</span>
                  <Badge variant="default">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">DDoS Protection</span>
                  <Badge variant="default">Active</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Events</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {securityEvents.map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getSeverityIcon(event.severity)}
                        <div>
                          <p className="font-medium">{event.type.replace(/_/g, ' ')}</p>
                          <p className="text-sm text-muted-foreground">
                            {event.userId ? `User: ${event.userId}` : 'System Event'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          event.severity === 'critical' ? 'destructive' :
                          event.severity === 'high' ? 'secondary' :
                          event.severity === 'medium' ? 'outline' : 'default'
                        }>
                          {event.severity}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTimestamp(event.metadata.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threats" className="space-y-6">
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Threat intelligence and analysis would be displayed here</p>
            <p className="text-sm">Including threat patterns, IP reputation, and security recommendations</p>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="text-center py-8 text-muted-foreground">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Security settings and configuration would be displayed here</p>
            <p className="text-sm">Including monitoring rules, alert preferences, and access controls</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Security Alert Component
export function SecurityAlert({ 
  type, 
  message, 
  onDismiss 
}: { 
  type: 'info' | 'warning' | 'error' | 'success'
  message: string
  onDismiss?: () => void 
}) {
  const getAlertStyles = () => {
    switch (type) {
      case 'error':
        return 'border-red-500 bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-200'
      case 'warning':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-200'
      case 'success':
        return 'border-green-500 bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-200'
      default:
        return 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-200'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'error': return <XCircle className="h-4 w-4" />
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      case 'success': return <CheckCircle className="h-4 w-4" />
      default: return <Eye className="h-4 w-4" />
    }
  }

  return (
    <Alert className={getAlertStyles()}>
      {getIcon()}
      <AlertDescription className="flex items-center justify-between">
        <span>{message}</span>
        {onDismiss && (
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            ×
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}

