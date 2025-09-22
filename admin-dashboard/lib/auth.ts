export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'moderator' | 'viewer'
  avatar?: string
  lastLogin?: string
  createdAt: string
}

export interface AuthResponse {
  user: User
  token: string
  expiresAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

class AuthService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
  private tokenKey = 'admin_auth_token'
  private userKey = 'admin_user_data'

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Mock authentication for demo purposes
    const mockUsers = [
      { email: 'admin@flavours.club', password: 'admin123', role: 'admin' as const, name: 'Admin User' },
      { email: 'mod@flavours.club', password: 'mod123', role: 'moderator' as const, name: 'Moderator User' },
      { email: 'viewer@flavours.club', password: 'viewer123', role: 'viewer' as const, name: 'Viewer User' }
    ]

    const user = mockUsers.find(u => u.email === credentials.email && u.password === credentials.password)
    
    if (!user) {
      throw new Error('Invalid email or password')
    }

    // Generate mock JWT token
    const mockToken = btoa(JSON.stringify({
      sub: user.email,
      role: user.role,
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    }))

    const mockResponse: AuthResponse = {
      user: {
        id: user.email,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: undefined,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString()
      },
      token: mockToken,
      expiresAt: new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString()
    }

    this.setAuthData(mockResponse)
    return mockResponse

    // Original API call (commented out for demo)
    /*
    const response = await fetch(`${this.baseURL}/admin/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Login failed')
    }

    const data: AuthResponse = await response.json()
    this.setAuthData(data)
    return data
    */
  }

  async signup(signupData: SignupData): Promise<AuthResponse> {
    if (signupData.password !== signupData.confirmPassword) {
      throw new Error('Passwords do not match')
    }

    if (signupData.password.length < 6) {
      throw new Error('Password must be at least 6 characters long')
    }

    // Mock signup for demo purposes
    const mockToken = btoa(JSON.stringify({
      sub: signupData.email,
      role: 'viewer', // Default role for new users
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    }))

    const mockResponse: AuthResponse = {
      user: {
        id: signupData.email,
        email: signupData.email,
        name: signupData.name,
        role: 'viewer',
        avatar: undefined,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString()
      },
      token: mockToken,
      expiresAt: new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString()
    }

    this.setAuthData(mockResponse)
    return mockResponse

    // Original API call (commented out for demo)
    /*
    const response = await fetch(`${this.baseURL}/admin/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Signup failed')
    }

    const data: AuthResponse = await response.json()
    this.setAuthData(data)
    return data
    */
  }

  async logout(): Promise<void> {
    const token = this.getToken()
    
    if (token) {
      try {
        await fetch(`${this.baseURL}/admin/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      } catch (error) {
        console.warn('Logout request failed:', error)
      }
    }

    this.clearAuthData()
  }

  async getCurrentUser(): Promise<User | null> {
    const token = this.getToken()
    if (!token) return null

    try {
      // Mock user data from localStorage
      const userData = this.getUser()
      if (userData) {
        return userData
      }

      // If no user data in localStorage, try to decode mock token
      const payload = JSON.parse(atob(token))
      const now = Date.now()
      
      if (payload.exp < now) {
        this.clearAuthData()
        return null
      }

      // Return mock user based on token
      return {
        id: payload.sub,
        email: payload.sub,
        name: payload.sub.split('@')[0],
        role: payload.role,
        avatar: undefined,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }
    } catch (error) {
      console.error('Failed to get current user:', error)
      this.clearAuthData()
      return null
    }

    // Original API call (commented out for demo)
    /*
    try {
      const response = await fetch(`${this.baseURL}/admin/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        this.clearAuthData()
        return null
      }

      const data = await response.json()
      return data.user
    } catch (error) {
      console.error('Failed to get current user:', error)
      this.clearAuthData()
      return null
    }
    */
  }

  async refreshToken(): Promise<boolean> {
    const token = this.getToken()
    if (!token) return false

    try {
      // Mock token refresh - just check if token is still valid
      const payload = JSON.parse(atob(token))
      const now = Date.now()
      
      if (payload.exp < now) {
        this.clearAuthData()
        return false
      }

      // Token is still valid, no need to refresh
      return true
    } catch (error) {
      console.error('Token refresh failed:', error)
      this.clearAuthData()
      return false
    }

    // Original API call (commented out for demo)
    /*
    try {
      const response = await fetch(`${this.baseURL}/admin/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        this.clearAuthData()
        return false
      }

      const data: AuthResponse = await response.json()
      this.setAuthData(data)
      return true
    } catch (error) {
      console.error('Token refresh failed:', error)
      this.clearAuthData()
      return false
    }
    */
  }

  isAuthenticated(): boolean {
    const token = this.getToken()
    if (!token) return false

    try {
      const payload = JSON.parse(atob(token))
      const now = Date.now()
      return payload.exp > now
    } catch {
      return false
    }
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(this.tokenKey)
  }

  getUser(): User | null {
    if (typeof window === 'undefined') return null
    const userData = localStorage.getItem(this.userKey)
    return userData ? JSON.parse(userData) : null
  }

  private setAuthData(data: AuthResponse): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.tokenKey, data.token)
    localStorage.setItem(this.userKey, JSON.stringify(data.user))
  }

  private clearAuthData(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.tokenKey)
    localStorage.removeItem(this.userKey)
  }
}

export const authService = new AuthService()
