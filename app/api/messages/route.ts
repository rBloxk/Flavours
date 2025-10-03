import { NextRequest, NextResponse } from 'next/server'
import { localDatabase } from '@/lib/local-database'
import { z } from 'zod'

const messageSchema = z.object({
  recipient_id: z.string().uuid('Invalid recipient ID'),
  content: z.string().min(1, 'Message content is required').max(1000, 'Message too long'),
  type: z.enum(['text', 'image', 'video']).default('text'),
  media_url: z.string().url().optional()
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get user to verify they exist
    const user = await localDatabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (!conversationId) {
      // Get user's conversations
      const conversations = await localDatabase.getUserConversations(user.id, {
        limit,
        offset
      })

      return NextResponse.json({
        success: true,
        conversations,
        pagination: {
          limit,
          offset,
          total: conversations.length
        }
      })
    }

    // Get messages for specific conversation
    const messages = await localDatabase.getConversationMessages(conversationId, {
      limit,
      offset
    })

    // Check if user is part of this conversation
    const conversation = await localDatabase.getConversationById(conversationId)
    if (!conversation || (conversation.user1_id !== user.id && conversation.user2_id !== user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      messages,
      conversation,
      pagination: {
        limit,
        offset,
        total: messages.length
      }
    })
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = messageSchema.parse(body)

    // Get user to verify they exist
    const user = await localDatabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if recipient exists
    const recipient = await localDatabase.getProfileById(validatedData.recipient_id)
    if (!recipient) {
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 404 }
      )
    }

    // Get or create conversation
    let conversation = await localDatabase.getConversationByUsers(user.id, validatedData.recipient_id)
    if (!conversation) {
      conversation = await localDatabase.createConversation({
        user1_id: user.id,
        user2_id: validatedData.recipient_id
      })
    }

    // Create message
    const message = await localDatabase.createMessage({
      conversation_id: conversation.id,
      sender_id: user.id,
      recipient_id: validatedData.recipient_id,
      content: validatedData.content,
      type: validatedData.type,
      media_url: validatedData.media_url,
      is_read: false
    })

    // Create notification for recipient
    await localDatabase.createNotification({
      user_id: validatedData.recipient_id,
      type: 'mention',
      title: 'New Message',
      message: `${user.username || user.email} sent you a message`,
      related_id: conversation.id,
      related_type: 'user',
      metadata: { sender_username: user.username || user.email }
    })

    return NextResponse.json({
      success: true,
      message,
      conversation
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Send message error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
