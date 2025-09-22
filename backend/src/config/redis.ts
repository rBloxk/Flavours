import { createClient, RedisClientType } from 'redis'
import { logger } from '../utils/logger'

export interface CacheConfig {
  url: string
  password?: string
  db: number
  retryAttempts: number
  retryDelay: number
  defaultTTL: number
  maxMemory: string
  maxMemoryPolicy: string
}

class RedisManager {
  private client: RedisClientType | null = null
  private config: CacheConfig
  private isConnected: boolean = false
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5

  constructor() {
    this.config = {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      retryAttempts: parseInt(process.env.REDIS_RETRY_ATTEMPTS || '3'),
      retryDelay: parseInt(process.env.REDIS_RETRY_DELAY || '1000'),
      defaultTTL: parseInt(process.env.REDIS_DEFAULT_TTL || '3600'), // 1 hour
      maxMemory: process.env.REDIS_MAX_MEMORY || '256mb',
      maxMemoryPolicy: process.env.REDIS_MAX_MEMORY_POLICY || 'allkeys-lru'
    }

    this.initializeConnection()
  }

  private async initializeConnection() {
    try {
      // Skip Redis initialization if not available
      if (this.config.url === 'redis://localhost:6379') {
        logger.warn('Redis not available, running in cache-disabled mode')
        this.isConnected = false
        return
      }

      this.client = createClient({
        url: this.config.url,
        password: this.config.password,
        database: this.config.db,
        socket: {
          connectTimeout: 10000,
          lazyConnect: true
        },
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            logger.error('Redis connection refused')
            return new Error('Redis connection refused')
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            logger.error('Redis retry time exhausted')
            return new Error('Redis retry time exhausted')
          }
          if (options.attempt > this.maxReconnectAttempts) {
            logger.error('Redis max reconnect attempts reached')
            return undefined
          }
          return Math.min(options.attempt * 100, 3000)
        }
      })

      this.client.on('connect', () => {
        logger.info('Redis connected')
        this.isConnected = true
        this.reconnectAttempts = 0
      })

      this.client.on('error', (error) => {
        logger.error('Redis error:', error)
        this.isConnected = false
      })

      this.client.on('end', () => {
        logger.warn('Redis connection ended')
        this.isConnected = false
      })

      this.client.on('reconnecting', () => {
        this.reconnectAttempts++
        logger.info(`Redis reconnecting (attempt ${this.reconnectAttempts})`)
      })

      await this.client.connect()
      
      // Configure Redis
      await this.client.configSet('maxmemory', this.config.maxMemory)
      await this.client.configSet('maxmemory-policy', this.config.maxMemoryPolicy)
      
