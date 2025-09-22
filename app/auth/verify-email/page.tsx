'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react'
import { toast } from 'sonner'

export default function VerifyEmailPage() {
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending')
  const [errorMessage, setErrorMessage] = useState('')
  const [isResending, setIsResending] = useState(false)
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  useEffect(() => {
    if (token) {
      verifyEmail(token)
    }
  }, [token])

  const verifyEmail = async (verificationToken: string) => {
    setIsVerifying(true)
    setVerificationStatus('pending')

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      })

      const data = await response.json()

      if (response.ok) {
        setVerificationStatus('success')
        toast.success('Email verified successfully! Welcome to Flavours!')
        
        // Redirect to feed after 3 seconds
        setTimeout(() => {
          router.push('/feed')
        }, 3000)
      } else {
        setVerificationStatus('error')
        setErrorMessage(data.error || 'Verification failed')
        toast.error(data.error || 'Verification failed')
      }
    } catch (error) {
      setVerificationStatus('error')
      setErrorMessage('Network error. Please try again.')
      toast.error('Network error. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  const resendVerification = async () => {
    setIsResending(true)
    
    try {
      // Get email from localStorage or prompt user
      const email = localStorage.getItem('pendingVerificationEmail')
      
      if (!email) {
        toast.error('Email not found. Please try signing up again.')
        return
      }

      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Verification email sent! Please check your inbox.')
      } else {
        toast.error(data.error || 'Failed to resend verification email')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  const renderContent = () => {
    if (isVerifying) {
      return (
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-semibold mb-2">Verifying your email...</h2>
          <p className="text-muted-foreground">Please wait while we verify your email address.</p>
        </div>
      )
    }

    if (verificationStatus === 'success') {
      return (
        <div className="text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-green-700">Email Verified!</h2>
          <p className="text-muted-foreground mb-4">
            Your email has been successfully verified. Welcome to Flavours!
          </p>
          <p className="text-sm text-muted-foreground">
            Redirecting you to the feed in a few seconds...
          </p>
          <Button 
            onClick={() => router.push('/feed')} 
            className="mt-4"
          >
            Go to Feed
          </Button>
        </div>
      )
    }

    if (verificationStatus === 'error') {
      return (
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-red-700">Verification Failed</h2>
          <Alert className="mb-4">
            <AlertDescription>
              {errorMessage || 'The verification link is invalid or has expired.'}
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <Button 
              onClick={resendVerification} 
              disabled={isResending}
              variant="outline"
              className="w-full"
            >
              {isResending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Resend Verification Email
                </>
              )}
            </Button>
            <Button 
              onClick={() => router.push('/auth')} 
              variant="ghost"
              className="w-full"
            >
              Back to Sign In
            </Button>
          </div>
        </div>
      )
    }

    // No token provided
    return (
      <div className="text-center">
        <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Email Verification Required</h2>
        <p className="text-muted-foreground mb-4">
          Please check your email and click the verification link to activate your account.
        </p>
        <Button 
          onClick={() => router.push('/auth')} 
          className="w-full"
        >
          Back to Sign In
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">🍃 Flavours</CardTitle>
          <CardDescription>
            Email Verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  )
}
