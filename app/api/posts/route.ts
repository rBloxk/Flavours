import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// File path for persistent storage
const POSTS_FILE = join(process.cwd(), 'data', 'posts.json')

// Initialize posts data
async function initializePosts() {
  try {
    // Create data directory if it doesn't exist
    const dataDir = join(process.cwd(), 'data')
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true })
    }

    // Check if posts file exists
    if (existsSync(POSTS_FILE)) {
      const data = await readFile(POSTS_FILE, 'utf-8')
      return JSON.parse(data)
    } else {
      // Create initial posts file with sample data
      const initialPosts = [
        {
          id: '1',
          creator: {
            id: 'user_1',
            username: 'jane_fitness',
            displayName: 'Jane Smith',
            avatarUrl: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150',
            isVerified: true,
            followerCount: 125000,
            engagementRate: 8.5,
            category: ['fitness', 'wellness', 'motivation'],
            trustScore: 9.2,
            isFollowing: true
          },
          content: 'New workout video is live! 💪 Who\'s ready to sweat with me? This 30-minute HIIT session will challenge every muscle group. Perfect for beginners and advanced athletes alike! #FitnessMotivation #HIIT #Workout',
          mediaUrl: 'https://images.pexels.com/photos/416809/pexels-photo-416809.jpeg?auto=compress&cs=tinysrgb&w=800',
          mediaType: 'video',
          isPaid: false,
          privacy: 'public',
          metrics: {
            likesCount: 2340,
            commentsCount: 180,
            sharesCount: 95,
            viewsCount: 15600,
            engagementRate: 8.2,
            viralityScore: 7.8,
            freshnessScore: 9.5,
            relevanceScore: 8.9
          },
          createdAt: '2h',
          createdAtTimestamp: Date.now() - 2 * 60 * 60 * 1000,
          tags: ['fitness', 'workout', 'motivation', 'hiit'],
          category: 'fitness',
          isLiked: false,
          isBookmarked: false,
          isViewed: false,
          qualityScore: 9.1,
          trendingScore: 8.7
        }
      ]
      
      // Write initial posts to file
      await writeFile(POSTS_FILE, JSON.stringify(initialPosts, null, 2))
      return initialPosts
    }
  } catch (error) {
    console.error('Error initializing posts:', error)
    return []
  }
}

// Save posts to file
async function savePosts(posts: any[]) {
  try {
    await writeFile(POSTS_FILE, JSON.stringify(posts, null, 2))
  } catch (error) {
    console.error('Error saving posts:', error)
  }
}

export async function GET() {
  try {
    // Load posts from persistent storage
    const posts = await initializePosts()
    
    // Return posts sorted by creation time (newest first)
    const sortedPosts = posts.sort((a: any, b: any) => b.createdAtTimestamp - a.createdAtTimestamp)
    
    return NextResponse.json({
      success: true,
      posts: sortedPosts,
      total: sortedPosts.length
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
    const formData = await request.formData()
    
    // Extract post data
    const content = formData.get('content') as string
    const privacy = formData.get('privacy') as string || 'public'
    const tags = JSON.parse(formData.get('tags') as string || '[]')
    const mentions = JSON.parse(formData.get('mentions') as string || '[]')
    const location = formData.get('location') as string || ''
    const isPaidContent = formData.get('isPaidContent') === 'true'
    const price = parseFloat(formData.get('price') as string || '0')
    
    // Extract user data from form
    const userDataStr = formData.get('userData') as string || '{}'
    const userData = JSON.parse(userDataStr)
    // Use provided user data or fallback to mock data
    const currentUser = {
      id: userData.id || 'current_user',
      username: userData.username || 'current_user',
      displayName: userData.displayName || userData.display_name || 'Current User',
      avatarUrl: userData.avatarUrl || userData.avatar_url || 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150',
      isVerified: userData.isVerified || false,
      followerCount: userData.followerCount || 1000,
      engagementRate: userData.engagementRate || 5.0,
      category: userData.category || ['general'],
      trustScore: userData.trustScore || 8.0,
      isFollowing: false
    }
    
    // Handle file uploads
    const mediaFiles: any[] = []
    const files = formData.getAll('media') as File[]
    
    for (const file of files) {
      if (file.size > 0) {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'public', 'uploads')
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true })
        }
        
        // Generate unique filename
        const timestamp = Date.now()
        const filename = `${timestamp}_${file.name}`
        const filepath = join(uploadsDir, filename)
        
        // Save file
        await writeFile(filepath, buffer)
        
        // Determine media type
        let mediaType: 'image' | 'video' = 'image'
        if (file.type.startsWith('video/')) {
          mediaType = 'video'
        }
        
        mediaFiles.push({
          filename,
          originalName: file.name,
          size: file.size,
          type: file.type,
          mediaType,
          url: `/uploads/${filename}`
        })
      }
    }
    
    // Create new post
    const newPost = {
      id: `post_${Date.now()}`,
      creator: currentUser,
      content,
      mediaUrl: mediaFiles.length > 0 ? mediaFiles[0].url : undefined,
      mediaType: mediaFiles.length > 0 ? mediaFiles[0].mediaType : undefined,
      mediaFiles,
      isPaid: isPaidContent,
      price: isPaidContent ? price : undefined,
      privacy: privacy as 'public' | 'followers' | 'paid',
      metrics: {
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        viewsCount: 0,
        engagementRate: 0,
        viralityScore: 0,
        freshnessScore: 10,
        relevanceScore: 5
      },
      createdAt: 'now',
      createdAtTimestamp: Date.now(),
      tags,
      mentions,
      location,
      category: 'general',
      isLiked: false,
      isBookmarked: false,
      isViewed: false,
      qualityScore: 5.0,
      trendingScore: 5.0
    }
    
    // Load existing posts and add new post
    const existingPosts = await initializePosts()
    const updatedPosts = [newPost, ...existingPosts]
    
    // Save to persistent storage
    await savePosts(updatedPosts)
    
    return NextResponse.json({
      success: true,
      post: newPost,
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
