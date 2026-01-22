import { useQuery } from '@tanstack/react-query'
import { financeApi } from '../api/financeApi'

export const FINANCE_SUMMARY_QUERY_KEY = ['finance', 'summary']

export function useFinanceSummary() {
  const {
    data: summary,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: FINANCE_SUMMARY_QUERY_KEY,
    queryFn: financeApi.getSummary,
    staleTime: 60_000, // 1 minute
  })

  return {
    summary,
    isLoading,
    error,
    refetch,
  }
}
