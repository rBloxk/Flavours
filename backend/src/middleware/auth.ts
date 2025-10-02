import { Request, Response, NextFunction } from 'express'
import { supabase } from '../config/database'
import { logger } from '../utils/logger'

export interface AuthenticatedRequest extends Request {
  user: {
    id: string
    email: string
    role?: string
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({
        error: 'No authorization header'
      })
    }

    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({
        error: 'No token provided'
      })
    }

    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return res.status(401).json({
        error: 'Invalid token'
      })
    }

    ;(req as AuthenticatedRequest).user = {
      id: user.id,
      email: user.email || '',
      role: user.user_metadata?.role || 'user'
    }

    next()
  } catch (error) {
    logger.error('Auth middleware error:', error)
    res.status(401).json({
      error: 'Authentication failed'
    })
  }
}

export const requireCreator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id

    const { data: creator } = await supabase
      .from('creators')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!creator) {
      return res.status(403).json({
        error: 'Creator access required'
      })
    }

    next()
  } catch (error) {
    logger.error('Creator check error:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
}

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as AuthenticatedRequest).user
  
  if (user.role !== 'admin') {
    return res.status(403).json({
      error: 'Admin access required'
    })
  }

  next()
}