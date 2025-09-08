"use client"

import React, { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import { MediaSecurityService, ClientMediaProtection } from '@/lib/media-security'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Shield, AlertTriangle, Lock } from 'lucide-react'

interface ProtectedMediaPlayerProps {
  mediaId: string
  mediaType: 'video' | 'image' | 'audio'
  src?: string
  isPaid?: boolean
  price?: number
  onAccessGranted?: () => void
  onAccessDenied?: () => void
  className?: string
}

export function ProtectedMediaPlayer({
  mediaId,
  mediaType,
  src,
  isPaid = false,
  price = 0,
  onAccessGranted,
  onAccessDenied,
  className = ''
}: ProtectedMediaPlayerProps) {
  const { user } = useAuth()
  const mediaRef = useRef<HTMLVideoElement | HTMLImageElement | HTMLAudioElement>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [watermark, setWatermark] = useState<string | null>(null)
  const [clientId] = useState(() => crypto.randomUUID())

  const mediaSecurity = MediaSecurityService.getInstance()

  useEffect(() => {
    if (isUnlocked && mediaRef.current) {
      // Apply client-side protection
      ClientMediaProtection.applyFullProtection(
        mediaRef.current as HTMLElement,
        watermark || undefined
      )
    }
  }, [isUnlocked, watermark])

  const requestAccess = async () => {
    if (!user) {
      setError('Authentication required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/media/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          contentId: mediaId,
          permissions: ['view']
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get access')
      }

      setAccessToken(data.accessToken)
      setWatermark(data.watermark)
      setIsUnlocked(true)
      onAccessGranted?.()

    } catch (err: any) {
      setError(err.message)
      onAccessDenied?.()
    } finally {
      setIsLoading(false)
    }
  }

  const renderMediaElement = () => {
    if (!isUnlocked || !accessToken) {
      return (
        <div className="relative w-full h-full bg-black flex items-center justify-center">
          <div className="text-center text-white space-y-4">
            <Lock className="h-16 w-16 mx-auto opacity-50" />
            <div>
              <h3 className="text-xl font-semibold mb-2">
                {isPaid ? 'Premium Content' : 'Protected Content'}
              </h3>
              {isPaid && (
                <p className="text-lg mb-4">
                  Unlock for ${price.toFixed(2)}
                </p>
              )}
              <Button
                onClick={requestAccess}
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Unlocking...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    {isPaid ? 'Purchase & View' : 'View Content'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )
    }

    const protectedSrc = `/api/media/stream?id=${mediaId}&token=${accessToken}&clientId=${clientId}`

    switch (mediaType) {
      case 'video':
        return (
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            src={protectedSrc}
            controls
            className="w-full h-full"
            onLoadStart={() => {
              // Register stream when video starts loading
              if (accessToken) {
                mediaSecurity.registerStream(accessToken, clientId)
              }
            }}
            onEnded={() => {
              // Unregister stream when video ends
              if (accessToken) {
                mediaSecurity.unregisterStream(accessToken, clientId)
              }
            }}
            onError={() => {
              setError('Failed to load media')
              if (accessToken) {
                mediaSecurity.unregisterStream(accessToken, clientId)
              }
            }}
          />
        )

      case 'image':
        return (
          <img
            ref={mediaRef as React.RefObject<HTMLImageElement>}
            src={protectedSrc}
            alt="Protected content"
            className="w-full h-full object-cover"
            onLoad={() => {
              // Register view when image loads
              if (accessToken) {
                mediaSecurity.registerStream(accessToken, clientId)
              }
            }}
            onError={() => {
              setError('Failed to load image')
            }}
          />
        )

      case 'audio':
        return (
          <audio
            ref={mediaRef as React.RefObject<HTMLAudioElement>}
            src={protectedSrc}
            controls
            className="w-full"
            onLoadStart={() => {
              if (accessToken) {
                mediaSecurity.registerStream(accessToken, clientId)
              }
            }}
            onEnded={() => {
              if (accessToken) {
                mediaSecurity.unregisterStream(accessToken, clientId)
              }
            }}
            onError={() => {
              setError('Failed to load audio')
              if (accessToken) {
                mediaSecurity.unregisterStream(accessToken, clientId)
              }
            }}
          />
        )

      default:
        return <div>Unsupported media type</div>
    }
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-0">
        {error && (
          <Alert className="m-4" variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="relative">
          {renderMediaElement()}
          
          {/* Security overlay */}
          {isUnlocked && (
            <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
              <Shield className="h-3 w-3 inline mr-1" />
              Protected
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Hook for media security
export function useMediaSecurity() {
  const [securityStats, setSecurityStats] = useState<any>(null)

  useEffect(() => {
    const mediaSecurity = MediaSecurityService.getInstance()
    setSecurityStats(mediaSecurity.getSecurityStats())

    // Update stats periodically
    const interval = setInterval(() => {
      setSecurityStats(mediaSecurity.getSecurityStats())
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return { securityStats }
}
