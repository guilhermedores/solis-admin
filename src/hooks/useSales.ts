import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Sale, SalesListResponse, SaleFilters } from '../types/sales'

/**
 * Hook para buscar lista de vendas com filtros e paginação
 */
export function useSales(filters: SaleFilters = {}) {
  return useQuery<SalesListResponse>({
    queryKey: ['sales', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.pageSize) params.append('pageSize', filters.pageSize.toString())
      if (filters.status) params.append('status', filters.status)
      if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.storeId) params.append('storeId', filters.storeId)
      if (filters.posId) params.append('posId', filters.posId)
      if (filters.operatorId) params.append('operatorId', filters.operatorId)
      if (filters.search) params.append('search', filters.search)
      
      const response = await api.get(`/api/sales?${params.toString()}`)
      return response.data
    },
  })
}

/**
 * Hook para buscar uma venda específica por ID
 */
export function useSale(saleId: string | undefined) {
  return useQuery<Sale>({
    queryKey: ['sale', saleId],
    queryFn: async () => {
      if (!saleId) throw new Error('Sale ID is required')
      const response = await api.get(`/api/sales/${saleId}`)
      return response.data
    },
    enabled: !!saleId,
  })
}
