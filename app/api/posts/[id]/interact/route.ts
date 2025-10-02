import { NextRequest, NextResponse } from 'next/server'
import { localDatabase } from '@/lib/local-database'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id
    const { action, userId = 'demo-user-1759370026017' } = await request.json()
    
    let result: any = {}
    
    switch (action) {
      case 'like':
        result = await localDatabase.toggleLike(userId, postId)
        break
        
      case 'bookmark':
        // For now, just return success for bookmarks
        result = { bookmarked: true, bookmarksCount: 1 }
        break
        
      case 'view':
        // For now, just return success for views
        result = { viewed: true, viewsCount: 1 }
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
    
    return NextResponse.json({
      success: true,
      action,
      ...result,
      userInteractions: {
        isLiked: action === 'like' ? result.liked : false,
        isBookmarked: action === 'bookmark' ? result.bookmarked : false,
        isViewed: action === 'view' ? result.viewed : false
      },
      counts: {
        likes: action === 'like' ? result.likesCount : 0,
        bookmarks: action === 'bookmark' ? result.bookmarksCount : 0,
        views: action === 'view' ? result.viewsCount : 0
      }
    })
    
  } catch (error) {
    console.error('Error handling post interaction:', error)
    return NextResponse.json(
      { error: 'Failed to process interaction' },
      { status: 500 }
    )
  }
}
