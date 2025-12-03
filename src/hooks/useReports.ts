import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { ReportsListResponse } from '../types/reports'

export function useReports(category?: string) {
  return useQuery<ReportsListResponse>({
    queryKey: ['reports', category],
    queryFn: async () => {
      const params = category ? { category } : {}
      const response = await api.get('/api/reports', { params })
      return response.data
    },
  })
}
