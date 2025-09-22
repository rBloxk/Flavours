import { NextRequest, NextResponse } from 'next/server'
import { storageService } from '@/lib/storage-service'

/**
 * GET /api/storage/content - Get user content files
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')
    const contentType = searchParams.get('type') as 'image' | 'video' | 'post' | undefined

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    const contentFiles = await storageService.getContentFiles(username, contentType)

    return NextResponse.json({
      success: true,
      data: { files: contentFiles }
    })
  } catch (error) {
    console.error('Content retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve content' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/storage/content - Upload content file
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const username = formData.get('username') as string
    const contentType = formData.get('contentType') as 'image' | 'video' | 'post'
    const file = formData.get('file') as File

    if (!username || !contentType || !file) {
      return NextResponse.json(
        { error: 'Username, contentType, and file are required' },
        { status: 400 }
      )
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 413 }
      )
    }

    // Validate content type
    const allowedTypes = {
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      video: ['video/mp4', 'video/webm', 'video/quicktime'],
      post: ['text/plain', 'application/json']
    }

    if (!allowedTypes[contentType].includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type for ${contentType}` },
        { status: 400 }
      )
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const contentFile = await storageService.storeContent(
      username,
      fileBuffer,
      file.name,
      file.type,
      contentType
    )

    return NextResponse.json({
      success: true,
      data: { file: contentFile },
      message: 'Content uploaded successfully'
    })
  } catch (error) {
    console.error('Content upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload content' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/storage/content - Delete content file
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')
    const fileId = searchParams.get('fileId')

    if (!username || !fileId) {
      return NextResponse.json(
        { error: 'Username and fileId are required' },
        { status: 400 }
      )
    }

    await storageService.deleteContent(username, fileId)

    return NextResponse.json({
      success: true,
      message: 'Content deleted successfully'
    })
  } catch (error) {
    console.error('Content deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete content' },
      { status: 500 }
    )
  }
}

