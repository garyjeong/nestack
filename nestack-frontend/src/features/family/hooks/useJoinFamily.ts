import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/app/store'
import { familyApi } from '../api/familyApi'
import { FAMILY_QUERY_KEY } from './useFamily'
import { AUTH_QUERY_KEY } from '@/features/auth/hooks'
import { showToast } from '@/shared/components/feedback'

export function useJoinFamily() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { setUser, user } = useAppStore()

  const joinFamilyMutation = useMutation({
    mutationFn: (inviteCode: string) => familyApi.joinFamily({ inviteCode }),
    onSuccess: (response) => {
      // Update user with family group ID
      if (user) {
        setUser({
          ...user,
          familyGroupId: response.familyGroup.id,
        })
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: FAMILY_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY })

      showToast.success('가족 연결 완료', '파트너와 연결되었습니다!')
      navigate('/')
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || '유효하지 않은 초대 코드입니다'
      showToast.error('연결 실패', message)
    },
  })

  return {
    joinFamily: joinFamilyMutation.mutate,
    joinFamilyAsync: joinFamilyMutation.mutateAsync,
    isLoading: joinFamilyMutation.isPending,
    error: joinFamilyMutation.error,
  }
}
