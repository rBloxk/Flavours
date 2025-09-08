import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'

export interface Metrics {
  requests_total: number
  requests_duration_ms: number
  requests_by_status: Record<number, number>
  requests_by_method: Record<string, number>
  requests_by_endpoint: Record<string, number>
  active_connections: number
  memory_usage: NodeJS.MemoryUsage
  uptime: number
}

class MetricsCollector {
  private metrics: Metrics = {
    requests_total: 0,
    requests_duration_ms: 0,
    requests_by_status: {},
    requests_by_method: {},
    requests_by_endpoint: {},
    active_connections: 0,
    memory_usage: process.memoryUsage(),
    uptime: process.uptime()
  }

  private startTime = Date.now()

  incrementRequest(method: string, endpoint: string, status: number, duration: number) {
    this.metrics.requests_total++
    this.metrics.requests_duration_ms += duration
    
    this.metrics.requests_by_status[status] = (this.metrics.requests_by_status[status] || 0) + 1
    this.metrics.requests_by_method[method] = (this.metrics.requests_by_method[method] || 0) + 1
    this.metrics.requests_by_endpoint[endpoint] = (this.metrics.requests_by_endpoint[endpoint] || 0) + 1
    
    this.metrics.memory_usage = process.memoryUsage()
    this.metrics.uptime = process.uptime()
  }

  getMetrics(): Metrics {
    return { ...this.metrics }
  }

  getAverageResponseTime(): number {
    return this.metrics.requests_total > 0 
      ? this.metrics.requests_duration_ms / this.metrics.requests_total 
      : 0
  }

  getRequestsPerMinute(): number {
    const minutes = (Date.now() - this.startTime) / (1000 * 60)
    return minutes > 0 ? this.metrics.requests_total / minutes : 0
  }

  reset() {
    this.metrics = {
      requests_total: 0,
      requests_duration_ms: 0,
      requests_by_status: {},
      requests_by_method: {},
      requests_by_endpoint: {},
      active_connections: 0,
      memory_usage: process.memoryUsage(),
      uptime: process.uptime()
    }
    this.startTime = Date.now()
  }
}

export const metricsCollector = new MetricsCollector()

// Request monitoring middleware
export const requestMonitoring = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now()
  const method = req.method
  const endpoint = req.route?.path || req.path
  
  // Increment active connections
  metricsCollector.getMetrics().active_connections++
  
  const originalSend = res.send
  
  res.send = function(data) {
    const duration = Date.now() - startTime
    const status = res.statusCode
    
    // Record metrics
    metricsCollector.incrementRequest(method, endpoint, status, duration)
    
    // Log slow requests
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        method,
        endpoint,
        duration,
        status,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      })
    }
    
    // Log error requests
    if (status >= 400) {
      logger.error('Request error', {
        method,
        endpoint,
        duration,
        status,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        body: req.body,
        query: req.query
      })
    }
    
    // Decrement active connections
    metricsCollector.getMetrics().active_connections--
    
    return originalSend.call(this, data)
  }
  
  next()
}

// Health check endpoint with detailed metrics
export const healthCheck = (req: Request, res: Response) => {
  const metrics = metricsCollector.getMetrics()
  const memoryUsage = process.memoryUsage()
  const cpuUsage = process.cpuUsage()
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    memory: {
      used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024),
      rss: Math.round(memoryUsage.rss / 1024 / 1024)
    },
    cpu: {
      user: cpuUsage.user,
      system: cpuUsage.system
    },
    metrics: {
      requests_total: metrics.requests_total,
      average_response_time: metricsCollector.getAverageResponseTime(),
      requests_per_minute: metricsCollector.getRequestsPerMinute(),
      active_connections: metrics.active_connections,
      requests_by_status: metrics.requests_by_status,
      requests_by_method: metrics.requests_by_method
    },
    environment: process.env.NODE_ENV || 'development'
  }
  
  // Check if system is healthy
  const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100
  if (memoryUsagePercent > 90) {
    health.status = 'unhealthy'
    health.memory.critical = true
  }
  
  res.status(health.status === 'healthy' ? 200 : 503).json(health)
}

// Metrics endpoint for monitoring systems
export const metricsEndpoint = (req: Request, res: Response) => {
  const metrics = metricsCollector.getMetrics()
  
  // Format metrics for Prometheus
  const prometheusMetrics = `
# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total ${metrics.requests_total}

# HELP http_request_duration_milliseconds Total duration of HTTP requests in milliseconds
# TYPE http_request_duration_milliseconds counter
http_request_duration_milliseconds ${metrics.requests_duration_ms}

# HELP http_requests_by_status Total number of HTTP requests by status code
# TYPE http_requests_by_status counter
${Object.entries(metrics.requests_by_status).map(([status, count]) => 
  `http_requests_by_status{status="${status}"} ${count}`
).join('\n')}

# HELP http_requests_by_method Total number of HTTP requests by method
# TYPE http_requests_by_method counter
${Object.entries(metrics.requests_by_method).map(([method, count]) => 
  `http_requests_by_method{method="${method}"} ${count}`
).join('\n')}

# HELP nodejs_memory_usage_bytes Node.js memory usage in bytes
# TYPE nodejs_memory_usage_bytes gauge
nodejs_memory_usage_bytes{type="heap_used"} ${metrics.memory_usage.heapUsed}
nodejs_memory_usage_bytes{type="heap_total"} ${metrics.memory_usage.heapTotal}
nodejs_memory_usage_bytes{type="external"} ${metrics.memory_usage.external}
nodejs_memory_usage_bytes{type="rss"} ${metrics.memory_usage.rss}

# HELP nodejs_uptime_seconds Node.js uptime in seconds
# TYPE nodejs_uptime_seconds counter
nodejs_uptime_seconds ${metrics.uptime}
`
  
  res.set('Content-Type', 'text/plain')
  res.send(prometheusMetrics)
}

// Performance monitoring middleware
export const performanceMonitoring = (req: Request, res: Response, next: NextFunction) => {
  const startTime = process.hrtime.bigint()
  
  const originalSend = res.send
  
  res.send = function(data) {
    const endTime = process.hrtime.bigint()
    const duration = Number(endTime - startTime) / 1000000 // Convert to milliseconds
    
    // Log performance metrics
    logger.info('Request performance', {
      method: req.method,
      url: req.url,
      duration_ms: duration,
      status: res.statusCode,
      memory_used: process.memoryUsage().heapUsed,
      memory_total: process.memoryUsage().heapTotal
    })
    
    return originalSend.call(this, data)
  }
  
  next()
}

// Error tracking middleware
export const errorTracking = (error: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Application error', {
    error: error.message,
    stack: error.stack,
    method: req.method,
    url: req.url,
    body: req.body,
    query: req.query,
    params: req.params,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  })
  
  // In production, send to error tracking service (Sentry, etc.)
  if (process.env.NODE_ENV === 'production') {
    // Sentry.captureException(error)
  }
  
  next(error)
}
