import type { User } from '@/features/auth/types'

// Family Group types
export interface FamilyGroup {
  id: string
  name: string
  createdBy: string
  status: 'active' | 'inactive'
  members: FamilyMember[]
  createdAt: string
  updatedAt: string
}

export interface FamilyMember {
  id: string
  userId: string
  familyGroupId: string
  role: 'owner' | 'member'
  joinedAt: string
  user: Pick<User, 'id' | 'name' | 'email' | 'profileImage'>
}

// Invite Code types
export interface InviteCode {
  id: string
  code: string
  familyGroupId: string
  createdBy: string
  expiresAt: string
  status: 'active' | 'used' | 'expired'
  createdAt: string
}

// API Request/Response types
export interface CreateFamilyRequest {
  name?: string
}

export interface JoinFamilyRequest {
  inviteCode: string
}

export interface CreateFamilyResponse {
  familyGroup: FamilyGroup
  inviteCode: InviteCode
}

export interface JoinFamilyResponse {
  familyGroup: FamilyGroup
  message: string
}

export interface InviteCodeResponse {
  inviteCode: InviteCode
}

export interface FamilyInfoResponse {
  familyGroup: FamilyGroup
  inviteCode: InviteCode | null
}

// Share settings
export type ShareStatus = 'full' | 'balance_only' | 'private'

export interface UpdateShareSettingsRequest {
  shareStatus: ShareStatus
}
