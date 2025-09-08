import { NextRequest, NextResponse } from 'next/server'
import { MediaSecurityService, MediaURLProtection } from '@/lib/media-security'
import { headers } from 'next/headers'

const mediaSecurity = MediaSecurityService.getInstance()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mediaId = searchParams.get('id')
    const token = searchParams.get('token')
    const clientId = searchParams.get('clientId') || crypto.randomUUID()

    // Validate required parameters
    if (!mediaId || !token) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Validate access token
    if (!mediaSecurity.validateAccessToken(token, ['view'])) {
      return NextResponse.json(
        { error: 'Invalid or expired access token' },
        { status: 401 }
      )
    }

    // Validate request headers
    const headersList = await headers()
    if (!MediaURLProtection.validateRequestHeaders(headersList)) {
      return NextResponse.json(
        { error: 'Suspicious request detected' },
        { status: 403 }
      )
    }

    // Register stream
    if (!mediaSecurity.registerStream(token, clientId)) {
      return NextResponse.json(
        { error: 'Stream limit exceeded or invalid token' },
        { status: 429 }
      )
    }

    // In a real implementation, you would:
    // 1. Fetch the media file from secure storage (S3, etc.)
    // 2. Apply DRM encryption if enabled
    // 3. Stream the content with proper headers
    
    // For demo purposes, return a protected media response
    const mediaResponse = new NextResponse(
      // This would be the actual media stream
      new ReadableStream({
        start(controller) {
          // Simulate streaming media data
          const mediaData = Buffer.from('Protected media content')
          controller.enqueue(mediaData)
          controller.close()
        }
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'video/mp4', // or appropriate media type
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'Content-Disposition': 'inline', // Prevent download
          'X-Accel-Buffering': 'no', // Disable nginx buffering
          'X-Client-ID': clientId
        }
      }
    )

    // Set up cleanup when stream ends
    request.signal.addEventListener('abort', () => {
      mediaSecurity.unregisterStream(token, clientId)
    })

    return mediaResponse

  } catch (error) {
    console.error('Media streaming error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, contentId, permissions = ['view'] } = body

    if (!userId || !contentId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Generate access token
    const accessToken = mediaSecurity.generateAccessToken(
      userId,
      contentId,
      permissions
    )

    return NextResponse.json({
      success: true,
      accessToken: accessToken.token,
      expiresAt: accessToken.expiresAt,
      watermark: accessToken.watermark,
      protectedUrl: MediaURLProtection.generateProtectedURL(contentId, accessToken.token)
    })

  } catch (error) {
    console.error('Token generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
