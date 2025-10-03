import { NextRequest, NextResponse } from 'next/server'

interface ProfileData {
  id: string
  username: string
  email: string
  display_name: string
  avatar_url: string
  bio?: string
  location?: string
  website?: string
  is_creator: boolean
  is_verified: boolean
  created_at: string
  last_active: string
  followers_count: number
  following_count: number
  posts_count: number
  likes_received: number
  total_views: number
  subscription_price?: number
  total_earnings?: number
  subscription_count?: number
  interests: string[]
  social_links?: {
    twitter?: string
    instagram?: string
    youtube?: string
    tiktok?: string
    onlyfans?: string
  }
  privacy_settings: {
    profile_visibility: 'public' | 'followers' | 'private'
    show_email: boolean
    show_location: boolean
    show_website: boolean
  }
  verification_status?: 'pending' | 'verified' | 'rejected'
  age_verified: boolean
  email_verified: boolean
  phone_verified: boolean
  two_factor_enabled: boolean
}

// Mock comprehensive profile data
const mockProfiles: Record<string, ProfileData> = {
  'demo-user': {
    id: 'demo-user',
    username: 'demo_user',
    email: 'demo@example.com',
    display_name: 'Demo User',
    avatar_url: 'https://ui-avatars.com/api/?name=Demo+User&background=random',
    bio: 'Passionate about fitness, creativity, and connecting with amazing people. Always learning and growing! 🌟',
    location: 'San Francisco, CA',
    website: 'https://example.com',
    is_creator: true,
    is_verified: false,
    created_at: '2024-01-15T10:30:00Z',
    last_active: '2024-01-20T15:45:00Z',
    followers_count: 1250,
    following_count: 856,
    posts_count: 42,
    likes_received: 3400,
    total_views: 12500,
    subscription_price: 9.99,
    total_earnings: 1247.50,
    subscription_count: 125,
    interests: ['Fitness', 'Art', 'Photography', 'Travel', 'Music', 'Cooking'],
    social_links: {
      twitter: '@demouser',
      instagram: '@demo_user',
      youtube: 'Demo User Channel',
      onlyfans: '@demo_onlyfans'
    },
    privacy_settings: {
      profile_visibility: 'public',
      show_email: false,
      show_location: true,
      show_website: true
    },
    verification_status: 'pending',
    age_verified: true,
    email_verified: true,
    phone_verified: false,
    two_factor_enabled: false
  },
  'jane_creator': {
    id: 'user-2',
    username: 'jane_creator',
    email: 'jane@example.com',
    display_name: 'Jane Smith',
    avatar_url: 'https://ui-avatars.com/api/?name=Jane+Smith&background=random',
    bio: 'Professional content creator specializing in lifestyle and fashion. Sharing my journey and inspiring others! ✨',
    location: 'Los Angeles, CA',
    website: 'https://janesmith.com',
    is_creator: true,
    is_verified: true,
    created_at: '2024-01-10T09:15:00Z',
    last_active: '2024-01-20T18:20:00Z',
    followers_count: 12500,
    following_count: 450,
    posts_count: 128,
    likes_received: 45600,
    total_views: 89000,
    subscription_price: 12.99,
    total_earnings: 12470.50,
    subscription_count: 1250,
    interests: ['Lifestyle', 'Fashion', 'Beauty', 'Travel', 'Photography', 'Wellness'],
    social_links: {
      twitter: '@janesmith',
      instagram: '@janesmith_lifestyle',
      youtube: 'Jane Smith Lifestyle',
      tiktok: '@janesmith',
      onlyfans: '@janesmith'
    },
    privacy_settings: {
      profile_visibility: 'public',
      show_email: false,
      show_location: true,
      show_website: true
    },
    verification_status: 'verified',
    age_verified: true,
    email_verified: true,
    phone_verified: true,
    two_factor_enabled: true
  },
  'jane_fitness': {
    id: 'user-3',
    username: 'jane_fitness',
    email: 'jane.fitness@example.com',
    display_name: 'Jane Smith',
    avatar_url: 'https://ui-avatars.com/api/?name=Jane+Smith&background=random',
    bio: 'Fitness enthusiast and certified trainer 💪 | Sharing workout routines, nutrition tips, and motivation | Let\'s achieve our goals together!',
    location: 'Miami, FL',
    website: 'https://janesmithfitness.com',
    is_creator: true,
    is_verified: true,
    created_at: '2024-02-15T08:30:00Z',
    last_active: '2024-01-20T16:45:00Z',
    followers_count: 23400,
    following_count: 892,
    posts_count: 245,
    likes_received: 156800,
    total_views: 245000,
    subscription_price: 19.99,
    total_earnings: 41979.00,
    subscription_count: 2100,
    interests: ['Fitness', 'Nutrition', 'Wellness', 'HIIT', 'Strength Training', 'Motivation'],
    social_links: {
      twitter: '@janesmithfitness',
      instagram: '@jane_fitness',
      youtube: 'Jane Smith Fitness',
      tiktok: '@janesmith_fitness',
      onlyfans: '@janesmith_fitness'
    },
    privacy_settings: {
      profile_visibility: 'public',
      show_email: false,
      show_location: true,
      show_website: true
    },
    verification_status: 'verified',
    age_verified: true,
    email_verified: true,
    phone_verified: true,
    two_factor_enabled: true
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const username = searchParams.get('username')

    if (!userId && !username) {
      return NextResponse.json(
        { error: 'User ID or username is required' },
        { status: 400 }
      )
    }

    // Find profile by userId or username
    let profile: ProfileData | undefined
    if (userId) {
      profile = mockProfiles[userId]
    } else if (username) {
      profile = Object.values(mockProfiles).find(p => p.username === username)
    }

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      profile,
      success: true
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, updates } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // In production, this would update the profile in the database
    console.log(`Updating profile for user ${userId}:`, updates)

    // Simulate profile update
    const profile = mockProfiles[userId]
    if (profile) {
      // Update the profile with new data
      Object.assign(profile, updates)
      
      return NextResponse.json({
        success: true,
        message: 'Profile updated successfully',
        profile
      })
    } else {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, userId, data } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const profile = mockProfiles[userId]
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    let message = ''
    let result: any = {}

    switch (action) {
      case 'follow':
        profile.followers_count += 1
        message = 'Successfully followed user'
        result = { followers_count: profile.followers_count }
        break
      
      case 'unfollow':
        profile.followers_count = Math.max(0, profile.followers_count - 1)
        message = 'Successfully unfollowed user'
        result = { followers_count: profile.followers_count }
        break
      
      case 'subscribe':
        profile.subscription_count = (profile.subscription_count || 0) + 1
        message = 'Successfully subscribed to creator'
        result = { subscription_count: profile.subscription_count }
        break
      
      case 'unsubscribe':
        profile.subscription_count = Math.max(0, (profile.subscription_count || 0) - 1)
        message = 'Successfully unsubscribed from creator'
        result = { subscription_count: profile.subscription_count }
        break
      
      case 'like_post':
        profile.likes_received += 1
        message = 'Post liked successfully'
        result = { likes_received: profile.likes_received }
        break
      
      case 'unlike_post':
        profile.likes_received = Math.max(0, profile.likes_received - 1)
        message = 'Post unliked successfully'
        result = { likes_received: profile.likes_received }
        break
      
      case 'add_interest':
        if (data.interest && !profile.interests.includes(data.interest)) {
          profile.interests.push(data.interest)
          message = 'Interest added successfully'
          result = { interests: profile.interests }
        } else {
          return NextResponse.json(
            { error: 'Interest already exists or is invalid' },
            { status: 400 }
          )
        }
        break
      
      case 'remove_interest':
        if (data.interest) {
          profile.interests = profile.interests.filter(i => i !== data.interest)
          message = 'Interest removed successfully'
          result = { interests: profile.interests }
        } else {
          return NextResponse.json(
            { error: 'Interest is required' },
            { status: 400 }
          )
        }
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
    console.error('Error performing profile action:', error)
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    )
  }
}

