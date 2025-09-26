"use client"

import React, { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  MessageSquare, 
  Send,
  Users, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  SkipForward, 
  Heart, 
  Star, 
  Flag, 
  Shield, 
  Zap, 
  Smile, 
  Camera,
  Volume2,
  VolumeX,
  Settings,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  X,
  Plus,
  Minus
} from 'lucide-react'
import { toast } from 'sonner'

interface Stranger {
  id: string
  avatar: string
  username: string
  interests: string[]
  isOnline: boolean
  country: string
  age: number
  gender: string
}

interface ChatMessage {
  id: string
  sender: 'me' | 'stranger'
  message: string
  timestamp: string
  type: 'text' | 'audio' | 'video'
}

interface InterestTag {
  id: string
  name: string
  color: string
  icon: string
}

export default function FlavoursTalkPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [currentStranger, setCurrentStranger] = useState<Stranger | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [videoEnabled, setVideoEnabled] = useState(false)
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionTime, setConnectionTime] = useState(0)
  const [showReportModal, setShowReportModal] = useState(false)

  // Mock interests data
  const interestTags: InterestTag[] = [
    { id: '1', name: 'Music', color: 'bg-blue-500', icon: '🎵' },
    { id: '2', name: 'Gaming', color: 'bg-green-500', icon: '🎮' },
    { id: '3', name: 'Art', color: 'bg-purple-500', icon: '🎨' },
    { id: '4', name: 'Sports', color: 'bg-orange-500', icon: '⚽' },
    { id: '5', name: 'Movies', color: 'bg-red-500', icon: '🎬' },
    { id: '6', name: 'Travel', color: 'bg-teal-500', icon: '✈️' },
    { id: '7', name: 'Food', color: 'bg-yellow-500', icon: '🍕' },
    { id: '8', name: 'Tech', color: 'bg-indigo-500', icon: '💻' },
    { id: '9', name: 'Fashion', color: 'bg-pink-500', icon: '👗' },
    { id: '10', name: 'Books', color: 'bg-amber-500', icon: '📚' }
  ]

  // Mock stranger data
  const mockStranger: Stranger = {
    id: '1',
    avatar: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=150',
    username: 'AnonymousUser123',
    interests: ['Music', 'Gaming', 'Art'],
    isOnline: true,
    country: 'United States',
    age: 25,
    gender: 'Non-binary'
  }

  // Connection timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isConnected) {
      interval = setInterval(() => {
        setConnectionTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isConnected])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleConnect = async () => {
    setIsConnecting(true)
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setCurrentStranger(mockStranger)
    setIsConnected(true)
    setIsConnecting(false)
    
    // Add welcome message
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'stranger',
      message: 'Hello! Nice to meet you! 👋',
      timestamp: new Date().toLocaleTimeString(),
      type: 'text'
    }
    setChatMessages([welcomeMessage])
    
    toast.success('Connected to a stranger!')
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setCurrentStranger(null)
    setChatMessages([])
    setConnectionTime(0)
    toast.info('Disconnected from stranger')
  }

  const handleSkip = () => {
    if (isConnected) {
      handleDisconnect()
      setTimeout(() => {
        handleConnect()
      }, 1000)
    }
  }

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        sender: 'me',
        message: newMessage,
        timestamp: new Date().toLocaleTimeString(),
        type: 'text'
      }
      setChatMessages(prev => [...prev, message])
      setNewMessage('')
      
      // Simulate stranger typing and responding
      setIsTyping(true)
      setTimeout(() => {
        const responses = [
          'That\'s interesting! Tell me more.',
          'I totally agree with you!',
          'Wow, I never thought about it that way.',
          'That sounds amazing!',
          'I can relate to that.',
          'Thanks for sharing that with me!'
        ]
        const randomResponse = responses[Math.floor(Math.random() * responses.length)]
        
        const strangerMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'stranger',
          message: randomResponse,
          timestamp: new Date().toLocaleTimeString(),
          type: 'text'
        }
        setChatMessages(prev => [...prev, strangerMessage])
        setIsTyping(false)
      }, 1500)
    }
  }

  const handleAddToFavorites = () => {
    toast.success('Added to favorites! Both users agreed to connect.')
  }

  const handleReport = () => {
    setShowReportModal(true)
  }

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    )
  }

  const renderConnectionScreen = () => (
    <div className="container mx-auto px-4 py-4 lg:py-6 space-y-4 lg:space-y-6 h-full flex flex-col">
      {/* Full Screen Connection View */}
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-black">
        <div className="text-center space-y-8">
          {/* Logo/Icon */}
          <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto">
            <MessageSquare className="h-16 w-16 text-gray-800 dark:text-white" />
          </div>
          
          {/* Title */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">FlavoursTalk</h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">Anonymous stranger chat</p>            
          </div>

          {/* Interest Selection */}
          <div className="max-w-2xl mx-auto">
            <h3 className="text-gray-900 dark:text-white text-lg mb-4">Select your interests to find better matches:</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {interestTags.map((tag) => (
                <Button
                  key={tag.id}
                  variant={selectedInterests.includes(tag.name) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleInterestToggle(tag.name)}
                  className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                >
                  <span>{tag.icon}</span>
                  {tag.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Connect Button */}
          <div className="pt-4">
            <Button 
              onClick={handleConnect} 
              disabled={isConnecting}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 text-lg"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Users className="h-5 w-5 mr-2" />
                  Start Chatting
                </>
              )}
            </Button>
          </div>

          {/* Safety Notice */}
          <div className="bg-gray-100 dark:bg-gray-800 backdrop-blur-sm border border-gray-300 dark:border-gray-600 rounded-lg p-4 max-w-md mx-auto">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-gray-800 dark:text-white mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Safety First</h3>
                <p className="text-gray-600 dark:text-gray-300 text-xs mt-1">
                  All chats are anonymous and not stored. Report any inappropriate behavior immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderChatScreen = () => (
    <div className="h-full flex bg-white dark:bg-black">
      {/* Video Column - 30% */}
      <div className="w-[30%] bg-white dark:bg-black flex flex-col">
        {/* Video Header */}
        <div className="bg-gray-100 dark:bg-black p-4 border-b border-gray-300 dark:border-black">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentStranger?.avatar} alt="Stranger" />
                <AvatarFallback className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white">?</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white text-sm">{currentStranger?.username}</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {formatTime(connectionTime)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={handleAddToFavorites} className="text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleReport} className="text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700">
                <Flag className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSkip} className="text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700">
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Video Area */}
        <div className="flex-1 bg-gray-50 dark:bg-black flex items-center justify-center relative">
          {/* Placeholder for video stream */}
          <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
            <div className="text-center text-white">
              <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Video Stream</p>
              <p className="text-sm opacity-70">Camera feed will appear here</p>
            </div>
          </div>
          
          {/* Video Controls Overlay */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            <Button
              variant={audioEnabled ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </Button>
            <Button
              variant={videoEnabled ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setVideoEnabled(!videoEnabled)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Column - 70% */}
      <div className="w-[70%] flex flex-col bg-white dark:bg-black">
        {/* Chat Header */}
        <div className="bg-gray-100 dark:bg-black p-4 border-b border-gray-300 dark:border-black">
          <div className="flex items-center justify-between">
            <h2 className="text-gray-900 dark:text-white font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Chat
            </h2>
            <Button variant="ghost" size="sm" onClick={handleDisconnect} className="text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700">
              <X className="h-4 w-4 mr-1" />
              Disconnect
            </Button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {chatMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  message.sender === 'me'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <p className="text-sm">{message.message}</p>
                <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="bg-gray-100 dark:bg-black p-4 border-t border-gray-300 dark:border-gray-700">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="bg-white dark:bg-black border-gray-900 dark:border-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-black"
            />
            <Button 
              onClick={handleSendMessage}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <AuthGuard>
      {/* Main Content */}
      {!isConnected ? renderConnectionScreen() : renderChatScreen()}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Report User
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Help us keep FlavoursTalk safe by reporting inappropriate behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select>
                <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                  <SelectItem value="harassment" className="text-gray-900 dark:text-white">Harassment</SelectItem>
                  <SelectItem value="spam" className="text-gray-900 dark:text-white">Spam</SelectItem>
                  <SelectItem value="inappropriate" className="text-gray-900 dark:text-white">Inappropriate Content</SelectItem>
                  <SelectItem value="underage" className="text-gray-900 dark:text-white">Underage User</SelectItem>
                  <SelectItem value="other" className="text-gray-900 dark:text-white">Other</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowReportModal(false)}
                  className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    setShowReportModal(false)
                    toast.success('Report submitted. Thank you for keeping our community safe.')
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Submit Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AuthGuard>
  )
}

