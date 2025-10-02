import { NextRequest, NextResponse } from 'next/server'
import { localDatabase } from '@/lib/local-database'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'

const commentSchema = z.object({
  postId: z.string().min(1, 'Post ID is required'),
  content: z.string().min(1, 'Comment cannot be empty').max(500, 'Comment too long'),
  parentCommentId: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { postId, content, parentCommentId } = commentSchema.parse(body)

    // For demo purposes, use demo user
    const userId = 'demo-user-1759370026017'

    // Create comment in local database
    const comment = await localDatabase.createComment({
      post_id: postId,
      user_id: userId,
      content,
      parent_comment_id: parentCommentId || null
    })

    // Get user profile for response
    const profile = await localDatabase.getProfileById(userId)

    return NextResponse.json({
      success: true,
      comment: {
        ...comment,
        profiles: {
          username: profile?.username || 'demo_user',
          display_name: profile?.display_name || 'Demo User',
          avatar_url: profile?.avatar_url || 'https://ui-avatars.com/api/?name=Demo+User&background=random',
          is_verified: profile?.is_verified || false
        }
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Comment creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      )
    }

    const offset = (page - 1) * limit

    // Get comments from local database
    const comments = await localDatabase.getComments(postId, limit, offset)

    // Get total count
    const total = await localDatabase.getCommentCount(postId)

    return NextResponse.json({
      success: true,
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get comments error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
