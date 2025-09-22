'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Shield, Eye, Ban, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface ContentScanResult {
  id: string
  type: 'image' | 'video' | 'text'
  content: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  categories: string[]
  confidence: number
  timestamp: string
  status: 'pending' | 'reviewed' | 'approved' | 'rejected'
  reviewedBy?: string
  reviewNotes?: string
}

interface ContentScannerProps {
  className?: string
}

export function ContentScanner({ className }: ContentScannerProps) {
  const [scanResults, setScanResults] = useState<ContentScanResult[]>([
    {
      id: '1',
      type: 'image',
      content: 'Suspicious image detected',
      riskLevel: 'critical',
      categories: ['child_exploitation', 'explicit_content'],
      confidence: 95,
      timestamp: '2024-01-15T10:30:00Z',
      status: 'pending'
    },
    {
      id: '2',
      type: 'text',
      content: 'Inappropriate text content',
      riskLevel: 'high',
      categories: ['violence', 'harassment'],
      confidence: 87,
      timestamp: '2024-01-15T10:25:00Z',
      status: 'pending'
    },
    {
      id: '3',
      type: 'video',
      content: 'Video content flagged',
      riskLevel: 'medium',
      categories: ['violence'],
      confidence: 72,
      timestamp: '2024-01-15T10:20:00Z',
      status: 'reviewed',
      reviewedBy: 'admin@flavours.club',
      reviewNotes: 'Content approved after review'
    }
  ])

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />
      case 'high': return <Ban className="h-4 w-4" />
      case 'medium': return <AlertCircle className="h-4 w-4" />
      case 'low': return <CheckCircle className="h-4 w-4" />
      default: return <Eye className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="text-orange-600">Pending</Badge>
      case 'reviewed': return <Badge variant="default" className="bg-blue-600">Under Review</Badge>
      case 'approved': return <Badge variant="default" className="bg-green-600">Approved</Badge>
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>
      default: return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleAction = (id: string, action: 'approve' | 'reject' | 'escalate') => {
    setScanResults(prev => 
      prev.map(result => 
        result.id === id 
          ? { 
              ...result, 
              status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'reviewed',
              reviewedBy: 'admin@flavours.club',
              reviewNotes: action === 'escalate' ? 'Escalated to senior moderator' : undefined
            }
          : result
      )
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          AI Content Scanner
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Automated detection of violent and inappropriate content
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Scanner Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">
                {scanResults.filter(r => r.riskLevel === 'critical').length}
              </div>
              <div className="text-xs text-red-600">Critical</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">
                {scanResults.filter(r => r.riskLevel === 'high').length}
              </div>
              <div className="text-xs text-orange-600">High Risk</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600">
                {scanResults.filter(r => r.riskLevel === 'medium').length}
              </div>
              <div className="text-xs text-yellow-600">Medium Risk</div>
            </div>
          </div>

          {/* Scan Results */}
          <div className="space-y-3">
            {scanResults.map((result) => (
              <div key={result.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getRiskIcon(result.riskLevel)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskColor(result.riskLevel)}`}>
                        {result.riskLevel.toUpperCase()}
                      </span>
                      <Badge variant="outline">{result.type}</Badge>
                      {getStatusBadge(result.status)}
                    </div>
                    
                    <p className="text-sm font-medium mb-1">{result.content}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Confidence: {result.confidence}%</span>
                      <span>Categories: {result.categories.join(', ')}</span>
                      <span>{new Date(result.timestamp).toLocaleString()}</span>
                    </div>
                    
                    {result.reviewNotes && (
                      <div className="mt-2 p-2 bg-muted rounded text-xs">
                        <strong>Review Notes:</strong> {result.reviewNotes}
                      </div>
                    )}
                  </div>
                  
                  {result.status === 'pending' && (
                    <div className="flex gap-2 ml-4">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleAction(result.id, 'escalate')}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Review
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => handleAction(result.id, 'approve')}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleAction(result.id, 'reject')}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
