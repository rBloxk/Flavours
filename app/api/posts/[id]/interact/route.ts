import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// File path for persistent storage
const INTERACTIONS_FILE = join(process.cwd(), 'data', 'interactions.json')

// Initialize interactions data
async function initializeInteractions() {
  try {
    // Create data directory if it doesn't exist
    const dataDir = join(process.cwd(), 'data')
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true })
    }

    // Check if interactions file exists
    if (existsSync(INTERACTIONS_FILE)) {
      const data = await readFile(INTERACTIONS_FILE, 'utf-8')
      return JSON.parse(data)
    } else {
      // Create initial interactions file
      const initialInteractions = {}
      await writeFile(INTERACTIONS_FILE, JSON.stringify(initialInteractions, null, 2))
      return initialInteractions
    }
  } catch (error) {
    console.error('Error initializing interactions:', error)
    return {}
  }
}

// Save interactions to file
async function saveInteractions(interactions: any) {
  try {
    await writeFile(INTERACTIONS_FILE, JSON.stringify(interactions, null, 2))
  } catch (error) {
    console.error('Error saving interactions:', error)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id
    const { action, userId = 'current_user' } = await request.json()
    
    // Load existing interactions
    const postInteractions = await initializeInteractions()
    
    if (!postInteractions[postId]) {
      postInteractions[postId] = {
        likes: [],
        bookmarks: [],
        views: []
      }
    }
    
    const interactions = postInteractions[postId]
    let updated = false
    
    switch (action) {
      case 'like':
        if (interactions.likes.includes(userId)) {
          interactions.likes = interactions.likes.filter(id => id !== userId)
        } else {
          interactions.likes.push(userId)
        }
        updated = true
        break
        
      case 'bookmark':
        if (interactions.bookmarks.includes(userId)) {
          interactions.bookmarks = interactions.bookmarks.filter(id => id !== userId)
        } else {
          interactions.bookmarks.push(userId)
        }
        updated = true
        break
        
      case 'view':
        if (!interactions.views.includes(userId)) {
          interactions.views.push(userId)
          updated = true
        }
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
    
    // Save updated interactions
    await saveInteractions(postInteractions)
    
    return NextResponse.json({
      success: true,
      action,
      updated,
      counts: {
        likes: interactions.likes.length,
        bookmarks: interactions.bookmarks.length,
        views: interactions.views.length
      },
      userInteractions: {
        isLiked: interactions.likes.includes(userId),
        isBookmarked: interactions.bookmarks.includes(userId),
        isViewed: interactions.views.includes(userId)
      }
    })
    
  } catch (error) {
    console.error('Error handling post interaction:', error)
    return NextResponse.json(
      { error: 'Failed to process interaction' },
      { status: 500 }
    )
  }
}
