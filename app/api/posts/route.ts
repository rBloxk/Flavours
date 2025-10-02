import { NextRequest, NextResponse } from 'next/server'
import { localDatabase } from '@/lib/local-database'

// Helper function to transform database post to API format
function transformPost(post: any, profile: any) {
  return {
    id: post.id,
    creator: {
      id: profile.user_id,
      username: profile.username,
      displayName: profile.display_name,
      avatarUrl: profile.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile.display_name),
      isVerified: profile.is_verified,
      followerCount: profile.followers_count,
      engagementRate: 8.5,
      category: profile.tags || ['general'],
      trustScore: 9.2,
      isFollowing: false
    },
    content: post.content,
    mediaUrl: post.media_url,
    mediaType: post.media_type,
    mediaFiles: post.media_files,
    isPaid: post.is_paid,
    price: post.price,
    privacy: post.privacy,
    metrics: {
      likesCount: post.likes_count,
      commentsCount: post.comments_count,
      sharesCount: post.shares_count,
      viewsCount: post.views_count,
      engagementRate: post.engagement_rate,
      viralityScore: post.virality_score,
      freshnessScore: post.freshness_score,
      relevanceScore: post.relevance_score
    },
    createdAt: new Date(post.created_at).toISOString(),
    createdAtTimestamp: new Date(post.created_at).getTime(),
    tags: post.tags || [],
    mentions: post.mentions || [],
    location: post.location,
    category: post.category || 'general',
    isLiked: false,
    isBookmarked: false,
    isViewed: false,
    qualityScore: post.quality_score,
    trendingScore: post.trending_score
  }
}

export async function GET() {
  try {
    // Get posts from local database
    const posts = await localDatabase.getPosts(20, 0)
    const profiles = await localDatabase.getProfiles(100, 0)
    
    // Transform posts to API format
    const transformedPosts = posts.map(post => {
      const profile = profiles.find(p => p.user_id === post.user_id)
      return transformPost(post, profile || profiles[0])
    })
    
    return NextResponse.json({
      success: true,
      posts: transformedPosts,
      total: transformedPosts.length
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type')
    
    let content, privacy, tags, mentions, location, isPaid, price, userId
    
    if (contentType?.includes('multipart/form-data')) {
      // Handle FormData from frontend
      const formData = await request.formData()
      content = formData.get('content') as string
      privacy = (formData.get('privacy') as string) || 'public'
      tags = JSON.parse((formData.get('tags') as string) || '[]')
      mentions = JSON.parse((formData.get('mentions') as string) || '[]')
      location = (formData.get('location') as string) || ''
      isPaid = formData.get('isPaidContent') === 'true'
      price = parseFloat((formData.get('price') as string) || '0')
      userId = 'demo-user-1759370026017' // Default user for now
    } else {
      // Handle JSON from API testing
      const body = await request.json()
      content = body.content
      privacy = body.privacy || 'public'
      tags = body.tags || []
      mentions = body.mentions || []
      location = body.location || ''
      isPaid = body.isPaid || false
      price = body.price || 0
      userId = body.userId || 'demo-user-1759370026017'
    }
    
    // Create new post in local database
    const newPost = await localDatabase.createPost({
      user_id: userId,
      content,
      privacy: privacy as 'public' | 'followers' | 'paid' | 'private',
      tags,
      mentions,
      location,
      is_paid: isPaid,
      price,
      category: 'general',
      likes_count: 0,
      comments_count: 0,
      shares_count: 0,
      views_count: 0,
      engagement_rate: 0,
      virality_score: 5,
      freshness_score: 10,
      relevance_score: 5,
      quality_score: 5,
      trending_score: 5,
      is_featured: false
    })
    
    // Get the user profile for the response
    const profile = await localDatabase.getProfileById(userId)
    
    // Transform to API format
    const transformedPost = transformPost(newPost, profile || { user_id: userId, username: 'demo_user', display_name: 'Demo User', avatar_url: null, is_verified: false, followers_count: 0, tags: ['general'] })
    
    return NextResponse.json({
      success: true,
      post: transformedPost,
      message: 'Post created successfully'
    })
    
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}
