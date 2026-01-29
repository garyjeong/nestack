import { useQuery } from '@tanstack/react-query'
import { badgeApi } from '../api/badgeApi'

export const BADGES_QUERY_KEY = ['badges']

export function useBadges() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: BADGES_QUERY_KEY,
    queryFn: async () => {
      const response = await badgeApi.getBadges()
      return response.data
    },
    staleTime: 60_000,
  })

  return {
    earnedBadges: data?.earnedBadges ?? [],
    availableBadges: data?.availableBadges ?? [],
    totalEarned: data?.totalEarned ?? 0,
    totalAvailable: data?.totalAvailable ?? 0,
    isLoading,
    error,
    refetch,
  }
}

export function useBadgeDetail(badgeId: string) {
  return useQuery({
    queryKey: [...BADGES_QUERY_KEY, badgeId],
    queryFn: async () => {
      const response = await badgeApi.getBadgeDetail(badgeId)
      return response.data
    },
    enabled: !!badgeId,
  })
}
