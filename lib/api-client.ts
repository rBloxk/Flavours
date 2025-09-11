// API Client for Flavours Backend
// This file handles all API communication between frontend and backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
  }
}

export interface User {
  id: string
  username: string
  display_name: string
  email: string
  avatar_url?: string
  bio?: string
  is_creator: boolean
  is_verified: boolean
  followers_count: number
  following_count: number
  posts_count: number
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  user: any
  session: {
    access_token: string
    refresh_token: string
  }
  profile?: any
  message?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  username: string
  display_name: string
  is_creator?: boolean
}

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
    this.loadToken()
  }

  private loadToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  private setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  private clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      return { data }
    } catch (error) {
      console.error('API request failed:', error)
      return {
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })

    if (response.data?.session?.access_token) {
      this.setToken(response.data.session.access_token)
    }

    return response
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
        username: userData.username,
        displayName: userData.display_name,
        isCreator: userData.is_creator || false
      }),
    })

    // Note: Signup doesn't return a token, user needs to sign in
    return response
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.request('/auth/signout', {
      method: 'POST',
    })

    this.clearToken()
    return response
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/me')
  }

  // User methods
  async getUserProfile(username: string): Promise<ApiResponse<{ profile: User }>> {
    return this.request<{ profile: User }>(`/users/profile/${username}`)
  }

  async updateProfile(profileData: Partial<User>): Promise<ApiResponse<{ profile: User }>> {
    return this.request<{ profile: User }>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  }

  async searchUsers(query: string, page: number = 1, limit: number = 20): Promise<ApiResponse<{ users: User[]; pagination: any }>> {
    return this.request<{ users: User[]; pagination: any }>(`/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`)
  }

  async followUser(userId: string): Promise<ApiResponse<{ message: string; following: boolean; followersCount: number }>> {
    return this.request<{ message: string; following: boolean; followersCount: number }>(`/users/${userId}/follow`, {
      method: 'POST',
    })
  }

  async getUserStats(userId: string): Promise<ApiResponse<{ stats: any }>> {
    return this.request<{ stats: any }>(`/users/${userId}/stats`)
  }

  // Content methods (placeholder for future implementation)
  async getFeed(page: number = 1, limit: number = 20): Promise<ApiResponse<{ posts: any[]; pagination: any }>> {
    return this.request<{ posts: any[]; pagination: any }>(`/content/feed?page=${page}&limit=${limit}`)
  }

  async createPost(postData: any): Promise<ApiResponse<{ post: any }>> {
    return this.request<{ post: any }>('/content/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    })
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request<{ status: string; timestamp: string }>('/health')
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient()

// Export the class for testing
export { ApiClient }
