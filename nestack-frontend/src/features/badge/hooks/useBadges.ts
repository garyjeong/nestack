import { useQuery } from '@tanstack/react-query'
import { badgeApi } from '../api/badgeApi'
import type { BadgesResponse, BadgeDetailResponse } from '../types'

export const BADGES_QUERY_KEY = ['badges'] as const

export function useBadges() {
  return useQuery<BadgesResponse>({
    queryKey: BADGES_QUERY_KEY,
    queryFn: badgeApi.getBadges,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useBadgeDetail(badgeId: string) {
  return useQuery<BadgeDetailResponse>({
    queryKey: [...BADGES_QUERY_KEY, badgeId],
    queryFn: () => badgeApi.getBadgeDetail(badgeId),
    enabled: !!badgeId,
  })
}
