import { useMutation, useQueryClient } from '@tanstack/react-query';
import { familyApi } from '../api/familyApi';
import type { UpdateShareSettingsRequest } from '../types';
import { showToast } from '@/shared/components/feedback/Toast';
import { Card } from '@/shared/components/ui/Card';
import { Switch } from '@/shared/components/ui/Switch';

export const useShareSettings = () => {
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['family', 'share-settings'],
    queryFn: () => familyApi.getShareSettings(),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateShareSettingsRequest) => {
      await familyApi.updateShareSettings(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family', 'share-settings'] });
      showToast.success('공유 설정이 변경되었습니다.');
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.error?.message || '공유 설정 변경에 실패했습니다.');
    },
  });

  return { accounts, isLoading, updateSettings: updateMutation.mutate };
};
