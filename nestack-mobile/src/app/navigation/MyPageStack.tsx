import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { MyPageStackParamList } from './types'
import MyPageScreen from '../../screens/mypage/MyPageScreen'
import ProfileEditScreen from '../../screens/mypage/ProfileEditScreen'
import BadgesScreen from '../../screens/mypage/BadgesScreen'
import SettingsScreen from '../../screens/mypage/SettingsScreen'
import FamilySettingsScreen from '../../screens/mypage/FamilySettingsScreen'

const Stack = createNativeStackNavigator<MyPageStackParamList>()

export default function MyPageStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MyPage" component={MyPageScreen} />
      <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
      <Stack.Screen name="Badges" component={BadgesScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="FamilySettings" component={FamilySettingsScreen} />
    </Stack.Navigator>
  )
}
