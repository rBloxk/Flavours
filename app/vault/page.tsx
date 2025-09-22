"use client"

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { 
  Image, 
  Plus, 
  Download, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  MoreVertical, 
  Upload, 
  File, 
  Video, 
  Music, 
  FileText, 
  Archive, 
  Folder, 
  FolderOpen, 
  Grid, 
  List, 
  Calendar, 
  Clock, 
  HardDrive, 
  Cloud, 
  CloudUpload, 
  CloudDownload, 
  Share, 
  Copy, 
  Edit, 
  Move, 
  Star, 
  Heart, 
  Bookmark, 
  Tag, 
  Tags, 
  Lock, 
  Unlock, 
  EyeOff, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info, 
  RefreshCw, 
  RotateCcw, 
  Save, 
  SaveAll, 
  FolderPlus, 
  FolderMinus, 
  FolderX, 
  FolderCheck, 
  FolderEdit, 
  FolderSearch, 
  FolderHeart, 
  FolderLock, 
  FolderUp, 
  FolderDown, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Crop, 
  Scissors, 
  Palette, 
  Settings, 
  Wrench, 
  Cog, 
  Sliders, 
  BarChart3, 
  PieChart, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Check, 
  Minus, 
  Zap, 
  Sparkles, 
  Target, 
  Globe, 
  ExternalLink, 
  HelpCircle, 
  AlertCircle, 
  Loader2, 
  Loader, 
  Circle, 
  Square, 
  Triangle, 
  Hexagon, 
  Octagon, 
  Pentagon, 
  Diamond, 
  Moon, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  Wind, 
  Droplets, 
  Flame, 
  Mountain, 
  Trees, 
  Leaf, 
  Flower, 
  Bug, 
  Fish, 
  Bird, 
  Cat, 
  Dog, 
  Rabbit, 
  Mouse, 
  Squirrel, 
} from 'lucide-react'

