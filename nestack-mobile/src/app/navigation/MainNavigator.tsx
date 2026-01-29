import React, { useRef, useCallback, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet'
import { Home, Target, CreditCard, User, Wallet, PlusCircle } from 'lucide-react-native'
import { Stack, Text } from 'tamagui'
import { useTheme } from '@/shared/hooks/useTheme'
import { CustomTabBar } from '@/shared/components/layout/CustomTabBar'
import type { MainTabParamList } from './types'
import HomeStack from './HomeStack'
import MissionStack from './MissionStack'
import FinanceStack from './FinanceStack'
import MyPageStack from './MyPageStack'
import { useNavigation } from '@react-navigation/native'

const Tab = createBottomTabNavigator<MainTabParamList>()

export default function MainNavigator() {
  const { colors, isDark } = useTheme()
  const bottomSheetRef = useRef<BottomSheet>(null)
  const navigation = useNavigation()
  const snapPoints = useMemo(() => ['25%'], [])

  const handleFabPress = useCallback(() => {
    bottomSheetRef.current?.expand()
  }, [])

  const handleSheetClose = useCallback(() => {
    bottomSheetRef.current?.close()
  }, [])

  const handleAddExpense = useCallback(() => {
    handleSheetClose()
    // TODO: Navigate to add expense screen
    // navigation.navigate('FinanceTab', { screen: 'AddTransaction' })
  }, [])

  const handleCreateMission = useCallback(() => {
    handleSheetClose()
    // @ts-ignore
    navigation.navigate('MissionTab', { screen: 'MissionCreate' })
  }, [navigation])

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  )

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} onFabPress={handleFabPress} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeStack}
          options={{
            tabBarLabel: '홈',
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
        />
        <Tab.Screen
          name="MissionTab"
          component={MissionStack}
          options={{
            tabBarLabel: '미션',
            tabBarIcon: ({ color, size }) => <Target size={size} color={color} />,
          }}
        />
        <Tab.Screen
          name="FinanceTab"
          component={FinanceStack}
          options={{
            tabBarLabel: '금융',
            tabBarIcon: ({ color, size }) => <CreditCard size={size} color={color} />,
          }}
        />
        <Tab.Screen
          name="MyPageTab"
          component={MyPageStack}
          options={{
            tabBarLabel: 'MY',
            tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          }}
        />
      </Tab.Navigator>

      {/* Quick Action Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{
          backgroundColor: colors.card,
        }}
        handleIndicatorStyle={{
          backgroundColor: colors.border,
          width: 40,
        }}
      >
        <BottomSheetView style={styles.sheetContent}>
          <Text fontSize={18} fontWeight="700" color={colors.text} marginBottom={20}>
            빠른 액션
          </Text>

          <Stack gap={12}>
            {/* 지출 추가 */}
            <Stack
              flexDirection="row"
              alignItems="center"
              padding={16}
              backgroundColor={colors.backgroundSecondary}
              borderRadius={16}
              gap={16}
              onPress={handleAddExpense}
              pressStyle={{ opacity: 0.7 }}
            >
              <Stack
                width={48}
                height={48}
                borderRadius={14}
                backgroundColor={colors.primary + '20'}
                alignItems="center"
                justifyContent="center"
              >
                <Wallet size={24} color={colors.primary} />
              </Stack>
              <Stack flex={1}>
                <Text fontSize={16} fontWeight="600" color={colors.text}>
                  지출 추가
                </Text>
                <Text fontSize={13} color={colors.textSecondary}>
                  수동으로 지출 내역을 기록해요
                </Text>
              </Stack>
            </Stack>

            {/* 미션 생성 */}
            <Stack
              flexDirection="row"
              alignItems="center"
              padding={16}
              backgroundColor={colors.backgroundSecondary}
              borderRadius={16}
              gap={16}
              onPress={handleCreateMission}
              pressStyle={{ opacity: 0.7 }}
            >
              <Stack
                width={48}
                height={48}
                borderRadius={14}
                backgroundColor={colors.secondary + '20'}
                alignItems="center"
                justifyContent="center"
              >
                <PlusCircle size={24} color={colors.secondary} />
              </Stack>
              <Stack flex={1}>
                <Text fontSize={16} fontWeight="600" color={colors.text}>
                  미션 생성
                </Text>
                <Text fontSize={13} color={colors.textSecondary}>
                  새로운 저축 목표를 만들어요
                </Text>
              </Stack>
            </Stack>
          </Stack>
        </BottomSheetView>
      </BottomSheet>
    </View>
  )
}

const styles = StyleSheet.create({
  sheetContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
})
