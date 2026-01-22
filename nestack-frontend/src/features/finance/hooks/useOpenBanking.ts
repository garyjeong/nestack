import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { financeApi } from '../api/financeApi'
import { ACCOUNTS_QUERY_KEY } from './useAccounts'
import { showToast } from '@/shared/components/feedback'

export const OPENBANKING_QUERY_KEY = ['finance', 'openbanking']

export function useOpenBankingConnection() {
  const {
    data: connection,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: OPENBANKING_QUERY_KEY,
    queryFn: financeApi.getOpenBankingConnection,
    staleTime: 60_000, // 1 minute
  })

  return {
    connection,
    isConnected: connection?.isConnected ?? false,
    isLoading,
    error,
    refetch,
  }
}

export function useOpenBankingAuth() {
  const mutation = useMutation({
    mutationFn: financeApi.getOpenBankingAuthUrl,
    onSuccess: (data) => {
      // Redirect to open banking authorization page
      window.location.href = data.url
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || '오픈뱅킹 연결을 시작할 수 없습니다'
      showToast.error('오류', message)
    },
  })

  return {
    startAuth: mutation.mutate,
    startAuthAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  }
}

export function useOpenBankingCallback() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ code, state }: { code: string; state: string }) =>
      financeApi.handleOpenBankingCallback(code, state),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OPENBANKING_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY })
      showToast.success('연결 완료', '오픈뱅킹이 연결되었습니다')
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || '오픈뱅킹 연결에 실패했습니다'
      showToast.error('오류', message)
    },
  })

  return {
    handleCallback: mutation.mutate,
    handleCallbackAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  }
}

export function useDisconnectOpenBanking() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: financeApi.disconnectOpenBanking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OPENBANKING_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY })
      showToast.success('연결 해제', '오픈뱅킹 연결이 해제되었습니다')
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || '오픈뱅킹 연결 해제에 실패했습니다'
      showToast.error('오류', message)
    },
  })

  return {
    disconnect: mutation.mutate,
    disconnectAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  }
}
