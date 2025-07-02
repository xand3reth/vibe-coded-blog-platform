import { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { format } from 'date-fns'
import { supabase } from '../lib/supabase'
import { TEXTS } from '../constants/texts'
import { commonStyles } from '../styles/common'

interface Post {
  id: string
  title: string
  content: string
  cover_image_url: string
  published_at: string
  view_count: number
  profiles: {
    display_name: string | null
    avatar_url: string | null
  }
}

interface PostDetailScreenProps {
  postId: string
}

export default function PostDetailScreen({ postId }: PostDetailScreenProps) {
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPost()
  }, [postId])

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, content, cover_image_url, published_at, view_count, profiles(display_name, avatar_url)')
        .eq('id', postId)
        .single()

      if (error) throw error

      setPost({
        ...data,
        profiles: {
          display_name: data.profiles?.display_name || null,
          avatar_url: data.profiles?.avatar_url || null
        }
      })
    } catch (error) {
      console.error('Error fetching post:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={commonStyles.text}>{TEXTS.COMMON.LOADING}</Text>
      </View>
    )
  }

  if (!post) {
    return (
      <View style={styles.container}>
        <Text style={commonStyles.text}>{TEXTS.ERRORS.NOT_FOUND}</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* Cover image */}
      {post.cover_image_url && (
        <Image
          source={{ uri: post.cover_image_url }}
          style={styles.coverImage}
          contentFit="cover"
        />
      )}

      {/* Title */}
      <View style={styles.content}>
        <Text style={styles.title}>{post.title}</Text>

        {/* Meta information */}
        <View style={styles.meta}>
          <View style={styles.author}>
            {post.profiles.avatar_url && (
              <Image
                source={{ uri: post.profiles.avatar_url }}
                style={styles.avatar}
                contentFit="cover"
              />
            )}
            <Text style={styles.authorName}>
              {post.profiles.display_name || TEXTS.COMMON.NAME}
            </Text>
          </View>
          <Text style={styles.date}>
            {format(new Date(post.published_at), 'MMM d, yyyy')}
          </Text>
        </View>

        {/* Content */}
        <Text style={styles.postContent}>{post.content}</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  coverImage: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  author: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  authorName: {
    fontSize: 14,
    color: '#666',
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
  },
}) 