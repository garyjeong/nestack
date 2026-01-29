import { apiClient } from '../../../api/client'
import { API_ENDPOINTS } from '../../../api/endpoints'
import type {
  Mission,
  MissionsResponse,
  MissionFilters,
  MissionSummary,
  CreateMissionRequest,
  UpdateMissionRequest,
  UpdateMissionStatusRequest,
  LinkTransactionRequest,
  MissionTemplate,
  LifeCycleCategory,
} from '../types'

function buildParams(
  filters: object,
): Record<string, string | number | boolean | undefined> {
  const params: Record<string, string | number | boolean | undefined> = {}
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      params[key] = value as string | number | boolean
    }
  }
  return params
}

export const missionApi = {
  getMissions: (filters?: MissionFilters) =>
    apiClient.get<MissionsResponse>(API_ENDPOINTS.MISSIONS.BASE, {
      params: filters ? buildParams(filters) : undefined,
    }),

  getMission: (id: string) =>
    apiClient.get<Mission>(API_ENDPOINTS.MISSIONS.DETAIL(id)),

  getMissionSummary: () =>
    apiClient.get<MissionSummary>(`${API_ENDPOINTS.MISSIONS.BASE}/summary`),

  getTemplates: (categoryId?: string) =>
    apiClient.get<MissionTemplate[]>(API_ENDPOINTS.MISSIONS.TEMPLATES, {
      params: categoryId ? { categoryId } : undefined,
    }),

  getCategories: () =>
    apiClient.get<LifeCycleCategory[]>(API_ENDPOINTS.MISSIONS.CATEGORIES),

  createMission: (data: CreateMissionRequest) =>
    apiClient.post<Mission>(API_ENDPOINTS.MISSIONS.BASE, data),

  updateMission: (id: string, data: UpdateMissionRequest) =>
    apiClient.patch<Mission>(API_ENDPOINTS.MISSIONS.DETAIL(id), data),

  deleteMission: (id: string) =>
    apiClient.delete(API_ENDPOINTS.MISSIONS.DETAIL(id)),

  updateStatus: (id: string, data: UpdateMissionStatusRequest) =>
    apiClient.post(API_ENDPOINTS.MISSIONS.STATUS(id), data),

  getMissionTransactions: (id: string) =>
    apiClient.get<{ transactions: import('../../finance/types').Transaction[] }>(
      API_ENDPOINTS.MISSIONS.TRANSACTIONS(id),
    ),

  linkTransactions: (id: string, data: LinkTransactionRequest) =>
    apiClient.post(API_ENDPOINTS.MISSIONS.TRANSACTIONS(id), data),
}
