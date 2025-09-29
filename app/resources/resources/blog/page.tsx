"use client"

import React from 'react'
import { ResourceHeader } from '@/components/layout/resource-header'
import { ResourceFooter } from '@/components/layout/resource-footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  Calendar, 
  User, 
  Tag,
  ArrowRight,
  Search,
  Filter,
  TrendingUp,
  Heart,
  MessageCircle,
  Share2,
  Clock,
  Eye
} from 'lucide-react'

export default function BlogPage() {
  const blogPosts = [
    {
      id: 1,
      title: "The Future of Creator Monetization: Trends to Watch in 2024",
      excerpt: "Explore the latest trends shaping the creator economy and how they're changing the way creators earn money online.",
      author: "Sarah Chen",
      authorRole: "Head of Creator Success",
      publishDate: "2024-01-15",
      readTime: "8 min read",
      category: "Industry Insights",
      tags: ["monetization", "trends", "creator economy"],
      image: "/api/placeholder/800/400",
      views: 1250,
      likes: 89,
      comments: 23
    },
    {
      id: 2,
      title: "Building Your Personal Brand: A Creator's Guide",
      excerpt: "Learn how to build a strong personal brand that resonates with your audience and drives engagement.",
      author: "Mike Rodriguez",
      authorRole: "Marketing Director",
      publishDate: "2024-01-12",
      readTime: "6 min read",
      category: "Creator Tips",
      tags: ["branding", "marketing", "personal brand"],
      image: "/api/placeholder/800/400",
      views: 980,
      likes: 67,
      comments: 15
    },
    {
      id: 3,
      title: "Content Protection: Keeping Your Work Safe Online",
      excerpt: "Essential strategies for protecting your content from theft and unauthorized use in the digital age.",
      author: "Alex Kim",
      authorRole: "Security Expert",
      publishDate: "2024-01-10",
      readTime: "10 min read",
      category: "Security",
      tags: ["content protection", "security", "copyright"],
      image: "/api/placeholder/800/400",
      views: 756,
      likes: 45,
      comments: 12
    },
    {
      id: 4,
      title: "The Psychology of Audience Engagement",
      excerpt: "Understanding what makes audiences tick and how to create content that truly connects with your viewers.",
      author: "Dr. Emily Watson",
      authorRole: "Behavioral Psychologist",
      publishDate: "2024-01-08",
      readTime: "12 min read",
      category: "Psychology",
      tags: ["psychology", "engagement", "audience"],
      image: "/api/placeholder/800/400",
      views: 1100,
      likes: 78,
      comments: 19
    },
    {
      id: 5,
      title: "Monetization Strategies That Actually Work",
      excerpt: "Real-world examples of successful monetization strategies from top creators on our platform.",
      author: "David Park",
      authorRole: "Business Analyst",
      publishDate: "2024-01-05",
      readTime: "9 min read",
      category: "Business",
      tags: ["monetization", "strategies", "success"],
      image: "/api/placeholder/800/400",
      views: 890,
      likes: 56,
      comments: 8
    },
    {
      id: 6,
      title: "The Art of Storytelling in Digital Content",
      excerpt: "Master the craft of storytelling to create compelling content that keeps your audience coming back for more.",
      author: "Lisa Wang",
      authorRole: "Content Strategist",
      publishDate: "2024-01-03",
      readTime: "7 min read",
      category: "Content Creation",
      tags: ["storytelling", "content", "narrative"],
      image: "/api/placeholder/800/400",
      views: 650,
      likes: 42,
      comments: 11
    }
  ]

  const categories = [
    "All Posts",
    "Industry Insights",
    "Creator Tips",
    "Security",
    "Psychology",
    "Business",
    "Content Creation"
  ]

  const featuredPost = blogPosts[0]

  return (
    <div className="min-h-screen bg-background">
      <ResourceHeader />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Flavours Blog</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Insights, tips, and stories from the creator economy
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <input
                type="text"
                placeholder="Search blog posts..."
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category, index) => (
              <Badge 
                key={index} 
                variant={index === 0 ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* Featured Post */}
        <Card className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="relative">
              <img
                src={featuredPost.image}
                alt={featuredPost.title}
                className="w-full h-64 lg:h-full object-cover rounded-lg"
              />
              <Badge className="absolute top-4 left-4 bg-primary">
                Featured
              </Badge>
            </div>
            <div className="p-6">
              <Badge variant="outline" className="mb-4">
                {featuredPost.category}
              </Badge>
              <h2 className="text-2xl font-bold mb-4">{featuredPost.title}</h2>
              <p className="text-muted-foreground mb-6">{featuredPost.excerpt}</p>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{featuredPost.author}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{featuredPost.publishDate}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{featuredPost.readTime}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{featuredPost.views}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="h-4 w-4" />
                    <span>{featuredPost.likes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{featuredPost.comments}</span>
                  </div>
                </div>
                <Button>
                  Read More
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Blog Posts Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Latest Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.slice(1).map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <div className="relative">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <Badge variant="outline" className="absolute top-3 left-3">
                    {post.category}
                  </Badge>
                </div>
                <CardHeader>
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{post.author}</span>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                  <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{post.publishDate}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{post.views}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4" />
                        <span>{post.likes}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <Card className="mb-12">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Stay Updated</CardTitle>
            <CardDescription>
              Get the latest blog posts and creator insights delivered to your inbox
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-md mx-auto">
              <div className="flex space-x-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button>Subscribe</Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                No spam, unsubscribe at any time
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Popular Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Tag className="h-6 w-6" />
              <span>Popular Tags</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {["monetization", "creator economy", "content creation", "marketing", "branding", "security", "engagement", "storytelling", "trends", "success"].map((tag, index) => (
                <Badge key={index} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                  #{tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <ResourceFooter />
    </div>
  )
}
