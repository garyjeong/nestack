import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { missionApi } from '../api/missionApi'
import { MISSIONS_QUERY_KEY } from './useMissions'
import { showToast } from '@/shared/components/feedback'
import type {
  CreateMissionRequest,
  UpdateMissionRequest,
  UpdateMissionStatusRequest,
  MissionStatus,
} from '../types'

export function useCreateMission() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: CreateMissionRequest) => missionApi.createMission(data),
    onSuccess: (mission) => {
      queryClient.invalidateQueries({ queryKey: MISSIONS_QUERY_KEY })
      showToast.success('미션 생성 완료', `"${mission.name}" 미션이 생성되었습니다`)
      navigate(`/missions/${mission.id}`)
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || '미션 생성에 실패했습니다'
      showToast.error('오류', message)
    },
  })

  return {
    createMission: mutation.mutate,
    createMissionAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  }
}

export function useUpdateMission(id: string) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: UpdateMissionRequest) => missionApi.updateMission(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MISSIONS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['missions', id] })
      showToast.success('미션 수정 완료', '미션이 수정되었습니다')
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || '미션 수정에 실패했습니다'
      showToast.error('오류', message)
    },
  })

  return {
    updateMission: mutation.mutate,
    updateMissionAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  }
}

export function useDeleteMission() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (id: string) => missionApi.deleteMission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MISSIONS_QUERY_KEY })
      showToast.success('미션 삭제 완료', '미션이 삭제되었습니다')
      navigate('/missions')
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || '미션 삭제에 실패했습니다'
      showToast.error('오류', message)
    },
  })

  return {
    deleteMission: mutation.mutate,
    deleteMissionAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  }
}

export function useUpdateMissionStatus(id: string) {
  const queryClient = useQueryClient()

  const getStatusMessage = (status: MissionStatus) => {
    switch (status) {
      case 'in_progress':
        return '미션을 시작했습니다'
      case 'completed':
        return '미션을 완료했습니다!'
      case 'failed':
        return '미션이 실패로 표시되었습니다'
      case 'cancelled':
        return '미션이 취소되었습니다'
      default:
        return '미션 상태가 변경되었습니다'
    }
  }

  const mutation = useMutation({
    mutationFn: (data: UpdateMissionStatusRequest) => missionApi.updateMissionStatus(id, data),
    onSuccess: (mission) => {
      queryClient.invalidateQueries({ queryKey: MISSIONS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['missions', id] })

      if (mission.status === 'completed') {
        showToast.success('축하합니다!', getStatusMessage(mission.status))
      } else {
        showToast.info('상태 변경', getStatusMessage(mission.status))
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || '상태 변경에 실패했습니다'
      showToast.error('오류', message)
    },
  })

  return {
    updateStatus: mutation.mutate,
    updateStatusAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  }
}
