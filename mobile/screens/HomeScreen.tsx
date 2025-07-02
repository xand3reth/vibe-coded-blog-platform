import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import { format } from 'date-fns'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'

import { supabase } from '../lib/supabase'
import { TEXTS } from '../constants/texts'
import { commonStyles, COLORS, SPACING, FONT_SIZES } from '../styles/AppStyles'

interface Post {
  id: string
  slug: string
  title: string
  excerpt: string
  cover_image_url: string
  published_at: string
  view_count: number
  profiles: {
    display_name: string | null
    avatar_url: string | null
  }
}

type RootStackParamList = {
  PostDetail: { postId: string }
}

type NavigationProp = StackNavigationProp<RootStackParamList, 'PostDetail'>

export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const navigation = useNavigation<NavigationProp>()

  const POSTS_PER_PAGE = 10

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('id, slug, title, excerpt, cover_image_url, published_at, view_count, profiles(display_name, avatar_url)')
        .order('published_at', { ascending: false })
        .limit(POSTS_PER_PAGE)

      if (error) throw error

      const newPosts = data.map((post: any) => ({
        ...post,
        profiles: {
          display_name: post.profiles?.display_name || null,
          avatar_url: post.profiles?.avatar_url || null
        }
      })) as Post[]

      setPosts(newPosts)
      setHasMore(data.length === POSTS_PER_PAGE)
    } catch (error) {
      console.error('Error fetching posts:', error)
      Alert.alert(TEXTS.APP.ERROR, TEXTS.ERRORS.NETWORK)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchMorePosts = async () => {
    if (loading || !hasMore) return

    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('posts')
        .select('id, slug, title, excerpt, cover_image_url, published_at, view_count, profiles(display_name, avatar_url)')
        .order('published_at', { ascending: false })
        .range(posts.length, posts.length + POSTS_PER_PAGE - 1)

      if (error) throw error

      const newPosts = data.map((post: any) => ({
        ...post,
        profiles: {
          display_name: post.profiles?.display_name || null,
          avatar_url: post.profiles?.avatar_url || null
        }
      })) as Post[]

      setPosts(prev => [...prev, ...newPosts])
      setHasMore(data.length === POSTS_PER_PAGE)
    } catch (error) {
      console.error('Error fetching more posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLoadMore = () => {
    fetchMorePosts()
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchPosts()
  }

  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={commonStyles.card}
      onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
      activeOpacity={0.7}
    >
      {item.cover_image_url && (
        <Image
          source={{ uri: item.cover_image_url }}
          style={{
            width: '100%',
            height: 200,
            borderRadius: 8,
            marginBottom: SPACING.SM,
          }}
          contentFit="cover"
        />
      )}
      
      <Text style={commonStyles.subtitle} numberOfLines={2}>
        {item.title}
      </Text>
      
      {item.excerpt && (
        <Text style={commonStyles.textSecondary} numberOfLines={3}>
          {item.excerpt}
        </Text>
      )}
      
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: SPACING.SM,
        paddingTop: SPACING.SM,
        borderTopWidth: 1,
        borderTopColor: COLORS.BORDER,
      }}>
        <Text style={[commonStyles.textSecondary, { fontSize: FONT_SIZES.XS }]}>
          {format(new Date(item.published_at), 'MMM d, yyyy')}
        </Text>
        
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="eye-outline" size={16} color={COLORS.GRAY[500]} />
          <Text style={[commonStyles.textSecondary, { marginLeft: 4, fontSize: FONT_SIZES.XS }]}>
            {item.view_count}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  const renderFooter = () => {
    if (!hasMore) return null
    
    return (
      <View style={{ padding: SPACING.MD, alignItems: 'center' }}>
        <ActivityIndicator size="small" color={COLORS.PRIMARY} />
        <Text style={[commonStyles.textSecondary, { marginTop: SPACING.SM }]}>
          {TEXTS.POSTS.LOADING_MORE}
        </Text>
      </View>
    )
  }

  const renderEmpty = () => (
    <View style={commonStyles.centerContainer}>
      <Ionicons name="document-text-outline" size={48} color={COLORS.GRAY[400]} />
      <Text style={[commonStyles.text, { marginTop: SPACING.MD, textAlign: 'center' }]}>
        {TEXTS.POSTS.NO_POSTS}
      </Text>
    </View>
  )

  if (loading && !refreshing && posts.length === 0) {
    return (
      <View style={commonStyles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={[commonStyles.text, { marginTop: SPACING.MD }]}>
          {TEXTS.APP.LOADING}
        </Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={{
        paddingHorizontal: SPACING.MD,
        paddingVertical: SPACING.SM,
        backgroundColor: COLORS.WHITE,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.BORDER,
      }}>
        <Text style={commonStyles.title}>{TEXTS.POSTS.TITLE}</Text>
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.PRIMARY]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  )
} 