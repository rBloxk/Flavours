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
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const verified = searchParams.get('verified')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('profiles')
      .select(`
        *,
        posts:user_id (count),
        followers:user_id (count),
        earnings:user_id (sum:amount)
      `)
      .eq('role', 'creator')

    // Apply filters
    if (search) {
      query = query.or(`username.ilike.%${search}%,display_name.ilike.%${search}%`)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (verified && verified !== 'all') {
      query = query.eq('is_verified', verified === 'true')
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: creators, error } = await query

    if (error) {
      throw error
    }

    // Get total count
    let countQuery = supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'creator')

    if (search) {
      countQuery = countQuery.or(`username.ilike.%${search}%,display_name.ilike.%${search}%`)
    }

    if (status && status !== 'all') {
      countQuery = countQuery.eq('status', status)
    }

    if (verified && verified !== 'all') {
      countQuery = countQuery.eq('is_verified', verified === 'true')
    }

    const { count } = await countQuery

    // Calculate statistics
    const { data: allCreators } = await supabase
      .from('profiles')
      .select('status, is_verified')
      .eq('role', 'creator')

    const stats = {
      total: count || 0,
      active: allCreators?.filter(c => c.status === 'active').length || 0,
      suspended: allCreators?.filter(c => c.status === 'suspended').length || 0,
      banned: allCreators?.filter(c => c.status === 'banned').length || 0,
      verified: allCreators?.filter(c => c.is_verified).length || 0,
      unverified: allCreators?.filter(c => !c.is_verified).length || 0
    }

    return NextResponse.json({
      success: true,
      creators,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      stats
    })
  } catch (error) {
    console.error('Get creators error:', error)
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

    const { creatorId, action, data } = await request.json()

    let updateData: any = {}
    let message = ''

    switch (action) {
      case 'update_status':
        updateData.status = data.status
        message = `Creator status updated to ${data.status}`
        break
      case 'verify_creator':
        updateData.is_verified = data.verified
        message = `Creator verification status updated`
        break
      case 'update_role':
        updateData.role = data.role
        message = `Creator role updated to ${data.role}`
        break
      case 'add_note':
        updateData.admin_notes = data.note
        message = 'Note added to creator profile'
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('user_id', creatorId)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message,
      creatorId,
      action,
      data
    })
  } catch (error) {
    console.error('Update creator error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
