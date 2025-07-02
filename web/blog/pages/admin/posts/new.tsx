import { GetServerSideProps } from 'next'
import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { createServerSupabase, createBrowserClient, SupabaseError } from '../../../lib/supabase'
import { TEXTS } from '../../../lib/constants'

interface NewPostProps {
  isAdmin: boolean
}

export default function NewPost({ isAdmin }: NewPostProps) {
  console.log('[NEW_POST] Component rendered with props:', { isAdmin })
  
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    coverImageUrl: '',
    status: 'draft' as 'draft' | 'published'
  })

  useEffect(() => {
    console.log('[NEW_POST] Component mounted, checking Supabase connection...')
    
    // Check Supabase connection
    const checkSupabaseConnection = async () => {
      try {
        console.log('[NEW_POST] Testing Supabase connection...')
        const supabase = createBrowserClient()
        const { data, error } = await supabase.auth.getUser()
        console.log('[NEW_POST] Supabase auth check result:', { data, error })
      } catch (error) {
        console.error('[NEW_POST] Supabase connection test failed:', error)
      }
    }
    
    checkSupabaseConnection()
  }, [])

  if (!isAdmin) {
    console.log('[NEW_POST] User is not admin, showing access denied')
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {TEXTS.AUTH.ADMIN_ONLY}
          </h1>
          <Link href="/" className="text-blue-600 hover:text-blue-700">
            {TEXTS.NAVIGATION.HOME}
          </Link>
        </div>
      </div>
    )
  }

  const generateSlug = (title: string) => {
    console.log('[NEW_POST] Generating slug for title:', title)
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    console.log('[NEW_POST] Generated slug:', slug)
    return slug
  }

  const handleTitleChange = (title: string) => {
    console.log('[NEW_POST] Title changed:', title)
    setFormData(prev => {
      const updated = {
        ...prev,
        title,
        slug: generateSlug(title)
      }
      console.log('[NEW_POST] Form data updated:', updated)
      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'published') => {
    console.log('[NEW_POST] Form submission started with status:', status)
    e.preventDefault()
    setLoading(true)

    try {
      console.log('[NEW_POST] Getting current user...')
      const supabase = createBrowserClient()
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error(TEXTS.ERRORS.AUTH_REQUIRED)
      }

      console.log('[NEW_POST] Preparing post data...')
      const postData = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        excerpt: formData.excerpt,
        cover_image_url: formData.coverImageUrl || null,
        status,
        author_id: user.id,
        ...(status === 'published' && { published_at: new Date().toISOString() })
      }
      console.log('[NEW_POST] Post data prepared:', { ...postData, author_id: '[REDACTED]' }) // Hide actual ID in logs for security

      console.log('[NEW_POST] Attempting to insert post into Supabase...')
      const { data, error } = await supabase
        .from('posts')
        .insert([postData])
        .select()
        .single()

      console.log('[NEW_POST] Supabase insert result:', { data, error })

      if (error) {
        console.error('[NEW_POST] Supabase insert error:', error)
        throw error
      }

      console.log('[NEW_POST] Post created successfully:', data)
      alert(status === 'published' ? TEXTS.ADMIN.PUBLISH_SUCCESS : TEXTS.ADMIN.SAVE_SUCCESS)
      
      console.log('[NEW_POST] Redirecting to post page:', `/admin/posts/${data.id}`)
      router.push(`/admin/posts/${data.id}`)
    } catch (error) {
      console.error('[NEW_POST] Post creation error:', error)
      
      // Detailed error handling based on error type
      if (error && typeof error === 'object' && 'message' in error) {
        const supabaseError = error as SupabaseError
        console.error('[NEW_POST] Error details:', {
          message: supabaseError.message,
          code: supabaseError.code,
          details: supabaseError.details,
          hint: supabaseError.hint
        })
        
        // Provide more specific error messages to users
        let errorMessage: string = TEXTS.ERRORS.GENERAL
        
        if (supabaseError.code === 'PGRST116') {
          errorMessage = TEXTS.ERRORS.ADMIN_PERMISSION
        } else if (supabaseError.code === '23505') {
          errorMessage = TEXTS.ERRORS.DUPLICATE_SLUG
        } else if (supabaseError.message.includes('RLS')) {
          errorMessage = TEXTS.ERRORS.DATABASE_ACCESS
        } else if (supabaseError.message) {
          errorMessage = supabaseError.message
        }
          
        alert(errorMessage)
      } else {
        console.error('[NEW_POST] Unknown error type:', error)
        alert(error instanceof Error ? error.message : TEXTS.ERRORS.GENERAL)
      }
    } finally {
      console.log('[NEW_POST] Form submission completed, setting loading to false')
      setLoading(false)
    }
  }

  console.log('[NEW_POST] Rendering main component with form data:', formData)

  return (
    <>
      <Head>
        <title>{TEXTS.NAVIGATION.NEW_POST} - {TEXTS.SITE.TITLE}</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                {TEXTS.SITE.TITLE}
              </Link>
              <nav className="flex space-x-6">
                <Link href="/admin/dashboard" className="text-gray-600 hover:text-gray-900">
                  {TEXTS.NAVIGATION.DASHBOARD}
                </Link>
                <Link href="/admin/posts" className="text-gray-600 hover:text-gray-900">
                  {TEXTS.NAVIGATION.MANAGE_POSTS}
                </Link>
                <span className="text-blue-600 font-medium">
                  {TEXTS.NAVIGATION.NEW_POST}
                </span>
              </nav>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {TEXTS.NAVIGATION.NEW_POST}
            </h1>
          </div>

          <form className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                {TEXTS.POSTS.TITLE} *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={TEXTS.FORMS.PLACEHOLDERS.TITLE}
                required
              />
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                {TEXTS.POSTS.SLUG} *
              </label>
              <input
                type="text"
                id="slug"
                value={formData.slug}
                onChange={(e) => {
                  console.log('[NEW_POST] Slug manually changed:', e.target.value)
                  setFormData(prev => ({ ...prev, slug: e.target.value }))
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={TEXTS.FORMS.PLACEHOLDERS.SLUG}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                URL: /posts/{formData.slug}
              </p>
            </div>

            {/* Excerpt */}
            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                {TEXTS.POSTS.EXCERPT}
              </label>
              <textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => {
                  console.log('[NEW_POST] Excerpt changed:', e.target.value.length, 'characters')
                  setFormData(prev => ({ ...prev, excerpt: e.target.value }))
                }}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={TEXTS.FORMS.PLACEHOLDERS.EXCERPT}
              />
            </div>

            {/* Cover Image */}
            <div>
              <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-2">
                {TEXTS.POSTS.COVER_IMAGE}
              </label>
              <input
                type="url"
                id="coverImage"
                value={formData.coverImageUrl}
                onChange={(e) => {
                  console.log('[NEW_POST] Cover image URL changed:', e.target.value)
                  setFormData(prev => ({ ...prev, coverImageUrl: e.target.value }))
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={TEXTS.FORMS.PLACEHOLDERS.COVER_IMAGE}
              />
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                {TEXTS.POSTS.CONTENT} *
              </label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => {
                  console.log('[NEW_POST] Content changed:', e.target.value.length, 'characters')
                  setFormData(prev => ({ ...prev, content: e.target.value }))
                }}
                rows={20}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder={TEXTS.FORMS.PLACEHOLDERS.CONTENT}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                You can use Markdown syntax.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Link
                href="/admin/posts"
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                onClick={() => console.log('[NEW_POST] Cancel button clicked')}
              >
                {TEXTS.FORMS.CANCEL}
              </Link>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={(e) => {
                    console.log('[NEW_POST] Save as draft button clicked')
                    handleSubmit(e, 'draft')
                  }}
                  disabled={loading || !formData.title || !formData.content}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? TEXTS.FORMS.LOADING : TEXTS.POSTS.SAVE_DRAFT}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    console.log('[NEW_POST] Publish button clicked')
                    handleSubmit(e, 'published')
                  }}
                  disabled={loading || !formData.title || !formData.content}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? TEXTS.FORMS.LOADING : TEXTS.POSTS.PUBLISH}
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  console.log('[NEW_POST_SSR] getServerSideProps started')
  
  try {
    console.log('[NEW_POST_SSR] Creating server Supabase client...')
    const supabase = createServerSupabase()
    console.log('[NEW_POST_SSR] Server Supabase client created successfully')
    
    const isAdmin = true // Temporary admin check
    console.log('[NEW_POST_SSR] Admin check result:', isAdmin)

    console.log('[NEW_POST_SSR] Returning props:', { isAdmin })
    return {
      props: {
        isAdmin,
      },
    }
  } catch (error: any) {
    console.error('[NEW_POST_SSR] Error in getServerSideProps:', error)
    console.error('[NEW_POST_SSR] Error details:', {
      message: error?.message,
      stack: error?.stack
    })
    
    return {
      props: {
        isAdmin: false,
      },
    }
  }
} 