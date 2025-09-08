"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Phone, 
  Video, 
  Image, 
  Smile, 
  Send,
  Shield,
  Crown,
  Clock,
  Check,
  CheckCheck,
  MessageCircle,
  Users,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Reply,
  Forward,
  Archive,
  Trash2,
  Block,
  Report,
  Settings,
  Filter,
  SortAsc,
  SortDesc,
  Eye,
  EyeOff,
  Mic,
  MicOff,
  Paperclip,
  Download,
  Copy,
  Edit,
  X,
  AlertTriangle,
  Info,
  Zap,
  Globe,
  Lock,
  Unlock,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  Calendar,
  Clock3,
  UserPlus,
  UserMinus,
  MessageSquare,
  MessageSquarePlus,
  MessageSquareReply,
  MessageSquareForward,
  MessageSquareEdit,
  MessageSquareX,
  MessageSquareCheck,
  MessageSquareWarning,
  MessageSquareInfo,
  MessageSquareHeart,
  MessageSquareStar,
  MessageSquareThumbsUp,
  MessageSquareThumbsDown,
  MessageSquareReply2,
  MessageSquareForward2,
  MessageSquareEdit2,
  MessageSquareX2,
  MessageSquareCheck2,
  MessageSquareWarning2,
  MessageSquareInfo2,
  MessageSquareHeart2,
  MessageSquareStar2,
  MessageSquareThumbsUp2,
  MessageSquareThumbsDown2
} from 'lucide-react'

