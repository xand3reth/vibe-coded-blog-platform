import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AuthCallback() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const { code } = router.query

    if (code) {
      supabase.auth.exchangeCodeForSession(String(code))
        .then(({ data, error }) => {
          if (error) {
            console.error('Error exchanging code for session:', error)
            router.push('/auth/login')
          } else {
            router.push('/')
          }
        })
    }
  }, [router.query])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Logging you in...</h2>
        <p className="text-gray-600">Please wait while we complete the authentication process.</p>
      </div>
    </div>
  )
} 