import { apiClient } from '../../../api/client'
import { API_ENDPOINTS } from '../../../api/endpoints'
import type {
  FamilyGroup,
  CreateFamilyRequest,
  CreateFamilyResponse,
  JoinFamilyRequest,
  JoinFamilyResponse,
  FamilyInfoResponse,
  InviteCodeResponse,
  ValidateInviteCodeResponse,
  ShareSettingsResponse,
  UpdateShareSettingsRequest,
  LeaveFamilyRequest,
} from '../types'

export const familyApi = {
  getFamily: () =>
    apiClient.get<FamilyInfoResponse>(API_ENDPOINTS.FAMILY.BASE),

  createFamily: (data?: CreateFamilyRequest) =>
    apiClient.post<CreateFamilyResponse>(API_ENDPOINTS.FAMILY.BASE, data),

  joinFamily: (data: JoinFamilyRequest) =>
    apiClient.post<JoinFamilyResponse>(API_ENDPOINTS.FAMILY.JOIN, data),

  leaveFamily: (data: LeaveFamilyRequest) =>
    apiClient.post(API_ENDPOINTS.FAMILY.LEAVE, data),

  getInviteCode: () =>
    apiClient.get<InviteCodeResponse>(API_ENDPOINTS.FAMILY.INVITE_CODE),

  regenerateInviteCode: () =>
    apiClient.post<InviteCodeResponse>(API_ENDPOINTS.FAMILY.REGENERATE_CODE),

  validateInviteCode: (code: string) =>
    apiClient.get<ValidateInviteCodeResponse>(
      `${API_ENDPOINTS.FAMILY.INVITE_CODE}/validate`,
      { params: { code } },
    ),

  getShareSettings: () =>
    apiClient.get<ShareSettingsResponse>(
      `${API_ENDPOINTS.FAMILY.BASE}/share-settings`,
    ),

  updateShareSettings: (data: UpdateShareSettingsRequest) =>
    apiClient.patch<ShareSettingsResponse>(
      `${API_ENDPOINTS.FAMILY.BASE}/share-settings`,
      data,
    ),
}
