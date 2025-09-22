import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get authentication token
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7d'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Calculate date range
    const now = new Date()
    let start: Date
    let end: Date = now

    switch (period) {
      case '1d':
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        start = startDate ? new Date(startDate) : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        end = endDate ? new Date(endDate) : now
    }

    // Get user analytics
    const { data: userAnalytics } = await supabase
      .from('profiles')
      .select('created_at, role, is_verified')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())

    // Get post analytics
    const { data: postAnalytics } = await supabase
      .from('posts')
      .select('created_at, privacy, is_paid')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())

    // Get revenue analytics
    const { data: revenueAnalytics } = await supabase
      .from('transactions')
      .select('amount, created_at, status')
      .eq('status', 'completed')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())

    // Process analytics data
    const analytics = {
      users: {
        total: userAnalytics?.length || 0,
        creators: userAnalytics?.filter(u => u.role === 'creator').length || 0,
        verified: userAnalytics?.filter(u => u.is_verified).length || 0,
        growth: calculateGrowthRate(userAnalytics || [])
      },
      posts: {
        total: postAnalytics?.length || 0,
        public: postAnalytics?.filter(p => p.privacy === 'public').length || 0,
        paid: postAnalytics?.filter(p => p.is_paid).length || 0,
        growth: calculateGrowthRate(postAnalytics || [])
      },
      revenue: {
        total: revenueAnalytics?.reduce((sum, t) => sum + t.amount, 0) || 0,
        transactions: revenueAnalytics?.length || 0,
        averageTransaction: revenueAnalytics?.length ? 
          revenueAnalytics.reduce((sum, t) => sum + t.amount, 0) / revenueAnalytics.length : 0,
        growth: calculateGrowthRate(revenueAnalytics || [])
      },
      engagement: {
        totalLikes: 0, // Would need likes table
        totalComments: 0, // Would need comments table
        totalShares: 0, // Would need shares table
        averageEngagement: 0
      }
    }

    return NextResponse.json({
      success: true,
      analytics,
      period,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString()
      }
    })
  } catch (error) {
    console.error('Get analytics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function calculateGrowthRate(data: any[]): number {
  if (data.length < 2) return 0
  
  const sortedData = data.sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
  
  const firstHalf = sortedData.slice(0, Math.floor(sortedData.length / 2))
  const secondHalf = sortedData.slice(Math.floor(sortedData.length / 2))
  
  const firstHalfCount = firstHalf.length
  const secondHalfCount = secondHalf.length
  
  if (firstHalfCount === 0) return 0
  
  return ((secondHalfCount - firstHalfCount) / firstHalfCount) * 100
}
