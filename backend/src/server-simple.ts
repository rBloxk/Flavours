import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { logger } from './utils/logger'

const app = express()
const PORT = process.env['PORT'] || 3001

// Basic middleware
app.use(helmet())
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// Basic API routes
app.get('/api/v1/test', (_req, res) => {
  res.json({ 
    message: 'Backend API is working!',
    timestamp: new Date().toISOString()
  })
})

// Content API (simplified)
app.get('/api/v1/content/posts', (_req, res) => {
  res.json({
    posts: [
      {
        id: '1',
        content: 'Welcome to Flavours! This is a test post.',
        creator: {
          id: '1',
          username: 'testuser',
          displayName: 'Test User',
          avatarUrl: null
        },
        createdAt: new Date().toISOString(),
        likesCount: 0,
        commentsCount: 0,
        isPaid: false,
        price: null
      }
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 1
    }
  })
})

// Cams API (simplified)
app.get('/api/v1/cams/streams', (_req, res) => {
  res.json({
    streams: [
      {
        id: '1',
        title: 'Test Stream',
        creator: {
          id: '1',
          username: 'testuser',
          displayName: 'Test User',
          avatarUrl: null
        },
        viewerCount: 0,
        isLive: false,
        category: 'general',
        thumbnailUrl: null,
        createdAt: new Date().toISOString()
      }
    ]
  })
})

// FlavoursTalk API (simplified)
app.get('/api/v1/flavourstalk/online-count', (_req, res) => {
  res.json({
    onlineCount: 0,
    activeSessions: 0
  })
})

// Error handling
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error:', err)
  res.status(500).json({
    error: 'Internal server error',
    message: process.env['NODE_ENV'] === 'development' ? err.message : 'Something went wrong'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`
  })
})

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Backend server running on port ${PORT}`)
  logger.info(`📊 Health check: http://localhost:${PORT}/health`)
  logger.info(`🔗 API test: http://localhost:${PORT}/api/v1/test`)
})

export default app
