import { NextRequest, NextResponse } from 'next/server'
import { localDatabase } from '@/lib/local-database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
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

    const unreadCount = await localDatabase.getUnreadNotificationCount(userId)

    return NextResponse.json({
      success: true,
      unreadCount
    })
  } catch (error) {
    console.error('Get unread count error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
