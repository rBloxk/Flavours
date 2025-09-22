import { promises as fs } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// Storage configuration
const STORAGE_ROOT = process.env.STORAGE_ROOT || './storage'
const USERS_DIR = path.join(STORAGE_ROOT, 'users')

// User folder structure interface
export interface UserFolderStructure {
  username: string
  rootPath: string
  contentPath: string
  activityPath: string
  imagesPath: string
  videosPath: string
  postsPath: string
  paymentsPath?: string
  analyticsPath?: string
}

// Activity log entry interface
export interface ActivityLogEntry {
  id: string
  timestamp: string
  type: 'login' | 'logout' | 'content_upload' | 'content_delete' | 'like' | 'comment' | 'subscription' | 'purchase' | 'interaction'
  details: Record<string, any>
  metadata?: {
    ip?: string
    userAgent?: string
    sessionId?: string
  }
}

// Content file interface
export interface ContentFile {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  path: string
  uploadedAt: string
  metadata?: Record<string, any>
}

class StorageService {
  private initialized = false

  constructor() {
    this.initializeStorage()
  }

  /**
   * Initialize storage directories
   */
  private async initializeStorage(): Promise<void> {
    try {
      await fs.mkdir(STORAGE_ROOT, { recursive: true })
      await fs.mkdir(USERS_DIR, { recursive: true })
      this.initialized = true
      console.log('Storage service initialized successfully')
    } catch (error) {
      console.error('Failed to initialize storage:', error)
      throw new Error('Storage initialization failed')
    }
  }

  /**
   * Create user folder structure
   */
  async createUserFolders(username: string): Promise<UserFolderStructure> {
    if (!this.initialized) {
      await this.initializeStorage()
    }

    const sanitizedUsername = this.sanitizeUsername(username)
    const userRootPath = path.join(USERS_DIR, sanitizedUsername)
    
    const folderStructure: UserFolderStructure = {
      username: sanitizedUsername,
      rootPath: userRootPath,
      contentPath: path.join(userRootPath, 'content'),
      activityPath: path.join(userRootPath, 'activity'),
      imagesPath: path.join(userRootPath, 'content', 'images'),
      videosPath: path.join(userRootPath, 'content', 'videos'),
      postsPath: path.join(userRootPath, 'content', 'posts'),
      paymentsPath: path.join(userRootPath, 'payments'),
      analyticsPath: path.join(userRootPath, 'analytics')
    }

    try {
      // Create all directories
      await fs.mkdir(folderStructure.contentPath, { recursive: true })
      await fs.mkdir(folderStructure.activityPath, { recursive: true })
      await fs.mkdir(folderStructure.imagesPath, { recursive: true })
      await fs.mkdir(folderStructure.videosPath, { recursive: true })
      await fs.mkdir(folderStructure.postsPath, { recursive: true })
      await fs.mkdir(folderStructure.paymentsPath!, { recursive: true })
      await fs.mkdir(folderStructure.analyticsPath!, { recursive: true })

      // Create initial activity log files
      await this.createInitialActivityLogs(folderStructure.activityPath)

      // Create .gitkeep files to ensure directories are tracked
      await this.createGitkeepFiles(folderStructure)

      console.log(`User folders created for ${sanitizedUsername}`)
      return folderStructure
    } catch (error) {
      console.error(`Failed to create user folders for ${sanitizedUsername}:`, error)
      throw new Error('User folder creation failed')
    }
  }

