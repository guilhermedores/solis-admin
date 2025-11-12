import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'admin' | 'manager' | 'user'

export interface User {
  id: string
  nome: string
  email: string
  role: UserRole
  tenantId: string
}

interface AuthState {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
  hasRole: (roles: UserRole[]) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      
      setAuth: (user: User, token: string) => {
        set({ user, token })
        localStorage.setItem('auth-token', token)
      },
      
      clearAuth: () => {
        set({ user: null, token: null })
        localStorage.removeItem('auth-token')
      },
      
      hasRole: (roles: UserRole[]) => {
        const { user } = get()
        return user ? roles.includes(user.role) : false
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
