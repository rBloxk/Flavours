import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

// Environment variables
const PORT = process.env.PORT || 3001
const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const app = express()

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// API routes
app.get('/api/v1/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// Auth routes
app.post('/api/v1/auth/register', async (req, res) => {
  try {
    const { email, password, username, displayName } = req.body

    // Basic validation
    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Create user in Supabase
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

    res.json({ 
      message: 'User created successfully',
      user: data.user 
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return res.status(401).json({ error: error.message })
    }

    res.json({ 
      message: 'Login successful',
      user: data.user,
      session: data.session
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Posts routes
app.get('/api/v1/posts', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    const { data, error } = await supabase
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

app.post('/api/v1/posts', async (req, res) => {
  try {
    const { content, creator_id, media_urls = [] } = req.body

    if (!content || !creator_id) {
      return res.status(400).json({ error: 'Content and creator_id required' })
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        content,
        creator_id,
        media_urls,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json({ 
      message: 'Post created successfully',
      post: data 
    })
  } catch (error) {
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
      .select('*')
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

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Flavours Backend running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🔗 API base: http://localhost:${PORT}/api/v1`)
})

export default app