  /**
   * Sanitize username for filesystem safety
   */
  private sanitizeUsername(username: string): string {
    return username
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/^[^a-zA-Z]/, 'user_')
      .toLowerCase()
  }

  /**
   * Create initial activity log files
   */
  private async createInitialActivityLogs(activityPath: string): Promise<void> {
    const initialLogs = {
      logins: [],
      interactions: [],
      subscriptions: [],
      content_uploads: [],
      payments: []
    }

    for (const [filename, data] of Object.entries(initialLogs)) {
      const filePath = path.join(activityPath, `${filename}.json`)
      await fs.writeFile(filePath, JSON.stringify(data, null, 2))
    }
  }

  /**
   * Create .gitkeep files to ensure directories are tracked
   */
  private async createGitkeepFiles(structure: UserFolderStructure): Promise<void> {
    const directories = [
      structure.contentPath,
      structure.activityPath,
      structure.imagesPath,
      structure.videosPath,
      structure.postsPath,
      structure.paymentsPath!,
      structure.analyticsPath!
    ]

    for (const dir of directories) {
      const gitkeepPath = path.join(dir, '.gitkeep')
      await fs.writeFile(gitkeepPath, '# This file ensures the directory is tracked by git\n')
    }
  }

  /**
   * Get user folder structure
   */
  async getUserFolders(username: string): Promise<UserFolderStructure | null> {
    const sanitizedUsername = this.sanitizeUsername(username)
    const userRootPath = path.join(USERS_DIR, sanitizedUsername)

    try {
      await fs.access(userRootPath)
      
      return {
        username: sanitizedUsername,
        rootPath: userRootPath,
        contentPath: path.join(userRootPath, 'content'),
        activityPath: path.join(userRootPath, 'activity'),
        imagesPath: path.join(userRootPath, 'content', 'images'),
        videosPath: path.join(userRootPath, 'content', 'videos'),
        postsPath: path.join(userRootPath, 'content', 'posts'),
        paymentsPath: path.join(userRootPath, 'payments'),
        analyticsPath: path.join(userRootPath, 'analytics')
      }
    } catch (error) {
      return null
    }
  }

  /**
   * Log user activity
   */
  async logActivity(
    username: string, 
    type: ActivityLogEntry['type'], 
    details: Record<string, any>,
    metadata?: ActivityLogEntry['metadata']
  ): Promise<void> {
    const folders = await this.getUserFolders(username)
    if (!folders) {
      throw new Error('User folders not found')
    }

    const logEntry: ActivityLogEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      type,
      details,
      metadata
    }

    // Determine which log file to update
    let logFile = 'interactions.json'
    switch (type) {
      case 'login':
      case 'logout':
        logFile = 'logins.json'
        break
      case 'subscription':
        logFile = 'subscriptions.json'
        break
      case 'content_upload':
        logFile = 'content_uploads.json'
        break
      case 'purchase':
        logFile = 'payments.json'
        break
      default:
        logFile = 'interactions.json'
    }

    const logPath = path.join(folders.activityPath, logFile)
    
    try {
      const existingLogs = await fs.readFile(logPath, 'utf-8')
      const logs = JSON.parse(existingLogs)
      logs.push(logEntry)
      
      // Keep only last 1000 entries to prevent file bloat
      if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000)
      }
      
      await fs.writeFile(logPath, JSON.stringify(logs, null, 2))
    } catch (error) {
      console.error('Failed to log activity:', error)
      throw new Error('Activity logging failed')
    }
  }

  /**
   * Store content file
   */
  async storeContent(
    username: string,
    file: Buffer,
    originalName: string,
    mimeType: string,
    contentType: 'image' | 'video' | 'post'
  ): Promise<ContentFile> {
    const folders = await this.getUserFolders(username)
    if (!folders) {
      throw new Error('User folders not found')
    }

    const fileId = uuidv4()
    const extension = path.extname(originalName)
    const filename = `${fileId}${extension}`
    
    let targetPath: string
    switch (contentType) {
      case 'image':
        targetPath = path.join(folders.imagesPath, filename)
        break
      case 'video':
        targetPath = path.join(folders.videosPath, filename)
        break
      case 'post':
        targetPath = path.join(folders.postsPath, filename)
        break
      default:
        throw new Error('Invalid content type')
    }

    try {
      await fs.writeFile(targetPath, file)
      
      const contentFile: ContentFile = {
        id: fileId,
        filename,
        originalName,
        mimeType,
        size: file.length,
        path: targetPath,
        uploadedAt: new Date().toISOString()
      }

      // Log the content upload
      await this.logActivity(username, 'content_upload', {
        fileId,
        originalName,
        mimeType,
        size: file.length,
        contentType
      })

      return contentFile
    } catch (error) {
      console.error('Failed to store content:', error)
      throw new Error('Content storage failed')
    }
  }

  /**
   * Get user activity logs
   */
  async getActivityLogs(username: string, logType?: string): Promise<ActivityLogEntry[]> {
    const folders = await this.getUserFolders(username)
    if (!folders) {
      // Return empty array instead of throwing error for better UX
      return []
    }

    const logFiles = logType ? [`${logType}.json`] : [
      'logins.json',
      'interactions.json',
      'subscriptions.json',
      'content_uploads.json',
      'payments.json'
    ]

    const allLogs: ActivityLogEntry[] = []

    for (const logFile of logFiles) {
      try {
        const logPath = path.join(folders.activityPath, logFile)
        const logData = await fs.readFile(logPath, 'utf-8')
        const logs = JSON.parse(logData)
        allLogs.push(...logs)
      } catch (error) {
        // Log file might not exist yet, continue
        console.warn(`Log file ${logFile} not found for user ${username}`)
      }
    }

    // Sort by timestamp (newest first)
    return allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  /**
   * Get user content files
   */
  async getContentFiles(username: string, contentType?: 'image' | 'video' | 'post'): Promise<ContentFile[]> {
    const folders = await this.getUserFolders(username)
    if (!folders) {
      // Return empty array instead of throwing error for better UX
      return []
    }

    const contentPaths = contentType ? [folders[`${contentType}sPath`]] : [
      folders.imagesPath,
      folders.videosPath,
      folders.postsPath
    ]

    const allFiles: ContentFile[] = []

    for (const contentPath of contentPaths) {
      try {
        const files = await fs.readdir(contentPath)
        for (const file of files) {
          if (file === '.gitkeep') continue
          
          const filePath = path.join(contentPath, file)
          const stats = await fs.stat(filePath)
          
          allFiles.push({
            id: path.parse(file).name,
            filename: file,
            originalName: file, // In a real implementation, you'd store this metadata
            mimeType: 'application/octet-stream', // You'd determine this from file extension
            size: stats.size,
            path: filePath,
            uploadedAt: stats.birthtime.toISOString()
          })
        }
      } catch (error) {
        console.warn(`Failed to read content directory ${contentPath}:`, error)
      }
    }

    return allFiles.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
  }

  /**
   * Delete user content
   */
  async deleteContent(username: string, fileId: string): Promise<void> {
    const folders = await this.getUserFolders(username)
    if (!folders) {
      throw new Error('User folders not found')
    }

    const contentFiles = await this.getContentFiles(username)
    const fileToDelete = contentFiles.find(file => file.id === fileId)
    
    if (!fileToDelete) {
      throw new Error('Content file not found')
    }

    try {
      await fs.unlink(fileToDelete.path)
      
      // Log the deletion
      await this.logActivity(username, 'content_delete', {
        fileId,
        filename: fileToDelete.filename,
        originalName: fileToDelete.originalName
      })
    } catch (error) {
      console.error('Failed to delete content:', error)
      throw new Error('Content deletion failed')
    }
  }

  /**
   * Get storage statistics for a user
   */
  async getUserStorageStats(username: string): Promise<{
    totalFiles: number
    totalSize: number
    contentBreakdown: {
      images: number
      videos: number
      posts: number
    }
    activityLogs: number
  }> {
    const folders = await this.getUserFolders(username)
    if (!folders) {
      // Return default stats instead of throwing error for better UX
      return {
        totalFiles: 0,
        totalSize: 0,
        contentBreakdown: {
          images: 0,
          videos: 0,
          posts: 0
        },
        activityLogs: 0
      }
    }

    const contentFiles = await this.getContentFiles(username)
    const activityLogs = await this.getActivityLogs(username)

    const stats = {
      totalFiles: contentFiles.length,
      totalSize: contentFiles.reduce((sum, file) => sum + file.size, 0),
      contentBreakdown: {
        images: contentFiles.filter(f => f.path.includes('images')).length,
        videos: contentFiles.filter(f => f.path.includes('videos')).length,
        posts: contentFiles.filter(f => f.path.includes('posts')).length
      },
      activityLogs: activityLogs.length
    }

    return stats
  }

  /**
   * Clean up user data (for account deletion)
   */
  async deleteUserData(username: string): Promise<void> {
    const sanitizedUsername = this.sanitizeUsername(username)
    const userRootPath = path.join(USERS_DIR, sanitizedUsername)

    try {
      await fs.rm(userRootPath, { recursive: true, force: true })
      console.log(`User data deleted for ${sanitizedUsername}`)
    } catch (error) {
      console.error(`Failed to delete user data for ${sanitizedUsername}:`, error)
      throw new Error('User data deletion failed')
    }
  }
}

// Export singleton instance
export const storageService = new StorageService()
export default storageService
