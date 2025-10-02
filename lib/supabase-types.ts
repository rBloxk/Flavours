// Consolidated Supabase Database Types
// This file contains all database types used across the application

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          username: string
          display_name: string
          email: string
          avatar_url: string | null
          bio: string | null
          website: string | null
          location: string | null
          birth_date: string | null
          is_verified: boolean
          is_creator: boolean
          role: 'user' | 'creator' | 'admin' | 'moderator'
          status: string
          followers_count: number
          following_count: number
          posts_count: number
          total_earnings: number
          subscription_count: number
          last_active: string | null
          last_login: string | null
          admin_notes: string | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          username: string
          display_name: string
          email: string
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          location?: string | null
          birth_date?: string | null
          is_verified?: boolean
          is_creator?: boolean
          role?: 'user' | 'creator' | 'admin' | 'moderator'
          status?: string
          followers_count?: number
          following_count?: number
          posts_count?: number
          total_earnings?: number
          subscription_count?: number
          last_active?: string | null
          last_login?: string | null
          admin_notes?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          username?: string
          display_name?: string
          email?: string
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          location?: string | null
          birth_date?: string | null
          is_verified?: boolean
          is_creator?: boolean
          role?: 'user' | 'creator' | 'admin' | 'moderator'
          status?: string
          followers_count?: number
          following_count?: number
          posts_count?: number
          total_earnings?: number
          subscription_count?: number
          last_active?: string | null
          last_login?: string | null
          admin_notes?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          content: string | null
          media_url: string | null
          media_type: string | null
          media_files: any | null
          is_paid: boolean
          price: number
          privacy: 'public' | 'followers' | 'paid' | 'private'
          tags: string[] | null
          mentions: string[] | null
          location: string | null
          category: string | null
          likes_count: number
          comments_count: number
          shares_count: number
          views_count: number
          engagement_rate: number
          virality_score: number
          freshness_score: number
          relevance_score: number
          quality_score: number
          trending_score: number
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content?: string | null
          media_url?: string | null
          media_type?: string | null
          media_files?: any | null
          is_paid?: boolean
          price?: number
          privacy?: 'public' | 'followers' | 'paid' | 'private'
          tags?: string[] | null
          mentions?: string[] | null
          location?: string | null
          category?: string | null
          likes_count?: number
          comments_count?: number
          shares_count?: number
          views_count?: number
          engagement_rate?: number
          virality_score?: number
          freshness_score?: number
          relevance_score?: number
          quality_score?: number
          trending_score?: number
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string | null
          media_url?: string | null
          media_type?: string | null
          media_files?: any | null
          is_paid?: boolean
          price?: number
          privacy?: 'public' | 'followers' | 'paid' | 'private'
          tags?: string[] | null
          mentions?: string[] | null
          location?: string | null
          category?: string | null
          likes_count?: number
          comments_count?: number
          shares_count?: number
          views_count?: number
          engagement_rate?: number
          virality_score?: number
          freshness_score?: number
          relevance_score?: number
          quality_score?: number
          trending_score?: number
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          parent_comment_id: string | null
          content: string
          likes_count: number
          replies_count: number
          is_edited: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          parent_comment_id?: string | null
          content: string
          likes_count?: number
          replies_count?: number
          is_edited?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          parent_comment_id?: string | null
          content?: string
          likes_count?: number
          replies_count?: number
          is_edited?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          post_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string
          created_at?: string
        }
      }
      bookmarks: {
        Row: {
          id: string
          user_id: string
          post_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string
          created_at?: string
        }
      }
      views: {
        Row: {
          id: string
          user_id: string
          post_id: string
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          subscriber_id: string
          creator_id: string
          tier: string | null
          price: number | null
          status: string
          started_at: string
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          subscriber_id: string
          creator_id: string
          tier?: string | null
          price?: number | null
          status?: string
          started_at?: string
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          subscriber_id?: string
          creator_id?: string
          tier?: string | null
          price?: number | null
          status?: string
          started_at?: string
          expires_at?: string | null
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          post_id: string | null
          subscription_id: string | null
          amount: number
          currency: string
          status: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_method: string | null
          stripe_payment_intent_id: string | null
          description: string | null
          metadata: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id?: string | null
          subscription_id?: string | null
          amount: number
          currency?: string
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_method?: string | null
          stripe_payment_intent_id?: string | null
          description?: string | null
          metadata?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string | null
          subscription_id?: string | null
          amount?: number
          currency?: string
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_method?: string | null
          stripe_payment_intent_id?: string | null
          description?: string | null
          metadata?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      moderation_queue: {
        Row: {
          id: string
          type: 'post' | 'user' | 'report' | 'comment'
          status: 'pending' | 'approved' | 'rejected' | 'escalated'
          post_id: string | null
          user_id: string | null
          report_id: string | null
          reason: string | null
          description: string | null
          reported_by: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          review_notes: string | null
          escalated_by: string | null
          escalated_at: string | null
          escalation_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: 'post' | 'user' | 'report' | 'comment'
          status?: 'pending' | 'approved' | 'rejected' | 'escalated'
          post_id?: string | null
          user_id?: string | null
          report_id?: string | null
          reason?: string | null
          description?: string | null
          reported_by?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
          escalated_by?: string | null
          escalated_at?: string | null
          escalation_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: 'post' | 'user' | 'report' | 'comment'
          status?: 'pending' | 'approved' | 'rejected' | 'escalated'
          post_id?: string | null
          user_id?: string | null
          report_id?: string | null
          reason?: string | null
          description?: string | null
          reported_by?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
          escalated_by?: string | null
          escalated_at?: string | null
          escalation_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          reported_user_id: string | null
          reported_post_id: string | null
          reason: string
          description: string | null
          status: string
          reviewed_by: string | null
          reviewed_at: string | null
          resolution: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          reporter_id: string
          reported_user_id?: string | null
          reported_post_id?: string | null
          reason: string
          description?: string | null
          status?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          resolution?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          reporter_id?: string
          reported_user_id?: string | null
          reported_post_id?: string | null
          reason?: string
          description?: string | null
          status?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          resolution?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'like' | 'comment' | 'follow' | 'mention' | 'system'
          title: string
          message: string
          data: any | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'like' | 'comment' | 'follow' | 'mention' | 'system'
          title: string
          message: string
          data?: any | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'like' | 'comment' | 'follow' | 'mention' | 'system'
          title?: string
          message?: string
          data?: any | null
          is_read?: boolean
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          recipient_id: string
          content: string
          media_url: string | null
          media_type: string | null
          is_read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          recipient_id: string
          content: string
          media_url?: string | null
          media_type?: string | null
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          recipient_id?: string
          content?: string
          media_url?: string | null
          media_type?: string | null
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
      }
      storage_activity: {
        Row: {
          id: string
          username: string
          type: string
          details: any | null
          metadata: any | null
          created_at: string
        }
        Insert: {
          id?: string
          username: string
          type: string
          details?: any | null
          metadata?: any | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          type?: string
          details?: any | null
          metadata?: any | null
          created_at?: string
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