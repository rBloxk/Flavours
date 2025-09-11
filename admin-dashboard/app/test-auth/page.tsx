'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AdminLayout } from '@/components/admin-layout'
import { AuthGuard } from '@/components/auth-guard'
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react'

export default function TestAuthPage() {
  const { user, loading, logout } = useAuth()
  const [authStatus, setAuthStatus] = useState<string>('Checking...')

  useEffect(() => {
    if (loading) {
      setAuthStatus('Loading...')
    } else if (user) {
      setAuthStatus('Authenticated')
    } else {
      setAuthStatus('Not authenticated')
    }
  }, [user, loading])

  const handleLogout = async () => {
    await logout()
    setAuthStatus('Logged out')
  }

  return (
    <AuthGuard requiredRole="viewer">
      <AdminLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Authentication Test</h1>
          <p className="text-muted-foreground">Test the authentication system</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Authentication Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge variant={authStatus === 'Authenticated' ? 'default' : 'destructive'}>
                    {authStatus}
                  </Badge>
                </div>
                
                {user && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Name:</span>
                      <span className="text-sm">{user.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Email:</span>
                      <span className="text-sm">{user.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Role:</span>
                      <Badge variant="outline">{user.role}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">User ID:</span>
                      <span className="text-sm font-mono text-xs">{user.id}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <RefreshCw className="h-5 w-5" />
                <span>Test Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={handleLogout} variant="destructive" className="w-full">
                  Logout
                </Button>
                
                <div className="text-sm text-muted-foreground">
                  <p><strong>Demo Credentials:</strong></p>
                  <ul className="mt-2 space-y-1">
                    <li>• admin@flavours.com / admin123 (Admin)</li>
                    <li>• mod@flavours.com / mod123 (Moderator)</li>
                    <li>• viewer@flavours.com / viewer123 (Viewer)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Authentication Flow Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">How to test:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Go to the login page</li>
                  <li>Click on any demo credential to auto-fill the form</li>
                  <li>Click "Sign In" to authenticate</li>
                  <li>You should be redirected to the dashboard</li>
                  <li>Check this page to see your authentication status</li>
                  <li>Test different roles (admin, moderator, viewer)</li>
                </ol>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <h3 className="font-medium mb-2 text-green-800 dark:text-green-200">✅ Working Features:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-green-700 dark:text-green-300">
                  <li>Mock authentication system</li>
                  <li>Role-based access control</li>
                  <li>JWT token simulation</li>
                  <li>Session persistence</li>
                  <li>Auto-logout on token expiry</li>
                  <li>Click-to-fill demo credentials</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    </AuthGuard>
  )
}
