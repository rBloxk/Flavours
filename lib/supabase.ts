import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          username: string
          display_name: string
          avatar_url: string | null
          bio: string | null
          is_creator: boolean
          is_verified: boolean
          age_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          username: string
          display_name: string
          avatar_url?: string | null
          bio?: string | null
          is_creator?: boolean
          is_verified?: boolean
          age_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          username?: string
          display_name?: string
          avatar_url?: string | null
          bio?: string | null
          is_creator?: boolean
          is_verified?: boolean
          age_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      creators: {
        Row: {
          id: string
          user_id: string
          profile_id: string
          subscription_price: number
          total_subscribers: number
          total_earnings: number
          verification_status: string
          payout_method: string
          payout_schedule: string
          tax_info: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          profile_id: string
          subscription_price?: number
          total_subscribers?: number
          total_earnings?: number
          verification_status?: string
          payout_method?: string
          payout_schedule?: string
          tax_info?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          profile_id?: string
          subscription_price?: number
          total_subscribers?: number
          total_earnings?: number
          verification_status?: string
          payout_method?: string
          payout_schedule?: string
          tax_info?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          creator_id: string
          content: string
          is_paid: boolean
          price: number | null
          is_preview: boolean
          likes_count: number
          comments_count: number
          views_count: number
          status: string
          scheduled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          content: string
          is_paid?: boolean
          price?: number | null
          is_preview?: boolean
          likes_count?: number
          comments_count?: number
          views_count?: number
          status?: string
          scheduled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          content?: string
          is_paid?: boolean
          price?: number | null
          is_preview?: boolean
          likes_count?: number
          comments_count?: number
          views_count?: number
          status?: string
          scheduled_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          recipient_id: string
          content: string
          media_url: string | null
          is_paid: boolean
          price: number | null
          is_read: boolean
          is_deleted_by_sender: boolean
          is_deleted_by_recipient: boolean
          thread_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          recipient_id: string
          content: string
          media_url?: string | null
          is_paid?: boolean
          price?: number | null
          is_read?: boolean
          is_deleted_by_sender?: boolean
          is_deleted_by_recipient?: boolean
          thread_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          recipient_id?: string
          content?: string
          media_url?: string | null
          is_paid?: boolean
          price?: number | null
          is_read?: boolean
          is_deleted_by_sender?: boolean
          is_deleted_by_recipient?: boolean
          thread_id?: string | null
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          creator_id: string | null
          type: string
          amount: number
          currency: string
          status: string
          payment_method: string | null
          payment_provider: string | null
          payment_provider_id: string | null
          fees: number
          net_amount: number | null
          metadata: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          creator_id?: string | null
          type: string
          amount: number
          currency?: string
          status?: string
          payment_method?: string | null
          payment_provider?: string | null
          payment_provider_id?: string | null
          fees?: number
          net_amount?: number | null
          metadata?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          creator_id?: string | null
          type?: string
          amount?: number
          currency?: string
          status?: string
          payment_method?: string | null
          payment_provider?: string | null
          payment_provider_id?: string | null
          fees?: number
          net_amount?: number | null
          metadata?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      feature_flags: {
        Row: {
          id: string
          name: string
          description: string | null
          is_enabled: boolean
          rollout_percentage: number
          target_users: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          is_enabled?: boolean
          rollout_percentage?: number
          target_users?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          is_enabled?: boolean
          rollout_percentage?: number
          target_users?: any | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
