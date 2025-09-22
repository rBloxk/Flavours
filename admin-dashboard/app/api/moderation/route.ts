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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    const offset = (page - 1) * limit

    // Build query for moderation queue
    let query = supabase
      .from('moderation_queue')
      .select(`
        *,
        posts:post_id (
          id,
          content,
          media_url,
          creator:user_id (
            username,
            display_name,
            avatar_url
          )
        ),
        reports:report_id (
          id,
          reason,
          description,
          reporter:user_id (
            username,
            display_name
          )
        )
      `)

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (type && type !== 'all') {
      query = query.eq('type', type)
    }

    // Apply pagination and sorting
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: moderationItems, error } = await query

    if (error) {
      throw error
    }

    // Get total count
    let countQuery = supabase
      .from('moderation_queue')
      .select('*', { count: 'exact', head: true })

    if (status && status !== 'all') {
      countQuery = countQuery.eq('status', status)
    }

    if (type && type !== 'all') {
      countQuery = countQuery.eq('type', type)
    }

    const { count } = await countQuery

    // Calculate statistics
    const { data: allItems } = await supabase
      .from('moderation_queue')
      .select('status, type')

    const stats = {
      total: count || 0,
      pending: allItems?.filter(item => item.status === 'pending').length || 0,
      approved: allItems?.filter(item => item.status === 'approved').length || 0,
      rejected: allItems?.filter(item => item.status === 'rejected').length || 0,
      posts: allItems?.filter(item => item.type === 'post').length || 0,
      reports: allItems?.filter(item => item.type === 'report').length || 0,
      users: allItems?.filter(item => item.type === 'user').length || 0
    }

    return NextResponse.json({
      success: true,
      items: moderationItems,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      stats
    })
  } catch (error) {
    console.error('Get moderation queue error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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

    const { itemId, action, data } = await request.json()

    let updateData: any = {}
    let message = ''

    switch (action) {
      case 'approve':
        updateData.status = 'approved'
        updateData.reviewed_by = user.id
        updateData.reviewed_at = new Date().toISOString()
        updateData.review_notes = data.notes || ''
        message = 'Item approved successfully'
        break
      case 'reject':
        updateData.status = 'rejected'
        updateData.reviewed_by = user.id
        updateData.reviewed_at = new Date().toISOString()
        updateData.review_notes = data.notes || ''
        message = 'Item rejected successfully'
        break
      case 'escalate':
        updateData.status = 'escalated'
        updateData.escalated_by = user.id
        updateData.escalated_at = new Date().toISOString()
        updateData.escalation_reason = data.reason || ''
        message = 'Item escalated successfully'
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    const { error } = await supabase
      .from('moderation_queue')
      .update(updateData)
      .eq('id', itemId)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message,
      itemId,
      action,
      data
    })
  } catch (error) {
    console.error('Update moderation item error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
