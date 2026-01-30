import React from 'react'
import { Stack, Text } from 'tamagui'
import { ChevronLeft } from 'lucide-react-native'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from '@/shared/hooks/useTheme'

interface HeaderProps {
  title: string
  showBack?: boolean
  rightAction?: React.ReactNode
}

export function Header({ title, showBack = true, rightAction }: HeaderProps) {
  const navigation = useNavigation()
  const { colors } = useTheme()

  return (
    <Stack
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      paddingVertical={12}
      paddingHorizontal={4}
    >
      <Stack flexDirection="row" alignItems="center" gap={8} flex={1}>
        {showBack && (
          <Stack onPress={() => navigation.goBack()} padding={4}>
            <ChevronLeft size={24} color={colors.text} />
          </Stack>
        )}
        <Text fontSize={20} fontWeight="700" color={colors.text} numberOfLines={1} flex={1}>
          {title}
        </Text>
      </Stack>
      {rightAction}
    </Stack>
  )
}
