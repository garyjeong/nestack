import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '../api/authApi'
import { useAuthStore } from '../../../store/authStore'

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((state) => state.setUser)

  return useMutation({
    mutationFn: async (data: { name?: string }) => {
      const response = await authApi.updateProfile(data)
      return response.data
    },
    onSuccess: (updatedUser) => {
      setUser(updatedUser as any)
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
    },
  })
}
