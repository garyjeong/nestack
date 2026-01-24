import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { familyApi } from '../api/familyApi'
import type { UpdateShareSettingsRequest } from '../types'
import { showToast } from '@/shared/components/feedback/Toast'

export const SHARE_SETTINGS_QUERY_KEY = ['family', 'share-settings']

export function useShareSettings() {
  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: SHARE_SETTINGS_QUERY_KEY,
    queryFn: familyApi.getShareSettings,
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateShareSettingsRequest) => familyApi.updateShareSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHARE_SETTINGS_QUERY_KEY })
      showToast.success('공유 설정이 변경되었습니다.')
    },
    onError: (error: Error & { response?: { data?: { error?: { message?: string } } } }) => {
      showToast.error(error.response?.data?.error?.message || '공유 설정 변경에 실패했습니다.')
    },
  })

  return {
    accounts: data?.accounts ?? [],
    familyGroup: data?.familyGroup ?? null,
    isLoading,
    error,
    refetch,
    updateSettings: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  }
}
