import { NextRequest, NextResponse } from 'next/server'
import { localDatabase } from '@/lib/local-database'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = params.id
    const { userId = 'demo-user-1759370026017' } = await request.json()
    
    // Toggle comment like
    const result = await localDatabase.toggleCommentLike(userId, commentId)
    
    return NextResponse.json({
      success: true,
      liked: result.liked,
      likesCount: result.likesCount
    })
    
  } catch (error) {
    console.error('Error handling comment like:', error)
    return NextResponse.json(
      { error: 'Failed to process comment like' },
      { status: 500 }
    )
  }
}
