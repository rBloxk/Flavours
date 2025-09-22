'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, XCircle, Lock } from 'lucide-react'
import { toast } from 'sonner'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isResetting, setIsResetting] = useState(false)
  const [resetStatus, setResetStatus] = useState<'pending' | 'success' | 'error'>('pending')
  const [errorMessage, setErrorMessage] = useState('')
  const [tokenValid, setTokenValid] = useState(false)
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setResetStatus('error')
      setErrorMessage('Invalid reset link')
    } else {
      setTokenValid(true)
    }
  }, [token])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    setIsResetting(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token, 
          newPassword: password 
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResetStatus('success')
        toast.success('Password reset successfully!')
        
        // Redirect to sign in after 3 seconds
        setTimeout(() => {
          router.push('/auth')
        }, 3000)
      } else {
        setResetStatus('error')
        setErrorMessage(data.error || 'Password reset failed')
        toast.error(data.error || 'Password reset failed')
      }
    } catch (error) {
      setResetStatus('error')
      setErrorMessage('Network error. Please try again.')
      toast.error('Network error. Please try again.')
    } finally {
      setIsResetting(false)
    }
  }

  const renderContent = () => {
    if (resetStatus === 'success') {
      return (
        <div className="text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-green-700">Password Reset!</h2>
          <p className="text-muted-foreground mb-4">
            Your password has been successfully reset. You can now sign in with your new password.
          </p>
          <p className="text-sm text-muted-foreground">
            Redirecting you to sign in...
          </p>
          <Button 
            onClick={() => router.push('/auth')} 
            className="mt-4"
          >
            Sign In
          </Button>
        </div>
      )
    }

    if (resetStatus === 'error') {
      return (
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-red-700">Reset Failed</h2>
          <Alert className="mb-4">
            <AlertDescription>
              {errorMessage || 'The reset link is invalid or has expired.'}
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => router.push('/auth')} 
            className="w-full"
          >
            Back to Sign In
          </Button>
        </div>
      )
    }

    // Show reset form
    return (
      <form onSubmit={handleResetPassword} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your new password"
            required
            minLength={8}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your new password"
            required
            minLength={8}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isResetting || !tokenValid}
        >
          {isResetting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Resetting Password...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Reset Password
            </>
          )}
        </Button>
      </form>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">🍃 Flavours</CardTitle>
          <CardDescription>
            Reset Your Password
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  )
}
