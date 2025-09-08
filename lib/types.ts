export interface Creator {
  id: string
  user_id: string
  profile: UserProfile
  subscription_price: number
  total_subscribers: number
  total_earnings: number
  verification_status: 'pending' | 'verified' | 'rejected'
  created_at: string
}

export interface SubscriptionPlan {
  id: string
  creator_id: string
  name: string
  price: number
  duration_days: number
  description?: string
  is_active: boolean
  created_at: string
}

export interface Post {
  id: string
  creator_id: string
  content: string
  media_assets: MediaAsset[]
  is_paid: boolean
  price?: number
  is_preview: boolean
  likes_count: number
  comments_count: number
  created_at: string
}

export interface MediaAsset {
  id: string
  post_id: string
  type: 'image' | 'video' | 'audio'
  url: string
  thumbnail_url?: string
  duration?: number
  size: number
  content_hash: string
  is_processed: boolean
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  creator_id: string
  plan_id: string
  status: 'active' | 'expired' | 'cancelled'
  expires_at: string
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  creator_id?: string
  type: 'subscription' | 'tip' | 'ppv' | 'payout'
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  payment_method: string
  created_at: string
}

export interface UserProfile {
  id: string
  user_id: string
  username: string
  display_name: string
  avatar_url?: string
  bio?: string
  is_creator: boolean
  is_verified: boolean
  age_verified: boolean
  created_at: string
}

export interface ModerationItem {
  id: string
  content_type: 'post' | 'profile' | 'message'
  content_id: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  reviewer_id?: string
  created_at: string
  reviewed_at?: string
}

export interface PaymentMethod {
  id: string
  user_id: string
  type: 'visa' | 'mastercard' | 'amex' | 'discover' | 'jcb' | 'diners'
  last4: string
  expiry_month: string
  expiry_year: string
  cardholder_name: string
  billing_address: BillingAddress
  is_default: boolean
  is_verified: boolean
  payment_provider: 'stripe' | 'commercegate' | 'ccbill' | 'segpay'
  payment_provider_id: string
  created_at: string
  updated_at: string
}

export interface BillingAddress {
  line1: string
  line2?: string
  city: string
  state: string
  postal_code: string
  country: string
}

export interface PaymentIntent {
  id: string
  user_id: string
  amount: number
  currency: string
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled'
  payment_method_id?: string
  client_secret: string
  metadata: Record<string, any>
  created_at: string
}