import React from 'react'
import { ScrollView, RefreshControl, type ViewStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack } from 'tamagui'
import { useTheme } from '@/shared/hooks/useTheme'

interface ScreenProps {
  children: React.ReactNode
  scrollable?: boolean
  refreshing?: boolean
  onRefresh?: () => void
  backgroundColor?: string
  edges?: ('top' | 'bottom' | 'left' | 'right')[]
  contentContainerStyle?: ViewStyle
}

export function Screen({
  children,
  scrollable = true,
  refreshing,
  onRefresh,
  backgroundColor,
  edges = ['top'],
  contentContainerStyle,
}: ScreenProps) {
  const { colors } = useTheme()
  const bgColor = backgroundColor ?? colors.background

  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: bgColor }}>
      {scrollable ? (
        <ScrollView
          contentContainerStyle={[{ paddingHorizontal: 16, paddingBottom: 100 }, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing || false}
                onRefresh={onRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      ) : (
        <Stack flex={1} paddingHorizontal={16}>
          {children}
        </Stack>
      )}
    </SafeAreaView>
  )
}
