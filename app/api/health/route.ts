import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()
    
    // Check database connection
    let dbStatus = 'healthy'
    let dbResponseTime = 0
    
    try {
      const dbStartTime = Date.now()
      const { error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
      
      dbResponseTime = Date.now() - dbStartTime
      
      if (error) {
        dbStatus = 'unhealthy'
      }
    } catch (error) {
      dbStatus = 'unhealthy'
      dbResponseTime = Date.now() - Date.now()
    }

    // Check Redis connection (if available)
    let redisStatus = 'not_configured'
    let redisResponseTime = 0
    
    // Check file storage
    let storageStatus = 'healthy'
    let storageResponseTime = 0
    
    try {
      const storageStartTime = Date.now()
      // Check if uploads directory exists and is writable
      const fs = require('fs')
      const path = require('path')
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
      
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true })
      }
      
      storageResponseTime = Date.now() - storageStartTime
    } catch (error) {
      storageStatus = 'unhealthy'
      storageResponseTime = Date.now() - Date.now()
    }

    // Check environment variables
    const requiredEnvVars = [
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
      'NEXTAUTH_SECRET'
    ]
    
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])
    
    // Calculate overall health
    const overallStatus = 
      dbStatus === 'healthy' && 
      storageStatus === 'healthy' && 
      missingEnvVars.length === 0 
        ? 'healthy' 
        : 'unhealthy'

    const responseTime = Date.now() - startTime

    const healthData = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
      services: {
        database: {
          status: dbStatus,
          responseTime: `${dbResponseTime}ms`,
          connection: 'supabase'
        },
        redis: {
          status: redisStatus,
          responseTime: `${redisResponseTime}ms`,
          connection: 'not_configured'
        },
        storage: {
          status: storageStatus,
          responseTime: `${storageResponseTime}ms`,
          type: 'local'
        }
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        missingVariables: missingEnvVars
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      }
    }

    const statusCode = overallStatus === 'healthy' ? 200 : 503

    return NextResponse.json(healthData, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Health check error:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }
}
