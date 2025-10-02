import { NextRequest, NextResponse } from 'next/server'
import { localDatabase } from '@/lib/local-database'
import { z } from 'zod'

const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  type: z.enum(['users', 'posts', 'all']).default('all'),
  limit: z.number().min(1).max(50).default(20),
  offset: z.number().min(0).default(0)
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') || 'all'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    const results: any = {
      query,
      type,
      pagination: {
        limit,
        offset
      }
    }

    if (type === 'users' || type === 'all') {
      const users = await localDatabase.searchUsers(query, limit, offset)
      results.users = users
      results.userCount = users.length
    }

    if (type === 'posts' || type === 'all') {
      const posts = await localDatabase.searchPosts(query, limit, offset)
      results.posts = posts
      results.postCount = posts.length
    }

    return NextResponse.json({
      success: true,
      ...results
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
