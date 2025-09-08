"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Search, 
  BookOpen, 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock, 
  Star, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Shield, 
  Zap, 
  Heart, 
  MessageSquare, 
  Video, 
  Image, 
  Mic, 
  Calendar, 
  Settings, 
  Bell, 
  Lock, 
  Globe, 
  ChevronRight, 
  ExternalLink,
  HelpCircle,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', label: 'All Topics', icon: BookOpen, count: 45 },
    { id: 'getting-started', label: 'Getting Started', icon: Zap, count: 12 },
    { id: 'monetization', label: 'Monetization', icon: DollarSign, count: 8 },
    { id: 'content-creation', label: 'Content Creation', icon: Video, count: 10 },
    { id: 'community', label: 'Community', icon: Users, count: 7 },
    { id: 'account', label: 'Account & Settings', icon: Settings, count: 5 },
    { id: 'troubleshooting', label: 'Troubleshooting', icon: AlertCircle, count: 3 }
  ]

  const faqs = [
    {
      id: 1,
      category: 'getting-started',
      title: 'How do I create my first post?',
      content: 'Creating your first post is easy! Click the "Create Post" button, write your content, add media if desired, choose your privacy settings, and hit post. You can also schedule posts for later.',
      helpful: 89,
      tags: ['posting', 'beginner', 'content']
    },
    {
      id: 2,
      category: 'monetization',
      title: 'How do I set up paid subscriptions?',
      content: 'Go to Creator Tools > Monetization Settings. Set your subscription price, create exclusive content tiers, and configure payment methods. You can offer different subscription levels with varying benefits.',
      helpful: 156,
      tags: ['subscriptions', 'monetization', 'creator']
    },
    {
      id: 3,
      category: 'content-creation',
      title: 'What file formats are supported for media?',
      content: 'We support images (JPEG, PNG, GIF, WebP) up to 10MB and videos (MP4, MOV, AVI) up to 100MB. For audio, we support MP3, WAV, and AAC formats up to 25MB.',
      helpful: 234,
      tags: ['media', 'formats', 'upload']
    },
    {
      id: 4,
      category: 'community',
      title: 'How do I report inappropriate content?',
      content: 'Click the three dots menu on any post and select "Report". Choose the reason for reporting and provide additional details. Our moderation team will review within 24 hours.',
      helpful: 78,
      tags: ['reporting', 'moderation', 'safety']
    },
    {
      id: 5,
      category: 'account',
      title: 'How do I change my profile information?',
      content: 'Go to Account Settings > Profile. You can update your display name, bio, avatar, cover photo, and other profile details. Changes are saved automatically.',
      helpful: 145,
      tags: ['profile', 'settings', 'account']
    },
    {
      id: 6,
      category: 'troubleshooting',
      title: 'Why can\'t I upload my video?',
      content: 'Check that your video is under 100MB and in a supported format (MP4, MOV, AVI). Ensure you have a stable internet connection. If issues persist, try uploading during off-peak hours.',
      helpful: 67,
      tags: ['upload', 'video', 'troubleshooting']
    }
  ]

  const popularArticles = [
    {
      title: 'Complete Guide to Creator Monetization',
      category: 'monetization',
      readTime: '8 min read',
      views: '12.5k',
      helpful: 89
    },
    {
      title: 'Building Your Audience on Flavours',
      category: 'community',
      readTime: '6 min read',
      views: '8.9k',
      helpful: 67
    },
    {
      title: 'Content Creation Best Practices',
      category: 'content-creation',
      readTime: '10 min read',
      views: '15.2k',
      helpful: 123
    },
    {
      title: 'Privacy and Security Settings',
      category: 'account',
      readTime: '4 min read',
      views: '6.7k',
      helpful: 45
    }
  ]

  const contactMethods = [
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      availability: '24/7',
      responseTime: 'Usually within minutes',
      color: 'text-green-500'
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us a detailed message',
      availability: '24/7',
      responseTime: 'Within 2-4 hours',
      color: 'text-blue-500'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak directly with our team',
      availability: 'Mon-Fri 9AM-6PM EST',
      responseTime: 'Immediate',
      color: 'text-purple-500'
    }
  ]

  const filteredFaqs = faqs.filter(faq => 
    (selectedCategory === 'all' || faq.category === selectedCategory) &&
    (searchQuery === '' || 
     faq.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     faq.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
     faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  )

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <HelpCircle className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Help Center</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Find answers to your questions and get the support you need to succeed on Flavours
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search for help articles, FAQs, or topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-3 text-lg"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <MessageCircle className="h-8 w-8 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Live Chat</h3>
            <p className="text-sm text-muted-foreground mb-3">Get instant help from our support team</p>
            <Button size="sm">Start Chat</Button>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <Mail className="h-8 w-8 text-blue-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Email Support</h3>
            <p className="text-sm text-muted-foreground mb-3">Send us a detailed message</p>
            <Button size="sm" variant="outline">Send Email</Button>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <Phone className="h-8 w-8 text-purple-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Phone Support</h3>
            <p className="text-sm text-muted-foreground mb-3">Speak directly with our team</p>
            <Button size="sm" variant="outline">Call Now</Button>
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Card 
                key={category.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedCategory === category.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <CardContent className="p-4 text-center">
                  <Icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <h3 className="font-medium text-sm mb-1">{category.label}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {category.count} articles
                  </Badge>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Popular Articles */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Popular Articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {popularArticles.map((article, index) => (
            <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg">{article.title}</h3>
                  <Badge variant="outline">{article.category}</Badge>
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {article.readTime}
                  </span>
                  <span className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {article.views} views
                  </span>
                  <span className="flex items-center">
                    <Heart className="h-4 w-4 mr-1" />
                    {article.helpful} helpful
                  </span>
                </div>
                <Button variant="ghost" size="sm" className="p-0 h-auto">
                  Read Article <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {filteredFaqs.map((faq) => (
            <Card key={faq.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg">{faq.title}</h3>
                  <Badge variant="secondary">{faq.category}</Badge>
                </div>
                <p className="text-muted-foreground mb-4">{faq.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {faq.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                      {faq.helpful} found helpful
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Still Need Help?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contactMethods.map((method, index) => {
            const Icon = method.icon
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Icon className={`h-6 w-6 ${method.color}`} />
                    <h3 className="font-semibold">{method.title}</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">{method.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Availability:</span>
                      <span className="font-medium">{method.availability}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Response Time:</span>
                      <span className="font-medium">{method.responseTime}</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant={index === 0 ? "default" : "outline"}>
                    {index === 0 ? 'Start Chat' : index === 1 ? 'Send Email' : 'Call Now'}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Tips */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Lightbulb className="h-6 w-6 text-primary mt-1" />
            <div>
              <h3 className="font-semibold text-lg mb-2">Pro Tip</h3>
              <p className="text-muted-foreground">
                Use specific keywords when searching for help. For example, instead of "problem", try "upload error" or "payment issue" for more targeted results.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
