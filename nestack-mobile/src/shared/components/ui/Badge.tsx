import React from 'react'
import { Stack, Text } from 'tamagui'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: 'sm' | 'md'
}

const variantColors = {
  default: { bg: '#f5f5f4', text: '#57534e' },
  success: { bg: '#d1fae5', text: '#047857' },
  warning: { bg: '#fef3c7', text: '#92400e' },
  danger: { bg: '#fecdd3', text: '#be123c' },
  info: { bg: '#dbeafe', text: '#1d4ed8' },
  primary: { bg: '#d1fae5', text: '#059669' },
}

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  const v = variantColors[variant]
  return (
    <Stack
      backgroundColor={v.bg}
      paddingHorizontal={size === 'sm' ? 8 : 12}
      paddingVertical={size === 'sm' ? 2 : 4}
      borderRadius={100}
      alignSelf="flex-start"
    >
      <Text fontSize={size === 'sm' ? 11 : 13} fontWeight="600" color={v.text}>
        {children}
      </Text>
    </Stack>
  )
}
