import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yrdwgiyfybnshhkznbaj.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZHdnaXlmeWJuc2hoa3puYmFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDIyNjUsImV4cCI6MjA3MzQ3ODI2NX0.Ohc3X9Ti_dUDhqLG1sdYMiyhLWOiDnpQDucelPO5eVs'

// Only throw error in runtime, not during build
if (typeof window !== 'undefined' && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
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
          role?: string
          last_active?: string
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
          role?: string
          last_active?: string
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
          role?: string
          last_active?: string
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
      moderation_queue: {
        Row: {
          id: string
          content_id: string
          content_type: string
          reason: string
          status: string
          moderator_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content_id: string
          content_type: string
          reason: string
          status?: string
          moderator_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content_id?: string
          content_type?: string
          reason?: string
          status?: string
          moderator_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          reported_content_id: string
          content_type: string
          reason: string
          status: string
          moderator_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          reporter_id: string
          reported_content_id: string
          content_type: string
          reason: string
          status?: string
          moderator_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          reporter_id?: string
          reported_content_id?: string
          content_type?: string
          reason?: string
          status?: string
          moderator_id?: string | null
          created_at?: string
          updated_at?: string
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
