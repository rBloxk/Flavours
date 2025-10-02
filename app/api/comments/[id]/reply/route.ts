import { NextRequest, NextResponse } from 'next/server'
import { localDatabase } from '@/lib/local-database'
import { z } from 'zod'

const replySchema = z.object({
  content: z.string().min(1, 'Reply cannot be empty').max(500, 'Reply too long')
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = params.id
    const body = await request.json()
    const { content } = replySchema.parse(body)
    
    // For demo purposes, use demo user
    const userId = 'demo-user-1759370026017'
    
    // Get the parent comment to get the post_id
    const parentComment = await localDatabase.getCommentById(commentId)
    if (!parentComment) {
      return NextResponse.json(
        { error: 'Parent comment not found' },
        { status: 404 }
      )
    }
    
    // Create reply comment
    const reply = await localDatabase.createComment({
      post_id: parentComment.post_id,
      user_id: userId,
      content,
      parent_comment_id: commentId,
      likes_count: 0,
      replies_count: 0,
      is_edited: false
    })
    
    // Get user profile for response
    const profile = await localDatabase.getProfileById(userId)
    
    return NextResponse.json({
      success: true,
      reply: {
        ...reply,
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
    
    console.error('Reply creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
