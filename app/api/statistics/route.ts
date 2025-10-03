import { NextRequest, NextResponse } from 'next/server'
import { localDatabase } from '@/lib/local-database'
import { z } from 'zod'

const statisticsQuerySchema = z.object({
  userId: z.string().optional().nullable(),
  timeRange: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
  metric: z.enum(['views', 'likes', 'comments', 'followers', 'engagement']).optional().nullable(),
  type: z.enum(['overview', 'trends', 'content', 'audience']).default('overview')
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = statisticsQuerySchema.parse({
      userId: searchParams.get('userId'),
      timeRange: searchParams.get('timeRange') || '30d',
      metric: searchParams.get('metric'),
      type: searchParams.get('type') || 'overview'
    })

    // Use demo user for now
    const userId = query.userId || 'demo-user-1759370026017'
    console.log('Getting stats for user:', userId)
    
    const stats = await localDatabase.getUserStatistics(userId, {
      timeRange: query.timeRange,
      metric: query.metric,
      type: query.type
    })
    console.log('Stats result:', stats)

    return NextResponse.json({
      success: true,
      statistics: stats,
      timeRange: query.timeRange,
      type: query.type
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Get statistics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
