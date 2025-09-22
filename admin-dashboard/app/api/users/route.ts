import { NextRequest, NextResponse } from 'next/server'

// Extended user data for admin dashboard
interface AdminUser {
  id: string
  username: string
  email: string
  display_name: string
  role: 'user' | 'creator' | 'admin'
  status: 'active' | 'suspended' | 'banned'
  is_verified: boolean
  created_at: string
  last_active: string
  last_login?: string
  followers_count: number
  following_count: number
  posts_count: number
  avatar_url: string
  bio?: string
  location?: string
  website?: string
  social_links?: {
    twitter?: string
    instagram?: string
    youtube?: string
  }
  subscription_price?: number
  total_earnings?: number
  verification_status?: 'pending' | 'verified' | 'rejected'
  age_verified: boolean
  email_verified: boolean
  phone_verified: boolean
  two_factor_enabled: boolean
  login_attempts: number
  last_password_change?: string
  ip_address?: string
  user_agent?: string
  referral_code?: string
  referred_by?: string
  subscription_count?: number
  total_spent?: number
  last_payment_date?: string
  payment_method?: string
  notes?: string
  tags?: string[]
}

// Mock comprehensive user data for admin dashboard
const mockUsers: AdminUser[] = [
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
    last_login: '2024-01-20T15:45:00Z',
    followers_count: 25,
    following_count: 12,
    posts_count: 3,
    avatar_url: 'https://ui-avatars.com/api/?name=John+Doe&background=random',
    bio: 'Content creator and photographer',
    location: 'New York, NY',
    website: 'https://johndoe.com',
    social_links: {
      twitter: '@johndoe',
      instagram: '@johndoe_photo'
    },
    age_verified: true,
    email_verified: true,
    phone_verified: false,
    two_factor_enabled: false,
    login_attempts: 0,
    last_password_change: '2024-01-15T10:30:00Z',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    referral_code: 'JOHN123',
    subscription_count: 2,
    total_spent: 29.98,
    last_payment_date: '2024-01-18T12:00:00Z',
    payment_method: 'credit_card',
    notes: 'Regular user, good engagement',
    tags: ['photography', 'travel']
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
    last_login: '2024-01-20T18:20:00Z',
    followers_count: 1250,
    following_count: 45,
    posts_count: 28,
    avatar_url: 'https://ui-avatars.com/api/?name=Jane+Smith&background=random',
    bio: 'Professional content creator specializing in lifestyle and fashion',
    location: 'Los Angeles, CA',
    website: 'https://janesmith.com',
    social_links: {
      twitter: '@janesmith',
      instagram: '@janesmith_lifestyle',
      youtube: 'Jane Smith Lifestyle'
    },
    subscription_price: 9.99,
    total_earnings: 1247.50,
    verification_status: 'verified',
    age_verified: true,
    email_verified: true,
    phone_verified: true,
    two_factor_enabled: true,
    login_attempts: 0,
    last_password_change: '2024-01-10T09:15:00Z',
    ip_address: '192.168.1.101',
    user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',
    referral_code: 'JANE456',
    subscription_count: 125,
    total_spent: 0,
    last_payment_date: undefined,
    payment_method: undefined,
    notes: 'Top creator, excellent content quality',
    tags: ['lifestyle', 'fashion', 'verified', 'top-creator']
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
    last_login: '2024-01-19T12:30:00Z',
    followers_count: 8,
    following_count: 15,
    posts_count: 1,
    avatar_url: 'https://ui-avatars.com/api/?name=Bob+Wilson&background=random',
    bio: 'Tech enthusiast and gamer',
    location: 'Seattle, WA',
    website: undefined,
    social_links: {},
    age_verified: true,
    email_verified: true,
    phone_verified: false,
    two_factor_enabled: false,
    login_attempts: 0,
    last_password_change: '2024-01-05T14:20:00Z',
    ip_address: '192.168.1.102',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    referral_code: 'BOB789',
    subscription_count: 1,
    total_spent: 4.99,
    last_payment_date: '2024-01-12T10:00:00Z',
    payment_method: 'paypal',
    notes: 'New user, low activity',
    tags: ['tech', 'gaming']
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
    last_login: '2024-01-20T20:10:00Z',
    followers_count: 890,
    following_count: 32,
    posts_count: 15,
    avatar_url: 'https://ui-avatars.com/api/?name=Alice+Johnson&background=random',
    bio: 'Digital artist and illustrator',
    location: 'Portland, OR',
    website: 'https://aliceart.com',
    social_links: {
      instagram: '@alice_art',
      youtube: 'Alice Art Studio'
    },
    subscription_price: 7.99,
    total_earnings: 623.40,
    verification_status: 'verified',
    age_verified: true,
    email_verified: true,
    phone_verified: true,
    two_factor_enabled: true,
    login_attempts: 0,
    last_password_change: '2024-01-08T11:45:00Z',
    ip_address: '192.168.1.103',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    referral_code: 'ALICE321',
    subscription_count: 78,
    total_spent: 0,
    last_payment_date: undefined,
    payment_method: undefined,
    notes: 'Talented artist, growing following',
    tags: ['art', 'digital-art', 'illustration', 'verified']
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
    last_login: '2024-01-18T09:15:00Z',
    followers_count: 0,
    following_count: 5,
    posts_count: 0,
    avatar_url: 'https://ui-avatars.com/api/?name=Mike+Chen&background=random',
    bio: 'Gaming content creator',
    location: 'Austin, TX',
    website: undefined,
    social_links: {},
    age_verified: true,
    email_verified: true,
    phone_verified: false,
    two_factor_enabled: false,
    login_attempts: 3,
    last_password_change: '2024-01-12T16:30:00Z',
    ip_address: '192.168.1.104',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    referral_code: 'MIKE654',
    subscription_count: 0,
    total_spent: 0,
    last_payment_date: undefined,
    payment_method: undefined,
    notes: 'Suspended for policy violations',
    tags: ['gaming', 'suspended']
  },
  {
    id: 'user-6',
    username: 'sarah_fitness',
    email: 'sarah@example.com',
    display_name: 'Sarah Williams',
    role: 'creator',
    status: 'active',
    is_verified: true,
    created_at: '2024-01-03T08:20:00Z',
    last_active: '2024-01-20T21:30:00Z',
    last_login: '2024-01-20T21:30:00Z',
    followers_count: 2100,
    following_count: 28,
    posts_count: 45,
    avatar_url: 'https://ui-avatars.com/api/?name=Sarah+Williams&background=random',
    bio: 'Fitness coach and nutritionist',
    location: 'Miami, FL',
    website: 'https://sarahfitness.com',
    social_links: {
      twitter: '@sarahfitness',
      instagram: '@sarah_fitness_coach',
      youtube: 'Sarah Fitness'
    },
    subscription_price: 12.99,
    total_earnings: 1890.75,
    verification_status: 'verified',
    age_verified: true,
    email_verified: true,
    phone_verified: true,
    two_factor_enabled: true,
    login_attempts: 0,
    last_password_change: '2024-01-03T08:20:00Z',
    ip_address: '192.168.1.105',
    user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',
    referral_code: 'SARAH987',
    subscription_count: 145,
    total_spent: 0,
    last_payment_date: undefined,
    payment_method: undefined,
    notes: 'Highly successful fitness creator',
    tags: ['fitness', 'nutrition', 'health', 'verified', 'top-creator']
  },
  {
    id: 'user-7',
    username: 'tom_tech',
    email: 'tom@example.com',
    display_name: 'Tom Rodriguez',
    role: 'user',
    status: 'banned',
    is_verified: false,
    created_at: '2024-01-01T12:00:00Z',
    last_active: '2024-01-15T14:20:00Z',
    last_login: '2024-01-15T14:20:00Z',
    followers_count: 0,
    following_count: 0,
    posts_count: 0,
    avatar_url: 'https://ui-avatars.com/api/?name=Tom+Rodriguez&background=random',
    bio: 'Tech reviewer',
    location: 'San Francisco, CA',
    website: undefined,
    social_links: {},
    age_verified: true,
    email_verified: true,
    phone_verified: false,
    two_factor_enabled: false,
    login_attempts: 5,
    last_password_change: '2024-01-01T12:00:00Z',
    ip_address: '192.168.1.106',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    referral_code: 'TOM147',
    subscription_count: 0,
    total_spent: 0,
    last_payment_date: undefined,
    payment_method: undefined,
    notes: 'Banned for spam and harassment',
    tags: ['tech', 'banned']
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
    const verified = searchParams.get('verified') || ''
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Filter users based on search and filters
    let filteredUsers = [...mockUsers]

    // Search filter
    if (search) {
      filteredUsers = filteredUsers.filter(user => 
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        user.display_name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.bio?.toLowerCase().includes(search.toLowerCase()) ||
        user.location?.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Role filter
    if (role && role !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.role === role)
    }

    // Status filter
    if (status && status !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.status === status)
    }

    // Verification filter
    if (verified && verified !== 'all') {
      const isVerified = verified === 'true'
      filteredUsers = filteredUsers.filter(user => user.is_verified === isVerified)
    }

    // Sorting
    filteredUsers.sort((a, b) => {
      let aValue: any = a[sortBy as keyof AdminUser]
      let bValue: any = b[sortBy as keyof AdminUser]

      if (sortBy === 'created_at' || sortBy === 'last_active' || sortBy === 'last_login') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

    // Calculate statistics
    const stats = {
      total: filteredUsers.length,
      active: filteredUsers.filter(u => u.status === 'active').length,
      suspended: filteredUsers.filter(u => u.status === 'suspended').length,
      banned: filteredUsers.filter(u => u.status === 'banned').length,
      verified: filteredUsers.filter(u => u.is_verified).length,
      creators: filteredUsers.filter(u => u.role === 'creator').length,
      users: filteredUsers.filter(u => u.role === 'user').length,
      admins: filteredUsers.filter(u => u.role === 'admin').length,
      totalEarnings: filteredUsers.reduce((sum, u) => sum + (u.total_earnings || 0), 0),
      totalSubscriptions: filteredUsers.reduce((sum, u) => sum + (u.subscription_count || 0), 0)
    }

    return NextResponse.json({
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / limit)
      },
      stats
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
    const { userId, action, data } = await request.json()

    // In production, this would update the user in the database
    console.log(`Admin action: ${action} on user ${userId}`, data)

    let message = ''
    switch (action) {
      case 'update_status':
        message = `User status updated to ${data.status}`
        break
      case 'update_role':
        message = `User role updated to ${data.role}`
        break
      case 'verify_user':
        message = 'User verification status updated'
        break
      case 'add_note':
        message = 'Note added to user profile'
        break
      case 'add_tag':
        message = 'Tag added to user profile'
        break
      case 'bulk_action':
        message = `Bulk action ${data.action} applied to ${data.userIds.length} users`
        break
      default:
        message = 'User updated successfully'
    }

    return NextResponse.json({
      success: true,
      message,
      userId,
      action,
      data
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // In production, this would delete the user from the database
    console.log(`Deleting user: ${userId}`)

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
      userId
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}

