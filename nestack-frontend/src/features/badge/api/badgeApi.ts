import { apiClient } from '@/api/client'
import type { BadgesResponse, BadgeDetailResponse } from '../types'

export const badgeApi = {
  // Get all badges (earned and available)
  getBadges: async (): Promise<BadgesResponse> => {
    const response = await apiClient.get('/badges')
    return response.data.data
  },

  // Get badge detail with progress
  getBadgeDetail: async (badgeId: string): Promise<BadgeDetailResponse> => {
    const response = await apiClient.get(`/badges/${badgeId}`)
    return response.data.data
  },
}