export default function VaultPage() {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // State management
  const [vaultItems, setVaultItems] = useState([
    {
      id: 1,
      name: 'Workout Video 1',
      type: 'video',
      size: 45200000, // bytes
      sizeString: '45.2 MB',
      uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      uploadedAtString: '2 days ago',
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
      url: 'https://example.com/video1.mp4',
      duration: '5:32',
      resolution: '1920x1080',
      format: 'MP4',
      isPublic: true,
      isStarred: false,
      tags: ['fitness', 'workout', 'motivation'],
      views: 1250,
      downloads: 89,
      folder: 'Fitness',
      description: 'Morning workout routine video',
      isProcessing: false,
      processingProgress: 100
    },
    {
      id: 2,
      name: 'Art Process Photo',
      type: 'image',
      size: 12800000,
      sizeString: '12.8 MB',
      uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      uploadedAtString: '1 week ago',
      thumbnail: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
      url: 'https://example.com/image1.jpg',
      duration: null,
      resolution: '2048x1536',
      format: 'JPEG',
      isPublic: true,
      isStarred: true,
      tags: ['art', 'creativity', 'process'],
      views: 890,
      downloads: 67,
      folder: 'Art',
      description: 'Behind the scenes of my latest artwork',
      isProcessing: false,
      processingProgress: 100
    },
    {
      id: 3,
      name: 'Cooking Tutorial',
      type: 'video',
      size: 78500000,
      sizeString: '78.5 MB',
      uploadedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      uploadedAtString: '2 weeks ago',
      thumbnail: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
      url: 'https://example.com/video2.mp4',
      duration: '12:45',
      resolution: '1920x1080',
      format: 'MP4',
      isPublic: false,
      isStarred: false,
      tags: ['cooking', 'tutorial', 'food'],
      views: 2100,
      downloads: 156,
      folder: 'Food',
      description: 'Step-by-step pasta making tutorial',
      isProcessing: false,
      processingProgress: 100
    }
  ])
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filterBy, setFilterBy] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [uploadingFiles, setUploadingFiles] = useState<any[]>([])
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<any>(null)
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false)
  const [removeDuplicatesDialogOpen, setRemoveDuplicatesDialogOpen] = useState(false)

  // Load persisted files on component mount
  useEffect(() => {
    const loadPersistedFiles = () => {
      try {
        const persistedFiles = localStorage.getItem('vaultFiles')
        if (persistedFiles) {
          const files = JSON.parse(persistedFiles)
          
          // Remove duplicates from localStorage first
          const uniqueFiles = files.filter((file: any, index: number, arr: any[]) => 
            arr.findIndex(f => f.name === file.name && f.size === file.size) === index
          )
          
          // Update localStorage with deduplicated files
          if (uniqueFiles.length !== files.length) {
            localStorage.setItem('vaultFiles', JSON.stringify(uniqueFiles))
            console.log('Removed duplicates from localStorage')
          }
          
          setVaultItems(prev => {
            // Merge with existing files, avoiding duplicates by ID
            const existingIds = new Set(prev.map(f => f.id))
            const newFiles = uniqueFiles.filter((f: any) => !existingIds.has(f.id))
            return [...prev, ...newFiles]
          })
        }
      } catch (error) {
        console.error('Failed to load persisted files:', error)
      }
    }

    loadPersistedFiles()
  }, [])

  // Interactive functions
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    files.forEach(file => {
      const newItem = {
        id: Date.now() + Math.random() * 1000, // Generate unique ID
        name: file.name,
        type: file.type.startsWith('video/') ? 'video' : 
              file.type.startsWith('audio/') ? 'audio' : 
              file.type.startsWith('image/') ? 'image' : 'file',
        size: file.size,
        sizeString: formatFileSize(file.size),
        uploadedAt: new Date(),
        uploadedAtString: 'now',
        thumbnail: file.type.startsWith('image/') ? URL.createObjectURL(file) : 
                   file.type.startsWith('video/') ? 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop' :
                   file.type.startsWith('audio/') ? 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop' :
                   'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
        url: URL.createObjectURL(file),
        duration: null,
        resolution: null,
        format: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
        isPublic: true,
        isStarred: false,
        tags: [],
        views: 0,
        downloads: 0,
        folder: 'Uploads',
        description: '',
        isProcessing: true,
        processingProgress: 0
      }

      setUploadingFiles(prev => [...prev, newItem])
      
      // Simulate upload progress
      simulateUpload(newItem.id)
    })

    toast({
      title: "Files uploaded",
      description: `${files.length} file(s) are being processed.`,
    })

    // Clear the file input to prevent re-uploading the same files
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const simulateUpload = async (id: number) => {
    let progress = 0
    const interval = setInterval(async () => {
      progress += Math.random() * 20
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        
        // Move from uploading to vault items and persist to backend
        setUploadingFiles(prev => {
          const item = prev.find(f => f.id === id)
          if (item) {
            const completedItem = { ...item, isProcessing: false, processingProgress: 100 }
            
            // Add to vault items
            setVaultItems(prevItems => [...prevItems, completedItem])
            
            // Persist to backend (simulate API call)
            persistFileToBackend(completedItem)
            
            return prev.filter(f => f.id !== id)
          }
          return prev
        })
        
        toast({
          title: "Upload complete",
          description: "File has been successfully uploaded.",
        })
      } else {
        setUploadingFiles(prev => 
          prev.map(f => f.id === id ? { ...f, processingProgress: progress } : f)
        )
      }
    }, 500)
  }

  const persistFileToBackend = async (item: any) => {
    try {
      // Simulate API call to persist file
      // In a real implementation, this would call your backend API
      console.log('Persisting file to backend:', item.name)
      
      // For now, we'll store in localStorage as a fallback
      const existingFiles = JSON.parse(localStorage.getItem('vaultFiles') || '[]')
      
      // Check for duplicates before adding
      const isDuplicate = existingFiles.some((existingFile: any) => 
        existingFile.name === item.name && 
        existingFile.size === item.size &&
        Math.abs(new Date(existingFile.uploadedAt).getTime() - new Date(item.uploadedAt).getTime()) < 1000 // Within 1 second
      )
      
      if (!isDuplicate) {
        existingFiles.push(item)
        localStorage.setItem('vaultFiles', JSON.stringify(existingFiles))
        console.log('File persisted successfully:', item.name)
      } else {
        console.log('Duplicate file detected, skipping persistence:', item.name)
      }
    } catch (error) {
      console.error('Failed to persist file:', error)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const confirmDelete = (id: number) => {
    const item = vaultItems.find(i => i.id === id)
    if (item) {
      setFileToDelete(item)
      setDeleteDialogOpen(true)
    }
  }

  const deleteItem = () => {
    if (!fileToDelete) return

    setVaultItems(prev => prev.filter(i => i.id !== fileToDelete.id))
    
    // Remove from localStorage as well
    try {
      const persistedFiles = JSON.parse(localStorage.getItem('vaultFiles') || '[]')
      const updatedFiles = persistedFiles.filter((f: any) => f.id !== fileToDelete.id)
      localStorage.setItem('vaultFiles', JSON.stringify(updatedFiles))
    } catch (error) {
      console.error('Failed to remove file from localStorage:', error)
    }
    
    toast({
      title: "File deleted",
      description: `"${fileToDelete.name}" has been deleted.`,
    })

    // Close dialog and reset state
    setDeleteDialogOpen(false)
    setFileToDelete(null)
  }

  const cancelDelete = () => {
    setDeleteDialogOpen(false)
    setFileToDelete(null)
  }

  const downloadItem = (id: number) => {
    const item = vaultItems.find(i => i.id === id)
    if (!item) return

    // Simulate download
    const link = document.createElement('a')
    link.href = item.url
    link.download = item.name
    link.click()
    
    // Update download count
    setVaultItems(prev => 
      prev.map(i => 
        i.id === id 
          ? { ...i, downloads: i.downloads + 1 }
          : i
      )
    )
    
    toast({
      title: "Download started",
      description: `"${item.name}" is being downloaded.`,
    })
  }

  const confirmClearAll = () => {
    setClearAllDialogOpen(true)
  }

  const clearAllFiles = () => {
    setVaultItems([])
    setUploadingFiles([])
    localStorage.removeItem('vaultFiles')
    
    toast({
      title: "All files cleared",
      description: "All uploaded files have been removed.",
    })
    
    setClearAllDialogOpen(false)
  }

  const cancelClearAll = () => {
    setClearAllDialogOpen(false)
  }

  const confirmRemoveDuplicates = () => {
    setRemoveDuplicatesDialogOpen(true)
  }

  const removeDuplicates = () => {
    setVaultItems(prev => {
      // Remove duplicates based on name and size
      const uniqueItems = prev.filter((item, index, arr) => 
        arr.findIndex(i => i.name === item.name && i.size === item.size) === index
      )
      
      // Update localStorage
      localStorage.setItem('vaultFiles', JSON.stringify(uniqueItems))
      
      const removedCount = prev.length - uniqueItems.length
      if (removedCount > 0) {
        toast({
          title: "Duplicates removed",
          description: `${removedCount} duplicate file(s) have been removed.`,
        })
      } else {
        toast({
          title: "No duplicates found",
          description: "All files are unique.",
        })
      }
      
      setRemoveDuplicatesDialogOpen(false)
      return uniqueItems
    })
  }

  const cancelRemoveDuplicates = () => {
    setRemoveDuplicatesDialogOpen(false)
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-8 w-8 text-white" />
      case 'audio':
        return <Music className="h-8 w-8 text-white" />
      case 'image':
        return <Image className="h-8 w-8 text-white" />
      default:
        return <File className="h-8 w-8 text-white" />
    }
  }

  const totalItems = vaultItems.length
  const totalSize = vaultItems.reduce((sum, item) => sum + item.size, 0)
  const totalViews = vaultItems.reduce((sum, item) => sum + item.views, 0)
  const totalDownloads = vaultItems.reduce((sum, item) => sum + item.downloads, 0)

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-4 lg:py-6 space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Vault</h1>
            <p className="text-sm lg:text-base text-muted-foreground">
              {totalItems} files • {formatFileSize(totalSize)} • {totalViews.toLocaleString()} views
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Media
            </Button>
            {vaultItems.length > 0 && (
              <>
                <Button 
                  variant="outline" 
                  onClick={confirmRemoveDuplicates}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Remove Duplicates
                </Button>
                <Button 
                  variant="outline" 
                  onClick={confirmClearAll}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{totalItems}</div>
              <div className="text-sm text-muted-foreground">Total Files</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{formatFileSize(totalSize)}</div>
              <div className="text-sm text-muted-foreground">Total Size</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{totalViews}</div>
              <div className="text-sm text-muted-foreground">Total Views</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{totalDownloads}</div>
              <div className="text-sm text-muted-foreground">Downloads</div>
            </CardContent>
          </Card>
        </div>

        {/* Uploading Files */}
        {uploadingFiles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CloudUpload className="h-5 w-5" />
                Uploading Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {uploadingFiles.map((file) => (
                  <div key={file.id} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
                      {getFileIcon(file.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{file.name}</span>
                        <span className="text-xs text-muted-foreground">{file.sizeString}</span>
                      </div>
                      <Progress value={file.processingProgress} className="mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Files Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {vaultItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow group">
              <CardHeader className="pb-3">
                <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg flex items-center justify-center mb-3 relative overflow-hidden">
                  <img 
                    src={item.thumbnail} 
                    alt={item.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                  />
                  <div className="relative z-10 flex items-center space-x-2">
                    {getFileIcon(item.type)}
                    {item.isStarred && <Star className="h-6 w-6 text-yellow-300" />}
                  </div>
                  <div className="absolute top-2 right-2 flex space-x-1">
                    {!item.isPublic && <Lock className="h-4 w-4 text-white" />}
                    {item.isProcessing && <Loader2 className="h-4 w-4 text-white animate-spin" />}
                  </div>
                </div>
                <CardTitle className="flex items-center justify-between text-lg">
                  <span className="truncate">{item.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {item.type}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-sm">
                  {item.sizeString} • {item.format} • {item.uploadedAtString}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {item.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{item.folder}</span>
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      {item.views}
                    </span>
                    <span className="flex items-center">
                      <Download className="h-3 w-3 mr-1" />
                      {item.downloads}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => router.push(`/vault/${item.id}`)}
                    disabled={item.isProcessing}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => downloadItem(item.id)}
                    disabled={item.isProcessing}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => confirmDelete(item.id)}
                    disabled={item.isProcessing}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {vaultItems.length === 0 && uploadingFiles.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Cloud className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No files yet</h3>
              <p className="text-muted-foreground mb-4">
                Upload your first file to get started.
              </p>
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Delete File
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this file? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            {fileToDelete && (
              <div className="py-4">
                <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
                    {getFileIcon(fileToDelete.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{fileToDelete.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {fileToDelete.sizeString} • {fileToDelete.format} • {fileToDelete.uploadedAtString}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={cancelDelete}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={deleteItem}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Clear All Confirmation Dialog */}
        <Dialog open={clearAllDialogOpen} onOpenChange={setClearAllDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Clear All Files
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete all files? This action cannot be undone and will remove all {vaultItems.length} file(s) from your vault.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Warning</span>
                </div>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  This will permanently delete all files in your vault.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={cancelClearAll}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={clearAllFiles}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Files
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Remove Duplicates Confirmation Dialog */}
        <Dialog open={removeDuplicatesDialogOpen} onOpenChange={setRemoveDuplicatesDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-blue-500" />
                Remove Duplicates
              </DialogTitle>
              <DialogDescription>
                This will scan your vault and remove any duplicate files based on name and size. Only the first occurrence of each file will be kept.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <Info className="h-4 w-4" />
                  <span className="text-sm font-medium">Safe Operation</span>
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  This operation is safe and will only remove exact duplicates.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={cancelRemoveDuplicates}
              >
                Cancel
              </Button>
              <Button 
                onClick={removeDuplicates}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Remove Duplicates
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  )
}
