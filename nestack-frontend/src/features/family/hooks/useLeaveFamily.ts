import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { showToast } from '@/shared/components/feedback/Toast';

export const useLeaveFamily = () => {
  const queryClient = useQueryClient();

  const leaveMutation = useMutation({
    mutationFn: async (data: { password: string; keepMissions: 'keep' | 'delete' }) => {
      const response = await apiClient.delete('/family/leave', { data });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['family', 'info']);
      showToast.success('가족 그룹에서 탈퇴하였습니다.');
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.error?.message || '탈퇴에 실패했습니다.');
    },
  });

  return {
    leaveFamily: leaveMutation.mutate,
    isLoading: leaveMutation.isPending,
  };
};
