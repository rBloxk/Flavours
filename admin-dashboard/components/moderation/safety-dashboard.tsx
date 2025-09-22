'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield, 
  AlertTriangle, 
  Users, 
  Eye, 
  Ban, 
  CheckCircle, 
  Clock,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react'

interface SafetyMetrics {
  totalScans: number
  violationsDetected: number
  childSafetyFlags: number
  violenceFlags: number
  harassmentFlags: number
  falsePositives: number
  averageResponseTime: number
  escalationRate: number
}

interface SafetyDashboardProps {
  className?: string
}

export function SafetyDashboard({ className }: SafetyDashboardProps) {
  const [metrics] = useState<SafetyMetrics>({
    totalScans: 15420,
    violationsDetected: 234,
    childSafetyFlags: 12,
    violenceFlags: 89,
    harassmentFlags: 133,
    falsePositives: 23,
    averageResponseTime: 2.3,
    escalationRate: 8.5
  })

  const [activeTab, setActiveTab] = useState('overview')

  const getTrendIcon = (value: number, threshold: number) => {
    return value > threshold ? 
      <TrendingUp className="h-4 w-4 text-red-500" /> : 
      <TrendingDown className="h-4 w-4 text-green-500" />
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Safety & Compliance Dashboard
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Monitor platform safety and content moderation effectiveness
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="child-safety">Child Safety</TabsTrigger>
            <TabsTrigger value="violence">Violence</TabsTrigger>
            <TabsTrigger value="harassment">Harassment</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{metrics.totalScans.toLocaleString()}</div>
                <div className="text-xs text-blue-600">Total Scans</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-600">{metrics.violationsDetected}</div>
                <div className="text-xs text-red-600">Violations</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">{metrics.falsePositives}</div>
                <div className="text-xs text-green-600">False Positives</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">{metrics.averageResponseTime}h</div>
                <div className="text-xs text-purple-600">Avg Response</div>
              </div>
            </div>

            {/* Response Time Trend */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Response Time Trend</h3>
                {getTrendIcon(metrics.averageResponseTime, 2.0)}
              </div>
              <div className="text-sm text-muted-foreground">
                Average time to review flagged content: {metrics.averageResponseTime} hours
              </div>
            </div>
          </TabsContent>

          <TabsContent value="child-safety" className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h3 className="font-medium text-red-800">Child Safety Alert</h3>
              </div>
              <div className="text-sm text-red-700">
                {metrics.childSafetyFlags} potential child exploitation cases detected in the last 24 hours.
                Immediate review required.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-600">{metrics.childSafetyFlags}</div>
                <div className="text-xs text-red-600">Child Safety Flags</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-2xl font-bold text-orange-600">100%</div>
                <div className="text-xs text-orange-600">Escalation Rate</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Immediate Actions Required:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Review all flagged content within 1 hour</li>
                <li>• Report to law enforcement if confirmed</li>
                <li>• Suspend accounts pending investigation</li>
                <li>• Document all actions taken</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="violence" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-2xl font-bold text-orange-600">{metrics.violenceFlags}</div>
                <div className="text-xs text-orange-600">Violence Flags</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-600">15%</div>
                <div className="text-xs text-yellow-600">False Positive Rate</div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Violence Detection Categories:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Graphic Violence</span>
                  <Badge variant="destructive">High Risk</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Threats</span>
                  <Badge variant="outline" className="text-orange-600">Medium Risk</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Fighting Content</span>
                  <Badge variant="outline" className="text-yellow-600">Low Risk</Badge>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="harassment" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">{metrics.harassmentFlags}</div>
                <div className="text-xs text-purple-600">Harassment Flags</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">92%</div>
                <div className="text-xs text-blue-600">Accuracy Rate</div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Harassment Types Detected:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Cyberbullying</span>
                  <span className="text-muted-foreground">45 cases</span>
                </div>
                <div className="flex justify-between">
                  <span>Hate Speech</span>
                  <span className="text-muted-foreground">32 cases</span>
                </div>
                <div className="flex justify-between">
                  <span>Sexual Harassment</span>
                  <span className="text-muted-foreground">28 cases</span>
                </div>
                <div className="flex justify-between">
                  <span>Doxxing</span>
                  <span className="text-muted-foreground">18 cases</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
