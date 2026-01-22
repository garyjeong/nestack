import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/app/store'
import { familyApi } from '../api/familyApi'
import { FAMILY_QUERY_KEY } from './useFamily'
import { AUTH_QUERY_KEY } from '@/features/auth/hooks'
import { showToast } from '@/shared/components/feedback'
import type { CreateFamilyRequest } from '../types'

export function useCreateFamily() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { setUser, user } = useAppStore()

  const createFamilyMutation = useMutation({
    mutationFn: (data?: CreateFamilyRequest) => familyApi.createFamily(data),
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

      showToast.success('가족 그룹 생성 완료', '초대 코드를 파트너에게 공유해주세요!')
      navigate('/onboarding/invite')
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || '가족 그룹 생성에 실패했습니다'
      showToast.error('오류', message)
    },
  })

  return {
    createFamily: createFamilyMutation.mutate,
    createFamilyAsync: createFamilyMutation.mutateAsync,
    isLoading: createFamilyMutation.isPending,
    error: createFamilyMutation.error,
  }
}
