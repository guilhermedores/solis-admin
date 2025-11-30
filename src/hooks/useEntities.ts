import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { EntitiesResponse } from '../types/entities'

export function useEntities() {
  return useQuery<EntitiesResponse>({
    queryKey: ['entities'],
    queryFn: async () => {
      const response = await api.get('/api/entities')
      return response.data
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}
