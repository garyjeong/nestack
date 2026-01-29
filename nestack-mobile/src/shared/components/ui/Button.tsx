import React from 'react'
import { ActivityIndicator, type TouchableOpacityProps } from 'react-native'
import { styled, Stack, Text, type GetProps } from 'tamagui'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children: React.ReactNode
  onPress?: () => void
}

const variantStyles = {
  primary: { bg: '#059669', color: '#fff', pressedBg: '#047857', borderColor: 'transparent', borderWidth: 0 },
  secondary: { bg: '#f5f5f4', color: '#1c1917', pressedBg: '#e7e5e4', borderColor: 'transparent', borderWidth: 0 },
  outline: { bg: 'transparent', color: '#1c1917', pressedBg: '#f5f5f4', borderColor: '#e7e5e4', borderWidth: 1 },
  ghost: { bg: 'transparent', color: '#1c1917', pressedBg: '#f5f5f4', borderColor: 'transparent', borderWidth: 0 },
  danger: { bg: '#ef4444', color: '#fff', pressedBg: '#dc2626', borderColor: 'transparent', borderWidth: 0 },
}

const sizeStyles = {
  sm: { height: 36, paddingHorizontal: 12, fontSize: 13 },
  md: { height: 44, paddingHorizontal: 16, fontSize: 14 },
  lg: { height: 52, paddingHorizontal: 20, fontSize: 16 },
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading,
  disabled,
  fullWidth,
  leftIcon,
  rightIcon,
  children,
  onPress,
}: ButtonProps) {
  const v = variantStyles[variant]
  const s = sizeStyles[size]
  const isDisabled = disabled || isLoading

  return (
    <Stack
      onPress={isDisabled ? undefined : onPress}
      backgroundColor={v.bg}
      borderColor={v.borderColor}
      borderWidth={v.borderWidth}
      height={s.height}
      paddingHorizontal={s.paddingHorizontal}
      borderRadius={14}
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
      gap={8}
      opacity={isDisabled ? 0.5 : 1}
      width={fullWidth ? '100%' : undefined}
      pressStyle={{ backgroundColor: v.pressedBg, scale: 0.98 }}
      animation="fast"
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={v.color} />
      ) : (
        <>
          {leftIcon}
          <Text color={v.color} fontSize={s.fontSize} fontWeight="600">
            {children}
          </Text>
          {rightIcon}
        </>
      )}
    </Stack>
  )
}
