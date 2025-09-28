"use client"

import { useState, useEffect } from 'react'
import { useStorage } from '@/hooks/use-storage'
import { useAuth } from '@/components/providers/auth-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  Download, 
  Trash2, 
  FileImage, 
  FileVideo, 
  FileText, 
  Activity,
  HardDrive,
  Calendar,
  User
} from 'lucide-react'

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
}

export function StorageDashboard() {
  const { user } = useAuth()
  const {
    loading,
    error,
    clearError,
    getStorageStats,
    getContentFiles,
    uploadContent,
    deleteContent,
    getActivityLogs,
    formatFileSize,
    getFileType
  } = useStorage()

  const [stats, setStats] = useState<StorageStats | null>(null)
  const [recentFiles, setRecentFiles] = useState<ContentFile[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadType, setUploadType] = useState<'image' | 'video' | 'post'>('image')

  useEffect(() => {
    if (user) {
      loadStorageData()
    }
  }, [user])

  const loadStorageData = async () => {
    const [statsData, filesData, activityData] = await Promise.all([
      getStorageStats(),
      getContentFiles(),
      getActivityLogs(undefined, 10)
    ])

    setStats(statsData)
    setRecentFiles(filesData.slice(0, 10))
    setRecentActivity(activityData)
  }

  const handleFileUpload = async () => {
    if (!selectedFile) return

    const uploadedFile = await uploadContent(selectedFile, uploadType)
    if (uploadedFile) {
      setSelectedFile(null)
      loadStorageData() // Refresh data
    }
  }

  const handleFileDelete = async (fileId: string) => {
    const success = await deleteContent(fileId)
    if (success) {
      loadStorageData() // Refresh data
    }
  }

  const getFileIcon = (mimeType: string) => {
    const type = getFileType(mimeType)
    switch (type) {
      case 'image':
        return <FileImage className="h-4 w-4" />
      case 'video':
        return <FileVideo className="h-4 w-4" />
      case 'text':
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <User className="h-4 w-4 text-green-500" />
      case 'content_upload':
        return <Upload className="h-4 w-4 text-blue-500" />
      case 'content_delete':
        return <Trash2 className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
          <p className="text-muted-foreground">Please log in to access your storage dashboard.</p>
        </div>
      </div>
    )
  }

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-red-800">{error}</p>
            <Button variant="outline" size="sm" onClick={clearError}>
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Storage Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalFiles || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.contentBreakdown.images || 0} images, {stats?.contentBreakdown.videos || 0} videos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFileSize(stats?.totalSize || 0)}</div>
            <Progress value={Math.min((stats?.totalSize || 0) / (100 * 1024 * 1024) * 100, 100)} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activity Logs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activityLogs || 0}</div>
            <p className="text-xs text-muted-foreground">Total logged activities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.contentBreakdown.posts || 0}</div>
            <p className="text-xs text-muted-foreground">Text content files</p>
          </CardContent>
        </Card>
      </div>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Content Type</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                variant={uploadType === 'image' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUploadType('image')}
                className="flex flex-col items-center space-y-2 h-auto py-4 hover:scale-105 transition-transform"
              >
                <FileImage className="h-5 w-5" />
                <span className="text-xs">Image</span>
              </Button>
              <Button
                variant={uploadType === 'video' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUploadType('video')}
                className="flex flex-col items-center space-y-2 h-auto py-4 hover:scale-105 transition-transform"
              >
                <FileVideo className="h-5 w-5" />
                <span className="text-xs">Video</span>
              </Button>
              <Button
                variant={uploadType === 'post' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUploadType('post')}
                className="flex flex-col items-center space-y-2 h-auto py-4 hover:scale-105 transition-transform"
              >
                <FileText className="h-5 w-5" />
                <span className="text-xs">Post</span>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Custom File Input */}
            <div className="relative">
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept={
                  uploadType === 'image' ? 'image/*' :
                  uploadType === 'video' ? 'video/*' :
                  'text/*,.json'
                }
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center w-full h-24 sm:h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all duration-200 group"
              >
                <div className="flex flex-col items-center space-y-2 text-center">
                  <div className="p-3 rounded-full bg-muted/50 group-hover:bg-primary/10 transition-colors">
                    <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {selectedFile ? selectedFile.name : 'Click to choose file'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {uploadType === 'image' ? 'PNG, JPG, GIF up to 50MB' :
                       uploadType === 'video' ? 'MP4, WebM up to 50MB' :
                       'TXT, JSON files up to 50MB'}
                    </p>
                  </div>
                </div>
              </label>
            </div>

            {/* File Info */}
            {selectedFile && (
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getFileIcon(selectedFile.type)}
                  <div>
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(selectedFile.size)} • {getFileType(selectedFile.type)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Upload Button */}
            <div className="flex justify-end">
              <Button 
                onClick={handleFileUpload} 
                disabled={!selectedFile || loading}
                className="flex items-center space-x-2 min-w-[120px]"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>Upload</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Files */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentFiles.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No files uploaded yet</p>
            ) : (
              recentFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(file.mimeType)}
                    <div>
                      <p className="font-medium">{file.originalName}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{getFileType(file.mimeType)}</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFileDelete(file.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentActivity.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No recent activity</p>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1">
                    <p className="font-medium capitalize">{activity.type.replace('_', ' ')}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="outline">{activity.type}</Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
