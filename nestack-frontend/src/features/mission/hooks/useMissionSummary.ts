import { useQuery } from '@tanstack/react-query'
import { missionApi } from '../api/missionApi'

export const MISSION_SUMMARY_QUERY_KEY = ['missions', 'summary']

export function useMissionSummary() {
  const {
    data: summary,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: MISSION_SUMMARY_QUERY_KEY,
    queryFn: missionApi.getSummary,
    staleTime: 60 * 1000, // 1 minute
  })

  return {
    summary,
    isLoading,
    error,
    refetch,
  }
}
