import React, { useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as SplashScreen from 'expo-splash-screen'
import { Session } from '@supabase/supabase-js'

import { supabase } from './lib/supabase'
import { TEXTS } from './constants/texts'
import { COLORS } from './styles/AppStyles'

// Screens
import HomeScreen from './screens/HomeScreen'
import PostDetailScreen from './screens/PostDetailScreen'
import ProfileScreen from './screens/ProfileScreen'
import LoginScreen from './screens/LoginScreen'

type RootStackParamList = {
  HomeTabs: undefined
  PostDetail: { postId: string }
  Login: undefined
}

type TabParamList = {
  Home: undefined
  Profile: undefined
}

const Tab = createBottomTabNavigator<TabParamList>()
const Stack = createStackNavigator<RootStackParamList>()

// Keep splash screen
SplashScreen.preventAutoHideAsync()

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = focused ? 'home' : 'home-outline'

          if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline'
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: TEXTS.NAVIGATION.HOME }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: TEXTS.NAVIGATION.PROFILE }}
      />
    </Tab.Navigator>
  )
}

function PostDetailScreenWrapper({ route }: { route: { params: { postId: string } } }) {
  return <PostDetailScreen postId={route.params.postId} />
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  useEffect(() => {
    SplashScreen.hideAsync()
  }, [])

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          {session ? (
            <>
              <Stack.Screen
                name="HomeTabs"
                component={HomeTabs}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="PostDetail"
                component={PostDetailScreenWrapper}
                options={{ title: '' }}
              />
            </>
          ) : (
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
          )}
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </SafeAreaProvider>
  )
} 