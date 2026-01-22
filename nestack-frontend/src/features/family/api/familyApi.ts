import { apiClient } from '@/api/client';
import type { ShareSettingsResponse, UpdateShareSettingsRequest } from '../types';

export const familyApi = {
  getFamily: async (): Promise<ShareSettingsResponse> => {
    const response = await apiClient.get('/family');
    return response.data.data;
  },

  updateShareSettings: async (data: UpdateShareSettingsRequest): Promise<ShareSettingsResponse> => {
    const response = await apiClient.patch('/family/share-settings', data);
    return response.data.data;
  },
};
