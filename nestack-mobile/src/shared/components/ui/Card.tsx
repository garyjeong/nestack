import React from 'react'
import { Stack, type StackProps } from 'tamagui'

interface CardProps extends StackProps {
  children: React.ReactNode
  variant?: 'default' | 'outline' | 'elevated'
}

export function Card({ children, variant = 'default', ...props }: CardProps) {
  const styles = {
    default: {
      backgroundColor: '#ffffff',
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    outline: {
      backgroundColor: '#ffffff',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: '#e7e5e4',
    },
    elevated: {
      backgroundColor: '#ffffff',
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
    },
  }

  return (
    <Stack padding={20} {...styles[variant]} {...props}>
      {children}
    </Stack>
  )
}
