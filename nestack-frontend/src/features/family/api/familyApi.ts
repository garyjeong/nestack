import { apiClient } from '@/api/client'
import type {
  ShareSettingsResponse,
  UpdateShareSettingsRequest,
  CreateFamilyRequest,
  CreateFamilyResponse,
  JoinFamilyRequest,
  JoinFamilyResponse,
  InviteCodeResponse,
  ValidateInviteCodeResponse,
  LeaveFamilyRequest,
} from '../types'

export const familyApi = {
  // Get family info with share settings
  getFamily: async (): Promise<ShareSettingsResponse> => {
    const response = await apiClient.get('/family')
    return response.data.data
  },

  // Create a new family group
  createFamily: async (data: CreateFamilyRequest): Promise<CreateFamilyResponse> => {
    const response = await apiClient.post('/family', data)
    return response.data.data
  },

  // Join a family group with invite code
  joinFamily: async (data: JoinFamilyRequest): Promise<JoinFamilyResponse> => {
    const response = await apiClient.post('/family/join', data)
    return response.data.data
  },

  // Leave family group
  leaveFamily: async (data: LeaveFamilyRequest): Promise<{ message: string }> => {
    const response = await apiClient.delete('/family/leave', { data })
    return response.data.data
  },

  // Get current invite code
  getInviteCode: async (): Promise<InviteCodeResponse> => {
    const response = await apiClient.get('/family/invite-code')
    return response.data.data
  },

  // Regenerate invite code
  regenerateInviteCode: async (): Promise<InviteCodeResponse> => {
    const response = await apiClient.post('/family/invite-code/regenerate')
    return response.data.data
  },

  // Validate invite code before joining
  validateInviteCode: async (code: string): Promise<ValidateInviteCodeResponse> => {
    const response = await apiClient.get(`/family/invite-code/validate/${code}`)
    return response.data.data
  },

  // Get share settings
  getShareSettings: async (): Promise<ShareSettingsResponse> => {
    const response = await apiClient.get('/family/share-settings')
    return response.data.data
  },

  // Update share settings
  updateShareSettings: async (data: UpdateShareSettingsRequest): Promise<ShareSettingsResponse> => {
    const response = await apiClient.patch('/family/share-settings', data)
    return response.data.data
  },
}
