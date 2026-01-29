import { useQuery } from '@tanstack/react-query'
import { missionApi } from '../api/missionApi'
import type { MissionFilters } from '../types'

export const MISSIONS_QUERY_KEY = ['missions']

export function useMissions(filters?: MissionFilters) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...MISSIONS_QUERY_KEY, filters],
    queryFn: async () => {
      const response = await missionApi.getMissions(filters)
      return response.data
    },
    staleTime: 30_000,
  })

  return {
    missions: data?.missions ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    refetch,
  }
}

export function useMission(id: string) {
  return useQuery({
    queryKey: [...MISSIONS_QUERY_KEY, id],
    queryFn: async () => {
      const response = await missionApi.getMission(id)
      return response.data
    },
    enabled: !!id,
  })
}

export function useMissionSummary() {
  return useQuery({
    queryKey: [...MISSIONS_QUERY_KEY, 'summary'],
    queryFn: async () => {
      const response = await missionApi.getMissionSummary()
      return response.data
    },
    staleTime: 30_000,
  })
}

export function useMissionTemplates(categoryId?: string) {
  return useQuery({
    queryKey: [...MISSIONS_QUERY_KEY, 'templates', categoryId],
    queryFn: async () => {
      const response = await missionApi.getTemplates(categoryId)
      return response.data
    },
  })
}

export function useMissionTransactions(missionId: string) {
  return useQuery({
    queryKey: [...MISSIONS_QUERY_KEY, missionId, 'transactions'],
    queryFn: async () => {
      const response = await missionApi.getMissionTransactions(missionId)
      return response.data
    },
    enabled: !!missionId,
  })
}

export function useLifeCycleCategories() {
  return useQuery({
    queryKey: [...MISSIONS_QUERY_KEY, 'categories'],
    queryFn: async () => {
      const response = await missionApi.getCategories()
      return response.data
    },
    staleTime: 5 * 60 * 1000,
  })
}
