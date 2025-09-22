// Advanced analytics service with real-time dashboards and insights
import React from 'react'

export class AnalyticsService {
  private apiUrl: string
  private realtimeService: any
  private cache: Map<string, any> = new Map()

  constructor(apiUrl: string = '/api/v1/analytics', realtimeService?: any) {
    this.apiUrl = apiUrl
    this.realtimeService = realtimeService
  }

  // Real-time platform analytics
  async getPlatformAnalytics(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<{
    overview: {
      totalUsers: number
      activeUsers: number
      newUsers: number
      totalRevenue: number
      revenueGrowth: number
      contentUploads: number
      engagementRate: number
    }
    realtime: {
      onlineUsers: number
      activeStreams: number
      liveChats: number
      systemHealth: 'healthy' | 'warning' | 'critical'
    }
    trends: {
      userGrowth: Array<{ date: string; count: number }>
      revenueTrend: Array<{ date: string; amount: number }>
      engagementTrend: Array<{ date: string; rate: number }>
      contentTrend: Array<{ date: string; uploads: number }>
    }
    topContent: Array<{
      id: string
      title: string
      creator: string
      views: number
      likes: number
      revenue: number
    }>
    topCreators: Array<{
      id: string
      username: string
      displayName: string
      followers: number
      revenue: number
      engagement: number
    }>
  }> {
    try {
      const response = await fetch(`${this.apiUrl}/platform?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Analytics API error: ${response.status}`)
      }

      const data = await response.json()
      this.cache.set(`platform-${timeRange}`, data)
      return data
    } catch (error) {
      console.error('Platform analytics error:', error)
      // Return cached data or fallback
      return this.cache.get(`platform-${timeRange}`) || this.getFallbackPlatformAnalytics()
    }
  }

  // Creator analytics
  async getCreatorAnalytics(creatorId: string, timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<{
    overview: {
      totalViews: number
      totalLikes: number
      totalComments: number
      totalRevenue: number
      subscriberCount: number
      engagementRate: number
      avgWatchTime: number
    }
    content: {
      totalPosts: number
      totalVideos: number
      totalStreams: number
      avgViewsPerPost: number
      bestPerformingContent: Array<{
        id: string
        title: string
        views: number
        likes: number
        revenue: number
        createdAt: string
      }>
    }
    audience: {
      demographics: {
        ageGroups: Array<{ age: string; percentage: number }>
        genders: Array<{ gender: string; percentage: number }>
        locations: Array<{ location: string; percentage: number }>
      }
      engagement: {
        peakHours: Array<{ hour: number; engagement: number }>
        peakDays: Array<{ day: string; engagement: number }>
        deviceTypes: Array<{ device: string; percentage: number }>
      }
    }
    revenue: {
      totalEarnings: number
      monthlyEarnings: Array<{ month: string; amount: number }>
      revenueSources: Array<{ source: string; amount: number; percentage: number }>
      payoutHistory: Array<{ date: string; amount: number; status: string }>
    }
    insights: {
      growthRate: number
      topPerformingContent: string
      audienceGrowth: number
      engagementTrend: 'up' | 'down' | 'stable'
      recommendations: string[]
    }
  }> {
    try {
      const response = await fetch(`${this.apiUrl}/creator/${creatorId}?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Creator analytics error: ${response.status}`)
      }

      const data = await response.json()
      this.cache.set(`creator-${creatorId}-${timeRange}`, data)
      return data
    } catch (error) {
      console.error('Creator analytics error:', error)
      return this.cache.get(`creator-${creatorId}-${timeRange}`) || this.getFallbackCreatorAnalytics()
    }
  }

