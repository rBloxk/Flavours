"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/components/providers/auth-provider'
import { 
  Image, 
  Video, 
  X, 
  Globe, 
  Lock, 
  Users,
  Loader2,
  Plus,
  Smile,
  MapPin,
  Calendar,
  Hash,
  AtSign,
  Palette,
  Type,
  Zap,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Download,
  Share2,
  Eye,
  EyeOff,
  Clock,
  DollarSign,
  Star,
  Heart,
  MessageCircle,
  Bookmark,
  Flag,
  MoreHorizontal
} from 'lucide-react'
import { toast } from 'sonner'

interface CreatePostModalProps {
  children: React.ReactNode
}

interface MediaFile {
  file: File
  preview: string
  type: 'image' | 'video'
  duration?: number
  size: number
}

interface PostDraft {
  content: string
  mediaFiles: MediaFile[]
  privacy: 'public' | 'followers' | 'paid'
  scheduledTime?: Date
  location?: string
  tags: string[]
  mentions: string[]
  isPaidContent: boolean
  price?: number
}

export function CreatePostModal({ children }: CreatePostModalProps) {
  const { profile } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [content, setContent] = useState('')
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [privacy, setPrivacy] = useState<'public' | 'followers' | 'paid'>('public')
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [charCount, setCharCount] = useState(0)
  const [isDraft, setIsDraft] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [showSchedulePicker, setShowSchedulePicker] = useState(false)
  const [showPriceModal, setShowPriceModal] = useState(false)
  const [postPrice, setPostPrice] = useState(0)
  const [tags, setTags] = useState<string[]>([])
  const [mentions, setMentions] = useState<string[]>([])
  const [location, setLocation] = useState('')
  const [scheduledTime, setScheduledTime] = useState<Date | null>(null)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)

  // Enhanced file upload with better validation and preview
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      // File size validation (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Maximum size is 10MB.`)
        return
      }

      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const img = new window.Image()
          img.onload = () => {
            setMediaFiles(prev => [...prev, {
              file,
              preview: e.target?.result as string,
              type: 'image',
              size: file.size
            }])
          }
          img.src = e.target?.result as string
        }
        reader.readAsDataURL(file)
      } else if (file.type.startsWith('video/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const video = document.createElement('video')
          video.onloadedmetadata = () => {
            setMediaFiles(prev => [...prev, {
              file,
              preview: e.target?.result as string,
              type: 'video',
              duration: video.duration,
              size: file.size
            }])
          }
          video.src = e.target?.result as string
        }
        reader.readAsDataURL(file)
      }
    })
  }

  // Audio recording functionality
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      
      const chunks: BlobPart[] = []
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' })
        setAudioBlob(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      toast.error('Could not access microphone')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const playAudio = () => {
    if (audioBlob && audioRef.current) {
      const audioUrl = URL.createObjectURL(audioBlob)
      audioRef.current.src = audioUrl
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  // Character count and content analysis
  useEffect(() => {
    setCharCount(content.length)
    
    // Extract hashtags and mentions
    const hashtagMatches = content.match(/#\w+/g) || []
    const mentionMatches = content.match(/@\w+/g) || []
    
    setTags(hashtagMatches.map(tag => tag.slice(1)))
    setMentions(mentionMatches.map(mention => mention.slice(1)))
  }, [content])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [content])

  const removeMediaFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index))
  }

  const saveDraft = () => {
    const draft: PostDraft = {
      content,
      mediaFiles,
      privacy,
      scheduledTime: scheduledTime || undefined,
      location,
      tags,
      mentions,
      isPaidContent: privacy === 'paid',
      price: privacy === 'paid' ? postPrice : undefined
    }
    
    localStorage.setItem('postDraft', JSON.stringify(draft))
    setIsDraft(true)
    toast.success('Draft saved!')
  }

  const loadDraft = () => {
    const savedDraft = localStorage.getItem('postDraft')
    if (savedDraft) {
      const draft: PostDraft = JSON.parse(savedDraft)
      setContent(draft.content)
      setMediaFiles(draft.mediaFiles)
      setPrivacy(draft.privacy)
      setScheduledTime(draft.scheduledTime ? new Date(draft.scheduledTime) : null)
      setLocation(draft.location || '')
      setTags(draft.tags)
      setMentions(draft.mentions)
      setPostPrice(draft.price || 0)
      setIsDraft(false)
      toast.success('Draft loaded!')
    }
  }

  const clearDraft = () => {
    localStorage.removeItem('postDraft')
    setIsDraft(false)
    toast.success('Draft cleared!')
  }

  const handleSubmit = async () => {
    if (!content.trim() && mediaFiles.length === 0 && !audioBlob) {
      toast.error('Please add some content, media, or audio to your post')
      return
    }

    setIsLoading(true)
    
    try {
      // Simulate API call with enhanced data
      const postData = {
        content,
        mediaFiles: mediaFiles.map(mf => ({
          type: mf.type,
          size: mf.size,
          duration: mf.duration
        })),
        audioBlob: audioBlob ? 'audio_attached' : null,
        privacy,
        tags,
        mentions,
        location,
        scheduledTime,
        isPaidContent: privacy === 'paid',
        price: privacy === 'paid' ? postPrice : null
      }
      
      console.log('Posting:', postData)
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success('Post created successfully!')
      setIsOpen(false)
      
      // Reset all state
      setContent('')
      setMediaFiles([])
      setAudioBlob(null)
      setTags([])
      setMentions([])
      setLocation('')
      setScheduledTime(null)
      setPostPrice(0)
      setIsDraft(false)
      clearDraft()
      
    } catch (error) {
      toast.error('Failed to create post')
    } finally {
      setIsLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const privacyOptions = [
    { value: 'public', label: 'Public', icon: Globe, description: 'Anyone can see this post', color: 'text-green-500' },
    { value: 'followers', label: 'Followers', icon: Users, description: 'Only your followers can see this post', color: 'text-blue-500' },
    { value: 'paid', label: 'Paid Content', icon: Lock, description: 'Only paid subscribers can see this post', color: 'text-purple-500' }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0 w-[95vw] sm:w-full">
        <div className="relative">
          {/* Header */}
          <div className="sticky top-0 bg-background border-b p-4 pb-3 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url} alt={profile?.display_name} />
                  <AvatarFallback className="text-xs">
                    {profile?.display_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-sm font-bold">{profile?.display_name}</h2>
                  <p className="text-xs text-muted-foreground">@{profile?.username}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {isDraft && (
                  <Badge variant="secondary" className="animate-pulse">
                    <Clock className="h-3 w-3 mr-1" />
                    Draft Saved
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={() => setShowAdvanced(!showAdvanced)}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {showAdvanced ? 'Simple' : 'Advanced'}
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Content Input */}
            <div className="relative">
              <Textarea
                ref={textareaRef}
                placeholder="What's happening? Share your thoughts, ideas, or experiences..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[150px] resize-none border-0 text-sm focus-visible:ring-0 bg-transparent p-0"
              />
              
              {/* Character count */}
              <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                {charCount}/280
              </div>
            </div>

            {/* Tags and Mentions Preview */}
            {(tags.length > 0 || mentions.length > 0) && (
              <div className="space-y-2">
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-muted-foreground">Tags:</span>
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        <Hash className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                {mentions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-muted-foreground">Mentions:</span>
                    {mentions.map((mention, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <AtSign className="h-3 w-3 mr-1" />
                        {mention}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Audio Recording */}
            {audioBlob && (
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Volume2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Voice Note</p>
                      <p className="text-sm text-muted-foreground">Audio attachment</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={isPlaying ? pauseAudio : playAudio}
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setAudioBlob(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />
              </div>
            )}

            {/* Media Preview */}
            {mediaFiles.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium flex items-center">
                  <Image className="h-4 w-4 mr-2" />
                  Media ({mediaFiles.length})
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {mediaFiles.map((media, index) => (
                    <div key={index} className="relative group">
                      {media.type === 'image' ? (
                        <img
                          src={media.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="relative">
                          <video
                            src={media.preview}
                            className="w-full h-32 object-cover rounded-lg"
                            controls
                          />
                          {media.duration && (
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                              {formatDuration(media.duration)}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {formatFileSize(media.size)}
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeMediaFile(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Advanced Options */}
            {showAdvanced && (
              <div className="space-y-4">
                <Separator />
                
                {/* Location */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="Add location..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Schedule */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Post
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledTime ? scheduledTime.toISOString().slice(0, 16) : ''}
                    onChange={(e) => setScheduledTime(e.target.value ? new Date(e.target.value) : null)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Price for Paid Content */}
                {privacy === 'paid' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Price (USD)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={postPrice}
                      onChange={(e) => setPostPrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Privacy Settings */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Who can see this post?</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {privacyOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <label
                      key={option.value}
                      className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                        privacy === option.value ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      <input
                        type="radio"
                        name="privacy"
                        value={option.value}
                        checked={privacy === option.value}
                        onChange={(e) => setPrivacy(e.target.value as any)}
                        className="sr-only"
                      />
                      <Icon className={`h-5 w-5 ${option.color}`} />
                      <div className="flex-1">
                        <p className="font-medium">{option.label}</p>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      {privacy === option.value && (
                        <div className="w-3 h-3 bg-primary rounded-full" />
                      )}
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="flex items-center space-x-2">
                {/* Media Upload */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2"
                >
                  <Image className="h-4 w-4" />
                  <span>Media</span>
                </Button>

                {/* Audio Recording */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`flex items-center space-x-2 ${isRecording ? 'bg-red-50 border-red-200 text-red-600' : ''}`}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  <span>{isRecording ? 'Stop' : 'Voice'}</span>
                </Button>

                {/* Emoji Picker */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Smile className="h-4 w-4" />
                </Button>

                {/* Draft Actions */}
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm" onClick={saveDraft}>
                    <Bookmark className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button variant="ghost" size="sm" onClick={loadDraft}>
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Load
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={() => setIsOpen(false)} className="text-sm">
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={isLoading || (!content.trim() && mediaFiles.length === 0 && !audioBlob)}
                  className="min-w-[100px] text-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-1 h-3 w-3" />
                      {scheduledTime ? 'Schedule' : 'Post'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
