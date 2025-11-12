import { Navigate } from 'react-router-dom'
import { useAuthStore, UserRole } from '../stores/auth.store'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, hasRole } = useAuthStore()

  console.log('RoleGuard - User:', user)
  console.log('RoleGuard - allowedRoles:', allowedRoles)
  console.log('RoleGuard - hasRole:', hasRole(allowedRoles))

  // Se não houver usuário, aguarda um momento antes de redirecionar
  // (pode estar carregando os dados)
  if (!user) {
    // Verifica se tem token - se tiver, está carregando
    const token = localStorage.getItem('auth-token')
    if (token) {
      // Mostra loading enquanto carrega dados do usuário
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      )
    }
    return <Navigate to="/login" replace />
  }

  // Se o usuário não tem a role necessária, redireciona para dashboard
  if (!hasRole(allowedRoles)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