export default function MessagesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // State management
  const [selectedChat, setSelectedChat] = useState<number | null>(1)
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewChat, setShowNewChat] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [sortBy, setSortBy] = useState('recent')
  const [filterBy, setFilterBy] = useState('all')
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [replyTo, setReplyTo] = useState<any>(null)
  const [editingMessage, setEditingMessage] = useState<any>(null)

  // Enhanced conversations data
  const [conversations, setConversations] = useState([
    {
      id: 1,
      user: {
        id: 'user-1',
        name: 'Sarah Johnson',
        username: 'sarah_fitness',
        avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=random',
        verified: true,
        isCreator: true,
        online: true,
        lastSeen: '2 minutes ago'
      },
      lastMessage: 'Thanks for the workout tips! They really helped me push through my plateau.',
      lastMessageTime: new Date(Date.now() - 2 * 60 * 1000),
      timestamp: '2 min ago',
      unread: 2,
      isTyping: false,
      isPinned: false,
      isArchived: false,
      isBlocked: false,
      messageCount: 15
    },
    {
      id: 2,
      user: {
        id: 'user-2',
        name: 'Alex Chen',
        username: 'alex_artist',
        avatar: 'https://ui-avatars.com/api/?name=Alex+Chen&background=random',
        verified: true,
        isCreator: true,
        online: false,
        lastSeen: '1 hour ago'
      },
      lastMessage: 'I love your latest art piece! The colors are amazing.',
      lastMessageTime: new Date(Date.now() - 60 * 60 * 1000),
      timestamp: '1 hour ago',
      unread: 0,
      isTyping: false,
      isPinned: true,
      isArchived: false,
      isBlocked: false,
      messageCount: 8
    },
    {
      id: 3,
      user: {
        id: 'user-3',
        name: 'Maya Rodriguez',
        username: 'maya_cooking',
        avatar: 'https://ui-avatars.com/api/?name=Maya+Rodriguez&background=random',
        verified: true,
        isCreator: true,
        online: true,
        lastSeen: 'now'
      },
      lastMessage: 'Can you share the recipe for that pasta dish?',
      lastMessageTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
      timestamp: '3 hours ago',
      unread: 1,
      isTyping: true,
      isPinned: false,
      isArchived: false,
      isBlocked: false,
      messageCount: 23
    },
    {
      id: 4,
      user: {
        id: 'user-4',
        name: 'David Kim',
        username: 'david_photography',
        avatar: 'https://ui-avatars.com/api/?name=David+Kim&background=random',
        verified: false,
        isCreator: false,
        online: false,
        lastSeen: '1 day ago'
      },
      lastMessage: 'Great shot! What camera settings did you use?',
      lastMessageTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
      timestamp: '1 day ago',
      unread: 0,
      isTyping: false,
      isPinned: false,
      isArchived: false,
      isBlocked: false,
      messageCount: 5
    },
    {
      id: 5,
      user: {
        id: 'user-5',
        name: 'Emma Wilson',
        username: 'emma_fitness',
        avatar: 'https://ui-avatars.com/api/?name=Emma+Wilson&background=random',
        verified: true,
        isCreator: true,
        online: true,
        lastSeen: 'now'
      },
      lastMessage: 'Just finished my workout! Feeling amazing 💪',
      lastMessageTime: new Date(Date.now() - 30 * 60 * 1000),
      timestamp: '30 min ago',
      unread: 3,
      isTyping: false,
      isPinned: false,
      isArchived: false,
      isBlocked: false,
      messageCount: 12
    }
  ])

  // Enhanced messages data
  const [messages, setMessages] = useState([
    {
      id: 1,
      senderId: 'user-1',
      sender: 'sarah_fitness',
      senderName: 'Sarah Johnson',
      content: 'Hey! I saw your latest workout video. Amazing form!',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      timeString: '10:30 AM',
      isRead: true,
      isDelivered: true,
      isEdited: false,
      editedAt: null,
      reactions: [
        { emoji: '👍', count: 2, users: ['user-1', 'me'] },
        { emoji: '❤️', count: 1, users: ['me'] }
      ],
      replyTo: null,
      attachments: [],
      messageType: 'text'
    },
    {
      id: 2,
      senderId: 'me',
      sender: 'me',
      senderName: 'You',
      content: 'Thank you! I\'ve been working on my technique. Do you have any tips for improving my deadlift?',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 2 * 60 * 1000),
      timeString: '10:32 AM',
      isRead: true,
      isDelivered: true,
      isEdited: false,
      editedAt: null,
      reactions: [],
      replyTo: null,
      attachments: [],
      messageType: 'text'
    },
    {
      id: 3,
      senderId: 'user-1',
      sender: 'sarah_fitness',
      senderName: 'Sarah Johnson',
      content: 'Absolutely! The key is to keep your core tight and drive through your heels. I can send you a detailed breakdown if you\'d like.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000),
      timeString: '10:35 AM',
      isRead: true,
      isDelivered: true,
      isEdited: false,
      editedAt: null,
      reactions: [
        { emoji: '🔥', count: 1, users: ['me'] }
      ],
      replyTo: null,
      attachments: [],
      messageType: 'text'
    },
    {
      id: 4,
      senderId: 'me',
      sender: 'me',
      senderName: 'You',
      content: 'That would be amazing! I\'d really appreciate it.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 6 * 60 * 1000),
      timeString: '10:36 AM',
      isRead: true,
      isDelivered: true,
      isEdited: false,
      editedAt: null,
      reactions: [],
      replyTo: null,
      attachments: [],
      messageType: 'text'
    },
    {
      id: 5,
      senderId: 'user-1',
      sender: 'sarah_fitness',
      senderName: 'Sarah Johnson',
      content: 'Thanks for the workout tips! They really helped me push through my plateau.',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      timeString: '2 min ago',
      isRead: false,
      isDelivered: true,
      isEdited: false,
      editedAt: null,
      reactions: [],
      replyTo: null,
      attachments: [],
      messageType: 'text'
    }
  ])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Simulate typing indicator
  useEffect(() => {
    if (isTyping) {
      const timer = setTimeout(() => {
        setIsTyping(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isTyping])

  // Filter and sort conversations
  const filteredConversations = () => {
    let filtered = conversations

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(conv => 
        conv.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply type filter
    if (filterBy !== 'all') {
      switch (filterBy) {
        case 'unread':
          filtered = filtered.filter(conv => conv.unread > 0)
          break
        case 'pinned':
          filtered = filtered.filter(conv => conv.isPinned)
          break
        case 'archived':
          filtered = filtered.filter(conv => conv.isArchived)
          break
        case 'blocked':
          filtered = filtered.filter(conv => conv.isBlocked)
          break
        case 'online':
          filtered = filtered.filter(conv => conv.user.online)
          break
        case 'creators':
          filtered = filtered.filter(conv => conv.user.isCreator)
          break
      }
    }

    // Apply sorting
    switch (sortBy) {
      case 'recent':
        filtered = filtered.sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime())
        break
      case 'oldest':
        filtered = filtered.sort((a, b) => a.lastMessageTime.getTime() - b.lastMessageTime.getTime())
        break
      case 'unread':
        filtered = filtered.sort((a, b) => b.unread - a.unread)
        break
      case 'alphabetical':
        filtered = filtered.sort((a, b) => a.user.name.localeCompare(b.user.name))
        break
      case 'messageCount':
        filtered = filtered.sort((a, b) => b.messageCount - a.messageCount)
        break
    }

    return filtered
  }

  const selectedConversation = conversations.find(chat => chat.id === selectedChat)

  // Interactive functions
  const sendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return

    const newMsg = {
      id: messages.length + 1,
      senderId: 'me',
      sender: 'me',
      senderName: 'You',
      content: newMessage.trim(),
      timestamp: new Date(),
      timeString: 'now',
      isRead: false,
      isDelivered: true,
      isEdited: false,
      editedAt: null,
      reactions: [],
      replyTo: replyTo,
      attachments: [],
      messageType: 'text'
    }

    setMessages(prev => [...prev, newMsg])
    setNewMessage('')
    setReplyTo(null)
    
    // Update conversation last message
    setConversations(prev => 
      prev.map(conv => 
        conv.id === selectedChat 
          ? { 
              ...conv, 
              lastMessage: newMessage.trim(),
              lastMessageTime: new Date(),
              timestamp: 'now',
              unread: 0
            }
          : conv
      )
    )

    toast({
      title: "Message sent",
      description: "Your message has been sent successfully.",
    })

    // Simulate typing indicator from other user
    setTimeout(() => {
      setIsTyping(true)
      setTypingUsers(['Sarah Johnson'])
    }, 1000)

    // Simulate reply after typing
    setTimeout(() => {
      const replyMsg = {
        id: messages.length + 2,
        senderId: 'user-1',
        sender: 'sarah_fitness',
        senderName: 'Sarah Johnson',
        content: 'Thanks for your message! I\'ll get back to you soon.',
        timestamp: new Date(),
        timeString: 'now',
        isRead: false,
        isDelivered: true,
        isEdited: false,
        editedAt: null,
        reactions: [],
        replyTo: null,
        attachments: [],
        messageType: 'text'
      }
      
      setMessages(prev => [...prev, replyMsg])
      setIsTyping(false)
      setTypingUsers([])
      
      // Update conversation
      setConversations(prev => 
        prev.map(conv => 
          conv.id === selectedChat 
            ? { 
                ...conv, 
                lastMessage: 'Thanks for your message! I\'ll get back to you soon.',
                lastMessageTime: new Date(),
                timestamp: 'now',
                unread: conv.id === selectedChat ? 0 : conv.unread + 1
              }
            : conv
        )
      )
    }, 4000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const addReaction = (messageId: number, emoji: string) => {
    setMessages(prev => 
      prev.map(msg => {
        if (msg.id === messageId) {
          const existingReaction = msg.reactions.find(r => r.emoji === emoji)
          if (existingReaction) {
            if (existingReaction.users.includes('me')) {
              // Remove reaction
              return {
                ...msg,
                reactions: msg.reactions.map(r => 
                  r.emoji === emoji 
                    ? { ...r, count: r.count - 1, users: r.users.filter(u => u !== 'me') }
                    : r
                ).filter(r => r.count > 0)
              }
            } else {
              // Add reaction
              return {
                ...msg,
                reactions: msg.reactions.map(r => 
                  r.emoji === emoji 
                    ? { ...r, count: r.count + 1, users: [...r.users, 'me'] }
                    : r
                )
              }
            }
          } else {
            // New reaction
            return {
              ...msg,
              reactions: [...msg.reactions, { emoji, count: 1, users: ['me'] }]
            }
          }
        }
        return msg
      })
    )
  }

  const deleteMessage = (messageId: number) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId))
    toast({
      title: "Message deleted",
      description: "The message has been deleted.",
    })
  }

  const editMessage = (messageId: number, newContent: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { 
              ...msg, 
              content: newContent,
              isEdited: true,
              editedAt: new Date()
            }
          : msg
      )
    )
    setEditingMessage(null)
    toast({
      title: "Message edited",
      description: "The message has been updated.",
    })
  }

  const pinConversation = (conversationId: number) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, isPinned: !conv.isPinned }
          : conv
      )
    )
    toast({
      title: "Conversation updated",
      description: "Conversation pin status changed.",
    })
  }

  const archiveConversation = (conversationId: number) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, isArchived: !conv.isArchived }
          : conv
      )
    )
    toast({
      title: "Conversation archived",
      description: "The conversation has been archived.",
    })
  }

  const blockUser = (conversationId: number) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, isBlocked: !conv.isBlocked }
          : conv
      )
    )
    toast({
      title: "User blocked",
      description: "The user has been blocked.",
    })
  }

  const markAsRead = (conversationId: number) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unread: 0 }
          : conv
      )
    )
  }

  const clearSearch = () => {
    setSearchQuery('')
  }

  const clearFilters = () => {
    setFilterBy('all')
    setSortBy('recent')
    setSearchQuery('')
  }

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-4 lg:py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 h-[calc(100vh-8rem)]">
        {/* Conversations List */}
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Messages
              </CardTitle>
              <div className="flex items-center gap-2">
                <Dialog open={showNewChat} onOpenChange={setShowNewChat}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Start New Conversation</DialogTitle>
                      <DialogDescription>
                        Search for users to start a new conversation
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input placeholder="Search users..." />
                      <div className="space-y-2">
                        {conversations.slice(0, 3).map(conv => (
                          <div key={conv.id} className="flex items-center space-x-3 p-2 hover:bg-muted rounded-lg cursor-pointer">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={conv.user.avatar} alt={conv.user.name} />
                              <AvatarFallback>{conv.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-sm">{conv.user.name}</span>
                                {conv.user.verified && <Shield className="h-3 w-3 text-blue-600" />}
                                {conv.user.isCreator && <Crown className="h-3 w-3 text-purple-600" />}
                              </div>
                              <p className="text-xs text-muted-foreground">@{conv.user.username}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog open={showSettings} onOpenChange={setShowSettings}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Message Settings</DialogTitle>
                      <DialogDescription>
                        Manage your messaging preferences
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="font-medium">Notifications</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Message notifications</span>
                            <Button size="sm" variant="outline">On</Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Sound notifications</span>
                            <Button size="sm" variant="outline">On</Button>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-medium">Privacy</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Read receipts</span>
                            <Button size="sm" variant="outline">On</Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Typing indicators</span>
                            <Button size="sm" variant="outline">On</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            {/* Search and Filter Controls */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search conversations..."
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
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              
              <div className="flex gap-2">
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="pinned">Pinned</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="creators">Creators</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recent</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="alphabetical">A-Z</SelectItem>
                    <SelectItem value="messageCount">Most Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-0">
            <div className="space-y-1">
              {filteredConversations().map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedChat === conversation.id ? 'bg-muted border-r-2 border-primary' : ''
                  }`}
                  onClick={() => {
                    setSelectedChat(conversation.id)
                    markAsRead(conversation.id)
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversation.user.avatar} alt={conversation.user.name} />
                        <AvatarFallback className="text-sm">{conversation.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {conversation.user.online && (
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                      )}
                      {conversation.isPinned && (
                        <div className="absolute -top-1 -left-1 h-3 w-3 bg-yellow-500 rounded-full border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm truncate">{conversation.user.name}</span>
                        {conversation.user.verified && (
                          <Shield className="h-3 w-3 text-blue-600 flex-shrink-0" />
                        )}
                        {conversation.user.isCreator && (
                          <Crown className="h-3 w-3 text-purple-600 flex-shrink-0" />
                        )}
                        {conversation.isBlocked && (
                          <div className="h-3 w-3 bg-red-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {conversation.isTyping ? (
                          <span className="text-blue-600 italic">typing...</span>
                        ) : (
                          conversation.lastMessage
                        )}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
                        <div className="flex items-center space-x-1">
                          {conversation.unread > 0 && (
                            <Badge variant="destructive" className="h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs">
                              {conversation.unread}
                            </Badge>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => e.stopPropagation()}
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                              >
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => pinConversation(conversation.id)}>
                                {conversation.isPinned ? <Star className="h-4 w-4 mr-2" /> : <Star className="h-4 w-4 mr-2" />}
                                {conversation.isPinned ? 'Unpin' : 'Pin'}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => archiveConversation(conversation.id)}>
                                <Archive className="h-4 w-4 mr-2" />
                                {conversation.isArchived ? 'Unarchive' : 'Archive'}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => blockUser(conversation.id)}>
                                <Block className="h-4 w-4 mr-2" />
                                {conversation.isBlocked ? 'Unblock' : 'Block'}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <CardHeader className="border-b pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedConversation.user.avatar} alt={selectedConversation.user.name} />
                        <AvatarFallback className="text-sm">{selectedConversation.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {selectedConversation.user.online && (
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">{selectedConversation.user.name}</span>
                        {selectedConversation.user.verified && (
                          <Shield className="h-3 w-3 text-blue-600" />
                        )}
                        {selectedConversation.user.isCreator && (
                          <Crown className="h-3 w-3 text-purple-600" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {selectedConversation.user.online ? 'Online' : `Last seen ${selectedConversation.user.lastSeen}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => {
                        toast({
                          title: "Voice call",
                          description: "Starting voice call...",
                        })
                      }}
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => {
                        toast({
                          title: "Video call",
                          description: "Starting video call...",
                        })
                      }}
                    >
                      <Video className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/profile/${selectedConversation.user.id}`)}>
                          <Users className="h-4 w-4 mr-2" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => pinConversation(selectedConversation.id)}>
                          <Star className="h-4 w-4 mr-2" />
                          {selectedConversation.isPinned ? 'Unpin' : 'Pin'} Conversation
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => archiveConversation(selectedConversation.id)}>
                          <Archive className="h-4 w-4 mr-2" />
                          {selectedConversation.isArchived ? 'Unarchive' : 'Archive'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => blockUser(selectedConversation.id)}>
                          <Block className="h-4 w-4 mr-2" />
                          {selectedConversation.isBlocked ? 'Unblock' : 'Block'} User
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Conversation
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <div key={message.id}>
                    {/* Reply indicator */}
                    {message.replyTo && (
                      <div className={`ml-4 mb-2 ${message.sender === 'me' ? 'mr-4' : ''}`}>
                        <div className="bg-muted/50 rounded-lg p-2 border-l-2 border-primary">
                          <p className="text-xs text-muted-foreground">Replying to:</p>
                          <p className="text-sm">{message.replyTo.content}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] ${message.sender === 'me' ? 'order-2' : 'order-1'}`}>
                        <div className="flex items-end space-x-2">
                          {message.sender !== 'me' && (
                            <Avatar className="h-6 w-6 mb-1">
                              <AvatarImage src={selectedConversation.user.avatar} alt={selectedConversation.user.name} />
                              <AvatarFallback className="text-xs">{selectedConversation.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          )}
                          <div className="flex flex-col">
                            <div
                              className={`rounded-lg px-3 py-2 ${
                                message.sender === 'me'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              {message.isEdited && (
                                <p className="text-xs opacity-70 mt-1">(edited)</p>
                              )}
                            </div>
                            
                            {/* Reactions */}
                            {message.reactions.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {message.reactions.map((reaction, idx) => (
                                  <Button
                                    key={idx}
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 px-2 text-xs"
                                    onClick={() => addReaction(message.id, reaction.emoji)}
                                  >
                                    <span className="mr-1">{reaction.emoji}</span>
                                    <span>{reaction.count}</span>
                                  </Button>
                                ))}
                              </div>
                            )}
                            
                            <div className={`flex items-center space-x-1 mt-1 ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                              <span className="text-xs text-muted-foreground">{message.timeString}</span>
                              {message.sender === 'me' && (
                                <div className="flex items-center">
                                  {message.isRead ? (
                                    <CheckCheck className="h-3 w-3 text-blue-600" />
                                  ) : (
                                    <Check className="h-3 w-3 text-muted-foreground" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Message actions */}
                    <div className={`flex justify-center ${message.sender === 'me' ? 'justify-end mr-4' : 'justify-start ml-4'}`}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-6 px-2 opacity-0 group-hover:opacity-100">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={message.sender === 'me' ? 'end' : 'start'}>
                          <DropdownMenuItem onClick={() => addReaction(message.id, '👍')}>
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            Like
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => addReaction(message.id, '❤️')}>
                            <Heart className="h-4 w-4 mr-2" />
                            Love
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setReplyTo(message)}>
                            <Reply className="h-4 w-4 mr-2" />
                            Reply
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            navigator.clipboard.writeText(message.content)
                            toast({
                              title: "Copied",
                              description: "Message copied to clipboard.",
                            })
                          }}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </DropdownMenuItem>
                          {message.sender === 'me' && (
                            <>
                              <DropdownMenuItem onClick={() => setEditingMessage(message)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => deleteMessage(message.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
                
                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-3 py-2">
                      <div className="flex items-center space-x-1">
                        <div className="flex space-x-1">
                          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-xs text-muted-foreground ml-2">
                          {typingUsers.join(', ')} typing...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Reply indicator */}
              {replyTo && (
                <div className="border-t p-3 bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Reply className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Replying to:</span>
                      <span className="text-sm font-medium">{replyTo.senderName}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setReplyTo(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 truncate">{replyTo.content}</p>
                </div>
              )}

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex items-end space-x-2">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => {
                      toast({
                        title: "Attach file",
                        description: "File attachment feature coming soon!",
                      })
                    }}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 relative">
                    <Textarea
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="min-h-[40px] max-h-[120px] resize-none"
                      rows={1}
                    />
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setIsRecording(!isRecording)}
                    className={isRecording ? 'text-red-600' : ''}
                  >
                    {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Button 
                    size="sm" 
                    disabled={!newMessage.trim()}
                    onClick={sendMessage}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Emoji picker */}
                {showEmojiPicker && (
                  <div className="mt-2 p-2 bg-muted rounded-lg">
                    <div className="flex flex-wrap gap-1">
                      {['😀', '😂', '❤️', '👍', '👎', '🔥', '💯', '🎉', '😍', '🤔', '😢', '😡'].map(emoji => (
                        <Button
                          key={emoji}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setNewMessage(prev => prev + emoji)
                            setShowEmojiPicker(false)
                          }}
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-lg font-medium">Select a conversation</h3>
                  <p className="text-muted-foreground">Choose a conversation from the sidebar to start messaging</p>
                </div>
                <Button onClick={() => setShowNewChat(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Start New Conversation
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
      </div>
    </AuthGuard>
  )
}
