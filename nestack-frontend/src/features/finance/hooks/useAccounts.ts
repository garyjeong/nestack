import { useQuery } from '@tanstack/react-query'
import { financeApi } from '../api/financeApi'

export const ACCOUNTS_QUERY_KEY = ['finance', 'accounts']

export function useAccounts() {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ACCOUNTS_QUERY_KEY,
    queryFn: financeApi.getAccounts,
    staleTime: 30_000, // 30 seconds
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
  const {
    data: account,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [...ACCOUNTS_QUERY_KEY, id],
    queryFn: () => financeApi.getAccount(id),
    enabled: !!id,
    staleTime: 30_000,
  })

  return {
    account,
    isLoading,
    error,
    refetch,
  }
}
