/**
 * Production-ready API client with error handling, retries, and caching
 */

interface ApiClientConfig {
  baseURL: string
  timeout?: number
  retries?: number
  retryDelay?: number
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  timeout?: number
  retries?: number
}

class ApiClient {
  private baseURL: string
  private timeout: number
  private retries: number
  private retryDelay: number
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private cacheTTL: number = 5 * 60 * 1000 // 5 minutes

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL
    this.timeout = config.timeout || 10000
    this.retries = config.retries || 3
    this.retryDelay = config.retryDelay || 1000
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.timeout,
      retries = this.retries
    } = options

    const url = `${this.baseURL}${endpoint}`
    const cacheKey = `${method}:${url}:${JSON.stringify(body || {})}`

    // Check cache for GET requests
    if (method === 'GET') {
      const cached = this.cache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
        return cached.data
      }
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Cache successful GET requests
      if (method === 'GET') {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        })
      }

      return data
    } catch (error) {
      clearTimeout(timeoutId)

      if (retries > 0 && this.shouldRetry(error)) {
        await this.delay(this.retryDelay)
        return this.makeRequest(endpoint, {
          ...options,
          retries: retries - 1
        })
      }

      throw error
    }
  }

  private shouldRetry(error: any): boolean {
    if (error.name === 'AbortError') return false
    if (error.message?.includes('HTTP 4')) return false // Don't retry client errors
    if (error.message?.includes('HTTP 5')) return true // Retry server errors
    return true
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Public methods
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'POST', body })
  }

  async put<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'PUT', body })
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'DELETE' })
  }

  async patch<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'PATCH', body })
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear()
  }

  // Set cache TTL
  setCacheTTL(ttl: number): void {
    this.cacheTTL = ttl
  }
}

// User interface
export interface User {
  id: string
  email: string
  username: string
  display_name: string
  is_creator: boolean
  is_verified: boolean
  avatar_url?: string
  bio?: string
  followers_count: number
  following_count: number
  posts_count: number
  created_at: string
  updated_at: string
}

// Create singleton instance
const apiClient = new ApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  timeout: 10000,
  retries: 3,
  retryDelay: 1000
})

// Add authentication methods to the client
apiClient.login = async (email: string, password: string) => {
  return apiClient.post('/auth/login', { email, password })
}

apiClient.register = async (userData: any) => {
  return apiClient.post('/auth/register', userData)
}

apiClient.logout = async () => {
  return apiClient.post('/auth/logout')
}

apiClient.getCurrentUser = async () => {
  return apiClient.get('/auth/me')
}

export default apiClient
export { ApiClient, apiClient }