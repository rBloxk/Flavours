import { DatingProfile } from '@/app/dating/page'

export interface DatingAction {
  id: string
  user_id: string
  target_user_id: string
  action: 'like' | 'pass' | 'super_like' | 'boost'
  created_at: string
}

export interface DatingMatch {
  id: string
  user1_id: string
  user2_id: string
  created_at: string
  is_active: boolean
  last_message_at?: string
}

export interface DatingMessage {
  id: string
  match_id: string
  sender_id: string
  content: string
  message_type: 'text' | 'image' | 'gif' | 'emoji'
  created_at: string
  is_read: boolean
}

export interface DatingBoost {
  id: string
  user_id: string
  boost_type: 'profile' | 'super_like' | 'discovery'
  duration_hours: number
  created_at: string
  expires_at: string
  is_active: boolean
}

export interface DatingPreferences {
  user_id: string
  age_range: [number, number]
  height_range: [number, number]
  distance_max: number
  gender_preference: string[]
  sexuality_preference: string[]
  relationship_status_preference: string[]
  education_preference: string[]
  interests_preference: string[]
  deal_breakers: string[]
  must_haves: string[]
  updated_at: string
}

export class DatingService {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api'
  }

  // Profile Management
  async createProfile(profileData: any): Promise<DatingProfile> {
    const response = await fetch(`${this.baseUrl}/dating/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    })
    
    if (!response.ok) throw new Error('Failed to create profile')
    return response.json()
  }

  async updateProfile(profileId: string, updates: Partial<DatingProfile>): Promise<DatingProfile> {
    const response = await fetch(`${this.baseUrl}/dating/profile/${profileId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    
    if (!response.ok) throw new Error('Failed to update profile')
    return response.json()
  }

  async uploadPhotos(profileId: string, photos: File[]): Promise<string[]> {
    const formData = new FormData()
    photos.forEach(photo => formData.append('photos', photo))

    const response = await fetch(`${this.baseUrl}/dating/profile/${profileId}/photos`, {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) throw new Error('Failed to upload photos')
    return response.json()
  }

  // Discovery & Matching
  async getDiscoveryProfiles(userId: string, preferences: DatingPreferences): Promise<DatingProfile[]> {
    const response = await fetch(`${this.baseUrl}/dating/discovery/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preferences)
    })
    
    if (!response.ok) throw new Error('Failed to get discovery profiles')
    return response.json()
  }

  async likeProfile(userId: string, targetUserId: string): Promise<{ isMatch: boolean; match?: DatingMatch }> {
    const response = await fetch(`${this.baseUrl}/dating/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, target_user_id: targetUserId })
    })
    
    if (!response.ok) throw new Error('Failed to like profile')
    return response.json()
  }

  async passProfile(userId: string, targetUserId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/dating/pass`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, target_user_id: targetUserId })
    })
    
    if (!response.ok) throw new Error('Failed to pass profile')
  }

  async superLikeProfile(userId: string, targetUserId: string): Promise<{ isMatch: boolean; match?: DatingMatch }> {
    const response = await fetch(`${this.baseUrl}/dating/super-like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, target_user_id: targetUserId })
    })
    
    if (!response.ok) throw new Error('Failed to super like profile')
    return response.json()
  }

  // Matches & Messaging
  async getMatches(userId: string): Promise<DatingMatch[]> {
    const response = await fetch(`${this.baseUrl}/dating/matches/${userId}`)
    
    if (!response.ok) throw new Error('Failed to get matches')
    return response.json()
  }

  async getMatchMessages(matchId: string, page: number = 1): Promise<DatingMessage[]> {
    const response = await fetch(`${this.baseUrl}/dating/matches/${matchId}/messages?page=${page}`)
    
    if (!response.ok) throw new Error('Failed to get messages')
    return response.json()
  }

  async sendMessage(matchId: string, senderId: string, content: string, messageType: 'text' | 'image' | 'gif' | 'emoji' = 'text'): Promise<DatingMessage> {
    const response = await fetch(`${this.baseUrl}/dating/matches/${matchId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender_id: senderId, content, message_type: messageType })
    })
    
    if (!response.ok) throw new Error('Failed to send message')
    return response.json()
  }

  async markMessagesAsRead(matchId: string, userId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/dating/matches/${matchId}/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    })
    
    if (!response.ok) throw new Error('Failed to mark messages as read')
  }

  // Boost & Premium Features
  async purchaseBoost(userId: string, boostType: 'profile' | 'super_like' | 'discovery', durationHours: number): Promise<DatingBoost> {
    const response = await fetch(`${this.baseUrl}/dating/boost`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, boost_type: boostType, duration_hours: durationHours })
    })
    
    if (!response.ok) throw new Error('Failed to purchase boost')
    return response.json()
  }

  async getActiveBoosts(userId: string): Promise<DatingBoost[]> {
    const response = await fetch(`${this.baseUrl}/dating/boost/${userId}`)
    
    if (!response.ok) throw new Error('Failed to get active boosts')
    return response.json()
  }

  // Preferences & Settings
  async updatePreferences(userId: string, preferences: Partial<DatingPreferences>): Promise<DatingPreferences> {
    const response = await fetch(`${this.baseUrl}/dating/preferences/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preferences)
    })
    
    if (!response.ok) throw new Error('Failed to update preferences')
    return response.json()
  }

  async getPreferences(userId: string): Promise<DatingPreferences> {
    const response = await fetch(`${this.baseUrl}/dating/preferences/${userId}`)
    
    if (!response.ok) throw new Error('Failed to get preferences')
    return response.json()
  }

  // Analytics & Insights
  async getProfileViews(userId: string, days: number = 7): Promise<{ date: string; views: number }[]> {
    const response = await fetch(`${this.baseUrl}/dating/analytics/${userId}/views?days=${days}`)
    
    if (!response.ok) throw new Error('Failed to get profile views')
    return response.json()
  }

  async getMatchStats(userId: string): Promise<{
    total_likes: number
    total_passes: number
    total_super_likes: number
    total_matches: number
    match_rate: number
  }> {
    const response = await fetch(`${this.baseUrl}/dating/analytics/${userId}/stats`)
    
    if (!response.ok) throw new Error('Failed to get match stats')
    return response.json()
  }

  // Safety & Reporting
  async reportProfile(userId: string, targetUserId: string, reason: string, description?: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/dating/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        reporter_id: userId, 
        reported_id: targetUserId, 
        reason, 
        description 
      })
    })
    
    if (!response.ok) throw new Error('Failed to report profile')
  }

  async blockUser(userId: string, targetUserId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/dating/block`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, target_user_id: targetUserId })
    })
    
    if (!response.ok) throw new Error('Failed to block user')
  }

  async getBlockedUsers(userId: string): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/dating/blocked/${userId}`)
    
    if (!response.ok) throw new Error('Failed to get blocked users')
    return response.json()
  }

  // Real-time Features
  async subscribeToMatches(userId: string, callback: (match: DatingMatch) => void): Promise<() => void> {
    // WebSocket implementation for real-time match notifications
    const ws = new WebSocket(`${this.baseUrl.replace('http', 'ws')}/dating/matches/${userId}`)
    
    ws.onmessage = (event) => {
      const match = JSON.parse(event.data)
      callback(match)
    }
    
    return () => ws.close()
  }

  async subscribeToMessages(matchId: string, callback: (message: DatingMessage) => void): Promise<() => void> {
    const ws = new WebSocket(`${this.baseUrl.replace('http', 'ws')}/dating/messages/${matchId}`)
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      callback(message)
    }
    
    return () => ws.close()
  }
}

// Utility functions
export const DatingUtils = {
  calculateAge(birthday: string): number {
    const today = new Date()
    const birthDate = new Date(birthday)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  },

  formatDistance(distance: number): string {
    if (distance < 1) return '< 1 mile'
    if (distance < 10) return `${distance.toFixed(1)} miles`
    return `${Math.round(distance)} miles`
  },

  getCompatibilityColor(score: number): string {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  },

  getCompatibilityText(score: number): string {
    if (score >= 80) return 'Excellent Match'
    if (score >= 60) return 'Good Match'
    return 'Fair Match'
  },

  validateProfile(profile: Partial<DatingProfile>): string[] {
    const errors: string[] = []
    
    if (!profile.display_name) errors.push('Display name is required')
    if (!profile.age || profile.age < 18) errors.push('Must be 18 or older')
    if (!profile.bio || profile.bio.length < 10) errors.push('Bio must be at least 10 characters')
    if (!profile.photos || profile.photos.length === 0) errors.push('At least one photo is required')
    
    return errors
  }
}

export const datingService = new DatingService()
