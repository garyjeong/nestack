import { apiClient } from '../../../api/client'
import { API_ENDPOINTS } from '../../../api/endpoints'
import type { BadgesResponse, BadgeDetailResponse } from '../types'

export const badgeApi = {
  getBadges: () =>
    apiClient.get<BadgesResponse>(API_ENDPOINTS.BADGES.BASE),

  getBadgeDetail: (badgeId: string) =>
    apiClient.get<BadgeDetailResponse>(
      `${API_ENDPOINTS.BADGES.BASE}/${badgeId}`,
    ),
}
