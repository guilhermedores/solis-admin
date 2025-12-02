import axios from 'axios'

// URL da API Backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Tenant padrão para desenvolvimento
const DEV_TENANT = import.meta.env.VITE_DEV_TENANT || 'demo'

/**
 * Extrai o subdomínio (tenant) da URL atual
 */
export const getTenantFromUrl = (): string => {
  const hostname = window.location.hostname
  
  // Para desenvolvimento local (localhost ou 127.0.0.1)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Tenta pegar do localStorage (setado pelo TenantValidator)
    const devTenant = localStorage.getItem('dev-tenant')
    if (devTenant) {
      return devTenant
    }
    // Fallback para a variável de ambiente
    return DEV_TENANT
  }
  
  // Para produção, extrai o primeiro segmento do domínio
  const parts = hostname.split('.')
  
  if (parts.length >= 3) {
    return parts[0] // Retorna o subdomínio
  }
  
  // Fallback para o tenant de desenvolvimento
  return DEV_TENANT
}

// Cliente HTTP configurado
export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para requests - adiciona x-tenant e token
api.interceptors.request.use(
  (config) => {
    // Adiciona o header x-tenant (mantido para compatibilidade)
    const tenant = getTenantFromUrl()
    if (tenant) {
      config.headers['X-Tenant-Subdomain'] = tenant
    }
    
    // Adiciona o token de autenticação se existir
    const token = localStorage.getItem('auth-token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('[API] Request error:', error)
    return Promise.reject(error)
  }
)

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    console.log(`[API] ✓ ${response.config.url} - ${response.status}`)
    return response
  },
  (error) => {
    if (error.response) {
      console.error(`[API] ✗ ${error.config?.url} - ${error.response.status}`, error.response.data)
      
      // Se receber 401, redireciona para login (exceto se já estiver na página de login)
      if (error.response.status === 401 && window.location.pathname !== '/login') {
        localStorage.removeItem('auth-token')
        window.location.href = '/login'
      }
    } else if (error.request) {
      console.error('[API] ✗ No response received', error.request)
    } else {
      console.error('[API] ✗ Request error', error.message)
    }
    return Promise.reject(error)
  }
)

export default api
