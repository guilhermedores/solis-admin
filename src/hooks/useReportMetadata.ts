import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { ReportMetadata } from '../types/reports'

export function useReportMetadata(reportName: string) {
  return useQuery<ReportMetadata>({
    queryKey: ['report-metadata', reportName],
    queryFn: async () => {
      const response = await api.get(`/api/reports/${reportName}/metadata`)
      return response.data
    },
    enabled: !!reportName,
  })
}
