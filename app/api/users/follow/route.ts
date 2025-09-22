import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { z } from 'zod'

const followSchema = z.object({
  targetUserId: z.string().uuid('Invalid user ID'),
  action: z.enum(['follow', 'unfollow'])
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { targetUserId, action } = followSchema.parse(body)

    // Get current user from session
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

    if (action === 'follow') {
      // Add follow relationship
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: targetUserId,
          created_at: new Date().toISOString()
        })

      if (error) {
        if (error.code === '23505') {
          return NextResponse.json(
            { error: 'Already following this user' },
            { status: 409 }
          )
        }
        throw error
      }

      // Update follower count
      await supabase.rpc('increment_follower_count', {
        user_id: targetUserId
      })

      return NextResponse.json({
        success: true,
        message: 'User followed successfully'
      })
    } else {
      // Remove follow relationship
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)

      if (error) {
        throw error
      }

      // Update follower count
      await supabase.rpc('decrement_follower_count', {
        user_id: targetUserId
      })

      return NextResponse.json({
        success: true,
        message: 'User unfollowed successfully'
      })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Follow action error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
