import { NextRequest, NextResponse } from 'next/server'
import { localDatabase } from '@/lib/local-database'
import { z } from 'zod'
import { createErrorResponse, validate, AuthenticationError, ValidationError } from '@/lib/error-handler'
import { createRateLimitMiddleware, RATE_LIMITS, getRateLimitHeaders } from '@/lib/rate-limiter'

const notificationSchema = z.object({
  type: z.enum(['like', 'comment', 'follow', 'mention', 'system']),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  user_id: z.string().uuid('Invalid user ID'),
  related_id: z.string().optional(),
  related_type: z.enum(['post', 'comment', 'user']).optional(),
  metadata: z.record(z.any()).optional()
})

export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimit = createRateLimitMiddleware(RATE_LIMITS.GENERAL)
  const rateLimitResult = rateLimit(request)
  
  if (!rateLimitResult.allowed) {
    const response = NextResponse.json(
      { error: 'Rate limit exceeded', code: 'RATE_LIMIT_ERROR' },
      { status: 429 }
    )
    Object.entries(getRateLimitHeaders(rateLimitResult.remaining, rateLimitResult.resetTime))
      .forEach(([key, value]) => response.headers.set(key, value))
    return response
  }

  const { searchParams } = new URL(request.url)
  const userId = validate.required(searchParams.get('userId'), 'User ID')
  const unreadOnly = searchParams.get('unreadOnly') === 'true'
  const limit = validate.number(searchParams.get('limit') || '20', 'Limit', 1, 100)
  const offset = validate.number(searchParams.get('offset') || '0', 'Offset', 0)

  // Get user to verify they exist
  const user = await localDatabase.auth.getUser()
  if (!user) {
    throw new AuthenticationError()
  }

  const notifications = await localDatabase.getNotifications(userId, {
    unreadOnly,
    limit,
    offset
  })

  const unreadCount = await localDatabase.getUnreadNotificationCount(userId)

  const response = NextResponse.json({
    success: true,
    notifications,
    unreadCount,
    pagination: {
      limit,
      offset,
      total: notifications.length
    }
  })

  // Add rate limit headers
  Object.entries(getRateLimitHeaders(rateLimitResult.remaining, rateLimitResult.resetTime))
    .forEach(([key, value]) => response.headers.set(key, value))

  return response
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = notificationSchema.parse(body)

    // Get user to verify they exist
    const user = await localDatabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const notification = await localDatabase.createNotification(validatedData)

    return NextResponse.json({
      success: true,
      notification
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create notification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, notificationIds } = body

    if (!action || !['mark_read', 'mark_all_read'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be mark_read or mark_all_read' },
        { status: 400 }
      )
    }

    // Get user to verify they exist
    const user = await localDatabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (action === 'mark_read' && notificationIds) {
      await localDatabase.markNotificationsAsRead(notificationIds)
    } else if (action === 'mark_all_read') {
      await localDatabase.markAllNotificationsAsRead(user.id)
    }

    return NextResponse.json({
      success: true,
      message: 'Notifications updated successfully'
    })
  } catch (error) {
    console.error('Update notifications error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
