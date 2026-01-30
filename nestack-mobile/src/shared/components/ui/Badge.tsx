import React from 'react'
import { Stack, Text } from 'tamagui'
import { useTheme } from '@/shared/hooks/useTheme'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: 'sm' | 'md'
}

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  const { colors } = useTheme()

  const getVariantColors = () => {
    switch (variant) {
      case 'success':
        return { bg: colors.successBg, text: colors.success }
      case 'warning':
        return { bg: colors.warningBg, text: colors.warning }
      case 'danger':
        return { bg: colors.errorBg, text: colors.error }
      case 'info':
        return { bg: colors.infoBg, text: colors.info }
      case 'primary':
        return { bg: `${colors.primary}15`, text: colors.primary }
      default:
        return { bg: colors.backgroundSecondary, text: colors.textSecondary }
    }
  }

  const v = getVariantColors()

  return (
    <Stack
      backgroundColor={v.bg}
      paddingHorizontal={size === 'sm' ? 8 : 12}
      paddingVertical={size === 'sm' ? 2 : 4}
      borderRadius={4}
      alignSelf="flex-start"
    >
      <Text fontSize={size === 'sm' ? 11 : 13} fontWeight="600" color={v.text}>
        {children}
      </Text>
    </Stack>
  )
}
