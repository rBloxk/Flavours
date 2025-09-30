import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'

// Environment variables with defaults
const PORT = process.env.PORT || 3001
const NODE_ENV = process.env.NODE_ENV || 'development'
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'

// In-memory storage (replace with database in production)
const users = new Map()
const posts = new Map()
const sessions = new Map()

const app = express()

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}))

// CORS configuration
app.use(cors({
  origin: NODE_ENV === 'production' ? [FRONTEND_URL] : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === 'production' ? 100 : 1000,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api/', limiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString()
  console.log(`${timestamp} ${req.method} ${req.path} - ${req.ip}`)
  next()
})

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: NODE_ENV
  })
})

app.get('/api/v1/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: NODE_ENV,
    services: {
      database: 'in-memory',
      cache: 'in-memory'
    }
  })
})

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(3).max(30),
  displayName: z.string().min(1).max(100).optional()
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

const postSchema = z.object({
  content: z.string().min(1).max(5000),
  creator_id: z.string().uuid(),
  media_urls: z.array(z.string().url()).optional(),
  tags: z.array(z.string()).optional()
})

// Auth middleware
const authenticateUser = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header required' })
    }

    const token = authHeader.substring(7)
    const session = sessions.get(token)

    if (!session || session.expiresAt < Date.now()) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    req.user = session.user
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(401).json({ error: 'Authentication failed' })
  }
}

