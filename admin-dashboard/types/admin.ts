export interface DashboardStats {
  totalUsers: number
  totalCreators: number
  totalPosts: number
  pendingModerations: number
  pendingReports: number
  newUsersToday: number
  newCreatorsToday: number
  activeUsers: number
  totalRevenue: number
  monthlyRevenue: number
}

export interface User {
  id: string
  username: string
  email: string
  displayName: string
  avatarUrl?: string
  role: 'user' | 'creator' | 'admin'
  status: 'active' | 'suspended' | 'banned'
  createdAt: string
  lastActive: string
  isVerified: boolean
}

export interface Creator {
  id: string
  userId: string
  username: string
  displayName: string
  verificationStatus: 'pending' | 'verified' | 'rejected'
  totalSubscribers: number
  totalEarnings: number
  subscriptionPrice: number
  createdAt: string
}

export interface ModerationItem {
  id: string
  type: 'post' | 'comment' | 'user' | 'creator'
  content: any
  reason: string
  reportedBy?: string
  status: 'pending' | 'approved' | 'rejected'
  reviewedBy?: string
  reviewedAt?: string
  reviewNotes?: string
  createdAt: string
}

export interface Report {
  id: string
  reporterId: string
  reportedUserId: string
  contentType: 'post' | 'profile' | 'message' | 'comment'
  contentId?: string
  reason: string
  description?: string
  status: 'open' | 'investigating' | 'resolved' | 'dismissed'
  resolvedBy?: string
  resolutionNotes?: string
  createdAt: string
  resolvedAt?: string
}

export interface Analytics {
  period: string
  metric: string
  data: {
    labels: string[]
    values: number[]
  }
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical'
  uptime: number
  memory: {
    used: number
    total: number
    percentage: number
  }
  cpu: {
    usage: number
  }
  database: {
    status: 'connected' | 'disconnected'
    responseTime: number
  }
  redis: {
    status: 'connected' | 'disconnected'
    responseTime: number
  }
}
