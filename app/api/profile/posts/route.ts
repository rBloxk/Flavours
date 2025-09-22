import { NextRequest, NextResponse } from 'next/server'

interface Post {
  id: string
  user_id: string
  username: string
  display_name: string
  avatar_url: string
  content: string
  media?: {
    type: 'image' | 'video'
    url: string
    alt: string
    thumbnail?: string
    duration?: number
  }[]
  stats: {
    likes: number
    comments: number
    shares: number
    views: number
  }
  created_at: string
  updated_at: string
  privacy: 'public' | 'followers' | 'paid'
  tags: string[]
  is_liked?: boolean
  is_bookmarked?: boolean
}

// Mock posts data
const mockPosts: Post[] = [
  {
    id: '1',
    user_id: 'demo-user',
    username: 'demo_user',
    display_name: 'Demo User',
    avatar_url: 'https://ui-avatars.com/api/?name=Demo+User&background=random',
    content: 'Just finished an amazing workout session! 💪 The energy today was incredible.',
    media: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
        alt: 'Workout session',
        thumbnail: '',
        duration: null
      }
    ],
    stats: { likes: 24, comments: 8, shares: 3, views: 156 },
    created_at: '2024-01-20T13:45:00Z',
    updated_at: '2024-01-20T13:45:00Z',
    privacy: 'public',
    tags: ['fitness', 'workout', 'motivation'],
    is_liked: false,
    is_bookmarked: false
  },
  {
    id: '2',
    user_id: 'demo-user',
    username: 'demo_user',
    display_name: 'Demo User',
    avatar_url: 'https://ui-avatars.com/api/?name=Demo+User&background=random',
    content: 'Sharing some behind-the-scenes content from my latest project! 🎬',
    media: [
      {
        type: 'video',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        alt: 'Behind the scenes',
        thumbnail: 'https://images.unsplash.com/photo-1489599804349-5b0b0b0b0b0b?w=800&h=600&fit=crop',
        duration: 120
      }
    ],
    stats: { likes: 156, comments: 23, shares: 12, views: 890 },
    created_at: '2024-01-19T16:30:00Z',
    updated_at: '2024-01-19T16:30:00Z',
    privacy: 'followers',
    tags: ['behind-the-scenes', 'project', 'creative'],
    is_liked: true,
    is_bookmarked: true
  },
  {
    id: '3',
    user_id: 'demo-user',
    username: 'demo_user',
    display_name: 'Demo User',
    avatar_url: 'https://ui-avatars.com/api/?name=Demo+User&background=random',
    content: 'Quick photography tip: Golden hour magic ✨',
    media: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop',
        alt: 'Golden hour photography',
        thumbnail: '',
        duration: null
      }
    ],
    stats: { likes: 89, comments: 12, shares: 5, views: 234 },
    created_at: '2024-01-18T09:15:00Z',
    updated_at: '2024-01-18T09:15:00Z',
    privacy: 'public',
    tags: ['photography', 'golden-hour', 'tips'],
    is_liked: false,
    is_bookmarked: false
  },
  {
    id: '4',
    user_id: 'demo-user',
    username: 'demo_user',
    display_name: 'Demo User',
    avatar_url: 'https://ui-avatars.com/api/?name=Demo+User&background=random',
    content: 'Short video tutorial on perfect lighting!',
    media: [
      {
        type: 'video',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        alt: 'Lighting tutorial',
        thumbnail: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop',
        duration: 45
      }
    ],
    stats: { likes: 203, comments: 34, shares: 18, views: 567 },
    created_at: '2024-01-17T14:20:00Z',
    updated_at: '2024-01-17T14:20:00Z',
    privacy: 'public',
    tags: ['tutorial', 'lighting', 'photography'],
    is_liked: true,
    is_bookmarked: true
  },
  {
    id: '5',
    user_id: 'demo-user',
    username: 'demo_user',
    display_name: 'Demo User',
    avatar_url: 'https://ui-avatars.com/api/?name=Demo+User&background=random',
    content: 'Another beautiful sunset captured today 🌅',
    media: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        alt: 'Sunset photography',
        thumbnail: '',
        duration: null
      }
    ],
    stats: { likes: 67, comments: 9, shares: 2, views: 123 },
    created_at: '2024-01-16T18:45:00Z',
    updated_at: '2024-01-16T18:45:00Z',
    privacy: 'public',
    tags: ['sunset', 'photography', 'nature'],
    is_liked: false,
    is_bookmarked: false
  },
  {
    id: '6',
    user_id: 'demo-user',
    username: 'demo_user',
    display_name: 'Demo User',
    avatar_url: 'https://ui-avatars.com/api/?name=Demo+User&background=random',
    content: 'Quick 30-second cooking tip!',
    media: [
      {
        type: 'video',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        alt: 'Cooking tip',
        thumbnail: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
        duration: 30
      }
    ],
    stats: { likes: 145, comments: 28, shares: 8, views: 345 },
    created_at: '2024-01-15T12:00:00Z',
    updated_at: '2024-01-15T12:00:00Z',
    privacy: 'followers',
    tags: ['cooking', 'tips', 'food'],
    is_liked: true,
    is_bookmarked: false
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const username = searchParams.get('username')
    const type = searchParams.get('type') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    if (!userId && !username) {
      return NextResponse.json(
        { error: 'User ID or username is required' },
        { status: 400 }
      )
    }

    // Filter posts by user
    let userPosts = mockPosts
    if (userId) {
      userPosts = mockPosts.filter(post => post.user_id === userId)
    } else if (username) {
      userPosts = mockPosts.filter(post => post.username === username)
    }

    // Filter by content type
    if (type !== 'all') {
      userPosts = userPosts.filter(post => {
        if (type === 'text') return !post.media || post.media.length === 0
        if (type === 'image') return post.media?.some(m => m.type === 'image')
        if (type === 'video') return post.media?.some(m => m.type === 'video')
        if (type === 'shortVideo') return post.media?.some(m => m.type === 'video' && m.duration && m.duration <= 60)
        return true
      })
    }

    // Sort posts
    userPosts.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Post]
      let bValue: any = b[sortBy as keyof Post]

      if (sortBy === 'created_at' || sortBy === 'updated_at') {
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
    const paginatedPosts = userPosts.slice(startIndex, endIndex)

    // Calculate statistics
    const stats = {
      total: userPosts.length,
      images: userPosts.filter(post => post.media?.some(m => m.type === 'image')).length,
      videos: userPosts.filter(post => post.media?.some(m => m.type === 'video')).length,
      shortVideos: userPosts.filter(post => post.media?.some(m => m.type === 'video' && m.duration && m.duration <= 60)).length,
      text: userPosts.filter(post => !post.media || post.media.length === 0).length,
      totalLikes: userPosts.reduce((sum, post) => sum + post.stats.likes, 0),
      totalComments: userPosts.reduce((sum, post) => sum + post.stats.comments, 0),
      totalViews: userPosts.reduce((sum, post) => sum + post.stats.views, 0)
    }

    return NextResponse.json({
      posts: paginatedPosts,
      pagination: {
        page,
        limit,
        total: userPosts.length,
        totalPages: Math.ceil(userPosts.length / limit)
      },
      stats
    })
  } catch (error) {
    console.error('Error fetching user posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, postId, userId } = await request.json()

    if (!postId || !userId) {
      return NextResponse.json(
        { error: 'Post ID and User ID are required' },
        { status: 400 }
      )
    }

    const post = mockPosts.find(p => p.id === postId)
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    let message = ''
    let result: any = {}

    switch (action) {
      case 'like':
        if (post.is_liked) {
          post.stats.likes = Math.max(0, post.stats.likes - 1)
          post.is_liked = false
          message = 'Post unliked'
        } else {
          post.stats.likes += 1
          post.is_liked = true
          message = 'Post liked'
        }
        result = { likes: post.stats.likes, is_liked: post.is_liked }
        break
      
      case 'bookmark':
        if (post.is_bookmarked) {
          post.is_bookmarked = false
          message = 'Post removed from bookmarks'
        } else {
          post.is_bookmarked = true
          message = 'Post bookmarked'
        }
        result = { is_bookmarked: post.is_bookmarked }
        break
      
      case 'share':
        post.stats.shares += 1
        message = 'Post shared'
        result = { shares: post.stats.shares }
        break
      
      case 'view':
        post.stats.views += 1
        message = 'Post view recorded'
        result = { views: post.stats.views }
        break
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message,
      ...result
    })
  } catch (error) {
    console.error('Error performing post action:', error)
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    )
  }
}

