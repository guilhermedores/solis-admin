import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { FieldOption } from '../types/entities'

export function useFieldOptions(
  entityName: string,
  recordId: string | undefined,
  fieldName: string
) {
  return useQuery<FieldOption[]>({
    queryKey: ['fieldOptions', entityName, recordId, fieldName],
    queryFn: async () => {
      // Para novos registros, usar ID dummy
      const id = recordId || '00000000-0000-0000-0000-000000000000'
      const endpoint = `/api/dynamic/${entityName}/${id}/options/${fieldName}`
      const response = await api.get(endpoint)
      return response.data
    },
    enabled: !!entityName && !!fieldName,
  })
}
