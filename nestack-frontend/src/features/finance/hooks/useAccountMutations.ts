import { useMutation, useQueryClient } from '@tanstack/react-query'
import { financeApi } from '../api/financeApi'
import { ACCOUNTS_QUERY_KEY } from './useAccounts'
import { TRANSACTIONS_QUERY_KEY } from './useTransactions'
import { showToast } from '@/shared/components/feedback'
import type { UpdateAccountRequest, LinkTransactionsRequest } from '../types'

export function useUpdateAccount(id: string) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: UpdateAccountRequest) => financeApi.updateAccount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY })
      showToast.success('계좌 설정 완료', '계좌 설정이 저장되었습니다')
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || '계좌 설정에 실패했습니다'
      showToast.error('오류', message)
    },
  })

  return {
    updateAccount: mutation.mutate,
    updateAccountAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  }
}

export function useSyncAccount(id: string) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => financeApi.syncAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [TRANSACTIONS_QUERY_KEY, id] })
      showToast.success('동기화 완료', '계좌 정보가 업데이트되었습니다')
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || '계좌 동기화에 실패했습니다'
      showToast.error('오류', message)
    },
  })

  return {
    syncAccount: mutation.mutate,
    syncAccountAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  }
}

export function useSyncAllAccounts() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: financeApi.syncAllAccounts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY })
      showToast.success('전체 동기화 완료', '모든 계좌 정보가 업데이트되었습니다')
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || '계좌 동기화에 실패했습니다'
      showToast.error('오류', message)
    },
  })

  return {
    syncAllAccounts: mutation.mutate,
    syncAllAccountsAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  }
}

export function useLinkTransactions() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: LinkTransactionsRequest) => financeApi.linkTransactionsToMission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY })
      showToast.success('연결 완료', '거래 내역이 미션에 연결되었습니다')
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || '거래 연결에 실패했습니다'
      showToast.error('오류', message)
    },
  })

  return {
    linkTransactions: mutation.mutate,
    linkTransactionsAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  }
}

export function useUnlinkTransaction() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (transactionId: string) => financeApi.unlinkTransactionFromMission(transactionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY })
      showToast.success('연결 해제', '거래 연결이 해제되었습니다')
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || '거래 연결 해제에 실패했습니다'
      showToast.error('오류', message)
    },
  })

  return {
    unlinkTransaction: mutation.mutate,
    unlinkTransactionAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  }
}
