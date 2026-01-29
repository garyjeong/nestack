// Mission status
export type MissionStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled'

// Mission type
export type MissionType = 'main' | 'monthly' | 'weekly' | 'daily'

// Life cycle category
export interface LifeCycleCategory {
  id: string
  name: string
  description: string
  icon: string
  order: number
}

// Mission template
export interface MissionTemplate {
  id: string
  categoryId: string
  name: string
  description: string
  defaultTargetAmount: number
  defaultDuration: number // in days
  type: MissionType
  icon: string
  isActive: boolean
  category?: LifeCycleCategory
}

// Mission
export interface Mission {
  id: string
  userId: string
  familyGroupId?: string
  templateId?: string
  categoryId: string
  parentMissionId?: string
  name: string
  description?: string
  type: MissionType
  targetAmount: number
  currentAmount: number
  status: MissionStatus
  startDate: string
  endDate: string
  completedAt?: string
  createdAt: string
  updatedAt: string
  // Relations
  category?: LifeCycleCategory
  template?: MissionTemplate
  parentMission?: Mission
  subMissions?: Mission[]
  sharedAccounts?: MissionSharedAccount[]
  // Computed
  progress: number
  daysRemaining: number
}

// Mission shared account
export interface MissionSharedAccount {
  id: string
  missionId: string
  bankAccountId: string
  createdAt: string
}

// API Request types
export interface CreateMissionRequest {
  templateId?: string
  categoryId: string
  parentMissionId?: string
  name: string
  description?: string
  type: MissionType
  targetAmount: number
  startDate: string
  endDate: string
  sharedAccountIds?: string[]
}

export interface UpdateMissionRequest {
  name?: string
  description?: string
  targetAmount?: number
  endDate?: string
}

export interface UpdateMissionStatusRequest {
  status: MissionStatus
}

export interface LinkTransactionRequest {
  transactionIds: string[]
}

// API Response types
export interface MissionsResponse {
  missions: Mission[]
  total: number
  page: number
  limit: number
}

export interface MissionFilters {
  status?: MissionStatus
  type?: MissionType
  categoryId?: string
  parentMissionId?: string
  page?: number
  limit?: number
}

// Dashboard summary
export interface MissionSummary {
  totalMissions: number
  activeMissions: number
  completedMissions: number
  totalSavedAmount: number
  monthlyTarget: number
  monthlyProgress: number
}
