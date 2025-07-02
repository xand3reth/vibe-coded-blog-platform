import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'

// Load and validate environment variables (Expo style)
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || ''
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || ''

// Environment variable validation
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[MOBILE_SUPABASE] Missing environment variables:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
  })
  throw new Error('Supabase environment variables are required. Please check your app.json extra configuration.')
}

// URL format validation
try {
  new URL(supabaseUrl)
} catch (error) {
  console.error('[MOBILE_SUPABASE] Invalid Supabase URL format:', error)
  throw new Error('Invalid Supabase URL format. Please check your configuration.')
}

// Key length validation
if (supabaseAnonKey.length < 100) {
  throw new Error('Invalid Supabase anon key format. Please check your anon key.')
}

console.log('[MOBILE_SUPABASE] Environment variables loaded successfully')

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          role: 'user' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          slug: string
          title: string
          content: string
          excerpt: string | null
          cover_image_url: string | null
          author_id: string
          status: 'draft' | 'published'
          view_count: number
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          content: string
          excerpt?: string | null
          cover_image_url?: string | null
          author_id: string
          status?: 'draft' | 'published'
          view_count?: number
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          content?: string
          excerpt?: string | null
          cover_image_url?: string | null
          author_id?: string
          status?: 'draft' | 'published'
          view_count?: number
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          author_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          author_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          author_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 