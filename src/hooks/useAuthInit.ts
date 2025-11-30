import { useEffect } from 'react'
import { useAuthStore } from '../stores/auth.store'
import { api } from '../lib/api'

/**
 * Hook para inicializar dados do usuário autenticado
 * Busca os dados do usuário se houver token mas não houver dados do usuário
 */
export function useAuthInit() {
  const { token, user, setAuth, clearAuth } = useAuthStore()

  useEffect(() => {
    const initAuth = async () => {
      const localToken = token || localStorage.getItem('auth-token')
      
      // Se não tem token, não faz nada
      if (!localToken) {
        return
      }

      // Se tem token mas não tem usuário, busca os dados
      if (!user) {
        try {
          console.log('Token presente mas sem usuário, buscando dados...')
          
          // Tenta buscar do endpoint /auth/me
          const response = await api.get('/api/auth/me')
          
          if (response.data) {
            console.log('Dados do usuário carregados:', response.data)
            setAuth(response.data, localToken)
          }
        } catch (error: any) {
          console.error('Erro ao buscar dados do usuário:', error)
          
          // Se falhar, limpa a autenticação apenas em erros 401/403
          if (error.response?.status === 401 || error.response?.status === 403) {
            console.log('Token inválido, limpando autenticação')
            clearAuth()
          }
        }
      }
    }

    initAuth()
  }, [token, user, setAuth, clearAuth]) // Roda quando token ou user mudar
}