      logger.info('Redis initialized successfully', {
        url: this.config.url,
        db: this.config.db,
        maxMemory: this.config.maxMemory
      })
    } catch (error) {
      logger.error('Failed to initialize Redis:', error)
      this.isConnected = false
    }
  }

  public async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected || !this.client) {
      logger.warn('Redis not connected, skipping cache get')
      return null
    }

    try {
      const value = await this.client.get(key)
      if (value) {
        return JSON.parse(value)
      }
      return null
    } catch (error) {
      logger.error('Redis get error:', error)
      return null
    }
  }

  public async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      logger.warn('Redis not connected, skipping cache set')
      return false
    }

    try {
      const serializedValue = JSON.stringify(value)
      const expirationTime = ttl || this.config.defaultTTL
      
      await this.client.setEx(key, expirationTime, serializedValue)
      return true
    } catch (error) {
      logger.error('Redis set error:', error)
      return false
    }
  }

  public async del(key: string): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      logger.warn('Redis not connected, skipping cache delete')
      return false
    }

    try {
      await this.client.del(key)
      return true
    } catch (error) {
      logger.error('Redis delete error:', error)
      return false
    }
  }

  public async exists(key: string): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false
    }

    try {
      const result = await this.client.exists(key)
      return result === 1
    } catch (error) {
      logger.error('Redis exists error:', error)
      return false
    }
  }

  public async expire(key: string, ttl: number): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false
    }

    try {
      await this.client.expire(key, ttl)
      return true
    } catch (error) {
      logger.error('Redis expire error:', error)
      return false
    }
  }

  public async keys(pattern: string): Promise<string[]> {
    if (!this.isConnected || !this.client) {
      return []
    }

    try {
      return await this.client.keys(pattern)
    } catch (error) {
      logger.error('Redis keys error:', error)
      return []
    }
  }

  public async flush(): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false
    }

    try {
      await this.client.flushDb()
      return true
    } catch (error) {
      logger.error('Redis flush error:', error)
      return false
    }
  }

  public async setex<T>(key: string, ttl: number, value: T): Promise<boolean> {
    return this.set(key, value, ttl)
  }

  public async lpush(key: string, ...values: string[]): Promise<number> {
    if (!this.isConnected || !this.client) {
      return 0
    }

    try {
      return await this.client.lPush(key, values)
    } catch (error) {
      logger.error('Redis lpush error:', error)
      return 0
    }
  }

  public async rpop(key: string): Promise<string | null> {
    if (!this.isConnected || !this.client) {
      return null
    }

    try {
      return await this.client.rPop(key)
    } catch (error) {
      logger.error('Redis rpop error:', error)
      return null
    }
  }

  public async llen(key: string): Promise<number> {
    if (!this.isConnected || !this.client) {
      return 0
    }

    try {
      return await this.client.lLen(key)
    } catch (error) {
      logger.error('Redis llen error:', error)
      return 0
    }
  }

  public async healthCheck(): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false
    }

    try {
      const pong = await this.client.ping()
      return pong === 'PONG'
    } catch (error) {
      logger.error('Redis health check failed:', error)
      return false
    }
  }

  public getStats() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      config: this.config
    }
  }

  public async close() {
    if (this.client) {
      await this.client.quit()
      this.isConnected = false
      logger.info('Redis connection closed')
    }
  }
}

// Singleton instance
export const redisManager = new RedisManager()

// Cache utility functions
export class CacheUtils {
  static generateKey(prefix: string, ...parts: string[]): string {
    return `${prefix}:${parts.join(':')}`
  }

  static async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try to get from cache
    const cached = await redisManager.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // Fetch from source
    const data = await fetchFn()
    
    // Cache the result
    await redisManager.set(key, data, ttl)
    
    return data
  }

  static async invalidatePattern(pattern: string): Promise<void> {
    const keys = await redisManager.keys(pattern)
    for (const key of keys) {
      await redisManager.del(key)
    }
  }

  static async cacheUser(userId: string, userData: any, ttl: number = 3600): Promise<void> {
    const key = CacheUtils.generateKey('user', userId)
    await redisManager.set(key, userData, ttl)
  }

  static async getCachedUser(userId: string): Promise<any | null> {
    const key = CacheUtils.generateKey('user', userId)
    return await redisManager.get(key)
  }

  static async cachePost(postId: string, postData: any, ttl: number = 1800): Promise<void> {
    const key = CacheUtils.generateKey('post', postId)
    await redisManager.set(key, postData, ttl)
  }

  static async getCachedPost(postId: string): Promise<any | null> {
    const key = CacheUtils.generateKey('post', postId)
    return await redisManager.get(key)
  }

  static async cacheFeed(userId: string, feedData: any[], ttl: number = 300): Promise<void> {
    const key = CacheUtils.generateKey('feed', userId)
    await redisManager.set(key, feedData, ttl)
  }

  static async getCachedFeed(userId: string): Promise<any[] | null> {
    const key = CacheUtils.generateKey('feed', userId)
    return await redisManager.get(key)
  }

  static async cacheSession(sessionId: string, sessionData: any, ttl: number = 86400): Promise<void> {
    const key = CacheUtils.generateKey('session', sessionId)
    await redisManager.set(key, sessionData, ttl)
  }

  static async getCachedSession(sessionId: string): Promise<any | null> {
    const key = CacheUtils.generateKey('session', sessionId)
    return await redisManager.get(key)
  }

  static async invalidateUserCache(userId: string): Promise<void> {
    await CacheUtils.invalidatePattern(`user:${userId}*`)
    await CacheUtils.invalidatePattern(`feed:${userId}*`)
  }

  static async invalidatePostCache(postId: string): Promise<void> {
    await CacheUtils.invalidatePattern(`post:${postId}*`)
    // Also invalidate feed caches since they might contain this post
    await CacheUtils.invalidatePattern('feed:*')
  }
}
