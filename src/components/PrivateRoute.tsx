import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth.store'

interface PrivateRouteProps {
  children: React.ReactNode
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { token } = useAuthStore()
  const localToken = localStorage.getItem('auth-token')

  // Verifica token do store ou localStorage
  if (!token && !localToken) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
