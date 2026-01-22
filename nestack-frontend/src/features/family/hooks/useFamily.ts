import { useQuery } from '@tanstack/react-query'
import { familyApi } from '../api/familyApi'

export const FAMILY_QUERY_KEY = ['family']

export function useFamily() {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: FAMILY_QUERY_KEY,
    queryFn: familyApi.getFamily,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    familyGroup: data?.familyGroup ?? null,
    inviteCode: data?.inviteCode ?? null,
    isLoading,
    error,
    refetch,
  }
}
