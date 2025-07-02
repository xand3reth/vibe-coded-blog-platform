import { GetServerSideProps } from 'next'
import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { createServerSupabase, supabase } from '../../../lib/supabase'
import { TEXTS } from '../../../lib/constants'
import { format } from 'date-fns'
import { useRouter } from 'next/router'
import { toast } from 'react-hot-toast'

interface Post {
  id: string
  title: string
  slug: string
  status: string
  view_count: number
  created_at: string
  updated_at: string
  published_at: string | null
}

interface PostsPageProps {
  posts: Post[]
  isAdmin: boolean
}

export default function PostsPage({ posts: initialPosts, isAdmin }: PostsPageProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

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

  const handleStatusChange = async (postId: string, newStatus: 'draft' | 'published') => {
    try {
      if (!supabase) {
        throw new Error('Failed to initialize Supabase client')
      }

      const { error } = await supabase
        .from('posts')
        .update({ 
          status: newStatus,
          published_at: newStatus === 'published' ? new Date().toISOString() : null 
        })
        .eq('id', postId)

      if (error) throw error

      toast.success(newStatus === 'published' ? TEXTS.ADMIN.PUBLISH_SUCCESS : TEXTS.ADMIN.SAVE_SUCCESS)
      router.reload()
    } catch (error) {
      console.error('Error updating post status:', error)
      toast.error('Failed to update post status')
    }
  }

  const handleDelete = async (postId: string) => {
    try {
      if (!supabase) {
        throw new Error('Failed to initialize Supabase client')
      }

      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)

      if (error) throw error

      toast.success(TEXTS.ADMIN.DELETE_SUCCESS)
      router.reload()
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error('Failed to delete post')
    }
  }

  return (
    <>
      <Head>
        <title>{TEXTS.NAVIGATION.MANAGE_POSTS} - {TEXTS.SITE.TITLE}</title>
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
                <Link href="/admin/posts" className="text-blue-600 font-medium">
                  {TEXTS.NAVIGATION.MANAGE_POSTS}
                </Link>
                <Link href="/admin/posts/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  {TEXTS.NAVIGATION.NEW_POST}
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {TEXTS.NAVIGATION.MANAGE_POSTS}
            </h1>
            <p className="text-gray-600 mt-2">
              Total Posts: {posts.length}
            </p>
          </div>

          {/* Posts Table */}
          <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      {TEXTS.POSTS.TITLE}
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      {TEXTS.POSTS.STATUS}
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      {TEXTS.POSTS.VIEWS}
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Updated
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      {TEXTS.POSTS.ACTIONS}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post, index) => (
                    <tr key={post.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-4 px-4">
                        <div>
                          <Link 
                            href={`/posts/${post.slug}`}
                            className="font-medium text-gray-900 hover:text-blue-600"
                            target="_blank"
                          >
                            {post.title}
                          </Link>
                          <p className="text-sm text-gray-500 mt-1">
                            /{post.slug}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          post.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {post.status === 'published' ? TEXTS.POSTS.PUBLISHED : TEXTS.POSTS.DRAFT}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {post.view_count.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {format(new Date(post.updated_at), 'yyyy/MM/dd HH:mm')}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <Link
                            href={`/admin/posts/${post.id}`}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            {TEXTS.POSTS.EDIT}
                          </Link>
                          <button
                            onClick={() => handleStatusChange(
                              post.id, 
                              post.status === 'published' ? 'draft' : 'published'
                            )}
                            disabled={loading}
                            className="text-green-600 hover:text-green-700 text-sm font-medium disabled:opacity-50"
                          >
                            {post.status === 'published' ? TEXTS.POSTS.UNPUBLISH : TEXTS.POSTS.PUBLISH}
                          </button>
                          <button
                            onClick={() => handleDelete(post.id)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                          >
                            {TEXTS.POSTS.DELETE}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {posts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">{TEXTS.POSTS.NO_POSTS}</p>
                <Link
                  href="/admin/posts/new"
                  className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  {TEXTS.NAVIGATION.NEW_POST}
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const supabase = createServerSupabase()
  const isAdmin = true // Temporary admin check

  if (!isAdmin) {
    return {
      props: {
        posts: [],
        isAdmin: false,
      },
    }
  }

  // Get all posts
  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, slug, status, view_count, created_at, updated_at, published_at')
    .order('updated_at', { ascending: false })

  return {
    props: {
      posts: posts || [],
      isAdmin: true,
    },
  }
} 