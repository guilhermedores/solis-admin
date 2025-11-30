import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, getTenantFromUrl } from '../lib/api'
import { useAuthStore } from '../stores/auth.store'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { setAuth, token } = useAuthStore()

  // Redireciona se já estiver autenticado
  useEffect(() => {
    const localToken = localStorage.getItem('auth-token')
    if (token || localToken) {
      navigate('/dashboard', { replace: true })
    }
  }, [token, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await api.post('/api/auth/login', {
        email,
        password,
      })

      console.log('Login response:', response.data)

      // Salva o token e os dados do usuário no store
      if (response.data.token) {
        // A API retorna 'usuario' (não 'user')
        const userData = response.data.usuario || response.data.user
        
        if (userData) {
          // Garante que tenantId está presente
          const userWithTenant = {
            ...userData,
            tenantId: userData.tenantId || getTenantFromUrl()
          }
          console.log('Salvando usuário no store:', userWithTenant)
          setAuth(userWithTenant, response.data.token)
        } else {
          // Fallback: salva apenas o token e deixa o useAuthInit buscar os dados
          console.log('Apenas token recebido, salvando no localStorage')
          localStorage.setItem('auth-token', response.data.token)
        }
        
        // Redireciona para o dashboard
        navigate('/dashboard', { replace: true })
      } else {
        setError('Token não recebido do servidor')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      const errorMessage = err.response?.data?.error || 
        err.response?.data?.message || 
        'Erro ao fazer login. Verifique suas credenciais.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-purple-500 to-indigo-700 flex items-center justify-center p-4 overflow-hidden">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Solis Admin</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Sistema de Administração</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="seu@email.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start justify-between animate-shake">
              <span className="flex-1">{error}</span>
              <button
                type="button"
                onClick={() => setError('')}
                className="ml-3 text-red-500 hover:text-red-700 font-bold text-lg leading-none flex-shrink-0"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 sm:py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all text-sm sm:text-base shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