// Auth routes
app.post('/api/v1/auth/register', async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body)
    const { email, password, username, displayName } = validatedData

    // Check if user already exists
    for (const [id, user] of users) {
      if (user.email === email || user.username === username) {
        return res.status(400).json({ error: 'User already exists' })
      }
    }

    const userId = uuidv4()
    const user = {
      id: userId,
      email,
      username,
      display_name: displayName || username,
      created_at: new Date().toISOString(),
      followers_count: 0,
      following_count: 0,
      posts_count: 0
    }

    users.set(userId, user)

    res.status(201).json({ 
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        display_name: user.display_name
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.errors 
      })
    }
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body)
    const { email, password } = validatedData

    // Find user (in production, verify password hash)
    let user = null
    for (const [id, u] of users) {
      if (u.email === email) {
        user = u
        break
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Create session
    const token = uuidv4()
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    sessions.set(token, {
      user,
      expiresAt
    })

  res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        display_name: user.display_name
      },
      session: {
        access_token: token,
        expires_at: expiresAt
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.errors 
      })
    }
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Posts routes
app.get('/api/v1/posts', async (req, res) => {
  try {
    const { page = 1, limit = 20, creator_id } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    let allPosts = Array.from(posts.values())

    if (creator_id) {
      allPosts = allPosts.filter(post => post.creator_id === creator_id)
    }

    // Sort by created_at descending
    allPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    const paginatedPosts = allPosts.slice(offset, offset + Number(limit))

    // Add user info to posts
    const postsWithUsers = paginatedPosts.map(post => {
      const user = users.get(post.creator_id)
      return {
        ...post,
        profiles: user ? {
          id: user.id,
          username: user.username,
          display_name: user.display_name,
          avatar_url: user.avatar_url
        } : null
      }
    })

    res.json({
      posts: postsWithUsers,
    pagination: {
        page: Number(page),
        limit: Number(limit),
        total: allPosts.length
      }
    })
  } catch (error) {
    console.error('Posts fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/v1/posts', authenticateUser, async (req, res) => {
  try {
    const validatedData = postSchema.parse(req.body)
    const { content, creator_id, media_urls, tags } = validatedData

    // Verify user owns the creator_id
    if (req.user.id !== creator_id) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    const postId = uuidv4()
    const post = {
      id: postId,
      content,
      creator_id,
      media_urls: media_urls || [],
      tags: tags || [],
      likes_count: 0,
      comments_count: 0,
      shares_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    posts.set(postId, post)

    // Update user's post count
    const user = users.get(creator_id)
    if (user) {
      user.posts_count += 1
      users.set(creator_id, user)
    }
    const postWithUser = {
      ...post,
      profiles: user ? {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        avatar_url: user.avatar_url
      } : null
    }

    res.status(201).json({ 
      message: 'Post created successfully',
      post: postWithUser
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.errors 
      })
    }
    console.error('Post creation error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Users routes
app.get('/api/v1/users/:id', async (req, res) => {
  try {
    const { id } = req.params

    const user = users.get(id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ user })
  } catch (error) {
    console.error('User fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Search routes
app.get('/api/v1/search', async (req, res) => {
  try {
    const { q, type = 'all', page = 1, limit = 20, category } = req.query

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query required' })
    }

    const offset = (Number(page) - 1) * Number(limit)
    const results: any = {
      users: [],
      posts: [],
      total: 0
    }

    if (type === 'all' || type === 'users') {
      const allUsers = Array.from(users.values())
      let filteredUsers = allUsers.filter(user => 
        user.username.toLowerCase().includes(q.toLowerCase()) ||
        user.display_name.toLowerCase().includes(q.toLowerCase())
      )

      // Apply category filter if specified
      if (category && category !== 'all') {
        filteredUsers = filteredUsers.filter(user => 
          user.bio?.toLowerCase().includes(category.toLowerCase()) ||
          user.username.toLowerCase().includes(category.toLowerCase())
        )
      }

      results.users = filteredUsers.slice(offset, offset + Number(limit))
    }

    if (type === 'all' || type === 'posts') {
      const allPosts = Array.from(posts.values())
      let filteredPosts = allPosts.filter(post => 
        post.content.toLowerCase().includes(q.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(q.toLowerCase()))
      )

      // Apply category filter if specified
      if (category && category !== 'all') {
        filteredPosts = filteredPosts.filter(post => 
          post.tags.some(tag => tag.toLowerCase().includes(category.toLowerCase()))
        )
      }

      results.posts = filteredPosts.slice(offset, offset + Number(limit))
    }

    results.total = results.users.length + results.posts.length

  res.json({
      query: q,
      results,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: results.total
      }
    })
  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Trending routes
app.get('/api/v1/trending/creators', async (req, res) => {
  try {
    const { limit = 10 } = req.query
    
    // Mock trending creators data
    const trendingCreators = [
      {
        id: 'trending-1',
        name: 'Sarah Johnson',
        username: '@sarah_fitness',
        avatar: '/avatars/sarah.jpg',
        followers: 125000,
        category: 'Fitness',
        verified: true,
        isCreator: true,
        bio: 'Certified personal trainer helping you achieve your fitness goals 💪',
        recentPost: 'New HIIT workout routine is live!',
        engagement: 98,
        isFollowing: false
      },
      {
        id: 'trending-2',
        name: 'Alex Chen',
        username: '@alex_artist',
        avatar: '/avatars/alex.jpg',
        followers: 89000,
        category: 'Art',
        verified: true,
        isCreator: true,
        bio: 'Digital artist creating stunning visual experiences',
        recentPost: 'Behind the scenes of my latest digital painting',
        engagement: 94,
        isFollowing: false
      },
      {
        id: 'trending-3',
        name: 'Maya Rodriguez',
        username: '@maya_cooking',
        avatar: '/avatars/maya.jpg',
        followers: 156000,
        category: 'Food',
        verified: true,
        isCreator: true,
        bio: 'Chef sharing authentic recipes and cooking tips',
        recentPost: 'Traditional pasta recipe from my grandmother',
        engagement: 96,
        isFollowing: false
      }
    ]

    res.json({
      creators: trendingCreators.slice(0, Number(limit))
    })
  } catch (error) {
    console.error('Trending creators error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// User follow routes
app.post('/api/v1/users/:id/follow', async (req, res) => {
  try {
    const { id } = req.params
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization required' })
    }

    // Mock follow functionality
    res.json({
      message: 'Followed successfully',
      following: true
    })
  } catch (error) {
    console.error('Follow error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.delete('/api/v1/users/:id/follow', async (req, res) => {
  try {
    const { id } = req.params
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization required' })
    }

    // Mock unfollow functionality
    res.json({
      message: 'Unfollowed successfully',
      following: false
    })
  } catch (error) {
    console.error('Unfollow error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Post interaction routes
app.post('/api/v1/posts/:id/like', async (req, res) => {
  try {
    const { id } = req.params
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization required' })
    }

    // Mock like functionality
    res.json({
      message: 'Liked successfully',
      liked: true
    })
  } catch (error) {
    console.error('Like error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.delete('/api/v1/posts/:id/like', async (req, res) => {
  try {
    const { id } = req.params
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization required' })
    }

    // Mock unlike functionality
    res.json({
      message: 'Unliked successfully',
      liked: false
    })
  } catch (error) {
    console.error('Unlike error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/v1/posts/:id/bookmark', async (req, res) => {
  try {
    const { id } = req.params
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization required' })
    }

    // Mock bookmark functionality
    res.json({
      message: 'Bookmarked successfully',
      bookmarked: true
    })
  } catch (error) {
    console.error('Bookmark error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.delete('/api/v1/posts/:id/bookmark', async (req, res) => {
  try {
    const { id } = req.params
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization required' })
    }

    // Mock unbookmark functionality
    res.json({
      message: 'Unbookmarked successfully',
      bookmarked: false
    })
  } catch (error) {
    console.error('Unbookmark error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// User settings routes
app.get('/api/v1/settings', async (req, res) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization required' })
    }

    // Mock user settings
    const settings = {
      content: {
        matureContent: false,
        violenceFilter: true,
        profanityFilter: true,
        spamFilter: true,
        autoPlay: true,
        dataSaver: false,
        contentLanguage: 'en'
      },
      accessibility: {
        highContrast: false,
        reducedMotion: false,
        screenReader: false,
        colorBlindSupport: false,
        keyboardNavigation: true,
        focusIndicators: true,
        altText: true
      },
      security: {
        twoFactorAuth: false,
        loginAlerts: true,
        deviceManagement: true,
        sessionTimeout: 30,
        biometricAuth: false,
        secureBackup: false,
        privacyMode: false,
        dataEncryption: true
      },
      data: {
        autoBackup: true,
        cloudSync: true,
        dataRetention: 365,
        analyticsOptIn: true,
        crashReporting: true,
        performanceMonitoring: true,
        personalizedAds: false,
        locationTracking: false
      }
    }

    res.json({ settings })
  } catch (error) {
    console.error('Settings fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.put('/api/v1/settings', async (req, res) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization required' })
    }

    const { settings } = req.body

    // Mock settings update
    console.log('Settings updated:', settings)

    res.json({
      message: 'Settings updated successfully',
      settings
    })
  } catch (error) {
    console.error('Settings update error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/api/v1/settings/content', async (req, res) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization required' })
    }

    // Mock content settings
    const contentSettings = {
      matureContent: false,
      violenceFilter: true,
      profanityFilter: true,
      spamFilter: true,
      autoPlay: true,
      dataSaver: false,
      contentLanguage: 'en'
    }

    res.json({ contentSettings })
  } catch (error) {
    console.error('Content settings fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.put('/api/v1/settings/content', async (req, res) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization required' })
    }

    const { contentSettings } = req.body

    // Mock content settings update
    console.log('Content settings updated:', contentSettings)

    res.json({
      message: 'Content settings updated successfully',
      contentSettings
    })
  } catch (error) {
    console.error('Content settings update error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/api/v1/settings/accessibility', async (req, res) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization required' })
    }

    // Mock accessibility settings
    const accessibilitySettings = {
      highContrast: false,
      reducedMotion: false,
      screenReader: false,
      colorBlindSupport: false,
      keyboardNavigation: true,
      focusIndicators: true,
      altText: true
    }

    res.json({ accessibilitySettings })
  } catch (error) {
    console.error('Accessibility settings fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.put('/api/v1/settings/accessibility', async (req, res) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization required' })
    }

    const { accessibilitySettings } = req.body

    // Mock accessibility settings update
    console.log('Accessibility settings updated:', accessibilitySettings)

    res.json({
      message: 'Accessibility settings updated successfully',
      accessibilitySettings
    })
  } catch (error) {
    console.error('Accessibility settings update error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/api/v1/settings/security', async (req, res) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization required' })
    }

    // Mock security settings
    const securitySettings = {
      twoFactorAuth: false,
      loginAlerts: true,
      deviceManagement: true,
      sessionTimeout: 30,
      biometricAuth: false,
      secureBackup: false,
      privacyMode: false,
      dataEncryption: true
    }

    res.json({ securitySettings })
  } catch (error) {
    console.error('Security settings fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.put('/api/v1/settings/security', async (req, res) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization required' })
    }

    const { securitySettings } = req.body

    // Mock security settings update
    console.log('Security settings updated:', securitySettings)

    res.json({
      message: 'Security settings updated successfully',
      securitySettings
    })
  } catch (error) {
    console.error('Security settings update error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/api/v1/settings/data', async (req, res) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization required' })
    }

    // Mock data settings
    const dataSettings = {
      autoBackup: true,
      cloudSync: true,
      dataRetention: 365,
      analyticsOptIn: true,
      crashReporting: true,
      performanceMonitoring: true,
      personalizedAds: false,
      locationTracking: false
    }

    res.json({ dataSettings })
  } catch (error) {
    console.error('Data settings fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.put('/api/v1/settings/data', async (req, res) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization required' })
    }

    const { dataSettings } = req.body

    // Mock data settings update
    console.log('Data settings updated:', dataSettings)

    res.json({
      message: 'Data settings updated successfully',
      dataSettings
    })
  } catch (error) {
    console.error('Data settings update error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Data export/import routes
app.get('/api/v1/data/export', async (req, res) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization required' })
    }

    // Mock data export
    const exportData = {
      user: {
        id: 'user-123',
        email: 'user@example.com',
        username: 'demo_user',
        display_name: 'Demo User',
        created_at: new Date().toISOString()
      },
      posts: [],
      followers: [],
      following: [],
      settings: {},
      export_date: new Date().toISOString()
    }

    res.json({
      message: 'Data export completed',
      download_url: '/api/v1/data/export/download',
      export_id: 'export-123'
    })
  } catch (error) {
    console.error('Data export error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/v1/data/import', async (req, res) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization required' })
    }

    const { importData } = req.body

    // Mock data import
    console.log('Data import requested:', importData)

    res.json({
      message: 'Data import completed successfully',
      imported_items: {
        posts: 0,
        followers: 0,
        following: 0,
        settings: 0
      }
    })
  } catch (error) {
    console.error('Data import error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.delete('/api/v1/data/delete', async (req, res) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization required' })
    }

    // Mock data deletion
    console.log('Data deletion requested')

    res.json({
      message: 'All data deleted successfully',
      deleted_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('Data deletion error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Analytics routes
app.get('/api/v1/analytics/overview', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id
    const user = users.get(userId)

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Get recent posts
    const allPosts = Array.from(posts.values())
    const userPosts = allPosts
      .filter(post => post.creator_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)

  res.json({
      user_stats: {
        followers_count: user.followers_count,
        following_count: user.following_count,
        posts_count: user.posts_count
      },
      recent_posts: userPosts
    })
  } catch (error) {
    console.error('Analytics error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  
  if (err instanceof z.ZodError) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: err.errors 
    })
  }

  res.status(500).json({
    error: NODE_ENV === 'production' ? 'Internal server error' : err.message 
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Flavours Backend running on port ${PORT}`)
  console.log(`🌍 Environment: ${NODE_ENV}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🔗 API base: http://localhost:${PORT}/api/v1`)
  
  // Add some sample data
  const sampleUser = {
    id: uuidv4(),
    email: 'demo@flavours.club',
    username: 'demo',
    display_name: 'Demo User',
    created_at: new Date().toISOString(),
    followers_count: 100,
    following_count: 50,
    posts_count: 5
  }
  users.set(sampleUser.id, sampleUser)

  const samplePost = {
    id: uuidv4(),
    content: 'Welcome to Flavours! This is a sample post to demonstrate the platform.',
    creator_id: sampleUser.id,
    media_urls: [],
    tags: ['welcome', 'demo'],
    likes_count: 25,
    comments_count: 3,
    shares_count: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  posts.set(samplePost.id, samplePost)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('Process terminated')
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  server.close(() => {
    console.log('Process terminated')
  })
})

export default app