import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { MissionStackParamList } from './types'
import MissionsScreen from '../../screens/missions/MissionsScreen'
import MissionDetailScreen from '../../screens/missions/MissionDetailScreen'
import MissionCreateScreen from '../../screens/missions/MissionCreateScreen'
import MissionEditScreen from '../../screens/missions/MissionEditScreen'

const Stack = createNativeStackNavigator<MissionStackParamList>()

export default function MissionStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Missions" component={MissionsScreen} />
      <Stack.Screen name="MissionDetail" component={MissionDetailScreen} />
      <Stack.Screen name="MissionCreate" component={MissionCreateScreen} />
      <Stack.Screen name="MissionEdit" component={MissionEditScreen} />
    </Stack.Navigator>
  )
}
