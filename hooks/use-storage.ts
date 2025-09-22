"use client"

import { useState, useCallback } from 'react'
import { useAuth } from '@/components/providers/auth-provider'

interface StorageStats {
  totalFiles: number
  totalSize: number
  contentBreakdown: {
    images: number
    videos: number
    posts: number
  }
  activityLogs: number
}

interface ContentFile {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  path: string
  uploadedAt: string
  metadata?: Record<string, any>
}

interface ActivityLogEntry {
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

export function useStorage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleError = (err: any, operation: string) => {
    console.error(`Storage ${operation} error:`, err)
    setError(`Failed to ${operation}`)
  }

  const clearError = () => setError(null)

  // Get user storage statistics
  const getStorageStats = useCallback(async (): Promise<StorageStats | null> => {
    if (!user) return null

    setLoading(true)
    clearError()

    try {
      const response = await fetch(`/api/storage/user?username=${encodeURIComponent(user.username)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get storage stats')
      }

      return data.data.stats
    } catch (err) {
      handleError(err, 'get storage stats')
      return null
    } finally {
      setLoading(false)
    }
  }, [user])

  // Get user content files
  const getContentFiles = useCallback(async (contentType?: 'image' | 'video' | 'post'): Promise<ContentFile[]> => {
    if (!user) return []

    setLoading(true)
    clearError()

    try {
      const params = new URLSearchParams({ username: user.username })
      if (contentType) params.append('type', contentType)

      const response = await fetch(`/api/storage/content?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get content files')
      }

      return data.data.files
    } catch (err) {
      handleError(err, 'get content files')
      return []
    } finally {
      setLoading(false)
    }
  }, [user])

  // Upload content file
  const uploadContent = useCallback(async (
    file: File,
    contentType: 'image' | 'video' | 'post'
  ): Promise<ContentFile | null> => {
    if (!user) return null

    setLoading(true)
    clearError()

    try {
      const formData = new FormData()
      formData.append('username', user.username)
      formData.append('contentType', contentType)
      formData.append('file', file)

      const response = await fetch('/api/storage/content', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload content')
      }

      return data.data.file
    } catch (err) {
      handleError(err, 'upload content')
      return null
    } finally {
      setLoading(false)
    }
  }, [user])

  // Delete content file
  const deleteContent = useCallback(async (fileId: string): Promise<boolean> => {
    if (!user) return false

    setLoading(true)
    clearError()

    try {
      const params = new URLSearchParams({
        username: user.username,
        fileId
      })

      const response = await fetch(`/api/storage/content?${params}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete content')
      }

      return true
    } catch (err) {
      handleError(err, 'delete content')
      return false
    } finally {
      setLoading(false)
    }
  }, [user])

  // Get activity logs
  const getActivityLogs = useCallback(async (
    logType?: string,
    limit?: number
  ): Promise<ActivityLogEntry[]> => {
    if (!user) return []

    setLoading(true)
    clearError()

    try {
      const params = new URLSearchParams({ username: user.username })
      if (logType) params.append('type', logType)
      if (limit) params.append('limit', limit.toString())

      const response = await fetch(`/api/storage/activity?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get activity logs')
      }

      return data.data.logs
    } catch (err) {
      handleError(err, 'get activity logs')
      return []
    } finally {
      setLoading(false)
    }
  }, [user])

  // Log activity
  const logActivity = useCallback(async (
    type: ActivityLogEntry['type'],
    details: Record<string, any>,
    metadata?: ActivityLogEntry['metadata']
  ): Promise<boolean> => {
    if (!user) return false

    try {
      const response = await fetch('/api/storage/activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: user.username,
          type,
          details,
          metadata
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to log activity')
      }

      return true
    } catch (err) {
      handleError(err, 'log activity')
      return false
    }
  }, [user])

  // Format file size for display
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }, [])

  // Get file type from mime type
  const getFileType = useCallback((mimeType: string): string => {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    if (mimeType.startsWith('audio/')) return 'audio'
    if (mimeType.includes('pdf')) return 'pdf'
    if (mimeType.includes('text/')) return 'text'
    return 'file'
  }, [])

  return {
    loading,
    error,
    clearError,
    getStorageStats,
    getContentFiles,
    uploadContent,
    deleteContent,
    getActivityLogs,
    logActivity,
    formatFileSize,
    getFileType
  }
}

