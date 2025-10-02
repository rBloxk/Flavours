import { NextRequest, NextResponse } from 'next/server'
import { localDatabase } from '../../../../lib/local-database'

export async function GET(request: NextRequest) {
  try {
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

    // Get data from local database
    const profiles = await localDatabase.getProfiles(1000, 0)
    const posts = await localDatabase.getPosts(1000, 0)
    const stats = await localDatabase.getStats()

    // Filter data by date range
    const userAnalytics = profiles.filter(p => {
      const createdDate = new Date(p.created_at)
      return createdDate >= start && createdDate <= end
    })

    const postAnalytics = posts.filter(p => {
      const createdDate = new Date(p.created_at)
      return createdDate >= start && createdDate <= end
    })

    // Process analytics data
    const analytics = {
      users: {
        total: userAnalytics.length,
        creators: userAnalytics.filter(u => u.is_creator).length,
        verified: userAnalytics.filter(u => u.is_verified).length,
        growth: calculateGrowthRate(userAnalytics)
      },
      posts: {
        total: postAnalytics.length,
        public: postAnalytics.filter(p => p.privacy === 'public').length,
        paid: postAnalytics.filter(p => p.is_paid).length,
        growth: calculateGrowthRate(postAnalytics)
      },
      revenue: {
        total: profiles.reduce((sum, p) => sum + (p.total_earnings || 0), 0),
        transactions: Math.floor(profiles.length * 0.3), // Mock transaction count
        averageTransaction: profiles.length > 0 ? 
          profiles.reduce((sum, p) => sum + (p.total_earnings || 0), 0) / profiles.length : 0,
        growth: 15.5 // Mock growth rate
      },
      engagement: {
        totalLikes: stats.totalLikes,
        totalComments: stats.totalComments,
        totalShares: 0, // Mock data
        averageEngagement: 8.5 // Mock data
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

