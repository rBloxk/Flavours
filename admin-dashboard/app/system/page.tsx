'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin-layout'
import { AuthGuard } from '@/components/auth-guard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Database, 
  Server, 
  Cpu, 
  HardDrive, 
  Wifi, 
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Activity,
  Zap,
  Shield,
  Globe
} from 'lucide-react'

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical'
  uptime: number
  memory: {
    used: number
    total: number
    percentage: number
  }
  cpu: {
    usage: number
    cores: number
  }
  disk: {
    used: number
    total: number
    percentage: number
  }
  network: {
    latency: number
    throughput: number
  }
  database: {
    status: 'connected' | 'disconnected' | 'slow'
    responseTime: number
    connections: number
  }
  redis: {
    status: 'connected' | 'disconnected' | 'slow'
    responseTime: number
    memory: number
  }
  services: {
    name: string
    status: 'running' | 'stopped' | 'error'
    uptime: number
  }[]
}

export default function SystemPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    fetchSystemHealth()
    const interval = setInterval(fetchSystemHealth, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchSystemHealth = async () => {
    try {
      setLoading(true)
      // Mock data for demo
      const mockHealth: SystemHealth = {
        status: 'healthy',
        uptime: 99.9,
        memory: {
          used: 6.2,
          total: 16,
          percentage: 38.75
        },
        cpu: {
          usage: 45,
          cores: 8
        },
        disk: {
          used: 250,
          total: 500,
          percentage: 50
        },
        network: {
          latency: 12,
          throughput: 1000
        },
        database: {
          status: 'connected',
          responseTime: 5,
          connections: 45
        },
        redis: {
          status: 'connected',
          responseTime: 2,
          memory: 128
        },
        services: [
          { name: 'API Server', status: 'running', uptime: 99.9 },
          { name: 'Database', status: 'running', uptime: 99.8 },
          { name: 'Redis Cache', status: 'running', uptime: 99.7 },
          { name: 'Media Worker', status: 'running', uptime: 99.5 },
          { name: 'Email Service', status: 'running', uptime: 99.2 },
          { name: 'Analytics', status: 'running', uptime: 98.9 }
        ]
      }
      setHealth(mockHealth)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to fetch system health:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'running':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
      case 'slow':
        return <Clock className="h-4 w-4 text-orange-500" />
      case 'critical':
      case 'disconnected':
      case 'stopped':
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'running':
        return <Badge variant="default" className="bg-green-600">Healthy</Badge>
      case 'warning':
      case 'slow':
        return <Badge variant="outline" className="text-orange-600 border-orange-600">Warning</Badge>
      case 'critical':
      case 'disconnected':
      case 'stopped':
      case 'error':
        return <Badge variant="destructive">Critical</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatUptime = (uptime: number) => {
    return `${uptime.toFixed(1)}%`
  }

  const formatBytes = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
    } else if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    } else if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`
    }
    return `${bytes} B`
  }

  if (loading && !health) {
    return (
      <AuthGuard requiredRole="admin">
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requiredRole="admin">
      <AdminLayout>
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">System Monitoring</h1>
              <p className="text-muted-foreground">Monitor system health and performance</p>
            </div>
            <div className="flex items-center space-x-2">
              {lastUpdated && (
                <p className="text-sm text-muted-foreground">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
              <Button variant="outline" size="sm" onClick={fetchSystemHealth}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Overall Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getStatusIcon(health?.status || 'unknown')}
              <span>System Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{getStatusBadge(health?.status || 'unknown')}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Overall system uptime: {formatUptime(health?.uptime || 0)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">System Uptime</p>
                <p className="text-3xl font-bold">{formatUptime(health?.uptime || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Resources */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{health?.cpu.usage || 0}%</div>
              <p className="text-xs text-muted-foreground">
                {health?.cpu.cores || 0} cores
              </p>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${health?.cpu.usage || 0}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{health?.memory.percentage || 0}%</div>
              <p className="text-xs text-muted-foreground">
                {formatBytes((health?.memory.used || 0) * 1024 * 1024 * 1024)} / {formatBytes((health?.memory.total || 0) * 1024 * 1024 * 1024)}
              </p>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${health?.memory.percentage || 0}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{health?.disk.percentage || 0}%</div>
              <p className="text-xs text-muted-foreground">
                {formatBytes((health?.disk.used || 0) * 1024 * 1024 * 1024)} / {formatBytes((health?.disk.total || 0) * 1024 * 1024 * 1024)}
              </p>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${health?.disk.percentage || 0}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Network Latency</CardTitle>
              <Wifi className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{health?.network.latency || 0}ms</div>
              <p className="text-xs text-muted-foreground">
                {formatBytes((health?.network.throughput || 0) * 1024 * 1024)}/s throughput
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Database & Cache Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {getStatusIcon(health?.database.status || 'unknown')}
                <span>Database</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  {getStatusBadge(health?.database.status || 'unknown')}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Response Time</span>
                  <span className="text-sm">{health?.database.responseTime || 0}ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Active Connections</span>
                  <span className="text-sm">{health?.database.connections || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {getStatusIcon(health?.redis.status || 'unknown')}
                <span>Redis Cache</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  {getStatusBadge(health?.redis.status || 'unknown')}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Response Time</span>
                  <span className="text-sm">{health?.redis.responseTime || 0}ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Memory Usage</span>
                  <span className="text-sm">{formatBytes((health?.redis.memory || 0) * 1024 * 1024)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services Status */}
        <Card>
          <CardHeader>
            <CardTitle>Services Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {health?.services.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(service.status)}
                    <div>
                      <h3 className="font-medium">{service.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Uptime: {formatUptime(service.uptime)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(service.status)}
                    <Button variant="ghost" size="sm">
                      <Activity className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>System Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                <RefreshCw className="h-6 w-6 mb-2" />
                <span>Restart Services</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                <Database className="h-6 w-6 mb-2" />
                <span>Clear Cache</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                <Shield className="h-6 w-6 mb-2" />
                <span>Security Scan</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    </AuthGuard>
  )
}
