import { NextRequest, NextResponse } from 'next/server'
import { storageService } from '@/lib/storage-service'

/**
 * GET /api/storage/user - Get user storage information
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    const folders = await storageService.getUserFolders(username)
    if (!folders) {
      return NextResponse.json(
        { error: 'User folders not found' },
        { status: 404 }
      )
    }

    const stats = await storageService.getUserStorageStats(username)

    return NextResponse.json({
      success: true,
      data: {
        folders,
        stats
      }
    })
  } catch (error) {
    console.error('Storage API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/storage/user - Create user folders
 */
export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    // Check if folders already exist
    const existingFolders = await storageService.getUserFolders(username)
    if (existingFolders) {
      return NextResponse.json(
        { error: 'User folders already exist' },
        { status: 409 }
      )
    }

    const folders = await storageService.createUserFolders(username)

    return NextResponse.json({
      success: true,
      data: { folders },
      message: 'User folders created successfully'
    })
  } catch (error) {
    console.error('Storage creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create user folders' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/storage/user - Delete user data
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    await storageService.deleteUserData(username)

    return NextResponse.json({
      success: true,
      message: 'User data deleted successfully'
    })
  } catch (error) {
    console.error('Storage deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete user data' },
      { status: 500 }
    )
  }
}

