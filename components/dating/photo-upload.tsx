"use client"

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Upload, X, Camera, Image as ImageIcon, Trash2, GripVertical, Plus } from 'lucide-react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

interface PhotoUploadProps {
  photos: string[]
  onPhotosChange: (photos: string[]) => void
  maxPhotos?: number
}

interface UploadedPhoto {
  id: string
  url: string
  file?: File
  isUploading?: boolean
}

export function PhotoUpload({ photos, onPhotosChange, maxPhotos = 6 }: PhotoUploadProps) {
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>(
    photos.map((url, index) => ({ id: `existing-${index}`, url }))
  )
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files) return

    const newPhotos: UploadedPhoto[] = []
    const remainingSlots = maxPhotos - uploadedPhotos.length

    for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
      const file = files[i]
      if (file.type.startsWith('image/')) {
        const id = `new-${Date.now()}-${i}`
        const url = URL.createObjectURL(file)
        
        newPhotos.push({
          id,
          url,
          file,
          isUploading: true
        })
      }
    }

    if (newPhotos.length > 0) {
      const updatedPhotos = [...uploadedPhotos, ...newPhotos]
      setUploadedPhotos(updatedPhotos)
      onPhotosChange(updatedPhotos.map(photo => photo.url))

      // Simulate upload process
      setTimeout(() => {
        setUploadedPhotos(prev => 
          prev.map(photo => 
            newPhotos.some(newPhoto => newPhoto.id === photo.id)
              ? { ...photo, isUploading: false }
              : photo
          )
        )
      }, 2000)
    }
  }, [uploadedPhotos, maxPhotos, onPhotosChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFileUpload(e.dataTransfer.files)
  }, [handleFileUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files)
  }, [handleFileUpload])

  const removePhoto = useCallback((photoId: string) => {
    const updatedPhotos = uploadedPhotos.filter(photo => photo.id !== photoId)
    setUploadedPhotos(updatedPhotos)
    onPhotosChange(updatedPhotos.map(photo => photo.url))
  }, [uploadedPhotos, onPhotosChange])

  const handleDragEnd = useCallback((result: any) => {
    if (!result.destination) return

    const items = Array.from(uploadedPhotos)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setUploadedPhotos(items)
    onPhotosChange(items.map(photo => photo.url))
  }, [uploadedPhotos, onPhotosChange])

  const canAddMore = uploadedPhotos.length < maxPhotos

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Profile Photos</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Add up to {maxPhotos} photos. Drag to reorder them. The first photo will be your main profile picture.
        </p>
      </div>

      {/* Upload Area */}
      {canAddMore && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 dark:border-gray-600 hover:border-primary/50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Upload className="h-8 w-8 text-gray-400" />
            </div>
            
            <div>
              <h4 className="text-lg font-medium">Upload Photos</h4>
              <p className="text-sm text-muted-foreground">
                Drag and drop images here, or click to browse
              </p>
            </div>

            <div className="flex justify-center space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('photo-upload')?.click()}
              >
                <Camera className="h-4 w-4 mr-2" />
                Choose Photos
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('photo-upload')?.click()}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                From Gallery
              </Button>
            </div>

            <input
              id="photo-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        </div>
      )}

      {/* Photo Grid */}
      {uploadedPhotos.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Your Photos ({uploadedPhotos.length}/{maxPhotos})</h4>
            {uploadedPhotos.length > 1 && (
              <Badge variant="outline" className="text-xs">
                Drag to reorder
              </Badge>
            )}
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="photos" direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="grid grid-cols-2 md:grid-cols-3 gap-4"
                >
                  {uploadedPhotos.map((photo, index) => (
                    <Draggable key={photo.id} draggableId={photo.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`relative group ${
                            snapshot.isDragging ? 'z-50' : ''
                          }`}
                        >
                          <Card className="overflow-hidden">
                            <div className="aspect-square relative">
                              <img
                                src={photo.url}
                                alt={`Profile photo ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              
                              {/* Uploading Overlay */}
                              {photo.isUploading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                  <div className="text-white text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                                    <p className="text-sm">Uploading...</p>
                                  </div>
                                </div>
                              )}

                              {/* Main Photo Badge */}
                              {index === 0 && (
                                <div className="absolute top-2 left-2">
                                  <Badge className="bg-primary text-primary-foreground text-xs">
                                    Main Photo
                                  </Badge>
                                </div>
                              )}

                              {/* Drag Handle */}
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-black/50 rounded p-1">
                                  <GripVertical className="h-4 w-4 text-white" />
                                </div>
                              </div>

                              {/* Delete Button */}
                              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-8 w-8 p-0"
                                  onClick={() => removePhoto(photo.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}

      {/* Photo Tips */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Photo Tips</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Use clear, well-lit photos</li>
            <li>• Include a mix of close-ups and full-body shots</li>
            <li>• Show your personality and interests</li>
            <li>• Avoid group photos or heavily filtered images</li>
            <li>• Make sure you're the only person in the photo</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
