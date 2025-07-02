import { NextApiRequest, NextApiResponse } from 'next'
import { createServerSupabase } from '../../../lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { postId } = req.body

  if (!postId) {
    return res.status(400).json({ error: 'Post ID is required' })
  }

  try {
    const supabase = createServerSupabase()

    const { error } = await supabase.rpc('increment_view_count', {
      post_id: postId
    })

    if (error) {
      console.error('Error incrementing view count:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error incrementing view count:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
} 