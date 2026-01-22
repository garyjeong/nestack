import { useQuery } from '@tanstack/react-query'
import { missionApi } from '../api/missionApi'
import type { MissionFilters } from '../types'

export const MISSIONS_QUERY_KEY = ['missions']

export function useMissions(filters?: MissionFilters) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [...MISSIONS_QUERY_KEY, filters],
    queryFn: () => missionApi.getMissions(filters),
    staleTime: 30 * 1000, // 30 seconds
  })

  return {
    missions: data?.missions ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    limit: data?.limit ?? 20,
    isLoading,
    error,
    refetch,
  }
}
