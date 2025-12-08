import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

export interface Store {
  id: string
  name: string
  code?: string
  address?: string
  active: boolean
  company_id: string
  created_at: string
  updated_at: string
}

/**
 * Hook para buscar stores do tenant
 */
export function useStores() {
  return useQuery<Store[]>({
    queryKey: ['stores'],
    queryFn: async () => {
      const response = await api.get('/api/dynamic/store?active=true')
      // O dynamic CRUD retorna { data: [...], pagination: {...} }
      const storesData = response.data.data || response.data || []
      // Cada store vem como { data: {id, name, ...} }, então extraímos o data interno
      return Array.isArray(storesData) 
        ? storesData.map((item: any) => item.data || item)
        : []
    },
  })
}
