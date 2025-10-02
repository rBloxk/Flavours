import { NextRequest, NextResponse } from 'next/server'
import { localDatabase } from '@/lib/local-database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    const limit = parseInt(searchParams.get('limit') || '10')

    const results: any = {}

    if (type === 'creators' || type === 'all') {
      const creators = await localDatabase.getTrendingCreators(limit)
      results.creators = creators
    }

    if (type === 'posts' || type === 'all') {
      const posts = await localDatabase.getTrendingPosts(limit)
      results.posts = posts
    }

    return NextResponse.json({
      success: true,
      ...results
    })
  } catch (error) {
    console.error('Trending error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
