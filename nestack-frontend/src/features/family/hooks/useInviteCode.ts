import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { familyApi } from '../api/familyApi'
import { showToast } from '@/shared/components/feedback'

export const INVITE_CODE_QUERY_KEY = ['family', 'invite-code']

export function useInviteCode() {
  const queryClient = useQueryClient()

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: INVITE_CODE_QUERY_KEY,
    queryFn: familyApi.getInviteCode,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  const regenerateMutation = useMutation({
    mutationFn: familyApi.regenerateInviteCode,
    onSuccess: (response) => {
      queryClient.setQueryData(INVITE_CODE_QUERY_KEY, response)
      showToast.success('코드 재발급 완료', '새로운 초대 코드가 생성되었습니다')
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || '코드 재발급에 실패했습니다'
      showToast.error('오류', message)
    },
  })

  const copyToClipboard = async () => {
    if (!data?.inviteCode?.code) return

    try {
      await navigator.clipboard.writeText(data.inviteCode.code)
      showToast.success('복사 완료', '초대 코드가 클립보드에 복사되었습니다')
    } catch {
      showToast.error('복사 실패', '클립보드 복사에 실패했습니다')
    }
  }

  return {
    inviteCode: data?.inviteCode ?? null,
    isLoading,
    error,
    regenerate: regenerateMutation.mutate,
    isRegenerating: regenerateMutation.isPending,
    copyToClipboard,
  }
}
