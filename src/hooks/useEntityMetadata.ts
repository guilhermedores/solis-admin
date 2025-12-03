import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { EntityMetadata } from '../types/entities'

export function useEntityMetadata(entityName: string) {
  return useQuery<EntityMetadata>({
    queryKey: ['entityMetadata', entityName],
    queryFn: async () => {
      const response = await api.get(`/api/dynamic/${entityName}/_metadata`)
      return response.data
    },
    enabled: !!entityName,
    staleTime: 0, // Sempre buscar dados frescos
    gcTime: 0, // Não manter em cache
  })
}
