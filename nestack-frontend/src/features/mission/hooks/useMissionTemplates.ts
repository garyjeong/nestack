import { useQuery } from '@tanstack/react-query'
import { missionApi } from '../api/missionApi'

export const TEMPLATES_QUERY_KEY = ['missions', 'templates']
export const CATEGORIES_QUERY_KEY = ['missions', 'categories']

export function useMissionTemplates(categoryId?: string) {
  const {
    data: templates,
    isLoading,
    error,
  } = useQuery({
    queryKey: [...TEMPLATES_QUERY_KEY, categoryId],
    queryFn: () => missionApi.getTemplates(categoryId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    templates: templates ?? [],
    isLoading,
    error,
  }
}

export function useLifeCycleCategories() {
  const {
    data: categories,
    isLoading,
    error,
  } = useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: missionApi.getCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  return {
    categories: categories ?? [],
    isLoading,
    error,
  }
}
