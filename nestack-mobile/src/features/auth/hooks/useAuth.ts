import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../../../store/authStore'
import { authApi } from '../api/authApi'

const AUTH_QUERY_KEY = ['auth', 'me']

export function useAuth() {
  const { accessToken, user, isAuthenticated, setUser, setLoading, logout } =
    useAuthStore()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      const response = await authApi.getMe()
      return response.data
    },
    enabled: !!accessToken,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (data) {
      setUser(data as any)
    }
  }, [data, setUser])

  useEffect(() => {
    setLoading(isLoading)
  }, [isLoading, setLoading])

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch {
      // ignore logout api errors
    } finally {
      logout()
      queryClient.clear()
    }
  }

  const refreshUser = () => {
    queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY })
  }

  return {
    user: user ?? (data as any) ?? null,
    isAuthenticated,
    isLoading,
    logout: handleLogout,
    refreshUser,
  }
}
