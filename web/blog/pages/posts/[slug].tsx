import { GetStaticProps, GetStaticPaths } from 'next'
import { createServerSupabase } from '../../lib/supabase'
import { TEXTS, STYLES } from '../../lib/constants'
import Head from 'next/head'
import Link from 'next/link'
import { format } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import CommentSection from '../../components/CommentSection'
import { Eye, ArrowLeft } from 'lucide-react'
import { useEffect } from 'react'
import Navbar from '../../components/Navbar'

interface Post {
  id: string
  slug: string
  title: string
  content: string
  excerpt: string | null
  cover_image_url: string | null
  published_at: string
  view_count: number
  profiles: {
    display_name: string | null
    avatar_url: string | null
  }
}

interface PostPageProps {
  post: Post
}

export default function PostPage({ post }: PostPageProps) {
  useEffect(() => {
    // Increment view count
    const incrementViewCount = async () => {
      try {
        await fetch('/api/posts/increment-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ postId: post.id }),
        })
      } catch (error) {
        console.error('Failed to increment view count:', error)
      }
    }

    incrementViewCount()
  }, [post.id])

  return (
    <>
      <Head>
        <title>{post.title} | {TEXTS.SITE.TITLE}</title>
        <meta name="description" content={post.excerpt || post.title} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt || post.title} />
        <meta property="og:type" content="article" />
        {post.cover_image_url && (
          <meta property="og:image" content={post.cover_image_url} />
        )}
      </Head>

      <div className="min-h-screen bg-slate-900">
        <Navbar />

        {/* Main Content */}
        <main className="max-w-5xl mx-auto px-4">
          {/* Back to home */}
          <div className="py-6">
            <Link
              href="/"
              className="inline-flex items-center text-slate-400 hover:text-slate-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go back to the list of posts
            </Link>
          </div>

          {/* Post Content */}
          <article className="bg-slate-800/50 rounded-xl shadow-lg overflow-hidden ring-1 ring-slate-700/50">
            {/* Cover Image */}
            {post.cover_image_url && (
              <div className="w-full h-[400px] bg-slate-900">
                <img
                  src={post.cover_image_url}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="px-8 py-10">
              {/* Post Header */}
              <div className="max-w-3xl mx-auto">
                {/* Category/Type */}
                <div className="text-sm font-medium text-slate-400 mb-3 tracking-wide uppercase">
                  {TEXTS.SITE.TITLE}
                </div>
                
                {/* Title */}
                <h1 className="text-4xl sm:text-5xl font-bold text-slate-50 leading-tight mb-8 tracking-tight">
                  {post.title}
                </h1>

                {/* Author Info */}
                <div className="flex items-center space-x-4 mb-12">
                  {post.profiles.avatar_url && (
                    <img
                      src={post.profiles.avatar_url}
                      alt={post.profiles.display_name || ''}
                      className="w-12 h-12 rounded-full ring-2 ring-slate-700/50"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-slate-200">
                      {post.profiles.display_name || TEXTS.SITE.AUTHOR}
                    </p>
                    <div className="flex items-center text-slate-400 text-sm mt-1">
                      <time>
                        {format(new Date(post.published_at), 'MMM d, yyyy')}
                      </time>
                      <span className="mx-2">·</span>
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        <span>{post.view_count} views</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <div className="prose prose-lg prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    className="text-slate-300 text-lg leading-relaxed [&>p]:mb-6 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-slate-50 [&>h2]:mt-12 [&>h2]:mb-6 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:text-slate-100 [&>h3]:mt-8 [&>h3]:mb-4"
                  >
                    {post.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </article>

          {/* Comments Section */}
          <div className="max-w-3xl mx-auto mt-12 mb-16">
            <CommentSection postId={post.id} />
          </div>
        </main>
      </div>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const supabase = createServerSupabase()

  const { data: posts } = await supabase
    .from('posts')
    .select('slug')
    .eq('status', 'published')

  const paths = posts?.map((post) => ({
    params: { slug: post.slug },
  })) || []

  return {
    paths,
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const supabase = createServerSupabase()

  const { data: post } = await supabase
    .from('posts')
    .select(`
      id,
      slug,
      title,
      content,
      excerpt,
      cover_image_url,
      published_at,
      view_count,
      profiles (
        display_name,
        avatar_url
      )
    `)
    .eq('slug', params?.slug)
    .eq('status', 'published')
    .single()

  if (!post) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      post,
    },
    revalidate: 60,
  }
} 