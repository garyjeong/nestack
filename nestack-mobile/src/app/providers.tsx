import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TamaguiProvider } from 'tamagui'
import config from '../shared/theme/tamagui.config'
import Toast from 'react-native-toast-message'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 300_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={config}>
        {children}
        <Toast />
      </TamaguiProvider>
    </QueryClientProvider>
  )
}
