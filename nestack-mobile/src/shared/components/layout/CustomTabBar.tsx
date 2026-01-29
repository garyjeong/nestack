import React, { useCallback } from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { Plus } from 'lucide-react-native'
import { useTheme } from '@/shared/hooks/useTheme'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'

interface CustomTabBarProps extends BottomTabBarProps {
  onFabPress: () => void
}

export function CustomTabBar({
  state,
  descriptors,
  navigation,
  onFabPress,
}: CustomTabBarProps) {
  const { colors, isDark } = useTheme()
  const insets = useSafeAreaInsets()

  // 탭 배열에서 중간에 FAB을 위한 더미 탭 추가
  const routes = state.routes
  const middleIndex = Math.floor(routes.length / 2)

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.tabBarBackground,
          paddingBottom: Math.max(insets.bottom, 8),
          borderTopColor: colors.tabBarBorder,
        },
      ]}
    >
      {routes.map((route, index) => {
        // FAB 위치 (중간)
        if (index === middleIndex) {
          return (
            <React.Fragment key="fab-wrapper">
              <TabItem
                key={route.key}
                route={route}
                index={index}
                state={state}
                descriptors={descriptors}
                navigation={navigation}
              />
              <FABButton onPress={onFabPress} colors={colors} />
            </React.Fragment>
          )
        }

        return (
          <TabItem
            key={route.key}
            route={route}
            index={index}
            state={state}
            descriptors={descriptors}
            navigation={navigation}
          />
        )
      })}
    </View>
  )
}

// 개별 탭 아이템
interface TabItemProps {
  route: any
  index: number
  state: any
  descriptors: any
  navigation: any
}

function TabItem({ route, index, state, descriptors, navigation }: TabItemProps) {
  const { colors } = useTheme()
  const scale = useSharedValue(1)

  const { options } = descriptors[route.key]
  const isFocused = state.index === index

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const onPressIn = useCallback(() => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 })
  }, [])

  const onPressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 })
  }, [])

  const onPress = useCallback(() => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    })

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name)
    }
  }, [isFocused, navigation, route])

  const onLongPress = useCallback(() => {
    navigation.emit({
      type: 'tabLongPress',
      target: route.key,
    })
  }, [navigation, route.key])

  const color = isFocused ? colors.tabBarActive : colors.tabBarInactive

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={styles.tabItem}
    >
      <Animated.View style={[styles.tabItemContent, animatedStyle]}>
        {options.tabBarIcon?.({ color, size: 24, focused: isFocused })}
        <Animated.Text
          style={[
            styles.tabLabel,
            {
              color,
              fontWeight: isFocused ? '600' : '500',
            },
          ]}
        >
          {options.tabBarLabel ?? route.name}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  )
}

// FAB 버튼
interface FABButtonProps {
  onPress: () => void
  colors: ReturnType<typeof useTheme>['colors']
}

function FABButton({ onPress, colors }: FABButtonProps) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 })
  }, [])

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 })
  }, [])

  return (
    <View style={styles.fabContainer}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Animated.View
          style={[
            styles.fab,
            animatedStyle,
            {
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
            },
          ]}
        >
          <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
        </Animated.View>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 11,
  },
  fabContainer: {
    width: 70,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: -20,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
})
