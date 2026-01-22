import { useQuery } from '@tanstack/react-query'
import { missionApi } from '../api/missionApi'

export function useMission(id: string) {
  const {
    data: mission,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['missions', id],
    queryFn: () => missionApi.getMission(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  })

  return {
    mission,
    isLoading,
    error,
    refetch,
  }
}
