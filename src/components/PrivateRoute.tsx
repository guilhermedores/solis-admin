import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth.store'

interface PrivateRouteProps {
  children: React.ReactNode
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { token } = useAuthStore()
  const localToken = localStorage.getItem('auth-token')

  console.log('[PrivateRoute] Verificando auth - token store:', !!token, 'token local:', !!localToken)

  // Verifica token do store ou localStorage
  if (!token && !localToken) {
    console.log('[PrivateRoute] Sem token - redirecionando para login')
    return <Navigate to="/login" replace />
  }

  console.log('[PrivateRoute] Autenticado - renderizando children')
  return <>{children}</>
}
