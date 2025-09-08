// Supabase Configuration for Flavours
// This file contains Supabase client configuration and utilities

import { createClient } from '@supabase/supabase-js'
import { Database } from './supabase-types'

// Supabase configuration
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your_supabase_anon_key_here',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'your_supabase_service_role_key_here'
}

// Create Supabase client for frontend
export const supabase = createClient<Database>(
  supabaseConfig.url,
  supabaseConfig.anonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
)

// Create Supabase client for backend (with service role)
export const supabaseAdmin = createClient<Database>(
  supabaseConfig.url,
  supabaseConfig.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Supabase auth configuration
export const authConfig = {
  providers: ['email', 'google', 'facebook', 'twitter'],
  requireEmailVerification: true,
  passwordMinLength: 8,
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  refreshTokenTimeout: 30 * 24 * 60 * 60 * 1000 // 30 days
}

// Supabase realtime configuration
export const realtimeConfig = {
  enabled: true,
  channels: {
    posts: 'posts',
    messages: 'messages',
    notifications: 'notifications',
    subscriptions: 'subscriptions'
  },
  events: {
    INSERT: 'INSERT',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE'
  }
}

// Supabase error codes and messages
export const supabaseErrorCodes = {
  'PGRST116': 'The result contains 0 rows',
  'PGRST301': 'JWT expired',
  'PGRST302': 'JWT invalid',
  '42501': 'Insufficient privileges',
  '42P01': 'Relation does not exist',
  '23505': 'Duplicate key value violates unique constraint',
  '23503': 'Foreign key violation',
  '23502': 'Not null violation',
  '22001': 'String data right truncated',
  '22003': 'Numeric value out of range',
  '22007': 'Invalid datetime format',
  '22008': 'Datetime field overflow',
  '22012': 'Division by zero',
  '22023': 'Invalid parameter value'
}

// Helper functions
export const getSupabaseError = (error: any): string => {
  if (error?.code && supabaseErrorCodes[error.code as keyof typeof supabaseErrorCodes]) {
    return supabaseErrorCodes[error.code as keyof typeof supabaseErrorCodes]
  }
  return error?.message || 'An unknown error occurred'
}

export const validateSupabaseConfig = (config: typeof supabaseConfig): boolean => {
  if (!config.url || !config.anonKey) {
    throw new Error('Missing required Supabase configuration')
  }
  return true
}

// Initialize Supabase configuration
export const initializeSupabaseConfig = () => {
  validateSupabaseConfig(supabaseConfig)
  return supabaseConfig
}
