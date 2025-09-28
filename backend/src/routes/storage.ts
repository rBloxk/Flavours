import { Router, Request, Response } from 'express'
import { supabase } from '../config/database'
import { authMiddleware } from '../middleware/auth'
import { validateRequest } from '../middleware/validation'
import { logger } from '../utils/logger'
import Joi from 'joi'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import AWS from 'aws-sdk'
import sharp from 'sharp'

const router = Router()

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
})

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
    files: 10
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/quicktime',
      'audio/mpeg', 'audio/wav', 'audio/ogg',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type'))
    }
  }
})

// =============================================
// STORAGE MANAGEMENT ENDPOINTS
// =============================================

// Get user storage overview
router.get('/overview', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Get user storage usage
    const { data: storageUsage } = await supabase
      .from('storage_usage')
      .select('*')
      .eq('user_id', req.user.id)
      .single()

    // Get recent files
    const { data: recentFiles } = await supabase
      .from('media')
      .select(`
        id,
        file_url,
        file_type,
        file_size,
        created_at,
        posts (
          id,
          content,
          content_type
        )
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    // Get file type breakdown
    const { data: fileTypes } = await supabase
      .from('media')
      .select('file_type, file_size')
      .eq('user_id', req.user.id)

    const typeBreakdown = fileTypes?.reduce((acc, file) => {
      if (!acc[file.file_type]) {
        acc[file.file_type] = { count: 0, size: 0 }
      }
      acc[file.file_type].count++
      acc[file.file_type].size += file.file_size
      return acc
    }, {} as Record<string, { count: number; size: number }>) || {}

    const defaultUsage = {
      total_size: 0,
      images_size: 0,
      videos_size: 0,
      documents_size: 0,
      storage_limit: 1073741824, // 1GB
      is_premium: false,
      total_files: 0,
      images_count: 0,
      videos_count: 0,
      documents_count: 0
    }

    res.json({
      success: true,
      data: {
        usage: storageUsage || defaultUsage,
        recent_files: recentFiles || [],
        type_breakdown: typeBreakdown,
        storage_percentage: storageUsage ? 
          (storageUsage.total_size / storageUsage.storage_limit) * 100 : 0
      }
    })
  } catch (error) {
    logger.error('Get storage overview error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Upload files
router.post('/upload', authMiddleware, upload.array('files', 10), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[]
    const { folder = 'general', tags = [] } = req.body

    if (!files || files.length === 0) {
      return res.status(400).json({
        error: 'No files provided'
      })
    }

    const uploadedFiles = []

    for (const file of files) {
      try {
        // Generate unique filename
        const fileExtension = file.originalname.split('.').pop()
        const fileName = `${uuidv4()}.${fileExtension}`
        const filePath = `users/${req.user.id}/${folder}/${fileName}`

        // Process file based on type
        let processedFile = file.buffer
        let thumbnailUrl = null

        if (file.mimetype.startsWith('image/')) {
          // Process image
          const processedImage = await sharp(file.buffer)
            .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 85 })
            .toBuffer()

          // Generate thumbnail
          const thumbnail = await sharp(file.buffer)
            .resize(300, 300, { fit: 'cover' })
            .jpeg({ quality: 80 })
            .toBuffer()

          processedFile = processedImage

          // Upload thumbnail
          const thumbnailPath = `users/${req.user.id}/thumbnails/${uuidv4()}.jpg`
          await s3.upload({
            Bucket: process.env.AWS_S3_BUCKET!,
            Key: thumbnailPath,
            Body: thumbnail,
            ContentType: 'image/jpeg'
          }).promise()

          thumbnailUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${thumbnailPath}`
        }

        // Upload file to S3
        const uploadResult = await s3.upload({
          Bucket: process.env.AWS_S3_BUCKET!,
          Key: filePath,
          Body: processedFile,
          ContentType: file.mimetype,
          Metadata: {
            userId: req.user.id,
            originalName: file.originalname,
            tags: Array.isArray(tags) ? tags.join(',') : tags
          }
        }).promise()

        // Get image dimensions if it's an image
        let width = null
        let height = null
        if (file.mimetype.startsWith('image/')) {
          const metadata = await sharp(file.buffer).metadata()
          width = metadata.width
          height = metadata.height
        }

        // Save file info to database
        const { data: mediaRecord } = await supabase
          .from('media')
          .insert({
            user_id: req.user.id,
            file_url: uploadResult.Location,
            file_type: file.mimetype.startsWith('image/') ? 'image' : 
                      file.mimetype.startsWith('video/') ? 'video' : 'document',
            file_size: processedFile.length,
            mime_type: file.mimetype,
            width,
            height,
            thumbnail_url: thumbnailUrl,
            storage_provider: 's3',
            storage_path: filePath,
            processing_status: 'completed'
          })
          .select()
          .single()

        // Update storage usage
        await updateStorageUsage(req.user.id, processedFile.length, mediaRecord.file_type)

        uploadedFiles.push({
          id: mediaRecord.id,
          file_url: uploadResult.Location,
          file_type: mediaRecord.file_type,
          file_size: processedFile.length,
          thumbnail_url: thumbnailUrl,
          width,
          height
        })
      } catch (fileError) {
        logger.error(`Error uploading file ${file.originalname}:`, fileError)
        // Continue with other files
      }
    }

    res.json({
      success: true,
      data: {
        uploaded_files: uploadedFiles,
        total_files: uploadedFiles.length
      },
      message: `${uploadedFiles.length} files uploaded successfully`
    })
  } catch (error) {
    logger.error('Upload files error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Get user files
router.get('/files', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      type = 'all',
      folder = 'all',
      search = '',
      sort = 'recent'
    } = req.query

    const offset = (Number(page) - 1) * Number(limit)

    // Build files query
    let query = supabase
      .from('media')
      .select(`
        *,
        posts (
          id,
          content,
          content_type
        )
      `)
      .eq('user_id', req.user.id)

    // Apply type filter
    if (type !== 'all') {
      query = query.eq('file_type', type)
    }

    // Apply search filter
    if (search) {
      query = query.or(`storage_path.ilike.%${search}%,mime_type.ilike.%${search}%`)
    }

    // Apply sorting
    if (sort === 'size') {
      query = query.order('file_size', { ascending: false })
    } else if (sort === 'name') {
      query = query.order('storage_path', { ascending: true })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    // Apply pagination
    query = query.range(offset, offset + Number(limit) - 1)

    const { data: files, error } = await query

    if (error) {
      throw error
    }

    // Get total count
    const { count: totalCount } = await supabase
      .from('media')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id)

    res.json({
      success: true,
      data: {
        files: files || [],
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalCount || 0,
          pages: Math.ceil((totalCount || 0) / Number(limit))
        }
      }
    })
  } catch (error) {
    logger.error('Get files error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Delete file
router.delete('/files/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // Get file info
    const { data: file } = await supabase
      .from('media')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single()

    if (!file) {
      return res.status(404).json({
        error: 'File not found'
      })
    }

    // Delete from S3
    try {
      await s3.deleteObject({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: file.storage_path
      }).promise()

      // Delete thumbnail if exists
      if (file.thumbnail_url) {
        const thumbnailPath = file.thumbnail_url.split('/').slice(-2).join('/')
        await s3.deleteObject({
          Bucket: process.env.AWS_S3_BUCKET!,
          Key: thumbnailPath
        }).promise()
      }
    } catch (s3Error) {
      logger.error('S3 delete error:', s3Error)
      // Continue with database deletion even if S3 fails
    }

    // Delete from database
    await supabase
      .from('media')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id)

    // Update storage usage
    await updateStorageUsage(req.user.id, -file.file_size, file.file_type)

    res.json({
      success: true,
      message: 'File deleted successfully'
    })
  } catch (error) {
    logger.error('Delete file error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Get file details
router.get('/files/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const { data: file } = await supabase
      .from('media')
      .select(`
        *,
        posts (
          id,
          content,
          content_type,
          created_at
        )
      `)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single()

    if (!file) {
      return res.status(404).json({
        error: 'File not found'
      })
    }

    res.json({
      success: true,
      data: file
    })
  } catch (error) {
    logger.error('Get file details error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Create folder
router.post('/folders', authMiddleware, validateRequest({
  body: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(500).optional(),
    parent_folder: Joi.string().uuid().optional()
  })
}), async (req: Request, res: Response) => {
  try {
    const { name, description, parent_folder } = req.body

    // Create folder record (you might want to add a folders table)
    const folderData = {
      id: uuidv4(),
      user_id: req.user.id,
      name,
      description,
      parent_folder,
      created_at: new Date().toISOString()
    }

    res.json({
      success: true,
      data: folderData,
      message: 'Folder created successfully'
    })
  } catch (error) {
    logger.error('Create folder error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Get storage analytics
router.get('/analytics', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { timeframe = '30d' } = req.query

    // Calculate date range
    const now = new Date()
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365
    const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000))

    // Get file uploads by day
    const { data: uploads } = await supabase
      .from('media')
      .select('created_at, file_size, file_type')
      .eq('user_id', req.user.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    // Calculate daily uploads
    const dailyUploads: Record<string, { count: number; size: number }> = {}
    
    uploads?.forEach(upload => {
      const date = upload.created_at.split('T')[0]
      if (!dailyUploads[date]) {
        dailyUploads[date] = { count: 0, size: 0 }
      }
      dailyUploads[date].count++
      dailyUploads[date].size += upload.file_size
    })

    // Get file type distribution
    const fileTypeDistribution = uploads?.reduce((acc, upload) => {
      if (!acc[upload.file_type]) {
        acc[upload.file_type] = { count: 0, size: 0 }
      }
      acc[upload.file_type].count++
      acc[upload.file_type].size += upload.file_size
      return acc
    }, {} as Record<string, { count: number; size: number }>) || {}

    // Calculate totals
    const totalUploads = uploads?.length || 0
    const totalSize = uploads?.reduce((sum, upload) => sum + upload.file_size, 0) || 0

    res.json({
      success: true,
      data: {
        timeframe,
        overview: {
          total_uploads: totalUploads,
          total_size: totalSize,
          avg_file_size: totalUploads > 0 ? totalSize / totalUploads : 0
        },
        daily_uploads: dailyUploads,
        file_type_distribution: fileTypeDistribution
      }
    })
  } catch (error) {
    logger.error('Get storage analytics error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// Update storage usage helper function
async function updateStorageUsage(userId: string, sizeChange: number, fileType: string) {
  try {
    // Get current usage
    const { data: currentUsage } = await supabase
      .from('storage_usage')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (currentUsage) {
      // Update existing usage
      const updates: any = {
        total_size: currentUsage.total_size + sizeChange,
        total_files: currentUsage.total_files + (sizeChange > 0 ? 1 : -1)
      }

      if (fileType === 'image') {
        updates.images_size = currentUsage.images_size + sizeChange
        updates.images_count = currentUsage.images_count + (sizeChange > 0 ? 1 : -1)
      } else if (fileType === 'video') {
        updates.videos_size = currentUsage.videos_size + sizeChange
        updates.videos_count = currentUsage.videos_count + (sizeChange > 0 ? 1 : -1)
      } else if (fileType === 'document') {
        updates.documents_size = currentUsage.documents_size + sizeChange
        updates.documents_count = currentUsage.documents_count + (sizeChange > 0 ? 1 : -1)
      }

      await supabase
        .from('storage_usage')
        .update(updates)
        .eq('user_id', userId)
    } else {
      // Create new usage record
      const newUsage = {
        user_id: userId,
        total_size: Math.max(0, sizeChange),
        images_size: fileType === 'image' ? Math.max(0, sizeChange) : 0,
        videos_size: fileType === 'video' ? Math.max(0, sizeChange) : 0,
        documents_size: fileType === 'document' ? Math.max(0, sizeChange) : 0,
        total_files: sizeChange > 0 ? 1 : 0,
        images_count: fileType === 'image' && sizeChange > 0 ? 1 : 0,
        videos_count: fileType === 'video' && sizeChange > 0 ? 1 : 0,
        documents_count: fileType === 'document' && sizeChange > 0 ? 1 : 0
      }

      await supabase
        .from('storage_usage')
        .insert(newUsage)
    }
  } catch (error) {
    logger.error('Update storage usage error:', error)
  }
}

export default router
