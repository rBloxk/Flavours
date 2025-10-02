import { NextRequest, NextResponse } from 'next/server'
import { localDatabase } from '../../../../lib/local-database'

export async function GET(request: NextRequest) {
  try {
    // Get dashboard statistics from local database
    const stats = await localDatabase.getStats()
    
    // Get additional data
    const profiles = await localDatabase.getProfiles(100, 0)
    const posts = await localDatabase.getPosts(100, 0)
    
    // Calculate additional metrics
    const creators = profiles.filter(p => p.is_creator)
    const activeUsers = profiles.filter(p => p.status === 'active')
    const newUsersToday = profiles.filter(p => {
      const createdDate = new Date(p.created_at)
      const today = new Date()
      return createdDate.toDateString() === today.toDateString()
    })
    
    // Mock revenue data
    const totalRevenue = profiles.reduce((sum, p) => sum + (p.total_earnings || 0), 0)
    const monthlyRevenue = totalRevenue * 0.3 // Mock 30% of total as monthly

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: stats.totalUsers,
        totalCreators: stats.creators,
        totalPosts: stats.totalPosts,
        pendingModerations: 0, // Mock data
        pendingReports: 0, // Mock data
        newUsersToday: newUsersToday.length,
        newCreatorsToday: newUsersToday.filter(p => p.is_creator).length,
        activeUsers: activeUsers.length,
        totalRevenue,
        monthlyRevenue
      }
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
