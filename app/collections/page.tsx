"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { 
  Star, 
  Plus, 
  Heart, 
  MessageCircle, 
  Share, 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Edit, 
  Trash2, 
  MoreVertical, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Users, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Bookmark, 
  BookmarkCheck, 
  Copy, 
  Download, 
  Upload, 
  Settings, 
  Grid, 
  List, 
  Image, 
  Video, 
  FileText, 
  Music, 
  Archive, 
  FolderPlus, 
  FolderOpen, 
  FolderClosed, 
  Tag, 
  Tags, 
  Pin, 
  PinOff, 
  Crown, 
  Shield, 
  Zap, 
  Sparkles, 
  Target, 
  BarChart3, 
  PieChart, 
  Activity, 
  Globe, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info, 
  HelpCircle, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  RefreshCw, 
  RotateCcw, 
  Save, 
  SaveAll, 
  Folder, 
  FolderMinus, 
  FolderX, 
  FolderCheck, 
  FolderEdit, 
  FolderSearch, 
  FolderHeart, 
  FolderLock, 
  FolderUp, 
  FolderDown
} from 'lucide-react'

export default function CollectionsPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  // State management
  const [collections, setCollections] = useState([
    {
      id: 1,
      name: 'Fitness Motivation',
      description: 'My favorite workout videos and fitness tips',
      postCount: 24,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      createdAtString: '2 weeks ago',
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
      isPublic: true,
      isPinned: false,
      tags: ['fitness', 'workout', 'motivation'],
      views: 1250,
      likes: 89,
      shares: 23,
      color: 'from-purple-400 to-pink-400',
      category: 'fitness',
      lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      collaborators: ['user-1', 'user-2'],
      isCollaborative: false,
      featured: true
    },
    {
      id: 2,
      name: 'Art Inspiration',
      description: 'Beautiful artwork and creative processes',
      postCount: 18,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      createdAtString: '1 month ago',
      thumbnail: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
      isPublic: true,
      isPinned: true,
      tags: ['art', 'creativity', 'inspiration'],
      views: 890,
      likes: 67,
      shares: 15,
      color: 'from-blue-400 to-purple-400',
      category: 'art',
      lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      collaborators: [],
      isCollaborative: false,
      featured: false
    },
    {
      id: 3,
      name: 'Food Adventures',
      description: 'Delicious recipes and cooking tutorials',
      postCount: 31,
      createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      createdAtString: '3 weeks ago',
      thumbnail: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
      isPublic: false,
      isPinned: false,
      tags: ['food', 'cooking', 'recipes'],
      views: 2100,
      likes: 156,
      shares: 42,
      color: 'from-orange-400 to-red-400',
      category: 'food',
      lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      collaborators: ['user-3'],
      isCollaborative: true,
      featured: true
    },
    {
      id: 4,
      name: 'Travel Memories',
      description: 'Amazing places I\'ve visited and want to visit',
      postCount: 45,
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      createdAtString: '1 month ago',
      thumbnail: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop',
      isPublic: true,
      isPinned: false,
      tags: ['travel', 'places', 'memories'],
      views: 3200,
      likes: 234,
      shares: 67,
      color: 'from-green-400 to-blue-400',
      category: 'travel',
      lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      collaborators: [],
      isCollaborative: false,
      featured: false
    },
    {
      id: 5,
      name: 'Tech Insights',
      description: 'Latest technology trends and innovations',
      postCount: 12,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      createdAtString: '1 week ago',
      thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      isPublic: true,
      isPinned: true,
      tags: ['technology', 'innovation', 'trends'],
      views: 1560,
      likes: 98,
      shares: 28,
      color: 'from-gray-400 to-blue-400',
      category: 'technology',
      lastUpdated: new Date(Date.now() - 6 * 60 * 60 * 1000),
      collaborators: ['user-4', 'user-5'],
      isCollaborative: true,
      featured: true
    }
  ])
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filterBy, setFilterBy] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState<any>(null)
  const [newCollection, setNewCollection] = useState({
    name: '',
    description: '',
    isPublic: true,
    tags: '',
    category: 'general'
  })

  // Filter and sort collections
  const filteredAndSortedCollections = () => {
    let filtered = collections

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(collection => 
        collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        collection.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        collection.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Apply category filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(collection => collection.category === filterBy)
    }

    // Apply sorting
    switch (sortBy) {
      case 'recent':
        filtered = filtered.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())
        break
      case 'oldest':
        filtered = filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        break
      case 'name':
        filtered = filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'posts':
        filtered = filtered.sort((a, b) => b.postCount - a.postCount)
        break
      case 'views':
        filtered = filtered.sort((a, b) => b.views - a.views)
        break
      case 'likes':
        filtered = filtered.sort((a, b) => b.likes - a.likes)
        break
    }

    return filtered
  }

  // Interactive functions
  const createCollection = () => {
    if (!newCollection.name.trim()) {
      toast({
        title: "Error",
        description: "Collection name is required.",
        variant: "destructive"
      })
      return
    }

    const collection = {
      id: collections.length + 1,
      name: newCollection.name.trim(),
      description: newCollection.description.trim(),
      postCount: 0,
      createdAt: new Date(),
      createdAtString: 'now',
      thumbnail: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
      isPublic: newCollection.isPublic,
      isPinned: false,
      tags: newCollection.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      views: 0,
      likes: 0,
      shares: 0,
      color: 'from-purple-400 to-pink-400',
      category: newCollection.category,
      lastUpdated: new Date(),
      collaborators: [],
      isCollaborative: false,
      featured: false
    }

    setCollections(prev => [collection, ...prev])
    setNewCollection({ name: '', description: '', isPublic: true, tags: '', category: 'general' })
    setShowCreateDialog(false)
    
    toast({
      title: "Collection created",
      description: `"${collection.name}" has been created successfully.`,
    })
  }

  const deleteCollection = (id: number) => {
    const collection = collections.find(c => c.id === id)
    setCollections(prev => prev.filter(c => c.id !== id))
    
    toast({
      title: "Collection deleted",
      description: `"${collection?.name}" has been deleted.`,
    })
  }

  const togglePin = (id: number) => {
    setCollections(prev => 
      prev.map(collection => 
        collection.id === id 
          ? { ...collection, isPinned: !collection.isPinned }
          : collection
      )
    )
    
    const collection = collections.find(c => c.id === id)
    toast({
      title: "Collection updated",
      description: `"${collection?.name}" has been ${collection?.isPinned ? 'unpinned' : 'pinned'}.`,
    })
  }

  const toggleVisibility = (id: number) => {
    setCollections(prev => 
      prev.map(collection => 
        collection.id === id 
          ? { ...collection, isPublic: !collection.isPublic }
          : collection
      )
    )
    
    const collection = collections.find(c => c.id === id)
    toast({
      title: "Visibility updated",
      description: `"${collection?.name}" is now ${collection?.isPublic ? 'private' : 'public'}.`,
    })
  }

  const duplicateCollection = (id: number) => {
    const original = collections.find(c => c.id === id)
    if (!original) return

    const duplicate = {
      ...original,
      id: collections.length + 1,
      name: `${original.name} (Copy)`,
      createdAt: new Date(),
      createdAtString: 'now',
      lastUpdated: new Date(),
      views: 0,
      likes: 0,
      shares: 0,
      isPinned: false,
      featured: false
    }

    setCollections(prev => [duplicate, ...prev])
    
    toast({
      title: "Collection duplicated",
      description: `"${duplicate.name}" has been created.`,
    })
  }

  const shareCollection = (id: number) => {
    const collection = collections.find(c => c.id === id)
    if (!collection) return

    const shareUrl = `${window.location.origin}/collections/${id}`
    navigator.clipboard.writeText(shareUrl)
    
    toast({
      title: "Link copied",
      description: "Collection link has been copied to clipboard.",
    })
  }

  const exportCollection = (id: number) => {
    const collection = collections.find(c => c.id === id)
    if (!collection) return

    const dataStr = JSON.stringify(collection, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `${collection.name.replace(/\s+/g, '_')}_collection.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    
    toast({
      title: "Collection exported",
      description: `"${collection.name}" has been exported.`,
    })
  }

  const clearSearch = () => {
    setSearchQuery('')
  }

  const clearFilters = () => {
    setFilterBy('all')
    setSortBy('recent')
    setSearchQuery('')
  }

  const totalCollections = collections.length
  const publicCollections = collections.filter(c => c.isPublic).length
  const privateCollections = collections.filter(c => !c.isPublic).length
  const pinnedCollections = collections.filter(c => c.isPinned).length
  const totalPosts = collections.reduce((sum, c) => sum + c.postCount, 0)
  const totalViews = collections.reduce((sum, c) => sum + c.views, 0)

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-4 lg:py-6 space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Collections</h1>
            <p className="text-sm lg:text-base text-muted-foreground">
              {totalCollections} collections • {totalPosts} posts • {totalViews.toLocaleString()} views
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
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Collection
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Collection</DialogTitle>
                  <DialogDescription>
                    Organize your favorite content into collections
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Collection Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter collection name..."
                      value={newCollection.name}
                      onChange={(e) => setNewCollection(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your collection..."
                      value={newCollection.description}
                      onChange={(e) => setNewCollection(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newCollection.category} onValueChange={(value) => setNewCollection(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="fitness">Fitness</SelectItem>
                        <SelectItem value="art">Art</SelectItem>
                        <SelectItem value="food">Food</SelectItem>
                        <SelectItem value="travel">Travel</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="music">Music</SelectItem>
                        <SelectItem value="photography">Photography</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      placeholder="fitness, workout, motivation"
                      value={newCollection.tags}
                      onChange={(e) => setNewCollection(prev => ({ ...prev, tags: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="public"
                      checked={newCollection.isPublic}
                      onCheckedChange={(checked) => setNewCollection(prev => ({ ...prev, isPublic: checked }))}
                    />
                    <Label htmlFor="public">Make collection public</Label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createCollection}>
                      Create Collection
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search collections..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  {searchQuery && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={clearSearch}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    >
                      <XCircle className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="fitness">Fitness</SelectItem>
                    <SelectItem value="art">Art</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="music">Music</SelectItem>
                    <SelectItem value="photography">Photography</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recent</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="posts">Posts</SelectItem>
                    <SelectItem value="views">Views</SelectItem>
                    <SelectItem value="likes">Likes</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{totalCollections}</div>
              <div className="text-sm text-muted-foreground">Total Collections</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{publicCollections}</div>
              <div className="text-sm text-muted-foreground">Public</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{pinnedCollections}</div>
              <div className="text-sm text-muted-foreground">Pinned</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{totalPosts}</div>
              <div className="text-sm text-muted-foreground">Total Posts</div>
            </CardContent>
          </Card>
        </div>

        {/* Collections Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {filteredAndSortedCollections().map((collection) => (
              <Card key={collection.id} className="hover:shadow-md transition-shadow group">
                <CardHeader className="pb-3">
                  <div className={`aspect-video bg-gradient-to-br ${collection.color} rounded-lg flex items-center justify-center mb-3 relative overflow-hidden`}>
                    <img 
                      src={collection.thumbnail} 
                      alt={collection.name}
                      className="absolute inset-0 w-full h-full object-cover opacity-80"
                    />
                    <div className="relative z-10 flex items-center space-x-2">
                      <Folder className="h-8 w-8 text-white" />
                      {collection.featured && <Crown className="h-6 w-6 text-yellow-300" />}
                    </div>
                    <div className="absolute top-2 right-2 flex space-x-1">
                      {collection.isPinned && <Pin className="h-4 w-4 text-white" />}
                      {!collection.isPublic && <Lock className="h-4 w-4 text-white" />}
                    </div>
                  </div>
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span className="truncate">{collection.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {collection.postCount}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-sm line-clamp-2">
                    {collection.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {collection.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {collection.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{collection.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Updated {collection.lastUpdated.toLocaleDateString()}</span>
                    <div className="flex items-center space-x-2">
                      <span className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {collection.views}
                      </span>
                      <span className="flex items-center">
                        <Heart className="h-3 w-3 mr-1" />
                        {collection.likes}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => router.push(`/collections/${collection.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => togglePin(collection.id)}>
                          {collection.isPinned ? <PinOff className="h-4 w-4 mr-2" /> : <Pin className="h-4 w-4 mr-2" />}
                          {collection.isPinned ? 'Unpin' : 'Pin'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleVisibility(collection.id)}>
                          {collection.isPublic ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                          {collection.isPublic ? 'Make Private' : 'Make Public'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => duplicateCollection(collection.id)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => shareCollection(collection.id)}>
                          <Share className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => exportCollection(collection.id)}>
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteCollection(collection.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="space-y-1">
                {filteredAndSortedCollections().map((collection) => (
                  <div key={collection.id} className="p-4 hover:bg-muted/50 transition-colors border-b last:border-b-0">
                    <div className="flex items-center space-x-4">
                      <div className={`w-16 h-16 bg-gradient-to-br ${collection.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Folder className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium truncate">{collection.name}</h3>
                          {collection.isPinned && <Pin className="h-4 w-4 text-yellow-500" />}
                          {!collection.isPublic && <Lock className="h-4 w-4 text-muted-foreground" />}
                          {collection.featured && <Crown className="h-4 w-4 text-purple-500" />}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{collection.description}</p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                          <span>{collection.postCount} posts</span>
                          <span>{collection.views} views</span>
                          <span>{collection.likes} likes</span>
                          <span>Updated {collection.lastUpdated.toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/collections/${collection.id}`)}
                        >
                          View
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => togglePin(collection.id)}>
                              {collection.isPinned ? <PinOff className="h-4 w-4 mr-2" /> : <Pin className="h-4 w-4 mr-2" />}
                              {collection.isPinned ? 'Unpin' : 'Pin'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleVisibility(collection.id)}>
                              {collection.isPublic ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                              {collection.isPublic ? 'Make Private' : 'Make Public'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => duplicateCollection(collection.id)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => shareCollection(collection.id)}>
                              <Share className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => exportCollection(collection.id)}>
                              <Download className="h-4 w-4 mr-2" />
                              Export
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => deleteCollection(collection.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {filteredAndSortedCollections().length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Folder className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchQuery ? 'No matching collections' : 'No collections yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? `No collections match "${searchQuery}". Try a different search term.`
                  : 'Create your first collection to organize your favorite content.'
                }
              </p>
              {searchQuery ? (
                <Button variant="outline" onClick={clearSearch}>
                  Clear Search
                </Button>
              ) : (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Collection
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AuthGuard>
  )
}
