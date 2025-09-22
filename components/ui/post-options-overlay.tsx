"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  MoreHorizontal,
  Trash2,
  Edit,
  Save,
  Heart,
  Flag,
  BarChart3,
  Bookmark,
  Share2
} from 'lucide-react'
import { toast } from 'sonner'

interface PostOptionsOverlayProps {
  postId: string
  isOwnPost: boolean
  isBookmarked?: boolean
  isFavorited?: boolean
  onDelete?: (postId: string) => void
  onEdit?: (postId: string) => void
  onSave?: (postId: string) => void
  onAddToFavorites?: (postId: string) => void
  onReport?: (postId: string) => void
  onViewInsights?: (postId: string) => void
  onShare?: (postId: string) => void
  className?: string
}

export function PostOptionsOverlay({
  postId,
  isOwnPost,
  isBookmarked = false,
  isFavorited = false,
  onDelete,
  onEdit,
  onSave,
  onAddToFavorites,
  onReport,
  onViewInsights,
  onShare,
  className = ""
}: PostOptionsOverlayProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    if (!onDelete) return
    
    setIsLoading(true)
    try {
      await onDelete(postId)
      toast.success("Post deleted successfully")
      setShowDeleteDialog(false)
    } catch (error) {
      toast.error("Failed to delete post")
      console.error("Delete error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = async (action: () => void | Promise<void>, successMessage: string) => {
    try {
      await action()
      toast.success(successMessage)
    } catch (error) {
      toast.error("Action failed")
      console.error("Action error:", error)
    }
  }

  const handleSave = () => {
    if (onSave) {
      handleAction(() => onSave(postId), "Post saved successfully")
    }
  }

  const handleAddToFavorites = () => {
    if (onAddToFavorites) {
      handleAction(() => onAddToFavorites(postId), 
        isFavorited ? "Removed from favorites" : "Added to favorites")
    }
  }

  const handleReport = () => {
    if (onReport) {
      handleAction(() => onReport(postId), "Post reported successfully")
    }
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(postId)
    }
  }

  const handleViewInsights = () => {
    if (onViewInsights) {
      onViewInsights(postId)
    }
  }

  const handleShare = () => {
    if (onShare) {
      handleAction(() => onShare(postId), "Post shared successfully")
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${className}`}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {isOwnPost ? (
            // Options for own posts
            <>
              <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={handleSave} className="cursor-pointer">
                <Save className="h-4 w-4 mr-2" />
                Save
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={handleAddToFavorites} className="cursor-pointer">
                <Heart className={`h-4 w-4 mr-2 ${isFavorited ? 'fill-current text-red-500' : ''}`} />
                {isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={handleViewInsights} className="cursor-pointer">
                <BarChart3 className="h-4 w-4 mr-2" />
                Insights
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={handleShare} className="cursor-pointer">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </>
          ) : (
            // Options for other users' posts
            <>
              <DropdownMenuItem onClick={handleSave} className="cursor-pointer">
                <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-current text-yellow-500' : ''}`} />
                {isBookmarked ? 'Unsave' : 'Save'}
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={handleAddToFavorites} className="cursor-pointer">
                <Heart className={`h-4 w-4 mr-2 ${isFavorited ? 'fill-current text-red-500' : ''}`} />
                {isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={handleShare} className="cursor-pointer">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={handleReport}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <Flag className="h-4 w-4 mr-2" />
                Report
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

