import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
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

interface User {
  id: string
  email: string
  user_metadata: {
    full_name?: string
    avatar_url?: string
  }
  created_at: string
}

type RootStackParamList = {
  Login: undefined
}

type NavigationProp = StackNavigationProp<RootStackParamList, 'Login'>

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const navigation = useNavigation<NavigationProp>()

  useEffect(() => {
    getCurrentUser()
  }, [])

  const getCurrentUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) throw error
      
      setUser(user as User)
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    Alert.alert(
      TEXTS.NAVIGATION.LOGOUT,
      TEXTS.AUTH.LOGOUT_CONFIRM,
      [
        {
          text: TEXTS.ACTIONS.CANCEL,
          style: 'cancel',
        },
        {
          text: TEXTS.ACTIONS.CONFIRM,
          onPress: async () => {
            try {
              setLoading(true)
              const { error } = await supabase.auth.signOut()
              if (error) throw error
              navigation.navigate('Login')
            } catch (error) {
              console.error('Error logging out:', error)
              Alert.alert(TEXTS.COMMON.ERROR, TEXTS.ERRORS.GENERAL)
            } finally {
              setLoading(false)
            }
          },
        },
      ],
      { cancelable: true }
    )
  }

  if (loading) {
    return (
      <View style={commonStyles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={[commonStyles.text, { marginTop: SPACING.MD }]}>
          {TEXTS.APP.LOADING}
        </Text>
      </View>
    )
  }

  if (!user) {
    return (
      <View style={commonStyles.errorContainer}>
        <Text style={commonStyles.errorText}>
          {TEXTS.ERRORS.GENERAL}
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
        <Text style={commonStyles.title}>{TEXTS.PROFILE.TITLE}</Text>
      </View>

      <View style={{ flex: 1, padding: SPACING.MD }}>
        {/* Profile header */}
        <View style={[commonStyles.card, { alignItems: 'center' }]}>
          {user.user_metadata?.avatar_url ? (
            <Image
              source={{ uri: user.user_metadata.avatar_url }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                marginBottom: SPACING.MD,
              }}
            />
          ) : (
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: COLORS.GRAY[200],
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: SPACING.MD,
            }}>
              <Ionicons name="person-outline" size={40} color={COLORS.GRAY[500]} />
            </View>
          )}

          <Text style={[commonStyles.subtitle, { textAlign: 'center' }]}>
            {user.user_metadata?.full_name || user.email.split('@')[0]}
          </Text>
          
          <Text style={[commonStyles.textSecondary, { textAlign: 'center' }]}>
            {user.email}
          </Text>
        </View>

        {/* Profile information */}
        <View style={commonStyles.card}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: SPACING.SM,
          }}>
            <Text style={commonStyles.text}>{TEXTS.PROFILE.EMAIL}</Text>
            <Text style={commonStyles.textSecondary}>{user.email}</Text>
          </View>

          <View style={commonStyles.divider} />

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <Text style={commonStyles.text}>{TEXTS.PROFILE.MEMBER_SINCE}</Text>
            <Text style={commonStyles.textSecondary}>
              {format(new Date(user.created_at), 'MMM d, yyyy')}
            </Text>
          </View>
        </View>

        {/* Settings menu */}
        <View style={commonStyles.card}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: SPACING.SM,
            }}
            onPress={() => Alert.alert('Info', 'App version: 1.0.0')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="information-circle-outline" size={20} color={COLORS.GRAY[600]} />
              <Text style={[commonStyles.text, { marginLeft: SPACING.SM }]}>
                {TEXTS.PROFILE.ABOUT}
              </Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={16} color={COLORS.GRAY[400]} />
          </TouchableOpacity>
        </View>

        {/* Logout button */}
        <TouchableOpacity
          style={[commonStyles.button, {
            backgroundColor: COLORS.ERROR,
            marginTop: SPACING.XL,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }]}
          onPress={handleLogout}
          disabled={loading}
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.WHITE} />
          <Text style={[commonStyles.buttonText, { marginLeft: SPACING.SM }]}>
            {TEXTS.NAVIGATION.LOGOUT}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  placeholderAvatar: {
    backgroundColor: '#eee',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  menuValue: {
    fontSize: 16,
    color: '#666',
  },
  logoutButton: {
    backgroundColor: '#f44336',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}) 