import { createClient } from '@supabase/supabase-js'
import { logger } from '../utils/logger'

export interface DatabaseConfig {
  url: string
  serviceKey: string
  maxConnections: number
  connectionTimeout: number
  queryTimeout: number
  retryAttempts: number
  retryDelay: number
}

class DatabaseManager {
  private supabase: any
  private config: DatabaseConfig
  private connectionPool: Map<string, any> = new Map()
  private isHealthy: boolean = true
  private lastHealthCheck: number = 0

  constructor() {
    this.config = {
      url: process.env.SUPABASE_URL || 'https://yrdwgiyfybnshhkznbaj.supabase.co',
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZHdnaXlmeWJuc2hoa3puYmFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwMjI2NSwiZXhwIjoyMDczNDc4MjY1fQ.fc8QJ_t-7rXP71P3acLs8JpeHYOt7z3JarZKX477fqI',
      maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
      connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000'),
      queryTimeout: parseInt(process.env.DB_QUERY_TIMEOUT || '30000'),
      retryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS || '3'),
      retryDelay: parseInt(process.env.DB_RETRY_DELAY || '1000')
    }

    if (!this.config.url || !this.config.serviceKey) {
      throw new Error('Missing Supabase environment variables')
    }

    this.initializeConnection()
    this.startHealthCheck()
  }

  private initializeConnection() {
    try {
      this.supabase = createClient(this.config.url, this.config.serviceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        db: {
          schema: 'public'
        },
        global: {
          headers: {
            'x-application-name': 'flavours-backend',
            'x-client-version': process.env.npm_package_version || '1.0.0'
          }
        }
      })

      logger.info('Database connection initialized', {
        url: this.config.url,
        maxConnections: this.config.maxConnections
      })
    } catch (error) {
      logger.error('Failed to initialize database connection:', error)
      throw error
    }
  }

  public getClient() {
    if (!this.isHealthy) {
      throw new Error('Database is not healthy')
    }
    return this.supabase
  }

  public async executeQuery<T>(
    query: () => Promise<{ data: T | null; error: any }>,
    retries: number = this.config.retryAttempts
  ): Promise<T> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const startTime = Date.now()
        const result = await query()
        const duration = Date.now() - startTime

        if (result.error) {
          throw new Error(result.error.message || 'Database query failed')
        }

        // Log slow queries
        if (duration > 1000) {
          logger.warn('Slow query detected', {
            duration,
            attempt
          })
        }

        return result.data as T
      } catch (error) {
        logger.error(`Database query attempt ${attempt} failed:`, error)

        if (attempt === retries) {
          throw error
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * attempt))
      }
    }

    throw new Error('All database query attempts failed')
  }

  public async executeTransaction<T>(
    operations: Array<() => Promise<any>>
  ): Promise<T[]> {
    const results: T[] = []
    
    try {
      for (const operation of operations) {
        const result = await this.executeQuery(operation)
        results.push(result)
      }
      
      return results
    } catch (error) {
      logger.error('Transaction failed:', error)
      throw error
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      const startTime = Date.now()
      const { error } = await this.supabase
        .from('profiles')
        .select('id')
        .limit(1)
      
      const duration = Date.now() - startTime
      
      if (error) {
        logger.error('Database health check failed:', error)
        this.isHealthy = false
        return false
      }

      this.isHealthy = true
      this.lastHealthCheck = Date.now()
      
      logger.debug('Database health check passed', { duration })
      return true
    } catch (error) {
      logger.error('Database health check error:', error)
      this.isHealthy = false
      return false
    }
  }

  private startHealthCheck() {
    // Health check every 30 seconds
    setInterval(async () => {
      await this.healthCheck()
    }, 30000)
  }

  public getConnectionStats() {
    return {
      isHealthy: this.isHealthy,
      lastHealthCheck: this.lastHealthCheck,
      maxConnections: this.config.maxConnections,
      connectionTimeout: this.config.connectionTimeout,
      queryTimeout: this.config.queryTimeout
    }
  }

  public async close() {
    try {
      // Supabase client doesn't need explicit closing
      logger.info('Database connection closed')
    } catch (error) {
      logger.error('Error closing database connection:', error)
    }
  }
}

// Singleton instance
export const databaseManager = new DatabaseManager()

// Export the Supabase client for backward compatibility
export const supabase = databaseManager.getClient()

// Database utility functions
export class DatabaseUtils {
  static async paginate<T>(
    query: any,
    page: number = 1,
    limit: number = 20,
    orderBy: string = 'created_at',
    orderDirection: 'asc' | 'desc' = 'desc'
  ): Promise<{ data: T[]; total: number; page: number; limit: number }> {
    try {
      const offset = (page - 1) * limit
      
      // Get total count
      const { count, error: countError } = await query.select('*', { count: 'exact', head: true })
      if (countError) throw countError
      
      // Get paginated data
      const { data, error } = await query
        .select('*')
        .order(orderBy, { ascending: orderDirection === 'asc' })
        .range(offset, offset + limit - 1)
      
      if (error) throw error
      
      return {
        data: data || [],
        total: count || 0,
        page,
        limit
      }
    } catch (error) {
      logger.error('Pagination error:', error)
      throw error
    }
  }

  static async batchInsert<T>(
    table: string,
    records: T[],
    batchSize: number = 100
  ): Promise<T[]> {
    const results: T[] = []
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize)
      
      const { data, error } = await supabase
        .from(table)
        .insert(batch)
        .select()
      
      if (error) {
        logger.error(`Batch insert error for ${table}:`, error)
        throw error
      }
      
      results.push(...(data || []))
    }
    
    return results
  }

  static async batchUpdate<T>(
    table: string,
    updates: Array<{ id: string; data: Partial<T> }>,
    batchSize: number = 100
  ): Promise<T[]> {
    const results: T[] = []
    
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize)
      
      const promises = batch.map(update =>
        supabase
          .from(table)
          .update(update.data)
          .eq('id', update.id)
          .select()
          .single()
      )
      
      const batchResults = await Promise.all(promises)
      
      for (const result of batchResults) {
        if (result.error) {
          logger.error(`Batch update error for ${table}:`, result.error)
          throw result.error
        }
        results.push(result.data)
      }
    }
    
    return results
  }

  static async softDelete(
    table: string,
    id: string,
    deletedBy?: string
  ): Promise<void> {
    const { error } = await supabase
      .from(table)
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: deletedBy
      })
      .eq('id', id)
    
    if (error) {
      logger.error(`Soft delete error for ${table}:`, error)
      throw error
    }
  }

  static async restore(
    table: string,
    id: string,
    restoredBy?: string
  ): Promise<void> {
    const { error } = await supabase
      .from(table)
      .update({
        deleted_at: null,
        deleted_by: null,
        restored_at: new Date().toISOString(),
        restored_by: restoredBy
      })
      .eq('id', id)
    
    if (error) {
      logger.error(`Restore error for ${table}:`, error)
      throw error
    }
  }
}
