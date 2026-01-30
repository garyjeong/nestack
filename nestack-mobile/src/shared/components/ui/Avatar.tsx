import React, { useState } from 'react'
import { Image } from 'react-native'
import { Stack, Text } from 'tamagui'
import { User } from 'lucide-react-native'
import { useTheme } from '@/shared/hooks/useTheme'

interface AvatarProps {
  src?: string | null
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = { xs: 24, sm: 32, md: 40, lg: 48, xl: 64 }
const fontSizeMap = { xs: 10, sm: 12, md: 14, lg: 18, xl: 24 }

export function Avatar({ src, name, size = 'md' }: AvatarProps) {
  const { colors } = useTheme()
  const [error, setError] = useState(false)
  const s = sizeMap[size]
  const initial = name?.charAt(0).toUpperCase() || ''

  return (
    <Stack
      width={s}
      height={s}
      borderRadius={s / 2}
      backgroundColor={colors.border}
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
    >
      {src && !error ? (
        <Image
          source={{ uri: src }}
          style={{ width: s, height: s }}
          onError={() => setError(true)}
        />
      ) : initial ? (
        <Text fontSize={fontSizeMap[size]} fontWeight="600" color={colors.textSecondary}>
          {initial}
        </Text>
      ) : (
        <User size={s * 0.5} color={colors.textSecondary} />
      )}
    </Stack>
  )
}
