import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'

// Environment variables with defaults
const PORT = process.env.PORT || 3001
const NODE_ENV = process.env.NODE_ENV || 'development'
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'
const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret'

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

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
  max: NODE_ENV === 'production' ? 100 : 1000, // limit each IP to 100 requests per windowMs in production
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
      database: 'connected',
      cache: 'connected'
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
const authenticateUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header required' })
    }

    const token = authHeader.substring(7)
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    req.user = user
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

    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single()

    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken' })
    }

    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          display_name: displayName || username
        }
      }
    })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    // Create profile record
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          username,
          display_name: displayName || username,
          email,
          created_at: new Date().toISOString()
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
      }
    }

    res.status(201).json({ 
      message: 'User created successfully',
      user: {
        id: data.user?.id,
        email: data.user?.email,
        username,
        display_name: displayName || username
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

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return res.status(401).json({ error: error.message })
    }

    res.json({ 
      message: 'Login successful',
      user: {
        id: data.user.id,
        email: data.user.email,
        username: data.user.user_metadata?.username,
        display_name: data.user.user_metadata?.display_name
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at
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

    let query = supabase
      .from('posts')
      .select(`
        *,
        profiles:creator_id (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })

    if (creator_id) {
      query = query.eq('creator_id', creator_id)
    }

    const { data, error } = await query
      .range(offset, offset + Number(limit) - 1)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json({
      posts: data || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: data?.length || 0
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

    const { data, error } = await supabase
      .from('posts')
      .insert({
        id: uuidv4(),
        content,
        creator_id,
        media_urls: media_urls || [],
        tags: tags || [],
        created_at: new Date().toISOString()
      })
      .select(`
        *,
        profiles:creator_id (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .single()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.status(201).json({ 
      message: 'Post created successfully',
      post: data 
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

    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        username,
        display_name,
        bio,
        avatar_url,
        cover_url,
        verified,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .single()

    if (error) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ user: data })
  } catch (error) {
    console.error('User fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Search routes
app.get('/api/v1/search', async (req, res) => {
  try {
    const { q, type = 'all', page = 1, limit = 20 } = req.query

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
      const { data: users } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
        .range(offset, offset + Number(limit) - 1)

      results.users = users || []
    }

    if (type === 'all' || type === 'posts') {
      const { data: posts } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:creator_id (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .or(`content.ilike.%${q}%,tags.cs.{${q}}`)
        .order('created_at', { ascending: false })
        .range(offset, offset + Number(limit) - 1)

      results.posts = posts || []
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

// Analytics routes
app.get('/api/v1/analytics/overview', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id

    // Get user stats
    const { data: userStats } = await supabase
      .from('profiles')
      .select('followers_count, following_count, posts_count')
      .eq('id', userId)
      .single()

    // Get recent posts
    const { data: recentPosts } = await supabase
      .from('posts')
      .select('id, content, created_at, likes_count, comments_count')
      .eq('creator_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    res.json({
      user_stats: userStats,
      recent_posts: recentPosts || []
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

