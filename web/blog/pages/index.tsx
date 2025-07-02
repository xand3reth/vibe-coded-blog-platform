import { GetStaticProps } from 'next'
import { TEXTS } from '../lib/constants'
import { createServerSupabase } from '../lib/supabase'
import Head from 'next/head'
import Link from 'next/link'
import { format } from 'date-fns'
import Navbar from '../components/Navbar'
import { Eye } from 'lucide-react'

interface Post {
  id: string
  slug: string
  title: string
  excerpt: string | null
  cover_image_url: string | null
  published_at: string
  view_count: number
  profiles: {
    display_name: string | null
    avatar_url: string | null
  }
}

interface HomeProps {
  posts: Post[]
}

export default function Home({ posts }: HomeProps) {
  return (
    <>
      <Head>
        <title>{TEXTS.SITE.TITLE}</title>
        <meta name="description" content={TEXTS.SITE.DESCRIPTION} />
        <meta property="og:title" content={TEXTS.SITE.TITLE} />
        <meta property="og:description" content={TEXTS.SITE.DESCRIPTION} />
        <meta property="og:type" content="website" />
      </Head>

      <div className="min-h-screen bg-slate-900">
        <Navbar />

        {/* Main Content */}
        <main className="max-w-5xl mx-auto px-4 py-8">
          {/* Posts List */}
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg">{TEXTS.POSTS.NO_POSTS}</p>
            </div>
          ) : (
            <div className="space-y-8">
              {posts.map((post, index) => (
                <article 
                  key={post.id} 
                  className={`flex flex-col gap-6 pb-8 ${
                    index !== posts.length - 1 ? 'border-b border-slate-800' : ''
                  }`}
                >
                  <Link href={`/posts/${post.slug}`} className="group">
                    <div className="flex items-center gap-3 mb-2">
                      {post.profiles.avatar_url && (
                        <img
                          src={post.profiles.avatar_url}
                          alt={post.profiles.display_name || ''}
                          className="w-6 h-6 rounded-full ring-1 ring-slate-800"
                        />
                      )}
                      <span className="text-slate-400 text-sm">
                        {post.profiles.display_name || TEXTS.SITE.AUTHOR}
                      </span>
                      <span className="text-slate-600">·</span>
                      <time className="text-slate-400 text-sm">
                        {format(new Date(post.published_at), 'MMM d, yyyy')}
                      </time>
                    </div>

                    <div className="flex justify-between items-start gap-8">
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-slate-50 mb-2 group-hover:text-blue-400 transition-colors">
                          {post.title}
                        </h2>
                        {post.excerpt && (
                          <p className="text-slate-300 line-clamp-2 mb-4">
                            {post.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Eye className="w-4 h-4" />
                          <span>{post.view_count} views</span>
                        </div>
                      </div>

                      {post.cover_image_url && (
                        <div className="w-48 h-32 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-slate-700">
                          <img
                            src={post.cover_image_url}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const supabase = createServerSupabase()
    if (!supabase) {
      throw new Error('Failed to create Supabase client')
    }

    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        id,
        slug,
        title,
        excerpt,
        cover_image_url,
        published_at,
        view_count,
        profiles (
          display_name,
          avatar_url
        )
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching posts:', error)
      return {
        props: {
          posts: [],
        },
        revalidate: 60,
      }
    }

    return {
      props: {
        posts: posts || [],
      },
      revalidate: 60, // ISR: Regenerate every 1 minute
    }
  } catch (error) {
    console.error('Error in getStaticProps:', error)
    return {
      props: {
        posts: [],
      },
      revalidate: 60,
    }
  }
} 