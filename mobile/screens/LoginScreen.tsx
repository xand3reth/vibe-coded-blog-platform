import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'
import { Image } from 'expo-image'
import { useNavigation } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'

import { supabase } from '../lib/supabase'
import { TEXTS } from '../constants/texts'
import { commonStyles, COLORS, SPACING, FONT_SIZES } from '../styles/AppStyles'

// Set OAuth redirect URL
WebBrowser.maybeCompleteAuthSession()

type RootStackParamList = {
  HomeTabs: undefined
}

type NavigationProp = StackNavigationProp<RootStackParamList, 'HomeTabs'>

export default function LoginScreen() {
  const [loading, setLoading] = useState(false)
  const navigation = useNavigation<NavigationProp>()

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: AuthSession.makeRedirectUri({
            scheme: 'com.supabase',
            path: 'auth/callback',
          }),
        },
      })

      if (error) throw error

      if (data) {
        navigation.navigate('HomeTabs')
      }
    } catch (error) {
      console.error('Error logging in:', error)
      Alert.alert(TEXTS.COMMON.ERROR, TEXTS.AUTH.LOGIN_ERROR)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={commonStyles.centerContainer}>
      <View style={{
        alignItems: 'center',
        paddingHorizontal: SPACING.XL,
      }}>
        {/* App icon */}
        <View style={{
          width: 80,
          height: 80,
          backgroundColor: COLORS.PRIMARY,
          borderRadius: 20,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: SPACING.XL,
        }}>
          <Ionicons name="book-outline" size={40} color={COLORS.WHITE} />
        </View>

        {/* Title */}
        <Text style={[commonStyles.title, { textAlign: 'center' }]}>
          {TEXTS.AUTH.LOGIN_TITLE}
        </Text>

        <Text style={[commonStyles.textSecondary, { 
          textAlign: 'center', 
          marginBottom: SPACING.XXL,
          fontSize: FONT_SIZES.BASE,
        }]}>
          {TEXTS.AUTH.LOGIN_SUBTITLE}
        </Text>

        {/* Google login button */}
        <TouchableOpacity
          style={[commonStyles.button, {
            flexDirection: 'row',
            alignItems: 'center',
            width: '100%',
            paddingVertical: SPACING.MD,
            opacity: loading ? 0.6 : 1,
          }]}
          onPress={handleGoogleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.WHITE} />
          ) : (
            <>
              <Ionicons name="logo-google" size={20} color={COLORS.WHITE} />
              <Text style={[commonStyles.buttonText, { marginLeft: SPACING.SM }]}>
                {TEXTS.AUTH.LOGIN_WITH_GOOGLE}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Description text */}
        <Text style={[commonStyles.textSecondary, {
          textAlign: 'center',
          marginTop: SPACING.XL,
          fontSize: FONT_SIZES.SM,
          lineHeight: 20,
        }]}>
          By logging in, you agree to the Terms of Service and Privacy Policy.
        </Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 48,
  },
  icon: {
    width: 120,
    height: 120,
  },
  content: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
  button: {
    backgroundColor: '#4285f4',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
}) 