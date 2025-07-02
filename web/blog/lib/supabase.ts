import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

// Logging utility
const isDevelopment = process.env.NODE_ENV === 'development'

const logDebug = (message: string, data?: any) => {
  if (isDevelopment) {
    if (data !== undefined) {
      console.log(message, data)
    } else {
      console.log(message)
    }
  }
}

const logError = (message: string, error?: any) => {
  if (error !== undefined) {
    console.error(message, error)
  } else {
    console.error(message)
  }
}

logDebug('[SUPABASE] Loading supabase.ts module...')

// Error type definition
export interface SupabaseError {
  message: string
  code?: string
  details?: string
  hint?: string
}

// Type definition (temporary)
export type Database = {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string
          title: string
          slug: string
          content: string
          excerpt: string | null
          cover_image_url: string | null
          status: 'draft' | 'published'
          published_at: string | null
          view_count: number
          created_at: string
          updated_at: string
          author_id: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          content: string
          excerpt?: string | null
          cover_image_url?: string | null
          status?: 'draft' | 'published'
          published_at?: string | null
          view_count?: number
          created_at?: string
          updated_at?: string
          author_id: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          content?: string
          excerpt?: string | null
          cover_image_url?: string | null
          status?: 'draft' | 'published'
          published_at?: string | null
          view_count?: number
          created_at?: string
          updated_at?: string
          author_id?: string
        }
      }
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
      admin_whitelist: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
        }
      }
    }
  }
}

// Environment variable check result type
interface EnvironmentVariables {
  supabaseUrl: string
  supabaseAnonKey: string
}

// Environment variable validation
const checkEnvironmentVariables = (): EnvironmentVariables => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  logDebug('[SUPABASE] Environment variables check:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlLength: supabaseUrl?.length || 0,
    keyLength: supabaseAnonKey?.length || 0,
    urlPreview: supabaseUrl?.substring(0, 30) + '...',
  })

  if (!supabaseUrl || !supabaseAnonKey) {
    logError('[SUPABASE] Missing environment variables:', {
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl || 'MISSING',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey ? '[SET]' : 'MISSING'
    })
    throw new Error('Missing Supabase environment variables')
  }

  // Enhanced validation
  if (!supabaseUrl.startsWith('https://') || 
      supabaseUrl.includes('your-project-url') || 
      supabaseUrl.includes('your_project_url') ||
      supabaseUrl.includes('localhost') ||
      supabaseUrl === 'https://') {
    throw new Error(`Invalid Supabase URL: ${supabaseUrl}. Please set a valid Supabase project URL.`)
  }

  if (supabaseAnonKey.length < 100) {
    throw new Error('Invalid Supabase anon key format')
  }

  return { supabaseUrl, supabaseAnonKey }
}

// Browser client (auto environment variable detection)
export const createBrowserClient = () => {
  logDebug('[SUPABASE] createBrowserClient called')
  try {
    // Validate environment variables first
    checkEnvironmentVariables()
    
    const client = createClientComponentClient<Database>()
    logDebug('[SUPABASE] Browser client created successfully')
    return client
  } catch (error) {
    logError('[SUPABASE] Browser client creation failed:', error)
    throw error
  }
}

// Server-side client
export const createServerSupabase = () => {
  logDebug('[SUPABASE] createServerSupabase called')
  
  try {
    const { supabaseUrl, supabaseAnonKey } = checkEnvironmentVariables()
    
    logDebug('[SUPABASE] Creating server Supabase client...')
    const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    logDebug('[SUPABASE] Server Supabase client created successfully')
    return client
  } catch (error) {
    logError('[SUPABASE] Server client creation failed:', error)
    throw error
  }
}

// Global browser client (maintained for compatibility)
let globalClient: ReturnType<typeof createBrowserClient> | null = null

export const supabase = (() => {
  if (typeof window !== 'undefined' && !globalClient) {
    logDebug('[SUPABASE] Creating global browser client...')
    globalClient = createBrowserClient()
  }
  return globalClient
})()

// Service role (admin operations)
export const createAdminClient = () => {
  logDebug('[SUPABASE] createAdminClient called')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    logError('[SUPABASE] Admin: Missing environment variables')
    throw new Error('Missing Supabase admin environment variables')
  }

  logDebug('[SUPABASE] Creating admin Supabase client...')
  const client = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  logDebug('[SUPABASE] Admin Supabase client created successfully')
  return client
}

// Admin permission check function
export const checkAdminPermission = async (userEmail: string): Promise<boolean> => {
  logDebug('[SUPABASE] checkAdminPermission called for:', userEmail)
  try {
    const client = createBrowserClient()
    const { data, error } = await client
      .from('admin_whitelist')
      .select('email')
      .eq('email', userEmail)
      .single()

    logDebug('[SUPABASE] Admin permission check result:', { data, error })
    return !error && !!data
  } catch (error) {
    logError('[SUPABASE] Admin permission check error:', error)
    return false
  }
}

// Check current user's admin permission
export const isCurrentUserAdmin = async (): Promise<boolean> => {
  logDebug('[SUPABASE] isCurrentUserAdmin called')
  try {
    const client = createBrowserClient()
    const { data: { user } } = await client.auth.getUser()
    logDebug('[SUPABASE] Current user check:', user?.email || 'No user')
    
    if (!user?.email) {
      logDebug('[SUPABASE] No user email found')
      return false
    }

    return await checkAdminPermission(user.email)
  } catch (error) {
    logError('[SUPABASE] Current user admin check error:', error)
    return false
  }
} 