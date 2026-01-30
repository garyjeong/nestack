import React from 'react'
import { Stack, Text } from 'tamagui'
import { useTheme } from '@/shared/hooks/useTheme'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  const { colors } = useTheme()

  return (
    <Stack alignItems="center" justifyContent="center" paddingVertical={48} gap={12}>
      {icon}
      <Text fontSize={16} fontWeight="600" color={colors.text} textAlign="center">{title}</Text>
      {description && (
        <Text fontSize={14} color={colors.textSecondary} textAlign="center">{description}</Text>
      )}
      {action && <Stack marginTop={8}>{action}</Stack>}
    </Stack>
  )
}
