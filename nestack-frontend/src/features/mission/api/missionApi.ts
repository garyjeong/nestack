import { apiClient } from '@/api/client'
import type {
  Mission,
  MissionTemplate,
  LifeCycleCategory,
  MissionFilters,
  MissionsResponse,
  MissionSummary,
  CreateMissionRequest,
  UpdateMissionRequest,
  UpdateMissionStatusRequest,
  LinkTransactionRequest,
} from '../types'

export const missionApi = {
  // Get all missions with filters
  getMissions: async (filters?: MissionFilters): Promise<MissionsResponse> => {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.type) params.append('type', filters.type)
    if (filters?.categoryId) params.append('categoryId', filters.categoryId)
    if (filters?.parentMissionId) params.append('parentMissionId', filters.parentMissionId)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const response = await apiClient.get(`/missions?${params.toString()}`)
    return response.data.data
  },

  // Get single mission by ID
  getMission: async (id: string): Promise<Mission> => {
    const response = await apiClient.get(`/missions/${id}`)
    return response.data.data
  },

  // Create new mission
  createMission: async (data: CreateMissionRequest): Promise<Mission> => {
    const response = await apiClient.post('/missions', data)
    return response.data.data
  },

  // Update mission
  updateMission: async (id: string, data: UpdateMissionRequest): Promise<Mission> => {
    const response = await apiClient.patch(`/missions/${id}`, data)
    return response.data.data
  },

  // Delete mission
  deleteMission: async (id: string): Promise<void> => {
    await apiClient.delete(`/missions/${id}`)
  },

  // Update mission status
  updateMissionStatus: async (id: string, data: UpdateMissionStatusRequest): Promise<Mission> => {
    const response = await apiClient.post(`/missions/${id}/status`, data)
    return response.data.data
  },

  // Link transactions to mission
  linkTransactions: async (id: string, data: LinkTransactionRequest): Promise<Mission> => {
    const response = await apiClient.post(`/missions/${id}/transactions`, data)
    return response.data.data
  },

  // Get mission summary (dashboard)
  getSummary: async (): Promise<MissionSummary> => {
    const response = await apiClient.get('/missions/summary')
    return response.data.data
  },

  // Get mission templates
  getTemplates: async (categoryId?: string): Promise<MissionTemplate[]> => {
    const url = categoryId
      ? `/missions/templates?categoryId=${categoryId}`
      : '/missions/templates'
    const response = await apiClient.get(url)
    return response.data.data
  },

  // Get life cycle categories
  getCategories: async (): Promise<LifeCycleCategory[]> => {
    const response = await apiClient.get('/missions/categories')
    return response.data.data
  },
}
