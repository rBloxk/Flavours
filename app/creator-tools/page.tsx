"use client"

import React, { useState } from 'react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Crown, 
  DollarSign, 
  TrendingUp, 
  BarChart3, 
  Users, 
  Heart, 
  MessageCircle, 
  Share2, 
  Video, 
  Image, 
  Mic, 
  Calendar, 
  Target, 
  Zap, 
  Award, 
  Star, 
  Globe, 
  Lock, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Upload, 
  Link, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Clock, 
  Eye, 
  EyeOff, 
  Bell, 
  Mail, 
  Smartphone, 
  Monitor, 
  Palette, 
  Type, 
  Hash, 
  AtSign, 
  MapPin, 
  Calendar as CalendarIcon, 
  DollarSign as DollarIcon, 
  Percent, 
  ArrowUp, 
  ArrowDown, 
  Minus, 
  Play, 
  Pause, 
  RotateCcw, 
  RefreshCw, 
  Filter, 
  Search, 
  SortAsc, 
  SortDesc, 
  MoreHorizontal, 
  ChevronRight, 
  ChevronDown, 
  Sparkles, 
  Rocket, 
  Shield, 
  Gift, 
  CreditCard, 
  Wallet, 
  Receipt, 
  TrendingDown, 
  Activity, 
  PieChart, 
  LineChart, 
  BarChart, 
  ScatterChart
} from 'lucide-react'

