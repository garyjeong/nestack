import React, { useState } from 'react'
import { TextInput, type TextInputProps } from 'react-native'
import { Stack, Text } from 'tamagui'
import { Eye, EyeOff } from 'lucide-react-native'

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
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <Stack gap={6}>
      {label && (
        <Text fontSize={14} fontWeight="500" color="#44403c">
          {label}
        </Text>
      )}
      <Stack
        flexDirection="row"
        alignItems="center"
        backgroundColor="#ffffff"
        borderRadius={14}
        borderWidth={1.5}
        borderColor={error ? '#ef4444' : isFocused ? '#059669' : '#e7e5e4'}
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
          placeholderTextColor="#a8a29e"
          style={{
            flex: 1,
            fontSize: 15,
            color: '#1c1917',
            padding: 0,
          }}
        />
        {isPassword ? (
          <Stack onPress={() => setShowPassword(!showPassword)} padding={4}>
            {showPassword ? (
              <EyeOff size={20} color="#a8a29e" />
            ) : (
              <Eye size={20} color="#a8a29e" />
            )}
          </Stack>
        ) : rightIcon}
      </Stack>
      {error && (
        <Text fontSize={12} color="#ef4444">{error}</Text>
      )}
      {helperText && !error && (
        <Text fontSize={12} color="#78716c">{helperText}</Text>
      )}
    </Stack>
  )
}
