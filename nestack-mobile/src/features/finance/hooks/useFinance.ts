import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { financeApi } from '../api/financeApi'
import type {
  TransactionFilters,
  UpdateAccountRequest,
  SyncAccountRequest,
  ConnectOpenBankingRequest,
  LinkTransactionsRequest,
} from '../types'
import Toast from 'react-native-toast-message'

export const FINANCE_QUERY_KEY = ['finance']
const ACCOUNTS_KEY = [...FINANCE_QUERY_KEY, 'accounts']
const TRANSACTIONS_KEY = [...FINANCE_QUERY_KEY, 'transactions']
const SUMMARY_KEY = [...FINANCE_QUERY_KEY, 'summary']
const OPENBANKING_KEY = [...FINANCE_QUERY_KEY, 'openbanking']

// ---------------------------------------------------------------------------
// Query hooks
// ---------------------------------------------------------------------------

export function useAccounts() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ACCOUNTS_KEY,
    queryFn: async () => {
      const response = await financeApi.getAccounts()
      return response.data
    },
    staleTime: 30_000,
  })

  return {
    accounts: data?.accounts ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    refetch,
  }
}

export function useAccount(id: string) {
  return useQuery({
    queryKey: [...ACCOUNTS_KEY, id],
    queryFn: async () => {
      const response = await financeApi.getAccount(id)
      return response.data
    },
    enabled: !!id,
  })
}

export function useTransactions(filters?: TransactionFilters) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...TRANSACTIONS_KEY, filters],
    queryFn: async () => {
      const response = await financeApi.getTransactions(filters)
      return response.data
    },
    staleTime: 30_000,
  })

  return {
    transactions: data?.transactions ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    refetch,
  }
}

export function useAccountTransactions(
  accountId: string,
  filters?: TransactionFilters,
) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...TRANSACTIONS_KEY, accountId, filters],
    queryFn: async () => {
      const response = await financeApi.getAccountTransactions(
        accountId,
        filters,
      )
      return response.data
    },
    enabled: !!accountId,
    staleTime: 30_000,
  })

  return {
    transactions: data?.transactions ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    refetch,
  }
}

export function useFinanceSummary() {
  return useQuery({
    queryKey: SUMMARY_KEY,
    queryFn: async () => {
      const response = await financeApi.getFinanceSummary()
      return response.data
    },
    staleTime: 60_000,
  })
}

// ---------------------------------------------------------------------------
// Open Banking hooks
// ---------------------------------------------------------------------------

export function useOpenBankingConnection() {
  const queryClient = useQueryClient()

  const authQuery = useQuery({
    queryKey: [...OPENBANKING_KEY, 'auth'],
    queryFn: async () => {
      const response = await financeApi.getOpenBankingAuth()
      return response.data
    },
    enabled: false, // called manually
  })

  const connectMutation = useMutation({
    mutationFn: async (data: ConnectOpenBankingRequest) => {
      const response = await financeApi.connectOpenBanking(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY })
      queryClient.invalidateQueries({ queryKey: SUMMARY_KEY })
      Toast.show({ type: 'success', text1: '\uC624\uD508\uBC45\uD0B9 \uC5F0\uACB0 \uC644\uB8CC' })
    },
    onError: (error: any) => {
      const message =
        error?.body?.error?.message ?? '\uC624\uD508\uBC45\uD0B9 \uC5F0\uACB0\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4'
      Toast.show({ type: 'error', text1: '\uC5F0\uACB0 \uC2E4\uD328', text2: message })
    },
  })

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      await financeApi.disconnectOpenBanking()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY })
      queryClient.invalidateQueries({ queryKey: SUMMARY_KEY })
      Toast.show({ type: 'success', text1: '\uC624\uD508\uBC45\uD0B9 \uC5F0\uACB0 \uD574\uC81C' })
    },
  })

  return {
    getAuthUrl: authQuery.refetch,
    authData: authQuery.data,
    connect: connectMutation.mutate,
    connectAsync: connectMutation.mutateAsync,
    disconnect: disconnectMutation.mutate,
    isConnecting: connectMutation.isPending,
    isDisconnecting: disconnectMutation.isPending,
  }
}

