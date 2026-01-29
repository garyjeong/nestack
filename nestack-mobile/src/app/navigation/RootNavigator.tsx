import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useAuthStore } from '../../store/authStore'
import type { RootStackParamList, OnboardingStackParamList } from './types'
import AuthNavigator from './AuthNavigator'
import MainNavigator from './MainNavigator'
import WelcomeScreen from '../../screens/onboarding/WelcomeScreen'
import InviteCodeScreen from '../../screens/onboarding/InviteCodeScreen'

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function RootNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const hasFamily = !!user?.familyGroupId

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : !hasFamily ? (
        <Stack.Group>
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        </Stack.Group>
      ) : (
        <Stack.Screen name="Main" component={MainNavigator} />
      )}
    </Stack.Navigator>
  )
}

// ---------------------------------------------------------------------------
// Inline Onboarding Navigator
// ---------------------------------------------------------------------------
function OnboardingNavigator() {
  const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>()

  return (
    <OnboardingStack.Navigator screenOptions={{ headerShown: false }}>
      <OnboardingStack.Screen name="Welcome" component={WelcomeScreen} />
      <OnboardingStack.Screen name="InviteCode" component={InviteCodeScreen} />
    </OnboardingStack.Navigator>
  )
}
