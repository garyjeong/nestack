import { useMutation, useQueryClient } from '@tanstack/react-query'
import { familyApi } from '../api/familyApi'
import { showToast } from '@/shared/components/feedback/Toast'
import { FAMILY_QUERY_KEY } from './useFamily'
import type { LeaveFamilyRequest } from '../types'

export function useLeaveFamily() {
  const queryClient = useQueryClient()

  const leaveMutation = useMutation({
    mutationFn: (data: LeaveFamilyRequest) => familyApi.leaveFamily(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAMILY_QUERY_KEY })
      showToast.success('가족 그룹에서 탈퇴하였습니다.')
    },
    onError: (error: Error & { response?: { data?: { error?: { message?: string } } } }) => {
      showToast.error(error.response?.data?.error?.message || '탈퇴에 실패했습니다.')
    },
  })

  return {
    leaveFamily: leaveMutation.mutate,
    leaveFamilyAsync: leaveMutation.mutateAsync,
    isLoading: leaveMutation.isPending,
  }
}
