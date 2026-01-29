import React from 'react'
import { Stack, Text } from 'tamagui'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Stack alignItems="center" justifyContent="center" paddingVertical={48} gap={12}>
      {icon}
      <Text fontSize={16} fontWeight="600" color="#1c1917" textAlign="center">{title}</Text>
      {description && (
        <Text fontSize={14} color="#78716c" textAlign="center">{description}</Text>
      )}
      {action && <Stack marginTop={8}>{action}</Stack>}
    </Stack>
  )
}
