import { NextRequest, NextResponse } from 'next/server'

// Mock users data for demo purposes
// In production, this would connect to your actual database
const mockUsers = [
  {
    id: 'user-1',
    username: 'john_doe',
    email: 'john@example.com',
    display_name: 'John Doe',
    role: 'user',
    status: 'active',
    is_verified: false,
    created_at: '2024-01-15T10:30:00Z',
    last_active: '2024-01-20T15:45:00Z',
    followers_count: 25,
    following_count: 12,
    posts_count: 3,
    avatar_url: 'https://ui-avatars.com/api/?name=John+Doe&background=random'
  },
  {
    id: 'user-2',
    username: 'jane_creator',
    email: 'jane@example.com',
    display_name: 'Jane Smith',
    role: 'creator',
    status: 'active',
    is_verified: true,
    created_at: '2024-01-10T09:15:00Z',
    last_active: '2024-01-20T18:20:00Z',
    followers_count: 1250,
    following_count: 45,
    posts_count: 28,
    avatar_url: 'https://ui-avatars.com/api/?name=Jane+Smith&background=random'
  },
  {
    id: 'user-3',
    username: 'bob_wilson',
    email: 'bob@example.com',
    display_name: 'Bob Wilson',
    role: 'user',
    status: 'active',
    is_verified: false,
    created_at: '2024-01-05T14:20:00Z',
    last_active: '2024-01-19T12:30:00Z',
    followers_count: 8,
    following_count: 15,
    posts_count: 1,
    avatar_url: 'https://ui-avatars.com/api/?name=Bob+Wilson&background=random'
  },
  {
    id: 'user-4',
    username: 'alice_artist',
    email: 'alice@example.com',
    display_name: 'Alice Johnson',
    role: 'creator',
    status: 'active',
    is_verified: true,
    created_at: '2024-01-08T11:45:00Z',
    last_active: '2024-01-20T20:10:00Z',
    followers_count: 890,
    following_count: 32,
    posts_count: 15,
    avatar_url: 'https://ui-avatars.com/api/?name=Alice+Johnson&background=random'
  },
  {
    id: 'user-5',
    username: 'mike_gamer',
    email: 'mike@example.com',
    display_name: 'Mike Chen',
    role: 'user',
    status: 'suspended',
    is_verified: false,
    created_at: '2024-01-12T16:30:00Z',
    last_active: '2024-01-18T09:15:00Z',
    followers_count: 0,
    following_count: 5,
    posts_count: 0,
    avatar_url: 'https://ui-avatars.com/api/?name=Mike+Chen&background=random'
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const status = searchParams.get('status') || ''

    // Filter users based on search and filters
    let filteredUsers = mockUsers

    if (search) {
      filteredUsers = filteredUsers.filter(user => 
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        user.display_name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (role && role !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.role === role)
    }

    if (status && status !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.status === status)
    }

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

    return NextResponse.json({
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, status, reason } = await request.json()

    // In production, this would update the user status in the database
    console.log(`Updating user ${userId} status to ${status}. Reason: ${reason}`)

    return NextResponse.json({
      message: 'User status updated successfully',
      userId,
      status,
      reason
    })
  } catch (error) {
    console.error('Error updating user status:', error)
    return NextResponse.json(
      { error: 'Failed to update user status' },
      { status: 500 }
    )
  }
}
