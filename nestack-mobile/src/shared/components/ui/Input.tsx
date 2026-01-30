import React, { useState } from 'react'
import { TextInput, type TextInputProps } from 'react-native'
import { Stack, Text } from 'tamagui'
import { Eye, EyeOff } from 'lucide-react-native'
import { useTheme } from '@/shared/hooks/useTheme'

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  isPassword?: boolean
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  isPassword,
  ...props
}: InputProps) {
  const { colors } = useTheme()
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <Stack gap={6}>
      {label && (
        <Text fontSize={14} fontWeight="500" color={colors.textSecondary}>
          {label}
        </Text>
      )}
      <Stack
        flexDirection="row"
        alignItems="center"
        backgroundColor={colors.card}
        borderRadius={4}
        borderWidth={1.5}
        borderColor={error ? colors.error : isFocused ? colors.primary : colors.border}
        paddingHorizontal={14}
        height={48}
        gap={10}
      >
        {leftIcon}
        <TextInput
          {...props}
          secureTextEntry={isPassword && !showPassword}
          onFocus={(e) => { setIsFocused(true); props.onFocus?.(e) }}
          onBlur={(e) => { setIsFocused(false); props.onBlur?.(e) }}
          placeholderTextColor={colors.textTertiary}
          style={{
            flex: 1,
            fontSize: 15,
            color: colors.text,
            padding: 0,
          }}
        />
        {isPassword ? (
          <Stack onPress={() => setShowPassword(!showPassword)} padding={4}>
            {showPassword ? (
              <EyeOff size={20} color={colors.textTertiary} />
            ) : (
              <Eye size={20} color={colors.textTertiary} />
            )}
          </Stack>
        ) : rightIcon}
      </Stack>
      {error && (
        <Text fontSize={12} color={colors.error}>{error}</Text>
      )}
      {helperText && !error && (
        <Text fontSize={12} color={colors.textSecondary}>{helperText}</Text>
      )}
    </Stack>
  )
}
