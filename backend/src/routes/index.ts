import { Express } from 'express'
import authRoutes from './auth'
import paymentRoutes from './payments'
import contentRoutes from './content'
import userRoutes from './users'
import adminRoutes from './admin'
import camsRoutes from './cams'
import flavourstalkRoutes from './flavourstalk'
import notificationsRoutes from './notifications'
import analyticsRoutes from './analytics'

export function setupRoutes(app: Express) {
  // API prefix
  const API_PREFIX = '/api/v1'

  // Routes
  app.use(`${API_PREFIX}/auth`, authRoutes)
  app.use(`${API_PREFIX}/payments`, paymentRoutes)
  app.use(`${API_PREFIX}/content`, contentRoutes)
  app.use(`${API_PREFIX}/users`, userRoutes)
  app.use(`${API_PREFIX}/admin`, adminRoutes)
  app.use(`${API_PREFIX}/cams`, camsRoutes)
  app.use(`${API_PREFIX}/flavourstalk`, flavourstalkRoutes)
  app.use(`${API_PREFIX}/notifications`, notificationsRoutes)
  app.use(`${API_PREFIX}/analytics`, analyticsRoutes)

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      error: 'Route not found',
      path: req.originalUrl
    })
  })
}