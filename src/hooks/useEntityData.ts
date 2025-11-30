import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { ListResponse } from '../types/entities'

interface UseEntityDataOptions {
  page?: number
  pageSize?: number
  search?: string
  orderBy?: string
  ascending?: boolean
}

export function useEntityData<T = any>(
  entityName: string,
  options: UseEntityDataOptions = {}
) {
  const {
    page = 1,
    pageSize = 20,
    search = '',
    orderBy = '',
    ascending = true,
  } = options

  return useQuery<ListResponse<T>>({
    queryKey: ['entityData', entityName, page, pageSize, search, orderBy, ascending],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('pageSize', pageSize.toString())
      if (search) params.append('search', search)
      if (orderBy) {
        params.append('orderBy', orderBy)
        params.append('ascending', ascending.toString())
      }

      console.log(`[useEntityData] Fetching ${entityName} with params:`, params.toString())
      const response = await api.get(`/api/dynamic/${entityName}?${params}`)
      console.log(`[useEntityData] Response for ${entityName}:`, response.data)
      return response.data
    },
    enabled: !!entityName,
  })
}

export function useEntityRecord(entityName: string, recordId: string | undefined) {
  return useQuery({
    queryKey: ['entityRecord', entityName, recordId],
    queryFn: async () => {
      const response = await api.get(`/api/dynamic/${entityName}/${recordId}`)
      return response.data
    },
    enabled: !!entityName && !!recordId,
  })
}
