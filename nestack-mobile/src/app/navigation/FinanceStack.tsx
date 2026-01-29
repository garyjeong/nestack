import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { FinanceStackParamList } from './types'
import FinanceScreen from '../../screens/finance/FinanceScreen'
import AccountDetailScreen from '../../screens/finance/AccountDetailScreen'
import TransactionListScreen from '../../screens/finance/TransactionListScreen'

const Stack = createNativeStackNavigator<FinanceStackParamList>()

export default function FinanceStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Finance" component={FinanceScreen} />
      <Stack.Screen name="AccountDetail" component={AccountDetailScreen} />
      <Stack.Screen name="TransactionList" component={TransactionListScreen} />
    </Stack.Navigator>
  )
}
