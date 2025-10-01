import { NextRequest, NextResponse } from 'next/server'

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  author: string
  authorRole: string
  publishDate: string
  readTime: string
  category: string
  tags: string[]
  image: string
  views: number
  likes: number
  comments: number
  status: 'draft' | 'published' | 'archived'
  createdAt: string
  updatedAt: string
}

// Mock database
let mockPosts: BlogPost[] = [
  {
    id: '1',
    title: "The Future of Creator Monetization: Trends to Watch in 2024",
    excerpt: "Explore the latest trends shaping the creator economy and how they're changing the way creators earn money online.",
    content: "The creator economy has been rapidly evolving, and 2024 promises to bring even more exciting changes. From new monetization platforms to innovative content formats, creators have more opportunities than ever to build sustainable businesses...",
    author: "Sarah Chen",
    authorRole: "Head of Creator Success",
    publishDate: "2024-01-15",
    readTime: "8 min read",
    category: "Industry Insights",
    tags: ["monetization", "trends", "creator economy"],
    image: "/api/placeholder/800/400",
    views: 1250,
    likes: 89,
    comments: 23,
    status: "published",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z"
  },
  {
    id: '2',
    title: "Building Your Personal Brand: A Creator's Guide",
    excerpt: "Learn how to build a strong personal brand that resonates with your audience and drives engagement.",
    content: "Building a personal brand is one of the most important investments a creator can make. It's not just about having a recognizable name or logo—it's about creating a consistent experience that your audience can trust and connect with...",
    author: "Mike Rodriguez",
    authorRole: "Marketing Director",
    publishDate: "2024-01-12",
    readTime: "6 min read",
    category: "Creator Tips",
    tags: ["branding", "marketing", "personal brand"],
    image: "/api/placeholder/800/400",
    views: 980,
    likes: 67,
    comments: 15,
    status: "published",
    createdAt: "2024-01-12T14:30:00Z",
    updatedAt: "2024-01-12T14:30:00Z"
  },
  {
    id: '3',
    title: "Content Protection: Keeping Your Work Safe Online",
    excerpt: "Essential strategies for protecting your creative content from theft and unauthorized use.",
    content: "As a creator, your content is your most valuable asset. Unfortunately, content theft and unauthorized use are common problems in the digital world. Here are some essential strategies to protect your work...",
    author: "Emily Johnson",
    authorRole: "Legal Counsel",
    publishDate: "2024-01-10",
    readTime: "5 min read",
    category: "Legal & Safety",
    tags: ["copyright", "protection", "legal"],
    image: "/api/placeholder/800/400",
    views: 750,
    likes: 45,
    comments: 8,
    status: "published",
    createdAt: "2024-01-10T09:15:00Z",
    updatedAt: "2024-01-10T09:15:00Z"
  },
  {
    id: '4',
    title: "Draft: Advanced Analytics for Content Creators",
    excerpt: "Understanding your audience through data-driven insights.",
    content: "This is a draft post about analytics...",
    author: "Alex Thompson",
    authorRole: "Data Analyst",
    publishDate: "2024-01-20",
    readTime: "7 min read",
    category: "Analytics",
    tags: ["analytics", "data", "insights"],
    image: "/api/placeholder/800/400",
    views: 0,
    likes: 0,
    comments: 0,
    status: "draft",
    createdAt: "2024-01-20T16:45:00Z",
    updatedAt: "2024-01-20T16:45:00Z"
  }
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const statusFilter = searchParams.get('status') as BlogPost['status'] | null
  const searchTerm = searchParams.get('search')

  let filteredPosts = mockPosts

  if (statusFilter && statusFilter !== 'all') {
    filteredPosts = filteredPosts.filter(post => post.status === statusFilter)
  }

  if (searchTerm) {
    const lowerCaseSearchTerm = searchTerm.toLowerCase()
    filteredPosts = filteredPosts.filter(post =>
      post.title.toLowerCase().includes(lowerCaseSearchTerm) ||
      post.excerpt.toLowerCase().includes(lowerCaseSearchTerm) ||
      post.author.toLowerCase().includes(lowerCaseSearchTerm) ||
      post.tags.some(tag => tag.toLowerCase().includes(lowerCaseSearchTerm))
    )
  }

  return NextResponse.json({
    success: true,
    data: filteredPosts,
    total: mockPosts.length,
    published: mockPosts.filter(post => post.status === 'published').length,
    draft: mockPosts.filter(post => post.status === 'draft').length,
    archived: mockPosts.filter(post => post.status === 'archived').length,
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  const newPost: BlogPost = {
    id: (mockPosts.length + 1).toString(),
    title: body.title,
    excerpt: body.excerpt,
    content: body.content,
    author: body.author,
    authorRole: body.authorRole,
    publishDate: body.publishDate || new Date().toISOString().split('T')[0],
    readTime: body.readTime,
    category: body.category,
    tags: body.tags || [],
    image: body.image,
    views: body.views || 0,
    likes: body.likes || 0,
    comments: body.comments || 0,
    status: body.status || 'draft',
    createdAt: body.createdAt || new Date().toISOString(),
    updatedAt: body.updatedAt || new Date().toISOString()
  }

  mockPosts.unshift(newPost)

  return NextResponse.json({
    success: true,
    data: newPost
  })
}

export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const { id, ...updateData } = body

  const postIndex = mockPosts.findIndex(post => post.id === id)

  if (postIndex === -1) {
    return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 })
  }

  const updatedPost = {
    ...mockPosts[postIndex],
    ...updateData,
    updatedAt: new Date().toISOString()
  }

  mockPosts[postIndex] = updatedPost

  return NextResponse.json({
    success: true,
    data: updatedPost
  })
}

export async function DELETE(request: NextRequest) {
  const body = await request.json()
  const { id } = body

  const postIndex = mockPosts.findIndex(post => post.id === id)

  if (postIndex === -1) {
    return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 })
  }

  const deletedPost = mockPosts[postIndex]
  mockPosts.splice(postIndex, 1)

  return NextResponse.json({
    success: true,
    data: deletedPost
  })
}