  // Content analytics
  async getContentAnalytics(contentId: string): Promise<{
    overview: {
      views: number
      likes: number
      comments: number
      shares: number
      saves: number
      engagementRate: number
      watchTime: number
      completionRate: number
    }
    demographics: {
      ageGroups: Array<{ age: string; views: number }>
      genders: Array<{ gender: string; views: number }>
      locations: Array<{ location: string; views: number }>
    }
    timeline: {
      viewsOverTime: Array<{ date: string; views: number }>
      engagementOverTime: Array<{ date: string; engagement: number }>
    }
    sources: {
      organic: number
      direct: number
      social: number
      search: number
      referral: number
    }
    insights: {
      peakViewingTime: string
      avgWatchTime: number
      dropOffPoints: Array<{ time: number; percentage: number }>
      viralPotential: number
      recommendations: string[]
    }
  }> {
    try {
      const response = await fetch(`${this.apiUrl}/content/${contentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Content analytics error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Content analytics error:', error)
      return this.getFallbackContentAnalytics()
    }
  }

  // Real-time analytics
  async getRealtimeAnalytics(): Promise<{
    onlineUsers: number
    activeStreams: number
    liveChats: number
    currentRevenue: number
    systemMetrics: {
      cpu: number
      memory: number
      disk: number
      network: number
    }
    topStreams: Array<{
      id: string
      creator: string
      viewers: number
      duration: number
    }>
    recentActivity: Array<{
      type: 'user_joined' | 'content_uploaded' | 'stream_started' | 'payment_received'
      description: string
      timestamp: string
    }>
  }> {
    try {
      // Use real-time service if available
      if (this.realtimeService) {
        const realtimeData = await this.realtimeService.getRealtimeAnalytics()
        return realtimeData
      }

      // Fallback to API
      const response = await fetch(`${this.apiUrl}/realtime`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Realtime analytics error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Realtime analytics error:', error)
      return this.getFallbackRealtimeAnalytics()
    }
  }

  // Audience analytics
  async getAudienceAnalytics(userId: string, timeRange: '7d' | '30d' | '90d' = '30d'): Promise<{
    demographics: {
      ageGroups: Array<{ age: string; count: number; percentage: number }>
      genders: Array<{ gender: string; count: number; percentage: number }>
      locations: Array<{ location: string; count: number; percentage: number }>
      languages: Array<{ language: string; count: number; percentage: number }>
    }
    behavior: {
      avgSessionDuration: number
      avgPagesPerSession: number
      bounceRate: number
      returnRate: number
      peakActivityHours: Array<{ hour: number; activity: number }>
    }
    interests: {
      topCategories: Array<{ category: string; engagement: number }>
      trendingTopics: Array<{ topic: string; growth: number }>
      contentPreferences: Array<{ type: string; preference: number }>
    }
    engagement: {
      totalInteractions: number
      avgEngagementRate: number
      engagementTrend: Array<{ date: string; rate: number }>
      topEngagingContent: Array<{ id: string; title: string; engagement: number }>
    }
  }> {
    try {
      const response = await fetch(`${this.apiUrl}/audience/${userId}?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Audience analytics error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Audience analytics error:', error)
      return this.getFallbackAudienceAnalytics()
    }
  }

  // Revenue analytics
  async getRevenueAnalytics(timeRange: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<{
    overview: {
      totalRevenue: number
      revenueGrowth: number
      avgRevenuePerUser: number
      conversionRate: number
    }
    sources: {
      subscriptions: number
      tips: number
      payPerView: number
      merchandise: number
      sponsorships: number
    }
    trends: {
      dailyRevenue: Array<{ date: string; amount: number }>
      monthlyRevenue: Array<{ month: string; amount: number }>
      revenueByCreator: Array<{ creator: string; amount: number }>
    }
    projections: {
      nextMonth: number
      nextQuarter: number
      nextYear: number
      confidence: number
    }
  }> {
    try {
      const response = await fetch(`${this.apiUrl}/revenue?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Revenue analytics error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Revenue analytics error:', error)
      return this.getFallbackRevenueAnalytics()
    }
  }

  // Export analytics data
  async exportAnalytics(type: 'platform' | 'creator' | 'content' | 'revenue', format: 'csv' | 'json' | 'pdf' = 'csv'): Promise<Blob> {
    try {
      const response = await fetch(`${this.apiUrl}/export?type=${type}&format=${format}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Export error: ${response.status}`)
      }

      return await response.blob()
    } catch (error) {
      console.error('Export analytics error:', error)
      throw error
    }
  }

  // Fallback data methods
  private getFallbackPlatformAnalytics() {
    return {
      overview: {
        totalUsers: 1250,
        activeUsers: 890,
        newUsers: 45,
        totalRevenue: 12500,
        revenueGrowth: 12.5,
        contentUploads: 234,
        engagementRate: 68.5
      },
      realtime: {
        onlineUsers: 156,
        activeStreams: 12,
        liveChats: 8,
        systemHealth: 'healthy' as const
      },
      trends: {
        userGrowth: this.generateTrendData(30, 1000, 1500),
        revenueTrend: this.generateTrendData(30, 8000, 15000),
        engagementTrend: this.generateTrendData(30, 60, 75),
        contentTrend: this.generateTrendData(30, 150, 300)
      },
      topContent: [],
      topCreators: []
    }
  }

  private getFallbackCreatorAnalytics() {
    return {
      overview: {
        totalViews: 45000,
        totalLikes: 3200,
        totalComments: 890,
        totalRevenue: 2500,
        subscriberCount: 1200,
        engagementRate: 7.2,
        avgWatchTime: 180
      },
      content: {
        totalPosts: 45,
        totalVideos: 23,
        totalStreams: 12,
        avgViewsPerPost: 1200,
        bestPerformingContent: []
      },
      audience: {
        demographics: {
          ageGroups: [
            { age: '18-24', percentage: 35 },
            { age: '25-34', percentage: 40 },
            { age: '35-44', percentage: 20 },
            { age: '45+', percentage: 5 }
          ],
          genders: [
            { gender: 'Male', percentage: 45 },
            { gender: 'Female', percentage: 50 },
            { gender: 'Other', percentage: 5 }
          ],
          locations: [
            { location: 'United States', percentage: 40 },
            { location: 'Canada', percentage: 15 },
            { location: 'United Kingdom', percentage: 12 },
            { location: 'Australia', percentage: 8 },
            { location: 'Other', percentage: 25 }
          ]
        },
        engagement: {
          peakHours: Array.from({ length: 24 }, (_, i) => ({ hour: i, engagement: Math.random() * 100 })),
          peakDays: [
            { day: 'Monday', engagement: 65 },
            { day: 'Tuesday', engagement: 70 },
            { day: 'Wednesday', engagement: 75 },
            { day: 'Thursday', engagement: 80 },
            { day: 'Friday', engagement: 85 },
            { day: 'Saturday', engagement: 90 },
            { day: 'Sunday', engagement: 60 }
          ],
          deviceTypes: [
            { device: 'Mobile', percentage: 65 },
            { device: 'Desktop', percentage: 25 },
            { device: 'Tablet', percentage: 10 }
          ]
        }
      },
      revenue: {
        totalEarnings: 2500,
        monthlyEarnings: this.generateTrendData(12, 150, 300),
        revenueSources: [
          { source: 'Subscriptions', amount: 1500, percentage: 60 },
          { source: 'Tips', amount: 800, percentage: 32 },
          { source: 'Pay-per-view', amount: 200, percentage: 8 }
        ],
        payoutHistory: []
      },
      insights: {
        growthRate: 15.2,
        topPerformingContent: 'Gaming Stream #45',
        audienceGrowth: 8.5,
        engagementTrend: 'up' as const,
        recommendations: [
          'Post more gaming content during peak hours',
          'Engage with comments to boost engagement',
          'Consider creating exclusive content for subscribers'
        ]
      }
    }
  }

  private getFallbackContentAnalytics() {
    return {
      overview: {
        views: 12500,
        likes: 890,
        comments: 156,
        shares: 45,
        saves: 78,
        engagementRate: 7.1,
        watchTime: 180,
        completionRate: 65
      },
      demographics: {
        ageGroups: [],
        genders: [],
        locations: []
      },
      timeline: {
        viewsOverTime: this.generateTrendData(30, 100, 500),
        engagementOverTime: this.generateTrendData(30, 5, 15)
      },
      sources: {
        organic: 60,
        direct: 20,
        social: 15,
        search: 3,
        referral: 2
      },
      insights: {
        peakViewingTime: '7:00 PM',
        avgWatchTime: 180,
        dropOffPoints: [],
        viralPotential: 75,
        recommendations: []
      }
    }
  }

  private getFallbackRealtimeAnalytics() {
    return {
      onlineUsers: 156,
      activeStreams: 12,
      liveChats: 8,
      currentRevenue: 125.50,
      systemMetrics: {
        cpu: 45,
        memory: 62,
        disk: 38,
        network: 78
      },
      topStreams: [],
      recentActivity: []
    }
  }

  private getFallbackAudienceAnalytics() {
    return {
      demographics: {
        ageGroups: [],
        genders: [],
        locations: [],
        languages: []
      },
      behavior: {
        avgSessionDuration: 0,
        avgPagesPerSession: 0,
        bounceRate: 0,
        returnRate: 0,
        peakActivityHours: []
      },
      interests: {
        topCategories: [],
        trendingTopics: [],
        contentPreferences: []
      },
      engagement: {
        totalInteractions: 0,
        avgEngagementRate: 0,
        engagementTrend: [],
        topEngagingContent: []
      }
    }
  }

  private getFallbackRevenueAnalytics() {
    return {
      overview: {
        totalRevenue: 0,
        revenueGrowth: 0,
        avgRevenuePerUser: 0,
        conversionRate: 0
      },
      sources: {
        subscriptions: 0,
        tips: 0,
        payPerView: 0,
        merchandise: 0,
        sponsorships: 0
      },
      trends: {
        dailyRevenue: [],
        monthlyRevenue: [],
        revenueByCreator: []
      },
      projections: {
        nextMonth: 0,
        nextQuarter: 0,
        nextYear: 0,
        confidence: 0
      }
    }
  }

  private generateTrendData(days: number, min: number, max: number) {
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      count: Math.floor(Math.random() * (max - min) + min)
    }))
  }
}

// Singleton instance
export const analyticsService = new AnalyticsService()

// React hooks for analytics
export function usePlatformAnalytics(timeRange: '1h' | '24h' | '7d' | '30d' = '24h') {
  const [data, setData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await analyticsService.getPlatformAnalytics(timeRange)
        setData(result)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [timeRange])

  return { data, loading, error, refetch: () => fetchData() }
}

export function useCreatorAnalytics(creatorId: string, timeRange: '1h' | '24h' | '7d' | '30d' = '24h') {
  const [data, setData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    if (!creatorId) return

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await analyticsService.getCreatorAnalytics(creatorId, timeRange)
        setData(result)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [creatorId, timeRange])

  return { data, loading, error, refetch: () => fetchData() }
}

export function useRealtimeAnalytics() {
  const [data, setData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await analyticsService.getRealtimeAnalytics()
        setData(result)
      } catch (error) {
        console.error('Realtime analytics error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    
    // Update every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  return { data, loading }
}
