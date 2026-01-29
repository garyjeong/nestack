import { useMutation, useQueryClient } from '@tanstack/react-query'
import { missionApi } from '../api/missionApi'
import { MISSIONS_QUERY_KEY } from './useMissions'
import type {
  CreateMissionRequest,
  UpdateMissionRequest,
  UpdateMissionStatusRequest,
  LinkTransactionRequest,
} from '../types'
import Toast from 'react-native-toast-message'

export function useCreateMission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateMissionRequest) => {
      const response = await missionApi.createMission(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MISSIONS_QUERY_KEY })
      Toast.show({ type: 'success', text1: '\uBBF8\uC158 \uC0DD\uC131 \uC644\uB8CC' })
    },
    onError: (error: any) => {
      const message =
        error?.body?.error?.message ?? '\uBBF8\uC158 \uC0DD\uC131\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4'
      Toast.show({ type: 'error', text1: '\uBBF8\uC158 \uC0DD\uC131 \uC2E4\uD328', text2: message })
    },
  })
}

export function useUpdateMission(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateMissionRequest) => {
      const response = await missionApi.updateMission(id, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MISSIONS_QUERY_KEY })
      Toast.show({ type: 'success', text1: '\uBBF8\uC158 \uC218\uC815 \uC644\uB8CC' })
    },
    onError: (error: any) => {
      const message =
        error?.body?.error?.message ?? '\uBBF8\uC158 \uC218\uC815\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4'
      Toast.show({ type: 'error', text1: '\uBBF8\uC158 \uC218\uC815 \uC2E4\uD328', text2: message })
    },
  })
}

export function useDeleteMission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await missionApi.deleteMission(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MISSIONS_QUERY_KEY })
      Toast.show({ type: 'success', text1: '\uBBF8\uC158\uC774 \uC0AD\uC81C\uB418\uC5C8\uC2B5\uB2C8\uB2E4' })
    },
    onError: (error: any) => {
      const message =
        error?.body?.error?.message ?? '\uBBF8\uC158 \uC0AD\uC81C\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4'
      Toast.show({ type: 'error', text1: '\uBBF8\uC158 \uC0AD\uC81C \uC2E4\uD328', text2: message })
    },
  })
}

export function useUpdateMissionStatus(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateMissionStatusRequest) => {
      await missionApi.updateStatus(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MISSIONS_QUERY_KEY })
    },
    onError: (error: any) => {
      const message =
        error?.body?.error?.message ?? '\uC0C1\uD0DC \uBCC0\uACBD\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4'
      Toast.show({ type: 'error', text1: '\uC0C1\uD0DC \uBCC0\uACBD \uC2E4\uD328', text2: message })
    },
  })
}

export function useLinkTransactions(missionId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: LinkTransactionRequest) => {
      await missionApi.linkTransactions(missionId, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MISSIONS_QUERY_KEY })
      Toast.show({ type: 'success', text1: '\uAC70\uB798 \uC5F0\uACB0 \uC644\uB8CC' })
    },
    onError: (error: any) => {
      const message =
        error?.body?.error?.message ?? '\uAC70\uB798 \uC5F0\uACB0\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4'
      Toast.show({ type: 'error', text1: '\uAC70\uB798 \uC5F0\uACB0 \uC2E4\uD328', text2: message })
    },
  })
}
