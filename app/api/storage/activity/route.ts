import { NextRequest, NextResponse } from 'next/server'
import { storageService } from '@/lib/storage-service'

/**
 * GET /api/storage/activity - Get user activity logs
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')
    const logType = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '100')

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    const activityLogs = await storageService.getActivityLogs(username, logType || undefined)
    
    // Apply limit
    const limitedLogs = activityLogs.slice(0, limit)

    return NextResponse.json({
      success: true,
      data: { 
        logs: limitedLogs,
        total: activityLogs.length,
        returned: limitedLogs.length
      }
    })
  } catch (error) {
    console.error('Activity retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve activity logs' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/storage/activity - Log user activity
 */
export async function POST(request: NextRequest) {
  try {
    const { username, type, details, metadata } = await request.json()

    if (!username || !type || !details) {
      return NextResponse.json(
        { error: 'Username, type, and details are required' },
        { status: 400 }
      )
    }

    // Validate activity type
    const validTypes = [
      'login', 'logout', 'content_upload', 'content_delete', 
      'like', 'comment', 'subscription', 'purchase', 'interaction'
    ]

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid activity type' },
        { status: 400 }
      )
    }

    await storageService.logActivity(username, type, details, metadata)

    return NextResponse.json({
      success: true,
      message: 'Activity logged successfully'
    })
  } catch (error) {
    console.error('Activity logging error:', error)
    return NextResponse.json(
      { error: 'Failed to log activity' },
      { status: 500 }
    )
  }
}

