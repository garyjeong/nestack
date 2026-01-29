import React from 'react'
import { ScrollView, RefreshControl, type ViewStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack } from 'tamagui'

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
  backgroundColor = '#fafaf9',
  edges = ['top'],
  contentContainerStyle,
}: ScreenProps) {
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor }}>
      {scrollable ? (
        <ScrollView
          contentContainerStyle={[{ paddingHorizontal: 16, paddingBottom: 100 }, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing || false}
                onRefresh={onRefresh}
                tintColor="#059669"
                colors={['#059669']}
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
