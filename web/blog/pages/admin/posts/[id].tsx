import { GetServerSideProps } from 'next'
import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { createServerSupabase, supabase } from '../../../lib/supabase'
import { TEXTS } from '../../../lib/constants'
import { toast } from 'react-hot-toast'

interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  cover_image_url: string | null
  status: string
  created_at: string
  updated_at: string
  published_at: string | null
  view_count: number | null
}

interface EditPostProps {
  post: Post | null
  isAdmin: boolean
}

interface PostFormData {
  title: string
  slug: string
  content: string
  excerpt: string
  coverImageUrl: string
}

export default function EditPost({ post, isAdmin }: EditPostProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: post?.title || '',
    slug: post?.slug || '',
    content: post?.content || '',
    excerpt: post?.excerpt || '',
    coverImageUrl: post?.cover_image_url || '',
    status: post?.status as 'draft' | 'published' || 'draft'
  })

  if (!isAdmin) {
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

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {TEXTS.ERRORS.NOT_FOUND}
          </h1>
          <Link href="/admin/posts" className="text-blue-600 hover:text-blue-700">
            {TEXTS.NAVIGATION.MANAGE_POSTS}
          </Link>
        </div>
      </div>
    )
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      // Don't auto-change slug when editing existing post
    }))
  }

  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'published') => {
    e.preventDefault()
    setLoading(true)

    try {
      const updateData = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        excerpt: formData.excerpt,
        cover_image_url: formData.coverImageUrl || null,
        status,
        updated_at: new Date().toISOString(),
        ...(status === 'published' && !post.published_at && { published_at: new Date().toISOString() })
      }

      if (supabase) {
        const { error } = await supabase
          .from('posts')
          .update(updateData)
          .eq('id', post.id)

        if (error) throw error
      } else {
        throw new Error('Supabase is null')
      }

      alert(status === 'published' ? TEXTS.ADMIN.PUBLISH_SUCCESS : TEXTS.ADMIN.SAVE_SUCCESS)
      
      // If status changed, redirect to list page
      if (status !== formData.status) {
        router.push('/admin/posts')
      }
    } catch (error) {
      console.error('Post update error:', error)
      alert(TEXTS.ERRORS.GENERAL)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(TEXTS.ADMIN.CONFIRM_DELETE)) {
      return
    }

    setLoading(true)
    try {
      if (!supabase) {
        throw new Error('Failed to initialize Supabase client')
      }

      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id)

      if (error) throw error

      alert(TEXTS.ADMIN.DELETE_SUCCESS)
      router.push('/admin/posts')
    } catch (error) {
      console.error('Delete error:', error)
      alert(TEXTS.ERRORS.GENERAL)
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async () => {
    try {
      if (!supabase) {
        throw new Error('Failed to initialize Supabase client')
      }

      const updateData = {
        status: 'published' as const,
        published_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', post.id)

      if (error) throw error

      router.push('/admin/posts')
      toast.success(TEXTS.ADMIN.PUBLISH_SUCCESS)
    } catch (error) {
      console.error('Error publishing post:', error)
      toast.error('Failed to publish post')
    }
  }

  const handleSaveDraft = async (formData: PostFormData) => {
    try {
      if (!supabase) {
        throw new Error('Failed to initialize Supabase client')
      }

      const { error } = await supabase
        .from('posts')
        .update({
          title: formData.title,
          slug: formData.slug,
          content: formData.content,
          excerpt: formData.excerpt,
          cover_image_url: formData.coverImageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', post.id)

      if (error) throw error

      toast.success(TEXTS.ADMIN.SAVE_SUCCESS)
    } catch (error) {
      console.error('Error saving draft:', error)
      toast.error('Failed to save draft')
    }
  }

  return (
    <>
      <Head>
        <title>{formData.title} - {TEXTS.POSTS.EDIT} - {TEXTS.SITE.TITLE}</title>
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
                  {TEXTS.POSTS.EDIT}
                </span>
              </nav>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {TEXTS.POSTS.EDIT}
              </h1>
              <p className="text-gray-600 mt-2">
                Created: {new Date(post.created_at).toLocaleDateString()}
                {post.published_at && (
                  <span className="ml-4">
                    Published: {new Date(post.published_at).toLocaleDateString()}
                  </span>
                )}
              </p>
            </div>
            <div className="flex space-x-3">
              <Link
                href={`/posts/${post.slug}`}
                target="_blank"
                className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
              >
                {TEXTS.POSTS.PREVIEW}
              </Link>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
              >
                {TEXTS.POSTS.DELETE}
              </button>
            </div>
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
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
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
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
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
                onChange={(e) => setFormData(prev => ({ ...prev, coverImageUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={TEXTS.FORMS.PLACEHOLDERS.COVER_IMAGE}
              />
              {formData.coverImageUrl && (
                <div className="mt-2">
                  <img
                    src={formData.coverImageUrl}
                    alt="Cover preview"
                    className="w-32 h-20 object-cover rounded border"
                  />
                </div>
              )}
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                {TEXTS.POSTS.CONTENT} *
              </label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={20}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder={TEXTS.FORMS.PLACEHOLDERS.CONTENT}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                You can use Markdown syntax.
              </p>
            </div>

            {/* Status Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Current Status</h3>
              <p className="text-sm text-gray-600">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  post.status === 'published'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {post.status === 'published' ? TEXTS.POSTS.PUBLISHED : TEXTS.POSTS.DRAFT}
                </span>
                <span className="ml-4">Views: {post.view_count || 0}</span>
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Link
                href="/admin/posts"
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                {TEXTS.FORMS.CANCEL}
              </Link>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, 'draft')}
                  disabled={loading || !formData.title || !formData.content}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? TEXTS.FORMS.LOADING : TEXTS.POSTS.SAVE_DRAFT}
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, 'published')}
                  disabled={loading || !formData.title || !formData.content}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? TEXTS.FORMS.LOADING : (post.status === 'published' ? TEXTS.FORMS.SAVE : TEXTS.POSTS.PUBLISH)}
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params, req }) => {
  const supabase = createServerSupabase()
  const postId = params?.id as string

  // Check admin permission
  // TODO: Need to check user session in actual implementation
  const isAdmin = true // Temporarily set to true

  if (!isAdmin) {
    return {
      props: {
        post: null,
        isAdmin: false,
      },
    }
  }

  // Fetch post data
  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('id', postId)
    .single()

  if (!post) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      post,
      isAdmin: true,
    },
  }
} 