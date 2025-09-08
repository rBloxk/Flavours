"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Eye, 
  Heart,
  MessageCircle,
  Upload,
  BarChart3,
  Calendar,
  Settings
} from 'lucide-react'

export function CreatorDashboard() {
  // Mock data - in real app, this would come from API
  const stats = {
    totalSubscribers: 1247,
    monthlyRevenue: 5680,
    totalViews: 45230,
    engagementRate: 8.3,
  }

  const recentPosts = [
    {
      id: '1',
      content: 'Behind the scenes photo shoot ✨',
      views: 3420,
      likes: 189,
      comments: 23,
      revenue: 245,
      createdAt: '2 hours ago',
    },
    {
      id: '2',
      content: 'Exclusive workout routine video',
      views: 5670,
      likes: 342,
      comments: 45,
      revenue: 890,
      createdAt: '1 day ago',
    },
  ]

  const subscriptionTiers = [
    {
      name: 'Basic',
      price: 9.99,
      subscribers: 890,
      revenue: 8910.10,
    },
    {
      name: 'Premium',
      price: 19.99,
      subscribers: 357,
      revenue: 7135.43,
    },
  ]

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="text-center space-y-4 ml-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Creator Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your content and track your performance
          </p>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Content
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubscribers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +180 from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.engagementRate}%</div>
            <p className="text-xs text-muted-foreground">
              +0.5% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Posts</CardTitle>
              <CardDescription>Your latest content performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{post.content}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {post.views.toLocaleString()}
                      </span>
                      <span className="flex items-center">
                        <Heart className="h-3 w-3 mr-1" />
                        {post.likes}
                      </span>
                      <span className="flex items-center">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        {post.comments}
                      </span>
                      <span>{post.createdAt}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      +${post.revenue}
                    </div>
                    <Badge variant="secondary">Published</Badge>
                  </div>
                </div>
              ))}
              <Button className="w-full" variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Upload New Content
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="subscribers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Tiers</CardTitle>
              <CardDescription>Manage your subscription pricing and tiers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscriptionTiers.map((tier, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{tier.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      ${tier.price}/month • {tier.subscribers} subscribers
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${tier.revenue.toFixed(2)}</div>
                    <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                  </div>
                </div>
              ))}
              <Button className="w-full" variant="outline">
                Add New Tier
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Payout Schedule</CardTitle>
                <CardDescription>Next payout in 5 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Pending Balance</span>
                    <span className="font-semibold">$1,234.56</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing Fees</span>
                    <span className="text-red-600">-$37.04</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Net Payout</span>
                    <span>$1,197.52</span>
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Payout History
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>This month's earnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subscriptions</span>
                    <span className="font-semibold">$4,560.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tips</span>
                    <span className="font-semibold">$890.50</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pay-per-view</span>
                    <span className="font-semibold">$229.50</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Total</span>
                    <span>$5,680.00</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Detailed insights into your content performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                  <p>Analytics dashboard coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}