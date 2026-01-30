import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'react-native'
import { AppProviders } from './providers'
import RootNavigator from './navigation/RootNavigator'
import { linking } from './navigation/linking'
import { useTheme } from '@/shared/hooks/useTheme'

function AppContent() {
  const { colors, isDark } = useTheme()

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <NavigationContainer linking={linking}>
        <RootNavigator />
      </NavigationContainer>
    </>
  )
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProviders>
          <AppContent />
        </AppProviders>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
