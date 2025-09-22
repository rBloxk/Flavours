'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { aiService } from '@/lib/ai-service'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  FileText,
  Image,
  Video,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModerationResult {
  isApproved: boolean
  confidence: number
  violations: Array<{
    type: 'spam' | 'harassment' | 'explicit' | 'violence' | 'hate_speech' | 'misinformation'
    severity: 'low' | 'medium' | 'high'
    reason: string
    confidence: number
  }>
  suggestions: string[]
}

interface ContentItem {
  id: string
  type: 'text' | 'image' | 'video'
  content: string
  mediaUrl?: string
  author: {
    id: string
    username: string
    displayName: string
  }
  createdAt: string
  status: 'pending' | 'approved' | 'rejected' | 'flagged'
}

interface AIContentModerationProps {
  contentItems: ContentItem[]
  onModerationComplete: (itemId: string, result: ModerationResult) => void
  className?: string
}

export function AIContentModeration({ 
  contentItems, 
  onModerationComplete,
  className 
}: AIContentModerationProps) {
  const [moderatingItems, setModeratingItems] = useState<Set<string>>(new Set())
  const [moderationResults, setModerationResults] = useState<Map<string, ModerationResult>>(new Map())
  const [activeTab, setActiveTab] = useState('pending')

  const moderateContent = useCallback(async (item: ContentItem) => {
    setModeratingItems(prev => new Set(prev).add(item.id))

    try {
      const result = await aiService.moderateContent({
        text: item.content,
        imageUrl: item.type === 'image' ? item.mediaUrl : undefined,
        videoUrl: item.type === 'video' ? item.mediaUrl : undefined
      })

      setModerationResults(prev => new Map(prev).set(item.id, result))
      onModerationComplete(item.id, result)
    } catch (error) {
      console.error('Moderation failed:', error)
    } finally {
      setModeratingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(item.id)
        return newSet
      })
    }
  }, [onModerationComplete])

  const moderateAllPending = useCallback(async () => {
    const pendingItems = contentItems.filter(item => item.status === 'pending')
    
    for (const item of pendingItems) {
      await moderateContent(item)
    }
  }, [contentItems, moderateContent])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'flagged':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <Eye className="h-4 w-4 text-gray-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'secondary'
      case 'low':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getViolationIcon = (type: string) => {
    switch (type) {
      case 'spam':
        return '📧'
      case 'harassment':
        return '⚠️'
      case 'explicit':
        return '🔞'
      case 'violence':
        return '🔪'
      case 'hate_speech':
        return '💬'
      case 'misinformation':
        return '📰'
      default:
        return '❓'
    }
  }

  const filteredItems = contentItems.filter(item => {
    switch (activeTab) {
      case 'pending':
        return item.status === 'pending'
      case 'approved':
        return item.status === 'approved'
      case 'rejected':
        return item.status === 'rejected'
      case 'flagged':
        return item.status === 'flagged'
      default:
        return true
    }
  })

  const pendingCount = contentItems.filter(item => item.status === 'pending').length
  const approvedCount = contentItems.filter(item => item.status === 'approved').length
  const rejectedCount = contentItems.filter(item => item.status === 'rejected').length
  const flaggedCount = contentItems.filter(item => item.status === 'flagged').length

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-blue-500" />
          <h2 className="text-xl font-semibold">AI Content Moderation</h2>
        </div>
        
        {pendingCount > 0 && (
          <Button onClick={moderateAllPending} className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Moderate All ({pendingCount})</span>
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Pending</span>
            </div>
            <p className="text-2xl font-bold text-gray-600">{pendingCount}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Approved</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Rejected</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Flagged</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{flaggedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedCount})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedCount})</TabsTrigger>
          <TabsTrigger value="flagged">Flagged ({flaggedCount})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {filteredItems.map((item) => {
                const isModerating = moderatingItems.has(item.id)
                const result = moderationResults.get(item.id)
                
                return (
                  <Card key={item.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {item.type === 'text' && <FileText className="h-4 w-4" />}
                          {item.type === 'image' && <Image className="h-4 w-4" />}
                          {item.type === 'video' && <Video className="h-4 w-4" />}
                          
                          <div>
                            <p className="font-medium">{item.author.displayName}</p>
                            <p className="text-sm text-muted-foreground">
                              @{item.author.username} • {new Date(item.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(item.status)}
                          {item.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => moderateContent(item)}
                              disabled={isModerating}
                            >
                              {isModerating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Shield className="h-4 w-4" />
                              )}
                              {isModerating ? 'Moderating...' : 'Moderate'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Content Preview */}
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <p className="text-sm">{item.content}</p>
                        {item.mediaUrl && (
                          <div className="mt-2">
                            <img 
                              src={item.mediaUrl} 
                              alt="Content media" 
                              className="max-w-xs rounded"
                            />
                          </div>
                        )}
                      </div>

                      {/* Moderation Result */}
                      {result && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Moderation Result</span>
                            <Badge variant={result.isApproved ? 'default' : 'destructive'}>
                              {result.isApproved ? 'Approved' : 'Rejected'}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Confidence</span>
                              <span>{result.confidence}%</span>
                            </div>
                            <Progress value={result.confidence} className="h-2" />
                          </div>

                          {/* Violations */}
                          {result.violations.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Violations Detected:</p>
                              <div className="space-y-1">
                                {result.violations.map((violation, index) => (
                                  <Alert key={index} className="py-2">
                                    <AlertDescription className="flex items-center space-x-2">
                                      <span>{getViolationIcon(violation.type)}</span>
                                      <Badge variant={getSeverityColor(violation.severity)}>
                                        {violation.severity}
                                      </Badge>
                                      <span className="text-sm">{violation.reason}</span>
                                      <span className="text-xs text-muted-foreground">
                                        ({violation.confidence}% confidence)
                                      </span>
                                    </AlertDescription>
                                  </Alert>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Suggestions */}
                          {result.suggestions.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Suggestions:</p>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {result.suggestions.map((suggestion, index) => (
                                  <li key={index} className="flex items-start space-x-2">
                                    <span>•</span>
                                    <span>{suggestion}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}

              {filteredItems.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No {activeTab} content found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Quick Moderation Component
export function QuickModeration({ 
  content, 
  onResult 
}: { 
  content: string
  onResult: (result: ModerationResult) => void 
}) {
  const [moderating, setModerating] = useState(false)
  const [result, setResult] = useState<ModerationResult | null>(null)

  const moderate = async () => {
    setModerating(true)
    try {
      const moderationResult = await aiService.moderateContent({ text: content })
      setResult(moderationResult)
      onResult(moderationResult)
    } catch (error) {
      console.error('Moderation failed:', error)
    } finally {
      setModerating(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>Quick Moderation</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
          <p className="text-sm">{content}</p>
        </div>
        
        <Button 
          onClick={moderate} 
          disabled={moderating}
          className="w-full"
        >
          {moderating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Moderating...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Moderate Content
            </>
          )}
        </Button>

        {result && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Result</span>
              <Badge variant={result.isApproved ? 'default' : 'destructive'}>
                {result.isApproved ? 'Approved' : 'Rejected'}
              </Badge>
            </div>
            <Progress value={result.confidence} className="h-2" />
            {result.violations.length > 0 && (
              <p className="text-sm text-red-600">
                {result.violations.length} violation(s) detected
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

