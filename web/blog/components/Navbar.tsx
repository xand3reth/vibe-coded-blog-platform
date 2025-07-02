import { useEffect, useState, useCallback, memo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { createBrowserClient } from '../lib/supabase'
import { TEXTS, STYLES } from '../lib/constants'

// Logging utility
const isDevelopment = process.env.NODE_ENV === 'development'
const logDebug = (message: string, data?: any) => {
  if (isDevelopment) {
    console.log(message, data)
  }
}

function Navbar() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    logDebug('[NAVBAR] Component mounted, setting up auth state')
    
    const checkUser = async () => {
      try {
        logDebug('[NAVBAR] Checking user session...')
        const supabase = createBrowserClient()
        const { data: { session } } = await supabase.auth.getSession()
        logDebug('[NAVBAR] Session check result:', { hasSession: !!session, userEmail: session?.user?.email })
        setIsLoggedIn(!!session)
      } catch (error) {
        console.error('[NAVBAR] Session check error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()

    // Subscribe to session state changes
    const supabase = createBrowserClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      logDebug('[NAVBAR] Auth state changed:', { event, hasSession: !!session })
      setIsLoggedIn(!!session)
    })

    return () => {
      logDebug('[NAVBAR] Cleaning up auth subscription')
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = useCallback(async () => {
    logDebug('[NAVBAR] Logout initiated')
    try {
      const supabase = createBrowserClient()
      await supabase.auth.signOut()
      logDebug('[NAVBAR] Logout successful, redirecting to home')
      router.push('/')
    } catch (error) {
      console.error('[NAVBAR] Logout error:', error)
    }
  }, [router])

  if (isLoading) {
    logDebug('[NAVBAR] Still loading, not rendering')
    return null // Nothing to display while loading
  }

  logDebug('[NAVBAR] Rendering navbar with login status:', isLoggedIn)

  return (
    <header className="bg-slate-900 border-b border-slate-800">
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-slate-50">
            {TEXTS.SITE.TITLE}
          </Link>
          <nav className="flex items-center gap-6">
            <Link 
              href="/" 
              className={`text-sm ${
                router.pathname === '/' 
                  ? 'text-slate-50 font-medium' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {TEXTS.NAVIGATION.HOME}
            </Link>
            {isLoggedIn && (
              <Link 
                href="/admin/dashboard" 
                className={`text-sm ${
                  router.pathname.startsWith('/admin') 
                    ? 'text-slate-50 font-medium' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {TEXTS.NAVIGATION.ADMIN}
              </Link>
            )}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="text-sm text-slate-400 hover:text-slate-200"
              >
                {TEXTS.NAVIGATION.LOGOUT}
              </button>
            ) : (
              <Link 
                href="/auth/login" 
                className="px-4 py-2 bg-blue-600 text-slate-50 rounded-full text-sm hover:bg-blue-700 transition-colors"
              >
                {TEXTS.NAVIGATION.LOGIN}
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default memo(Navbar) 