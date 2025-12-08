import { useMutation } from '@tanstack/react-query'
import { api } from '../lib/api'

export interface GenerateAgentTokenRequest {
  storeId: string
  agentName: string
}

export interface GenerateAgentTokenResponse {
  token: string
  tenantId: string
  tenant: string
  storeId: string
  agentName: string
  expiresAt: string
}

/**
 * Hook para gerar token de agente PDV
 */
export function useGenerateAgentToken() {
  return useMutation<GenerateAgentTokenResponse, Error, GenerateAgentTokenRequest>({
    mutationFn: async (data) => {
      const response = await api.post('/api/auth/generate-agent-token', data)
      return response.data
    },
  })
}
