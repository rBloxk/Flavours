"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  BookOpen, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  Play, 
  Download, 
  ExternalLink, 
  Clock, 
  Users, 
  Star, 
  Zap, 
  DollarSign, 
  Video, 
  Image, 
  Mic, 
  Settings, 
  Shield, 
  Globe, 
  Lock, 
  Heart, 
  MessageCircle, 
  Calendar, 
  TrendingUp, 
  Award, 
  Target, 
  Lightbulb, 
  CheckCircle, 
  AlertTriangle, 
  Info
} from 'lucide-react'

export default function DocumentationPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedSections, setExpandedSections] = useState<string[]>(['getting-started'])

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const documentationSections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: Zap,
      description: 'Everything you need to know to begin your journey on Flavours',
      color: 'text-green-500',
      articles: [
        {
          title: 'Welcome to Flavours',
          description: 'Learn about our platform and how it can help you monetize your content',
          readTime: '5 min',
          difficulty: 'Beginner',
          type: 'Guide'
        },
        {
          title: 'Creating Your Account',
          description: 'Step-by-step guide to setting up your Flavours account',
          readTime: '3 min',
          difficulty: 'Beginner',
          type: 'Tutorial'
        },
        {
          title: 'Setting Up Your Profile',
          description: 'Make your profile stand out and attract followers',
          readTime: '7 min',
          difficulty: 'Beginner',
          type: 'Guide'
        },
        {
          title: 'First Steps Checklist',
          description: 'Essential tasks to complete when you first join Flavours',
          readTime: '4 min',
          difficulty: 'Beginner',
          type: 'Checklist'
        }
      ]
    },
    {
      id: 'content-creation',
      title: 'Content Creation',
      icon: Video,
      description: 'Master the art of creating engaging content that resonates with your audience',
      color: 'text-blue-500',
      articles: [
        {
          title: 'Content Strategy Guide',
          description: 'Develop a winning content strategy for your niche',
          readTime: '12 min',
          difficulty: 'Intermediate',
          type: 'Guide'
        },
        {
          title: 'Creating Engaging Posts',
          description: 'Tips and tricks for writing posts that get engagement',
          readTime: '8 min',
          difficulty: 'Beginner',
          type: 'Tips'
        },
        {
          title: 'Media Upload Best Practices',
          description: 'Optimize your images and videos for better performance',
          readTime: '6 min',
          difficulty: 'Intermediate',
          type: 'Technical'
        },
        {
          title: 'Voice Notes and Audio Content',
          description: 'How to create compelling audio content for your audience',
          readTime: '5 min',
          difficulty: 'Beginner',
          type: 'Guide'
        },
        {
          title: 'Content Scheduling',
          description: 'Plan and schedule your content for maximum impact',
          readTime: '4 min',
          difficulty: 'Beginner',
          type: 'Feature'
        }
      ]
    },
    {
      id: 'monetization',
      title: 'Monetization',
      icon: DollarSign,
      description: 'Learn how to turn your content into sustainable income',
      color: 'text-purple-500',
      articles: [
        {
          title: 'Subscription Models',
          description: 'Set up and manage different subscription tiers',
          readTime: '10 min',
          difficulty: 'Intermediate',
          type: 'Guide'
        },
        {
          title: 'Pricing Strategies',
          description: 'How to price your content and subscriptions effectively',
          readTime: '8 min',
          difficulty: 'Advanced',
          type: 'Strategy'
        },
        {
          title: 'Paid Content Features',
          description: 'Create exclusive content for your paying subscribers',
          readTime: '6 min',
          difficulty: 'Intermediate',
          type: 'Feature'
        },
        {
          title: 'Revenue Analytics',
          description: 'Track and analyze your earnings and growth',
          readTime: '7 min',
          difficulty: 'Intermediate',
          type: 'Analytics'
        },
        {
          title: 'Payment Processing',
          description: 'Understanding how payments work on Flavours',
          readTime: '5 min',
          difficulty: 'Beginner',
          type: 'Technical'
        }
      ]
    },
    {
      id: 'community',
      title: 'Community Building',
      icon: Users,
      description: 'Build and nurture a loyal community around your content',
      color: 'text-orange-500',
      articles: [
        {
          title: 'Growing Your Audience',
          description: 'Strategies to attract and retain followers',
          readTime: '9 min',
          difficulty: 'Intermediate',
          type: 'Strategy'
        },
        {
          title: 'Engagement Best Practices',
          description: 'How to increase likes, comments, and shares',
          readTime: '6 min',
          difficulty: 'Beginner',
          type: 'Tips'
        },
        {
          title: 'Building Relationships',
          description: 'Connect with your audience on a deeper level',
          readTime: '7 min',
          difficulty: 'Intermediate',
          type: 'Guide'
        },
        {
          title: 'Community Guidelines',
          description: 'Understanding and following community standards',
          readTime: '4 min',
          difficulty: 'Beginner',
          type: 'Policy'
        }
      ]
    },
    {
      id: 'advanced-features',
      title: 'Advanced Features',
      icon: Settings,
      description: 'Unlock the full potential of Flavours with advanced tools',
      color: 'text-red-500',
      articles: [
        {
          title: 'Creator Dashboard',
          description: 'Navigate and utilize the creator dashboard effectively',
          readTime: '8 min',
          difficulty: 'Intermediate',
          type: 'Feature'
        },
        {
          title: 'Analytics and Insights',
          description: 'Understand your content performance and audience metrics',
          readTime: '10 min',
          difficulty: 'Advanced',
          type: 'Analytics'
        },
        {
          title: 'Privacy and Security',
          description: 'Protect your content and maintain your privacy',
          readTime: '6 min',
          difficulty: 'Intermediate',
          type: 'Security'
        },
        {
          title: 'API Documentation',
          description: 'Integrate Flavours with your existing tools and workflows',
          readTime: '15 min',
          difficulty: 'Advanced',
          type: 'Technical'
        }
      ]
    }
  ]

  const quickStartGuides = [
    {
      title: 'Creator Onboarding',
      description: 'Complete guide for new creators',
      duration: '15 min',
      steps: 8,
      difficulty: 'Beginner',
      icon: Zap
    },
    {
      title: 'Monetization Setup',
      description: 'Set up your first subscription',
      duration: '10 min',
      steps: 5,
      difficulty: 'Intermediate',
      icon: DollarSign
    },
    {
      title: 'Content Strategy',
      description: 'Plan your content calendar',
      duration: '20 min',
      steps: 6,
      difficulty: 'Intermediate',
      icon: Target
    },
    {
      title: 'Community Building',
      description: 'Grow your first 100 followers',
      duration: '25 min',
      steps: 7,
      difficulty: 'Beginner',
      icon: Users
    }
  ]

  const videoTutorials = [
    {
      title: 'Getting Started with Flavours',
      duration: '8:32',
      views: '12.5k',
      thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=225&fit=crop',
      description: 'Complete walkthrough of the Flavours platform'
    },
    {
      title: 'Setting Up Paid Subscriptions',
      duration: '12:15',
      views: '8.9k',
      thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=225&fit=crop',
      description: 'Learn how to monetize your content'
    },
    {
      title: 'Content Creation Tips',
      duration: '15:42',
      views: '15.2k',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop',
      description: 'Best practices for creating engaging content'
    },
    {
      title: 'Analytics Deep Dive',
      duration: '18:27',
      views: '6.7k',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop',
      description: 'Understanding your performance metrics'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Documentation</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Comprehensive guides, tutorials, and resources to help you succeed on Flavours. 
          From beginner basics to advanced strategies, find everything you need to know.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search documentation, guides, and tutorials..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-3 text-lg"
        />
      </div>

      {/* Quick Start Guides */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Quick Start Guides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStartGuides.map((guide, index) => {
            const Icon = guide.icon
            return (
              <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                    <Badge variant={guide.difficulty === 'Beginner' ? 'default' : 'secondary'}>
                      {guide.difficulty}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{guide.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{guide.description}</p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {guide.duration}
                    </span>
                    <span className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {guide.steps} steps
                    </span>
                  </div>
                  <Button className="w-full" size="sm">
                    Start Guide <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Video Tutorials */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Video Tutorials</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {videoTutorials.map((video, index) => (
            <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Play className="h-12 w-12 text-white" />
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">{video.title}</h3>
                <p className="text-muted-foreground text-sm mb-3">{video.description}</p>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {video.views} views
                  </span>
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    Watch <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Documentation Sections */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Documentation Sections</h2>
        {documentationSections.map((section) => {
          const Icon = section.icon
          const isExpanded = expandedSections.includes(section.id)
          
          return (
            <Card key={section.id} className="hover:shadow-lg transition-shadow">
              <CardHeader 
                className="cursor-pointer"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-6 w-6 ${section.color}`} />
                    <div>
                      <CardTitle className="text-xl">{section.title}</CardTitle>
                      <p className="text-muted-foreground">{section.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{section.articles.length} articles</Badge>
                    {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  </div>
                </div>
              </CardHeader>
              
              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.articles.map((article, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">{article.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {article.type}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm mb-3">{article.description}</p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {article.readTime}
                          </span>
                          <Badge variant={article.difficulty === 'Beginner' ? 'default' : 'secondary'} className="text-xs">
                            {article.difficulty}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* Resources */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Additional Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <Download className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Download Guides</h3>
              <p className="text-sm text-muted-foreground mb-4">Get PDF versions of our guides for offline reading</p>
              <Button variant="outline" size="sm">Download PDFs</Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Community Forum</h3>
              <p className="text-sm text-muted-foreground mb-4">Connect with other creators and get help from the community</p>
              <Button variant="outline" size="sm">Join Forum</Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <MessageCircle className="h-8 w-8 text-purple-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Live Support</h3>
              <p className="text-sm text-muted-foreground mb-4">Get real-time help from our support team</p>
              <Button variant="outline" size="sm">Start Chat</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tips */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Lightbulb className="h-6 w-6 text-primary mt-1" />
            <div>
              <h3 className="font-semibold text-lg mb-2">Documentation Tips</h3>
              <ul className="text-muted-foreground space-y-1">
                <li>• Use the search bar to quickly find specific topics</li>
                <li>• Start with Quick Start Guides if you're new to Flavours</li>
                <li>• Watch video tutorials for visual learning</li>
                <li>• Bookmark important articles for quick reference</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