// ---------------------------------------------------------------------------
// Account mutation hooks
// ---------------------------------------------------------------------------

export function useAccountMutations() {
  const queryClient = useQueryClient()

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: UpdateAccountRequest
    }) => {
      const response = await financeApi.updateAccount(id, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY })
      Toast.show({ type: 'success', text1: '\uACC4\uC88C \uC815\uBCF4 \uC218\uC815 \uC644\uB8CC' })
    },
    onError: (error: any) => {
      const message =
        error?.body?.error?.message ?? '\uACC4\uC88C \uC815\uBCF4 \uC218\uC815\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4'
      Toast.show({ type: 'error', text1: '\uC218\uC815 \uC2E4\uD328', text2: message })
    },
  })

  const syncMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data?: SyncAccountRequest
    }) => {
      const response = await financeApi.syncAccount(id, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY })
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEY })
      queryClient.invalidateQueries({ queryKey: SUMMARY_KEY })
      Toast.show({ type: 'success', text1: '\uACC4\uC88C \uB3D9\uAE30\uD654 \uC644\uB8CC' })
    },
    onError: (error: any) => {
      const message =
        error?.body?.error?.message ?? '\uACC4\uC88C \uB3D9\uAE30\uD654\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4'
      Toast.show({ type: 'error', text1: '\uB3D9\uAE30\uD654 \uC2E4\uD328', text2: message })
    },
  })

  return {
    updateAccount: updateMutation.mutate,
    updateAccountAsync: updateMutation.mutateAsync,
    syncAccount: syncMutation.mutate,
    syncAccountAsync: syncMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    isSyncing: syncMutation.isPending,
  }
}

export function useSyncAllAccounts() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await financeApi.syncAllAccounts()
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY })
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEY })
      queryClient.invalidateQueries({ queryKey: SUMMARY_KEY })
      Toast.show({
        type: 'success',
        text1: '\uC804\uCCB4 \uB3D9\uAE30\uD654 \uC644\uB8CC',
        text2: `${data.synced}\uAC1C \uACC4\uC88C\uAC00 \uB3D9\uAE30\uD654\uB418\uC5C8\uC2B5\uB2C8\uB2E4`,
      })
    },
    onError: (error: any) => {
      const message =
        error?.body?.error?.message ?? '\uACC4\uC88C \uB3D9\uAE30\uD654\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4'
      Toast.show({ type: 'error', text1: '\uB3D9\uAE30\uD654 \uC2E4\uD328', text2: message })
    },
  })
}

// ---------------------------------------------------------------------------
// Transaction linking hooks
// ---------------------------------------------------------------------------

export function useLinkTransactions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: LinkTransactionsRequest) => {
      await financeApi.linkTransactions(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEY })
      Toast.show({ type: 'success', text1: '\uAC70\uB798 \uC5F0\uACB0 \uC644\uB8CC' })
    },
    onError: (error: any) => {
      const message =
        error?.body?.error?.message ?? '\uAC70\uB798 \uC5F0\uACB0\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4'
      Toast.show({ type: 'error', text1: '\uC5F0\uACB0 \uC2E4\uD328', text2: message })
    },
  })
}

export function useUnlinkTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (transactionId: string) => {
      await financeApi.unlinkTransaction(transactionId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEY })
      Toast.show({ type: 'success', text1: '\uAC70\uB798 \uC5F0\uACB0 \uD574\uC81C' })
    },
    onError: (error: any) => {
      const message =
        error?.body?.error?.message ?? '\uAC70\uB798 \uC5F0\uACB0 \uD574\uC81C\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4'
      Toast.show({ type: 'error', text1: '\uD574\uC81C \uC2E4\uD328', text2: message })
    },
  })
}
