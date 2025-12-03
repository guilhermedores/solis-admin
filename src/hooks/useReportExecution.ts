import { useMutation } from '@tanstack/react-query'
import { api } from '../lib/api'
import { ReportExecutionRequest, ReportExecutionResponse } from '../types/reports'

export function useReportExecution(reportName: string) {
  return useMutation<ReportExecutionResponse, Error, ReportExecutionRequest>({
    mutationFn: async (request: ReportExecutionRequest) => {
      const response = await api.post(`/api/reports/${reportName}/execute`, request)
      return response.data
    },
  })
}

export function useReportExport(reportName: string) {
  return useMutation<Blob, Error, ReportExecutionRequest>({
    mutationFn: async (request: ReportExecutionRequest) => {
      const response = await api.post(`/api/reports/${reportName}/export`, request, {
        responseType: 'blob',
      })
      return response.data
    },
  })
}
