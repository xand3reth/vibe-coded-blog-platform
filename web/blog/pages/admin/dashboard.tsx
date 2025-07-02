import { GetServerSideProps } from 'next'
import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { createServerSupabase } from '../../lib/supabase'
import { TEXTS, STYLES } from '../../lib/constants'
import { format } from 'date-fns'

interface DashboardStats {
  totalPosts: number
  totalComments: number
  totalViews: number
}

interface RecentPost {
  id: string
  title: string
  status: string
  view_count: number
  created_at: string
  slug: string
}

interface RecentComment {
  id: string
  content: string
  created_at: string
  profiles: {
    display_name: string | null
  }
  posts: {
    title: string
    slug: string
  }
}

interface DashboardProps {
  stats: DashboardStats
  recentPosts: RecentPost[]
  recentComments: RecentComment[]
  isAdmin: boolean
}

export default function Dashboard({ stats, recentPosts, recentComments, isAdmin }: DashboardProps) {
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

  return (
    <>
      <Head>
        <title>{TEXTS.ADMIN.DASHBOARD_TITLE} - {TEXTS.SITE.TITLE}</title>
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
                <Link href="/admin/dashboard" className="text-blue-600 font-medium">
                  {TEXTS.NAVIGATION.DASHBOARD}
                </Link>
                <Link href="/admin/posts" className="text-gray-600 hover:text-gray-900">
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
              {TEXTS.ADMIN.DASHBOARD_TITLE}
            </h1>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">
                    {TEXTS.ADMIN.TOTAL_POSTS}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalPosts}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">
                    {TEXTS.ADMIN.TOTAL_COMMENTS}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalComments}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">
                    {TEXTS.ADMIN.TOTAL_VIEWS}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalViews.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Posts */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {TEXTS.ADMIN.RECENT_POSTS}
                </h2>
                <Link href="/admin/posts" className="text-blue-600 hover:text-blue-700 text-sm">
                  View All →
                </Link>
              </div>
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 truncate">
                        {post.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <span className={`px-2 py-1 rounded text-xs ${
                          post.status === 'published' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {post.status === 'published' ? TEXTS.POSTS.PUBLISHED : TEXTS.POSTS.DRAFT}
                        </span>
                        <span>{TEXTS.POSTS.VIEWS}: {post.view_count}</span>
                        <span>{format(new Date(post.created_at), 'M/d')}</span>
                      </div>
                    </div>
                    <Link 
                      href={`/admin/posts/${post.id}`}
                      className="ml-4 text-blue-600 hover:text-blue-700"
                    >
                      {TEXTS.POSTS.EDIT}
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Comments */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {TEXTS.ADMIN.RECENT_COMMENTS}
              </h2>
              <div className="space-y-4">
                {recentComments.map((comment) => (
                  <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-900 text-sm line-clamp-2 mb-2">
                      {comment.content}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {comment.profiles.display_name || 'Anonymous'} • {comment.posts.title}
                      </span>
                      <span>
                        {format(new Date(comment.created_at), 'M/d HH:mm')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const supabase = createServerSupabase()

  // Check admin permission
  // TODO: Need to check user session in actual implementation
  const isAdmin = true // Temporarily set to true

  if (!isAdmin) {
    return {
      props: {
        stats: { totalPosts: 0, totalComments: 0, totalViews: 0 },
        recentPosts: [],
        recentComments: [],
        isAdmin: false,
      },
    }
  }

  // Fetch statistics data
  const [postsResult, commentsResult, viewsResult] = await Promise.all([
    supabase.from('posts').select('id', { count: 'exact' }),
    supabase.from('comments').select('id', { count: 'exact' }),
    supabase.from('posts').select('view_count')
  ])

  const totalViews = viewsResult.data?.reduce((sum, post) => sum + (post.view_count || 0), 0) || 0

  // Fetch recent posts
  const { data: recentPosts } = await supabase
    .from('posts')
    .select('id, title, status, view_count, created_at, slug')
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch recent comments
  const { data: recentComments } = await supabase
    .from('comments')
    .select(`
      id,
      content,
      created_at,
      profiles (display_name),
      posts (title, slug)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  return {
    props: {
      stats: {
        totalPosts: postsResult.count || 0,
        totalComments: commentsResult.count || 0,
        totalViews,
      },
      recentPosts: recentPosts || [],
      recentComments: recentComments || [],
      isAdmin: true,
    },
  }
} 