// Advanced API caching service with Redis integration
export class APICache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private maxSize = 1000
  private defaultTTL = 300000 // 5 minutes

  constructor(private redisClient?: any) {}

  // Generate cache key from URL and params
  private generateKey(url: string, params?: Record<string, any>): string {
    const paramString = params ? JSON.stringify(params) : ''
    return `${url}:${paramString}`
  }

  // Check if cache entry is valid
  private isValid(entry: { timestamp: number; ttl: number }): boolean {
    return Date.now() - entry.timestamp < entry.ttl
  }

  // Get data from cache
  async get<T>(url: string, params?: Record<string, any>): Promise<T | null> {
    const key = this.generateKey(url, params)

    // Try Redis first if available
    if (this.redisClient) {
      try {
        const cached = await this.redisClient.get(key)
        if (cached) {
          const parsed = JSON.parse(cached)
          if (this.isValid(parsed)) {
            console.log(`📦 Cache HIT (Redis): ${key}`)
            return parsed.data
          }
        }
      } catch (error) {
        console.warn('Redis cache error:', error)
      }
    }

    // Fallback to memory cache
    const entry = this.cache.get(key)
    if (entry && this.isValid(entry)) {
      console.log(`📦 Cache HIT (Memory): ${key}`)
      return entry.data
    }

    console.log(`📦 Cache MISS: ${key}`)
    return null
  }

  // Set data in cache
  async set<T>(url: string, data: T, ttl: number = this.defaultTTL, params?: Record<string, any>): Promise<void> {
    const key = this.generateKey(url, params)
    const entry = { data, timestamp: Date.now(), ttl }

    // Store in Redis if available
    if (this.redisClient) {
      try {
        await this.redisClient.setex(key, Math.floor(ttl / 1000), JSON.stringify(entry))
      } catch (error) {
        console.warn('Redis cache set error:', error)
      }
    }

    // Store in memory cache
    this.cache.set(key, entry)

    // Cleanup old entries if cache is full
    if (this.cache.size > this.maxSize) {
      this.cleanup()
    }

    console.log(`📦 Cache SET: ${key}`)
  }

  // Invalidate cache entry
  async invalidate(url: string, params?: Record<string, any>): Promise<void> {
    const key = this.generateKey(url, params)

    // Remove from Redis
    if (this.redisClient) {
      try {
        await this.redisClient.del(key)
      } catch (error) {
        console.warn('Redis cache delete error:', error)
      }
    }

    // Remove from memory
    this.cache.delete(key)
    console.log(`📦 Cache INVALIDATED: ${key}`)
  }

  // Invalidate cache by pattern
  async invalidatePattern(pattern: string): Promise<void> {
    // Redis pattern invalidation
    if (this.redisClient) {
      try {
        const keys = await this.redisClient.keys(pattern)
        if (keys.length > 0) {
          await this.redisClient.del(...keys)
        }
      } catch (error) {
        console.warn('Redis pattern invalidation error:', error)
      }
    }

    // Memory pattern invalidation
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }

    console.log(`📦 Cache INVALIDATED (Pattern): ${pattern}`)
  }

  // Cleanup expired entries
  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (!this.isValid(entry)) {
        this.cache.delete(key)
      }
    }
  }

  // Get cache statistics
  getStats(): {
    size: number
    maxSize: number
    hitRate: number
    memoryUsage: number
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0, // Would need to track hits/misses
      memoryUsage: JSON.stringify([...this.cache.entries()]).length
    }
  }

  // Clear all cache
  async clear(): Promise<void> {
    this.cache.clear()
    
    if (this.redisClient) {
      try {
        await this.redisClient.flushdb()
      } catch (error) {
        console.warn('Redis clear error:', error)
      }
    }

    console.log('📦 Cache CLEARED')
  }
}

// Singleton instance
export const apiCache = new APICache()

// Enhanced fetch with caching
export async function cachedFetch<T>(
  url: string,
  options: RequestInit = {},
  cacheOptions: {
    ttl?: number
    params?: Record<string, any>
    skipCache?: boolean
  } = {}
): Promise<T> {
  const { ttl = 300000, params, skipCache = false } = cacheOptions

  // Try cache first
  if (!skipCache) {
    const cached = await apiCache.get<T>(url, params)
    if (cached) {
      return cached
    }
  }

  // Fetch from API
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()

  // Cache the result
  if (!skipCache) {
    await apiCache.set(url, data, ttl, params)
  }

  return data
}

// Cache invalidation helpers
export const cacheInvalidation = {
  // Invalidate user-related cache
  user: (userId: string) => apiCache.invalidatePattern(`*user*${userId}*`),
  
  // Invalidate content-related cache
  content: (contentId?: string) => 
    contentId ? apiCache.invalidatePattern(`*content*${contentId}*`) : apiCache.invalidatePattern('*content*'),
  
  // Invalidate feed cache
  feed: () => apiCache.invalidatePattern('*feed*'),
  
  // Invalidate notifications cache
  notifications: (userId?: string) => 
    userId ? apiCache.invalidatePattern(`*notifications*${userId}*`) : apiCache.invalidatePattern('*notifications*'),
  
  // Invalidate all cache
  all: () => apiCache.clear()
}

// React hook for cached API calls
export function useCachedAPI<T>(
  url: string,
  options: RequestInit = {},
  cacheOptions: {
    ttl?: number
    params?: Record<string, any>
    skipCache?: boolean
    dependencies?: any[]
  } = {}
) {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const result = await cachedFetch<T>(url, options, cacheOptions)
        
        if (!cancelled) {
          setData(result)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [url, JSON.stringify(options), JSON.stringify(cacheOptions.dependencies)])

  return { data, loading, error, refetch: () => fetchData() }
}

