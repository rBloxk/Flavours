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

    // Get dashboard statistics
    const [
      { count: totalUsers },
      { count: totalCreators },
      { count: totalPosts },
      { count: pendingModerations },
      { count: pendingReports },
      { count: newUsersToday },
      { count: newCreatorsToday },
      { count: activeUsers }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'creator'),
      supabase.from('posts').select('*', { count: 'exact', head: true }),
      supabase.from('moderation_queue').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'creator').gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('last_active', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    ])

    // Get revenue data
    const { data: revenueData } = await supabase
      .from('transactions')
      .select('amount, created_at')
      .eq('status', 'completed')

    const totalRevenue = revenueData?.reduce((sum, transaction) => sum + transaction.amount, 0) || 0

    const monthlyRevenue = revenueData
      ?.filter(transaction => {
        const transactionDate = new Date(transaction.created_at)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        return transactionDate >= thirtyDaysAgo
      })
      .reduce((sum, transaction) => sum + transaction.amount, 0) || 0

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: totalUsers || 0,
        totalCreators: totalCreators || 0,
        totalPosts: totalPosts || 0,
        pendingModerations: pendingModerations || 0,
        pendingReports: pendingReports || 0,
        newUsersToday: newUsersToday || 0,
        newCreatorsToday: newCreatorsToday || 0,
        activeUsers: activeUsers || 0,
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
