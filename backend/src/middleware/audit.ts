import { Request, Response, NextFunction } from 'express'
import { supabase } from '../config/supabase'
import { logger } from '../utils/logger'

export interface AuditLog {
  id?: string
  user_id?: string
  action: string
  resource: string
  resource_id?: string
  details: any
  ip_address: string
  user_agent: string
  timestamp: string
  status: 'success' | 'failure' | 'error'
  error_message?: string
}

export const auditLogger = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now()
  const originalSend = res.send
  
  // Override res.send to capture response
  res.send = function(data) {
    const duration = Date.now() - startTime
    const status = res.statusCode >= 400 ? 'failure' : 'success'
    
    // Log audit entry
    logAuditEntry({
      user_id: (req as any).user?.id,
      action: `${req.method} ${req.route?.path || req.path}`,
      resource: req.path.split('/')[1] || 'unknown',
      resource_id: req.params.id,
      details: {
        method: req.method,
        url: req.url,
        body: req.method !== 'GET' ? req.body : undefined,
        query: req.query,
        params: req.params,
        status_code: res.statusCode,
        duration_ms: duration,
        response_size: data ? data.length : 0
      },
      ip_address: req.ip || req.connection.remoteAddress || 'unknown',
      user_agent: req.get('User-Agent') || 'unknown',
      timestamp: new Date().toISOString(),
      status,
      error_message: res.statusCode >= 400 ? data : undefined
    })
    
    return originalSend.call(this, data)
  }
  
  next()
}

export const logAuditEntry = async (auditData: AuditLog) => {
  try {
    // Log to database
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: auditData.user_id,
        action: auditData.action,
        resource: auditData.resource,
        resource_id: auditData.resource_id,
        details: auditData.details,
        ip_address: auditData.ip_address,
        user_agent: auditData.user_agent,
        timestamp: auditData.timestamp,
        status: auditData.status,
        error_message: auditData.error_message
      })
    
    if (error) {
      logger.error('Failed to log audit entry:', error)
    }
    
    // Also log to file for critical actions
    if (auditData.action.includes('DELETE') || 
        auditData.action.includes('PAYMENT') || 
        auditData.action.includes('AUTH')) {
      logger.info('Critical action logged:', auditData)
    }
  } catch (error) {
    logger.error('Audit logging error:', error)
  }
}

// Specific audit middleware for sensitive operations
export const auditSensitiveOperation = (operation: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await logAuditEntry({
        user_id: (req as any).user?.id,
        action: operation,
        resource: req.path.split('/')[1] || 'unknown',
        resource_id: req.params.id,
        details: {
          method: req.method,
          url: req.url,
          body: req.body,
          query: req.query,
          params: req.params
        },
        ip_address: req.ip || req.connection.remoteAddress || 'unknown',
        user_agent: req.get('User-Agent') || 'unknown',
        timestamp: new Date().toISOString(),
        status: 'success'
      })
      
      next()
    } catch (error) {
      logger.error('Sensitive operation audit error:', error)
      next()
    }
  }
}

// Audit middleware for payment operations
export const auditPaymentOperation = async (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send
  
  res.send = function(data) {
    const status = res.statusCode >= 400 ? 'failure' : 'success'
    
    logAuditEntry({
      user_id: (req as any).user?.id,
      action: `PAYMENT_${req.method}`,
      resource: 'payment',
      resource_id: req.params.id,
      details: {
        method: req.method,
        url: req.url,
        body: req.body,
        status_code: res.statusCode,
        response: data
      },
      ip_address: req.ip || req.connection.remoteAddress || 'unknown',
      user_agent: req.get('User-Agent') || 'unknown',
      timestamp: new Date().toISOString(),
      status,
      error_message: res.statusCode >= 400 ? data : undefined
    })
    
    return originalSend.call(this, data)
  }
  
  next()
}

// Audit middleware for authentication operations
export const auditAuthOperation = async (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send
  
  res.send = function(data) {
    const status = res.statusCode >= 400 ? 'failure' : 'success'
    
    logAuditEntry({
      user_id: (req as any).user?.id,
      action: `AUTH_${req.method}`,
      resource: 'authentication',
      details: {
        method: req.method,
        url: req.url,
        body: req.method !== 'GET' ? req.body : undefined,
        status_code: res.statusCode,
        response: data
      },
      ip_address: req.ip || req.connection.remoteAddress || 'unknown',
      user_agent: req.get('User-Agent') || 'unknown',
      timestamp: new Date().toISOString(),
      status,
      error_message: res.statusCode >= 400 ? data : undefined
    })
    
    return originalSend.call(this, data)
  }
  
  next()
}
