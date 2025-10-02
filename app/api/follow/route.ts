import { NextRequest, NextResponse } from 'next/server'
import { localDatabase } from '@/lib/local-database'
import { z } from 'zod'

const followSchema = z.object({
  followingId: z.string().min(1, 'Following ID is required'),
  followerId: z.string().min(1, 'Follower ID is required')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { followingId, followerId } = followSchema.parse(body)

    // Toggle follow status
    const result = await localDatabase.toggleFollow(followerId, followingId)

    // Get updated profile data
    const profile = await localDatabase.getProfileById(followingId)
    const isFollowing = await localDatabase.isFollowing(followerId, followingId)

    return NextResponse.json({
      success: true,
      isFollowing: result.isFollowing,
      profile: profile ? {
        ...profile,
        isFollowing
      } : null
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Follow toggle error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type') // 'followers' or 'following'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!userId || !type) {
      return NextResponse.json(
        { error: 'User ID and type are required' },
        { status: 400 }
      )
    }

    let profiles = []
    if (type === 'followers') {
      profiles = await localDatabase.getFollowers(userId, limit, offset)
    } else if (type === 'following') {
      profiles = await localDatabase.getFollowing(userId, limit, offset)
    } else {
      return NextResponse.json(
        { error: 'Type must be "followers" or "following"' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      profiles,
      type,
      pagination: {
        limit,
        offset,
        count: profiles.length
      }
    })
  } catch (error) {
    console.error('Get follows error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
