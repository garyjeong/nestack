import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { familyApi } from '../api/familyApi'
import type {
  CreateFamilyRequest,
  JoinFamilyRequest,
  LeaveFamilyRequest,
  UpdateShareSettingsRequest,
} from '../types'
import Toast from 'react-native-toast-message'

export const FAMILY_QUERY_KEY = ['family']

// ---------------------------------------------------------------------------
// Query hooks
// ---------------------------------------------------------------------------

export function useFamily() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: FAMILY_QUERY_KEY,
    queryFn: async () => {
      const response = await familyApi.getFamily()
      return response.data
    },
    staleTime: 60_000,
  })

  return {
    familyGroup: data?.familyGroup ?? null,
    inviteCode: data?.inviteCode ?? null,
    isLoading,
    error,
    refetch,
  }
}

export function useInviteCode() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...FAMILY_QUERY_KEY, 'invite-code'],
    queryFn: async () => {
      const response = await familyApi.getInviteCode()
      return response.data
    },
    staleTime: 5 * 60 * 1000,
  })

  return {
    inviteCode: data?.inviteCode ?? null,
    isLoading,
    error,
    refetch,
  }
}

export function useValidateInviteCode(code: string) {
  return useQuery({
    queryKey: [...FAMILY_QUERY_KEY, 'validate', code],
    queryFn: async () => {
      const response = await familyApi.validateInviteCode(code)
      return response.data
    },
    enabled: !!code && code.length > 0,
    retry: false,
  })
}

export function useShareSettings() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...FAMILY_QUERY_KEY, 'share-settings'],
    queryFn: async () => {
      const response = await familyApi.getShareSettings()
      return response.data
    },
    staleTime: 30_000,
  })

  return {
    shareSettings: data ?? null,
    isLoading,
    error,
    refetch,
  }
}

// ---------------------------------------------------------------------------
// Mutation hooks
// ---------------------------------------------------------------------------

export function useCreateFamily() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data?: CreateFamilyRequest) => {
      const response = await familyApi.createFamily(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAMILY_QUERY_KEY })
      Toast.show({ type: 'success', text1: '\uAC00\uC871 \uADF8\uB8F9 \uC0DD\uC131 \uC644\uB8CC' })
    },
    onError: (error: any) => {
      const message =
        error?.body?.error?.message ?? '\uAC00\uC871 \uADF8\uB8F9 \uC0DD\uC131\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4'
      Toast.show({ type: 'error', text1: '\uC0DD\uC131 \uC2E4\uD328', text2: message })
    },
  })
}

export function useJoinFamily() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: JoinFamilyRequest) => {
      const response = await familyApi.joinFamily(data)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: FAMILY_QUERY_KEY })
      Toast.show({
        type: 'success',
        text1: '\uAC00\uC871 \uADF8\uB8F9 \uCC38\uC5EC \uC644\uB8CC',
        text2: data.message,
      })
    },
    onError: (error: any) => {
      const message =
        error?.body?.error?.message ?? '\uAC00\uC871 \uADF8\uB8F9 \uCC38\uC5EC\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4'
      Toast.show({ type: 'error', text1: '\uCC38\uC5EC \uC2E4\uD328', text2: message })
    },
  })
}

export function useLeaveFamily() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: LeaveFamilyRequest) => {
      await familyApi.leaveFamily(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAMILY_QUERY_KEY })
      Toast.show({ type: 'success', text1: '\uAC00\uC871 \uADF8\uB8F9\uC5D0\uC11C \uB098\uAC14\uC2B5\uB2C8\uB2E4' })
    },
    onError: (error: any) => {
      const message =
        error?.body?.error?.message ?? '\uAC00\uC871 \uADF8\uB8F9 \uD0C8\uD1F4\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4'
      Toast.show({ type: 'error', text1: '\uD0C8\uD1F4 \uC2E4\uD328', text2: message })
    },
  })
}

export function useRegenerateInviteCode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await familyApi.regenerateInviteCode()
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...FAMILY_QUERY_KEY, 'invite-code'],
      })
      Toast.show({ type: 'success', text1: '\uCD08\uB300 \uCF54\uB4DC\uAC00 \uC7AC\uC0DD\uC131\uB418\uC5C8\uC2B5\uB2C8\uB2E4' })
    },
    onError: (error: any) => {
      const message =
        error?.body?.error?.message ?? '\uCD08\uB300 \uCF54\uB4DC \uC7AC\uC0DD\uC131\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4'
      Toast.show({ type: 'error', text1: '\uC7AC\uC0DD\uC131 \uC2E4\uD328', text2: message })
    },
  })
}

export function useUpdateShareSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateShareSettingsRequest) => {
      const response = await familyApi.updateShareSettings(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...FAMILY_QUERY_KEY, 'share-settings'],
      })
      Toast.show({ type: 'success', text1: '\uACF5\uC720 \uC124\uC815 \uC218\uC815 \uC644\uB8CC' })
    },
    onError: (error: any) => {
      const message =
        error?.body?.error?.message ?? '\uACF5\uC720 \uC124\uC815 \uC218\uC815\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4'
      Toast.show({ type: 'error', text1: '\uC218\uC815 \uC2E4\uD328', text2: message })
    },
  })
}
