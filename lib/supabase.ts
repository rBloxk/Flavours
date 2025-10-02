import { createClient } from '@supabase/supabase-js'
import type { Database } from './supabase-types'
import { createMockSupabaseClient } from './local-database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yrdwgiyfybnshhkznbaj.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZHdnaXlmeWJuc2hoa3puYmFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDIyNjUsImV4cCI6MjA3MzQ3ODI2NX0.Ohc3X9Ti_dUDhqLG1sdYMiyhBoiU6TSCbYDcpbyFT45zOANg'

// Check if we should use local database (when Supabase is not available)
let supabase: any

try {
  // Try to create Supabase client
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

  // Test connection
  supabase.from('profiles').select('id').limit(1).then((result: any) => {
    if (result.error) {
      console.log('🔄 Supabase connection failed, using local database')
      supabase = createMockSupabaseClient()
    } else {
      console.log('✅ Connected to Supabase')
    }
  }).catch(() => {
    console.log('🔄 Supabase connection failed, using local database')
    supabase = createMockSupabaseClient()
  })
} catch (error) {
  console.log('🔄 Supabase initialization failed, using local database')
  supabase = createMockSupabaseClient()
}

export { supabase }
export type { Database }
