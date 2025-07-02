import { useState, useEffect } from 'react'
import { createBrowserClient } from '../lib/supabase'
import { TEXTS } from '../lib/constants'
import { format } from 'date-fns'
import { MessageCircle, Send } from 'lucide-react'
import { useUser } from '@supabase/auth-helpers-react'

interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  email: string
  role: string
  created_at: string
  updated_at: string
}

interface Comment {
  id: string
  post_id: string
  author_id: string
  content: string
  created_at: string
  updated_at: string
  profiles: Profile | null
}

interface CommentSectionProps {
  postId: string
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const user = useUser()
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchComments()
    
    // Real-time comment subscription
    const channel = supabase
      .channel(`comments:${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`,
        },
        () => {
          // Reload comments whenever there are changes
          fetchComments()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [postId])

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles (
            *
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setComments(data || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newComment.trim()) return

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          author_id: user.id,
          content: newComment.trim(),
        })

      if (error) throw error
      
      setNewComment('')
      // Comments will be automatically updated through real-time subscription
    } catch (error) {
      console.error('Error submitting comment:', error)
      alert(TEXTS.ERRORS.GENERAL)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <MessageCircle className="w-5 h-5 mr-2 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          {TEXTS.COMMENTS.TITLE} ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={TEXTS.FORMS.PLACEHOLDERS.COMMENT}
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            required
          />
          <div className="flex justify-end mt-3">
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
            >
              <Send className="w-4 h-4 mr-2" />
              {submitting ? 'Submitting...' : TEXTS.COMMENTS.SUBMIT}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600 mb-3">{TEXTS.COMMENTS.LOGIN_REQUIRED}</p>
          <a href="/auth/login" className="btn-primary">
            {TEXTS.AUTH.LOGIN_WITH_GOOGLE}
          </a>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-4">
          <p className="text-gray-500">{TEXTS.POSTS.LOADING}</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">{TEXTS.COMMENTS.NO_COMMENTS}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-b-0">
              <div className="flex items-start space-x-3">
                {comment.profiles?.avatar_url ? (
                  <img
                    src={comment.profiles.avatar_url}
                    alt={comment.profiles.display_name || ''}
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900">
                      {comment.profiles?.display_name || 'Anonymous'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {format(new Date(comment.created_at), 'MMM d, yyyy HH:mm')}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 