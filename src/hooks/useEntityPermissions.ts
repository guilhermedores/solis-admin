import { useMemo } from 'react'
import { useAuthStore } from '../stores/auth.store'
import type { EntityMetadata } from '../types/entities'

export function useEntityPermissions(metadata: EntityMetadata | undefined) {
  const user = useAuthStore((state) => state.user)

  return useMemo(() => {
    if (!metadata || !user) {
      return {
        canCreate: false,
        canRead: false,
        canUpdate: false,
        canDelete: false,
      }
    }

    // Buscar permissão para o role do usuário
    const permission = metadata.permissions?.find((p) => p.role === user.role)

    if (permission) {
      return {
        canCreate: permission.canCreate,
        canRead: permission.canRead,
        canUpdate: permission.canUpdate,
        canDelete: permission.canDelete,
        canReadOwnOnly: permission.canReadOwnOnly,
      }
    }

    // Fallback para as permissões globais se não houver permissão por role
    return {
      canCreate: metadata.allowCreate,
      canRead: metadata.allowRead,
      canUpdate: metadata.allowUpdate,
      canDelete: metadata.allowDelete,
      canReadOwnOnly: false,
    }
  }, [metadata, user])
}
