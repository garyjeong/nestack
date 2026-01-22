import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/app/store'
import { authApi } from '../api/authApi'
import type { User } from '../types'

export const AUTH_QUERY_KEY = ['auth', 'me']

export function useAuth() {
  const queryClient = useQueryClient()
  const {
    accessToken,
    user,
    isAuthenticated,
    isLoading: storeLoading,
    setUser,
    setLoading,
    logout: storeLogout,
  } = useAppStore()

  // Fetch user data when we have a token
  const {
    data: userData,
    isLoading: queryLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: authApi.getMe,
    enabled: !!accessToken,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Sync user data to store
  useEffect(() => {
    if (userData) {
      setUser(userData)
    }
  }, [userData, setUser])

  // Handle auth error (token invalid)
  useEffect(() => {
    if (error) {
      storeLogout()
    }
  }, [error, storeLogout])

  // Set loading state
  useEffect(() => {
    if (!accessToken) {
      setLoading(false)
    } else {
      setLoading(queryLoading)
    }
  }, [accessToken, queryLoading, setLoading])

  const logout = async (logoutAll = false) => {
    try {
      await authApi.logout(logoutAll)
    } catch {
      // Ignore logout errors
    } finally {
      storeLogout()
      queryClient.clear()
    }
  }

  const refreshUser = async () => {
    await refetch()
  }

  return {
    user: user as User | null,
    isAuthenticated,
    isLoading: storeLoading || queryLoading,
    logout,
    refreshUser,
  }
}