export default function CreatorToolsPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d')

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'monetization', label: 'Monetization', icon: DollarSign },
    { id: 'content', label: 'Content Tools', icon: Video },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'audience', label: 'Audience', icon: Users },
    { id: 'engagement', label: 'Engagement', icon: Heart },
    { id: 'automation', label: 'Automation', icon: Zap }
  ]

  const overviewStats = [
    {
      title: 'Total Revenue',
      value: '$2,847.50',
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'text-green-500'
    },
    {
      title: 'Subscribers',
      value: '1,247',
      change: '+8.2%',
      changeType: 'positive',
      icon: Users,
      color: 'text-blue-500'
    },
    {
      title: 'Content Views',
      value: '45.2K',
      change: '+15.3%',
      changeType: 'positive',
      icon: Eye,
      color: 'text-purple-500'
    },
    {
      title: 'Engagement Rate',
      value: '8.7%',
      change: '+2.1%',
      changeType: 'positive',
      icon: Heart,
      color: 'text-red-500'
    }
  ]

  const monetizationOptions = [
    {
      title: 'Subscription Tiers',
      description: 'Create multiple subscription levels with different benefits',
      icon: Crown,
      status: 'active',
      revenue: '$1,847.50',
      subscribers: 1247,
      color: 'text-yellow-500'
    },
    {
      title: 'Paid Posts',
      description: 'Charge for individual premium content',
      icon: Lock,
      status: 'active',
      revenue: '$650.00',
      posts: 23,
      color: 'text-purple-500'
    },
    {
      title: 'Tips & Donations',
      description: 'Receive tips from your audience',
      icon: Gift,
      status: 'active',
      revenue: '$350.00',
      tips: 156,
      color: 'text-green-500'
    },
    {
      title: 'Affiliate Marketing',
      description: 'Earn commissions from product recommendations',
      icon: Link,
      status: 'inactive',
      revenue: '$0.00',
      clicks: 0,
      color: 'text-gray-500'
    }
  ]

  const contentTools = [
    {
      title: 'Content Scheduler',
      description: 'Plan and schedule your posts in advance',
      icon: Calendar,
      features: ['Bulk scheduling', 'Optimal timing', 'Content calendar'],
      status: 'active'
    },
    {
      title: 'Content Templates',
      description: 'Pre-designed templates for different content types',
      icon: Type,
      features: ['Post templates', 'Story templates', 'Video templates'],
      status: 'active'
    },
    {
      title: 'Hashtag Generator',
      description: 'AI-powered hashtag suggestions for better reach',
      icon: Hash,
      features: ['Trending hashtags', 'Niche-specific', 'Performance tracking'],
      status: 'active'
    },
    {
      title: 'Content Analytics',
      description: 'Detailed insights into your content performance',
      icon: BarChart3,
      features: ['Performance metrics', 'Audience insights', 'Optimization tips'],
      status: 'active'
    }
  ]

  const analyticsData = [
    {
      metric: 'Total Views',
      value: '45,247',
      change: '+15.3%',
      changeType: 'positive',
      trend: 'up'
    },
    {
      metric: 'Engagement Rate',
      value: '8.7%',
      change: '+2.1%',
      changeType: 'positive',
      trend: 'up'
    },
    {
      metric: 'New Followers',
      value: '234',
      change: '+12.5%',
      changeType: 'positive',
      trend: 'up'
    },
    {
      metric: 'Click-Through Rate',
      value: '3.2%',
      change: '-0.5%',
      changeType: 'negative',
      trend: 'down'
    }
  ]

  const audienceInsights = [
    {
      title: 'Top Locations',
      data: [
        { location: 'United States', percentage: 45, users: 1123 },
        { location: 'Canada', percentage: 18, users: 448 },
        { location: 'United Kingdom', percentage: 12, users: 299 },
        { location: 'Australia', percentage: 8, users: 199 },
        { location: 'Germany', percentage: 7, users: 174 }
      ]
    },
    {
      title: 'Age Demographics',
      data: [
        { age: '18-24', percentage: 25, users: 623 },
        { age: '25-34', percentage: 35, users: 872 },
        { age: '35-44', percentage: 22, users: 548 },
        { age: '45-54', percentage: 12, users: 299 },
        { age: '55+', percentage: 6, users: 149 }
      ]
    },
    {
      title: 'Active Hours',
      data: [
        { hour: '9 AM', activity: 85 },
        { hour: '12 PM', activity: 92 },
        { hour: '3 PM', activity: 78 },
        { hour: '6 PM', activity: 95 },
        { hour: '9 PM', activity: 88 }
      ]
    }
  ]

  const automationTools = [
    {
      title: 'Auto-Responder',
      description: 'Automatically respond to common messages',
      icon: MessageCircle,
      status: 'active',
      responses: 45
    },
    {
      title: 'Welcome Series',
      description: 'Automated welcome messages for new subscribers',
      icon: Mail,
      status: 'active',
      subscribers: 1247
    },
    {
      title: 'Content Promotion',
      description: 'Automatically promote your content across platforms',
      icon: Share2,
      status: 'inactive',
      platforms: 0
    },
    {
      title: 'Engagement Tracking',
      description: 'Monitor and respond to engagement automatically',
      icon: Heart,
      status: 'active',
      interactions: 2847
    }
  ]

  const recentActivity = [
    {
      type: 'subscription',
      message: 'New subscriber: Sarah Johnson',
      time: '2 minutes ago',
      icon: Users,
      color: 'text-green-500'
    },
    {
      type: 'payment',
      message: 'Payment received: $29.99',
      time: '15 minutes ago',
      icon: DollarSign,
      color: 'text-blue-500'
    },
    {
      type: 'engagement',
      message: 'Post reached 1K likes',
      time: '1 hour ago',
      icon: Heart,
      color: 'text-red-500'
    },
    {
      type: 'content',
      message: 'New post scheduled for tomorrow',
      time: '2 hours ago',
      icon: Calendar,
      color: 'text-purple-500'
    }
  ]

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Crown className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Creator Tools</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Powerful tools and insights to help you grow your audience, monetize your content, and build a successful creator business.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {overviewStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                  <Badge variant={stat.changeType === 'positive' ? 'default' : 'secondary'}>
                    {stat.change}
                  </Badge>
                </div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.title}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Revenue Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Revenue chart will be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => {
                  const Icon = activity.icon
                  return (
                    <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Icon className={`h-5 w-5 ${activity.color}`} />
                      <div className="flex-1">
                        <p className="font-medium">{activity.message}</p>
                        <p className="text-sm text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Monetization Tab */}
      {activeTab === 'monetization' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {monetizationOptions.map((option, index) => {
              const Icon = option.icon
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon className={`h-6 w-6 ${option.color}`} />
                        <div>
                          <CardTitle className="text-lg">{option.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>
                      </div>
                      <Badge variant={option.status === 'active' ? 'default' : 'secondary'}>
                        {option.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Revenue</span>
                        <span className="font-semibold">{option.revenue}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {option.subscribers ? 'Subscribers' : option.posts ? 'Posts' : 'Tips'}
                        </span>
                        <span className="font-semibold">
                          {option.subscribers || option.posts || option.tips || option.clicks}
                        </span>
                      </div>
                      <Button 
                        className="w-full" 
                        variant={option.status === 'active' ? 'outline' : 'default'}
                      >
                        {option.status === 'active' ? 'Manage' : 'Activate'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Content Tools Tab */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contentTools.map((tool, index) => {
              const Icon = tool.icon
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <Icon className="h-6 w-6 text-primary" />
                      <div>
                        <CardTitle className="text-lg">{tool.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{tool.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-2">Features:</p>
                        <ul className="space-y-1">
                          {tool.features.map((feature, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-center">
                              <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Button className="w-full">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {analyticsData.map((data, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{data.metric}</span>
                    <div className="flex items-center space-x-1">
                      {data.trend === 'up' ? (
                        <ArrowUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`text-sm ${data.changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`}>
                        {data.change}
                      </span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold">{data.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Placeholder */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-muted/50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <LineChart className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Engagement chart</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-muted/50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Performance chart</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Audience Tab */}
      {activeTab === 'audience' && (
        <div className="space-y-6">
          {audienceInsights.map((insight, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{insight.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insight.data.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        <span className="font-medium">
                          {'location' in item ? item.location : 'age' in item ? item.age : item.hour}
                        </span>
                        {'users' in item && item.users && (
                          <span className="text-sm text-muted-foreground">
                            ({item.users.toLocaleString()} users)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${'percentage' in item ? item.percentage : item.activity}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-12 text-right">
                          {'percentage' in item ? `${item.percentage}%` : `${item.activity}%`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Engagement Tab */}
      {activeTab === 'engagement' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">2,847</div>
                  <div className="text-sm text-muted-foreground">Total Likes</div>
                </div>
                <div className="text-center">
                  <MessageCircle className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">456</div>
                  <div className="text-sm text-muted-foreground">Comments</div>
                </div>
                <div className="text-center">
                  <Share2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">123</div>
                  <div className="text-sm text-muted-foreground">Shares</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <Video className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Sample Post {item}</p>
                      <p className="text-sm text-muted-foreground">Posted 2 days ago</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">2.{item}K views</div>
                      <div className="text-sm text-muted-foreground">8.{item}% engagement</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Automation Tab */}
      {activeTab === 'automation' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {automationTools.map((tool, index) => {
              const Icon = tool.icon
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon className="h-6 w-6 text-primary" />
                        <div>
                          <CardTitle className="text-lg">{tool.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">{tool.description}</p>
                        </div>
                      </div>
                      <Badge variant={tool.status === 'active' ? 'default' : 'secondary'}>
                        {tool.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {tool.responses ? 'Responses' : tool.subscribers ? 'Subscribers' : tool.platforms ? 'Platforms' : 'Interactions'}
                        </span>
                        <span className="font-semibold">
                          {tool.responses || tool.subscribers || tool.platforms || tool.interactions}
                        </span>
                      </div>
                      <Button 
                        className="w-full" 
                        variant={tool.status === 'active' ? 'outline' : 'default'}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        {tool.status === 'active' ? 'Configure' : 'Activate'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Pro Tips */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Sparkles className="h-6 w-6 text-primary mt-1" />
            <div>
              <h3 className="font-semibold text-lg mb-2">Creator Pro Tips</h3>
              <ul className="text-muted-foreground space-y-1">
                <li>• Post consistently at optimal times for your audience</li>
                <li>• Engage with your audience within the first hour of posting</li>
                <li>• Use analytics to identify your best-performing content types</li>
                <li>• Create exclusive content for your paying subscribers</li>
                <li>• Respond to comments and messages to build community</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </AuthGuard>
  )
}
