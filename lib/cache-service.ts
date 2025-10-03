/**
 * Redis Cache Service
 * Provides caching functionality for frequently accessed data
 */

interface CacheConfig {
  defaultTTL: number // Default time to live in seconds
  keyPrefix: string // Prefix for all cache keys
  enabled: boolean // Whether caching is enabled
}

interface CacheEntry<T> {
  data: T
  expiresAt: number
  createdAt: number
}

class CacheService {
  private config: CacheConfig
  private memoryCache = new Map<string, CacheEntry<any>>()
  private cleanupInterval: NodeJS.Timeout

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 300, // 5 minutes
      keyPrefix: 'flavours:',
      enabled: process.env.NODE_ENV === 'production' && !!process.env.REDIS_URL,
      ...config
    }

    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.config.enabled) {
      return null
    }

    const fullKey = this.getFullKey(key)
    const entry = this.memoryCache.get(fullKey)

    if (!entry) {
      return null
    }

    if (entry.expiresAt <= Date.now()) {
      this.memoryCache.delete(fullKey)
      return null
    }

    return entry.data
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (!this.config.enabled) {
      return
    }

    const fullKey = this.getFullKey(key)
    const expiresAt = Date.now() + (ttl || this.config.defaultTTL) * 1000

    const entry: CacheEntry<T> = {
      data: value,
      expiresAt,
      createdAt: Date.now()
    }

    this.memoryCache.set(fullKey, entry)
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    if (!this.config.enabled) {
      return
    }

    const fullKey = this.getFullKey(key)
    this.memoryCache.delete(fullKey)
  }

  /**
   * Delete multiple keys
   */
  async deleteMany(keys: string[]): Promise<void> {
    if (!this.config.enabled) {
      return
    }

    keys.forEach(key => {
      const fullKey = this.getFullKey(key)
      this.memoryCache.delete(fullKey)
    })
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    if (!this.config.enabled) {
      return
    }

    this.memoryCache.clear()
  }

  /**
   * Check if key exists in cache
   */
  async exists(key: string): Promise<boolean> {
    if (!this.config.enabled) {
      return false
    }

    const fullKey = this.getFullKey(key)
    const entry = this.memoryCache.get(fullKey)

    if (!entry) {
      return false
    }

    if (entry.expiresAt <= Date.now()) {
      this.memoryCache.delete(fullKey)
      return false
    }

    return true
  }

  /**
   * Get or set value with fallback function
   */
  async getOrSet<T>(
    key: string,
    fallback: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = await this.get<T>(key)
    
    if (cached !== null) {
      return cached
    }

    const value = await fallback()
    await this.set(key, value, ttl)
    
    return value
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidatePattern(pattern: string): Promise<void> {
    if (!this.config.enabled) {
      return
    }

    const fullPattern = this.getFullKey(pattern)
    const regex = new RegExp(fullPattern.replace(/\*/g, '.*'))

    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key)
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number
    hitRate: number
    enabled: boolean
    config: CacheConfig
  } {
    return {
      size: this.memoryCache.size,
      hitRate: 0, // Would need to track hits/misses for real implementation
      enabled: this.config.enabled,
      config: this.config
    }
  }

  /**
   * Get full cache key with prefix
   */
  private getFullKey(key: string): string {
    return `${this.config.keyPrefix}${key}`
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.expiresAt <= now) {
        this.memoryCache.delete(key)
      }
    }
  }

  /**
   * Destroy the cache service
   */
  destroy(): void {
    clearInterval(this.cleanupInterval)
    this.memoryCache.clear()
  }
}

// Singleton instance
export const cacheService = new CacheService()

// Cache key generators
export const cacheKeys = {
  // User-related cache keys
  user: (id: string) => `user:${id}`,
  userProfile: (id: string) => `user:profile:${id}`,
  userPosts: (id: string, page: number = 1) => `user:posts:${id}:${page}`,
  userFollowers: (id: string) => `user:followers:${id}`,
  userFollowing: (id: string) => `user:following:${id}`,

  // Post-related cache keys
  post: (id: string) => `post:${id}`,
  postComments: (id: string, page: number = 1) => `post:comments:${id}:${page}`,
  postLikes: (id: string) => `post:likes:${id}`,
  feed: (userId: string, page: number = 1) => `feed:${userId}:${page}`,
  trending: (category?: string) => `trending:${category || 'all'}`,
  featured: () => 'posts:featured',

  // Search cache keys
  search: (query: string, type: string) => `search:${type}:${query}`,
  searchUsers: (query: string) => `search:users:${query}`,
  searchPosts: (query: string) => `search:posts:${query}`,

  // Analytics cache keys
  stats: (userId: string, timeRange: string) => `stats:${userId}:${timeRange}`,
  analytics: (type: string, timeRange: string) => `analytics:${type}:${timeRange}`,

  // Notifications cache keys
  notifications: (userId: string, unreadOnly: boolean = false) => 
    `notifications:${userId}:${unreadOnly ? 'unread' : 'all'}`,
  unreadCount: (userId: string) => `notifications:unread:${userId}`,

  // Messages cache keys
  conversations: (userId: string) => `conversations:${userId}`,
  messages: (conversationId: string, page: number = 1) => `messages:${conversationId}:${page}`,
  unreadMessages: (userId: string) => `messages:unread:${userId}`,

  // System cache keys
  health: () => 'system:health',
  config: () => 'system:config'
}

// Cache TTL constants (in seconds)
export const cacheTTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 1800, // 30 minutes
  VERY_LONG: 3600, // 1 hour
  EXTRA_LONG: 86400, // 24 hours
  PERMANENT: 604800 // 1 week
}

// Cache invalidation helpers
export const cacheInvalidation = {
  // Invalidate user-related caches
  user: async (userId: string) => {
    await cacheService.deleteMany([
      cacheKeys.user(userId),
      cacheKeys.userProfile(userId),
      cacheKeys.userPosts(userId),
      cacheKeys.userFollowers(userId),
      cacheKeys.userFollowing(userId)
    ])
  },

  // Invalidate post-related caches
  post: async (postId: string) => {
    await cacheService.deleteMany([
      cacheKeys.post(postId),
      cacheKeys.postComments(postId),
      cacheKeys.postLikes(postId)
    ])
    // Invalidate feed caches
    await cacheService.invalidatePattern(cacheKeys.feed('*'))
  },

  // Invalidate search caches
  search: async () => {
    await cacheService.invalidatePattern(cacheKeys.search('*', '*'))
  },

  // Invalidate analytics caches
  analytics: async (userId?: string) => {
    if (userId) {
      await cacheService.invalidatePattern(cacheKeys.stats(userId, '*'))
    }
    await cacheService.invalidatePattern(cacheKeys.analytics('*', '*'))
  },

  // Invalidate notification caches
  notifications: async (userId: string) => {
    await cacheService.deleteMany([
      cacheKeys.notifications(userId),
      cacheKeys.notifications(userId, true),
      cacheKeys.unreadCount(userId)
    ])
  },

  // Invalidate message caches
  messages: async (userId: string, conversationId?: string) => {
    await cacheService.deleteMany([
      cacheKeys.conversations(userId),
      cacheKeys.unreadMessages(userId)
    ])
    if (conversationId) {
      await cacheService.invalidatePattern(cacheKeys.messages(conversationId, '*'))
    }
  }
}

export default cacheService
