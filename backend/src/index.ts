import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { setupRoutes } from './routes'
import { setupWebSocket } from './websocket'
import { logger } from './utils/logger'
import { errorHandler, errorRecovery, handleUnhandledRejection, handleUncaughtException, gracefulShutdown } from './middleware/errorHandler'
import { rateLimiter } from './middleware/rateLimiter'
import { securityHeaders, ipFilter, requestSizeLimiter, sqlInjectionProtection, xssProtection } from './middleware/security'
import { requestMonitoring, healthCheck, metricsEndpoint, performanceMonitoring, errorTracking } from './middleware/monitoring'
import { auditLogger, auditPaymentOperation, auditAuthOperation } from './middleware/audit'
import { sanitizeInput, validateContentType } from './middleware/validation'
import { redisManager } from './config/redis'
import { databaseManager } from './config/database'

dotenv.config()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
  },
  transports: ['websocket', 'polling']
})

const PORT = process.env.PORT || 3001

// Set trust proxy for accurate IP addresses
app.set('trust proxy', 1)

// Global error handlers
process.on('unhandledRejection', handleUnhandledRejection)
process.on('uncaughtException', handleUncaughtException)

// Graceful shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Security middleware
app.use(securityHeaders)
app.use(ipFilter)
app.use(requestSizeLimiter)
app.use(sqlInjectionProtection)
app.use(xssProtection)

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID']
}))

// Helmet security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false
}))

// Request parsing middleware
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf.toString())
    } catch (e) {
      res.status(400).json({ error: 'Invalid JSON' })
      throw new Error('Invalid JSON')
    }
  }
}))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Content type validation
app.use(validateContentType(['application/json', 'multipart/form-data', 'application/x-www-form-urlencoded']))

// Input sanitization
app.use(sanitizeInput)

// Error recovery middleware
app.use(errorRecovery)

// Monitoring middleware
app.use(requestMonitoring)
app.use(performanceMonitoring)
app.use(errorTracking)

// Rate limiting
app.use(rateLimiter)

// Audit logging
app.use(auditLogger)

// Health check endpoints
app.get('/health', healthCheck)
app.get('/metrics', metricsEndpoint)

// API routes
setupRoutes(app)

// WebSocket setup
const websocketHandlers = setupWebSocket(io)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  })
})

// Error handling (must be last)
app.use(errorHandler)

// Start server
server.listen(PORT, async () => {
  try {
    // Initialize services
    await redisManager.healthCheck()
    await databaseManager.healthCheck()
    
    logger.info(`🚀 Flavours Backend Server running on port ${PORT}`)
    logger.info(`🔗 WebSocket server ready`)
    logger.info(`📊 Health check: http://localhost:${PORT}/health`)
    logger.info(`📈 Metrics: http://localhost:${PORT}/metrics`)
    logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
    logger.info(`🔒 Security: Enhanced`)
    logger.info(`📝 Monitoring: Enabled`)
    logger.info(`💾 Cache: Redis connected`)
    logger.info(`🗄️ Database: Supabase connected`)
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
})

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down server...')
  
  server.close(async () => {
    try {
      await redisManager.close()
      await databaseManager.close()
      logger.info('Server shut down gracefully')
      process.exit(0)
    } catch (error) {
      logger.error('Error during shutdown:', error)
      process.exit(1)
    }
  })
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

export { app, io }