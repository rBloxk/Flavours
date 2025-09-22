'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAPI } from '@/lib/api-client'
import { 
  BookOpen, 
  Code, 
  Play, 
  Copy, 
  Download,
  Globe,
  Database,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface APIDocumentationProps {
  className?: string
}

export function APIDocumentation({ className }: APIDocumentationProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedEndpoint, setSelectedEndpoint] = useState('')
  const [testQuery, setTestQuery] = useState('')
  const [testVariables, setTestVariables] = useState('')
  const [testResult, setTestResult] = useState<any>(null)
  const [testLoading, setTestLoading] = useState(false)
  const [testError, setTestError] = useState<string | null>(null)

  const { query, mutate, loading, error } = useAPI()

  const endpoints = [
    {
      method: 'GET',
      path: '/content/feed',
      description: 'Get user feed',
      category: 'Content',
      parameters: [
        { name: 'page', type: 'number', required: false, description: 'Page number' },
        { name: 'limit', type: 'number', required: false, description: 'Items per page' }
      ],
      example: {
        request: 'GET /api/v1/content/feed?page=1&limit=20',
        response: {
          posts: [
            {
              id: '1',
              content: 'Hello world!',
              creator: { username: 'john_doe', displayName: 'John Doe' },
              createdAt: '2024-01-01T00:00:00Z'
            }
          ],
          hasMore: true
        }
      }
    },
    {
      method: 'POST',
      path: '/content',
      description: 'Create new content',
      category: 'Content',
      parameters: [
        { name: 'content', type: 'string', required: true, description: 'Content text' },
        { name: 'mediaUrl', type: 'string', required: false, description: 'Media URL' }
      ],
      example: {
        request: 'POST /api/v1/content\nContent-Type: application/json\n\n{ "content": "Hello world!" }',
        response: {
          id: '1',
          content: 'Hello world!',
          createdAt: '2024-01-01T00:00:00Z'
        }
      }
    },
    {
      method: 'GET',
      path: '/users/profile',
      description: 'Get user profile',
      category: 'Users',
      parameters: [],
      example: {
        request: 'GET /api/v1/users/profile',
        response: {
          id: '1',
          username: 'john_doe',
          displayName: 'John Doe',
          email: 'john@example.com',
          avatarUrl: 'https://example.com/avatar.jpg'
        }
      }
    }
  ]

  const graphqlQueries = [
    {
      name: 'Get User',
      description: 'Fetch user information with posts',
      query: `query GetUser($id: ID!) {
  user(id: $id) {
    id
    username
    displayName
    avatarUrl
    posts {
      id
      content
      createdAt
    }
  }
}`,
      variables: { id: '1' }
    },
    {
      name: 'Create Post',
      description: 'Create a new post',
      query: `mutation CreatePost($input: PostInput!) {
  createPost(input: $input) {
    id
    content
    createdAt
  }
}`,
      variables: { input: { content: 'Hello world!' } }
    }
  ]

  const handleTestQuery = async () => {
    if (!testQuery.trim()) return

    setTestLoading(true)
    setTestError(null)
    setTestResult(null)

    try {
      let variables = {}
      if (testVariables.trim()) {
        variables = JSON.parse(testVariables)
      }

      const result = await query(testQuery, variables)
      setTestResult(result)
    } catch (err: any) {
      setTestError(err.message)
    } finally {
      setTestLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'POST': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'PUT': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">API Documentation</h1>
          <p className="text-muted-foreground">
            Complete guide to the Flavours API
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download Docs
          </Button>
          <Button variant="outline" size="sm">
            <Copy className="h-4 w-4 mr-2" />
            Copy Base URL
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rest">REST API</TabsTrigger>
          <TabsTrigger value="graphql">GraphQL</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* API Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Base URL</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <code className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded block">
                  https://api.flavours.club/api/v1
                </code>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Authentication</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Bearer token authentication
                </p>
                <code className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded block">
                  Authorization: Bearer {'<token>'}
                </code>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Rate Limits</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Per User:</span>
                    <span className="font-medium">1000/hour</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Per IP:</span>
                    <span className="font-medium">100/minute</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Start */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Start</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">1. Get your API token</h4>
                <p className="text-sm text-muted-foreground">
                  Visit your profile settings to generate an API token.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">2. Make your first request</h4>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <pre className="text-sm">
{`curl -H "Authorization: Bearer YOUR_TOKEN" \\
     https://api.flavours.club/api/v1/users/profile`}
                  </pre>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">3. Explore the API</h4>
                <p className="text-sm text-muted-foreground">
                  Use the testing tab to try out different endpoints and GraphQL queries.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rest" className="space-y-6">
          {/* REST Endpoints */}
          <div className="space-y-4">
            {endpoints.map((endpoint, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge className={getMethodColor(endpoint.method)}>
                        {endpoint.method}
                      </Badge>
                      <code className="text-sm">{endpoint.path}</code>
                    </div>
                    <Badge variant="outline">{endpoint.category}</Badge>
                  </div>
                  <CardTitle className="text-lg">{endpoint.description}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Parameters */}
                  {endpoint.parameters.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Parameters</h4>
                      <div className="space-y-2">
                        {endpoint.parameters.map((param, paramIndex) => (
                          <div key={paramIndex} className="flex items-center space-x-4 text-sm">
                            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                              {param.name}
                            </code>
                            <Badge variant={param.required ? 'destructive' : 'outline'}>
                              {param.type}
                            </Badge>
                            <span className="text-muted-foreground">{param.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Example */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Example</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(endpoint.example.request)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                      <pre className="text-sm whitespace-pre-wrap">
                        {endpoint.example.request}
                      </pre>
                    </div>
                  </div>

                  {/* Response */}
                  <div>
                    <h4 className="font-medium mb-2">Response</h4>
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                      <pre className="text-sm">
                        {JSON.stringify(endpoint.example.response, null, 2)}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="graphql" className="space-y-6">
          {/* GraphQL Queries */}
          <div className="space-y-4">
            {graphqlQueries.map((query, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{query.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{query.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Query</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(query.query)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                      <pre className="text-sm">{query.query}</pre>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Variables</h4>
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                      <pre className="text-sm">
                        {JSON.stringify(query.variables, null, 2)}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          {/* GraphQL Testing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Play className="h-5 w-5" />
                <span>GraphQL Playground</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Query</label>
                <Textarea
                  value={testQuery}
                  onChange={(e) => setTestQuery(e.target.value)}
                  placeholder="Enter your GraphQL query here..."
                  className="min-h-32 font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Variables (JSON)</label>
                <Textarea
                  value={testVariables}
                  onChange={(e) => setTestVariables(e.target.value)}
                  placeholder='{"id": "1"}'
                  className="min-h-20 font-mono"
                />
              </div>

              <Button onClick={handleTestQuery} disabled={testLoading || !testQuery.trim()}>
                {testLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run Query
                  </>
                )}
              </Button>

              {/* Results */}
              {testResult && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Result</span>
                  </h4>
                  <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                    <pre className="text-sm">
                      {JSON.stringify(testResult, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {testError && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center space-x-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span>Error</span>
                  </h4>
                  <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
                    <pre className="text-sm text-red-600 dark:text-red-400">
                      {testError}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
          <div className="text-center py-8 text-muted-foreground">
            <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Code examples and SDKs would be displayed here</p>
            <p className="text-sm">Including JavaScript, Python, and other language examples</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// API Status Component
export function APIStatus() {
  const [status, setStatus] = React.useState<'healthy' | 'unhealthy' | 'degraded' | 'checking'>('checking')
  const { healthCheck } = useAPI()

  React.useEffect(() => {
    const checkHealth = async () => {
      try {
        const result = await healthCheck()
        setStatus(result.status)
      } catch {
        setStatus('unhealthy')
      }
    }

    checkHealth()
    const interval = setInterval(checkHealth, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = () => {
    switch (status) {
      case 'healthy': return 'text-green-500'
      case 'degraded': return 'text-yellow-500'
      case 'unhealthy': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />
      case 'degraded': return <AlertTriangle className="h-4 w-4" />
      case 'unhealthy': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4 animate-spin" />
    }
  }

  return (
    <div className="flex items-center space-x-2">
      {getStatusIcon()}
      <span className={cn("text-sm font-medium", getStatusColor())}>
        API {status === 'checking' ? 'Checking...' : status}
      </span>
    </div>
  )
}

