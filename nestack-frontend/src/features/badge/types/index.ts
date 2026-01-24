// Badge types

export type BadgeCategory = 'mission' | 'finance' | 'family' | 'streak' | 'special'

export interface Badge {
  id: string
  code: string
  name: string
  description: string
  icon: string
  category: BadgeCategory
  requirement: string
  createdAt: string
}

export interface UserBadge {
  id: string
  userId: string
  badgeId: string
  earnedAt: string
  badge: Badge
}

export interface BadgesResponse {
  earnedBadges: UserBadge[]
  availableBadges: Badge[]
  totalEarned: number
  totalAvailable: number
}

export interface BadgeDetailResponse {
  badge: Badge
  earned: boolean
  earnedAt: string | null
  progress: number // 0-100 percentage
  currentValue: number
  targetValue: number
}
