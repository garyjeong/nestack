import { useQuery } from '@tanstack/react-query'
import { financeApi } from '../api/financeApi'
import type { TransactionFilters } from '../types'

export const TRANSACTIONS_QUERY_KEY = ['finance', 'transactions']

export function useTransactions(filters?: TransactionFilters) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [TRANSACTIONS_QUERY_KEY, filters],
    queryFn: () => financeApi.getTransactions(filters),
    staleTime: 30_000,
  })

  return {
    transactions: data?.transactions ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    limit: data?.limit ?? 20,
    isLoading,
    error,
    refetch,
  }
}

export function useAccountTransactions(accountId: string, filters?: Omit<TransactionFilters, 'accountId'>) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [TRANSACTIONS_QUERY_KEY, accountId, filters],
    queryFn: () => financeApi.getAccountTransactions(accountId, filters),
    enabled: !!accountId,
    staleTime: 30_000,
  })

  return {
    transactions: data?.transactions ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    limit: data?.limit ?? 20,
    isLoading,
    error,
    refetch,
  }
}
