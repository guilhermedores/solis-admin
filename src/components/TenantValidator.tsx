import { useEffect, useState, useRef } from 'react'
import { api, getTenantFromUrl } from '../lib/api'
import { AlertCircle } from 'lucide-react'

interface TenantValidatorProps {
  children: React.ReactNode
}

export default function TenantValidator({ children }: TenantValidatorProps) {
  const [tenantValid, setTenantValid] = useState<boolean | null>(null)
  const [customTenant, setCustomTenant] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const hasValidated = useRef(false)

  useEffect(() => {
    console.log('[TenantValidator] Componente montado - hasValidated:', hasValidated.current)
    if (!hasValidated.current) {
      console.log('[TenantValidator] Iniciando validação de tenant...')
      hasValidated.current = true
      validateTenant()
    } else {
      console.log('[TenantValidator] Validação já executada, pulando')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Executa apenas uma vez

  const validateTenant = async () => {
    const tenant = getTenantFromUrl()
    console.log('[TenantValidator] Tenant atual:', tenant)
    
    // Para desenvolvimento local, sempre permite prosseguir
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('[TenantValidator] Localhost detectado - permitindo acesso')
      setTenantValid(true)
      return
    }

    try {
      setLoading(true)
      console.log('[TenantValidator] Validando tenant no servidor...')
      // Chama endpoint público de validação de tenant
      const response = await api.get(`/api/tenants/check/${tenant}`)
      
      if (response.data.exists) {
        console.log('[TenantValidator] Tenant válido')
        setTenantValid(true)
      } else {
        console.log('[TenantValidator] Tenant inválido')
        setTenantValid(false)
      }
    } catch (err: any) {
      console.error('[TenantValidator] Erro ao validar tenant:', err)
      
      // Se for 404, tenant não existe
      if (err.response?.status === 404) {
        setTenantValid(false)
      } else {
        // Outros erros (rede, etc), permite prosseguir para não bloquear
        console.log('[TenantValidator] Erro de rede - permitindo acesso')
        setTenantValid(true)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRedirect = () => {
    if (!customTenant.trim()) {
      setError('Por favor, informe o domínio da sua empresa')
      return
    }

    const tenant = customTenant.trim().toLowerCase()
    
    // Validar formato básico
    if (!/^[a-z0-9-]+$/.test(tenant)) {
      setError('O domínio deve conter apenas letras minúsculas, números e hífens')
      return
    }

    // Para localhost, armazena no localStorage e recarrega
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      localStorage.setItem('dev-tenant', tenant)
      window.location.reload()
      return
    }

    // Para produção, redireciona para o subdomínio correto
    const currentUrl = window.location
    const protocol = currentUrl.protocol
    const port = currentUrl.port ? `:${currentUrl.port}` : ''
    
    // Remove o subdomínio atual (se existir) e adiciona o novo
    const domainParts = currentUrl.hostname.split('.')
    
    // Se já tem subdomínio (exemplo.dominio.com), remove o primeiro segmento
    const baseDomain = domainParts.length >= 2 
      ? domainParts.slice(domainParts.length > 2 ? 1 : 0).join('.')
      : currentUrl.hostname
    
    const newUrl = `${protocol}//${tenant}.${baseDomain}${port}${currentUrl.pathname}`
    window.location.href = newUrl
  }

  // Loading state
  if (loading || tenantValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validando acesso...</p>
        </div>
      </div>
    )
  }

  // Tenant inválido - solicita domínio correto
  if (tenantValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
            Empresa não encontrada
          </h1>
          
          <p className="text-gray-600 text-center mb-6">
            O domínio <span className="font-semibold">{getTenantFromUrl()}</span> não está cadastrado no sistema.
          </p>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Informe o domínio correto da sua empresa:
            </label>
            <input
              type="text"
              value={customTenant}
              onChange={(e) => {
                setCustomTenant(e.target.value)
                setError('')
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleRedirect()}
              placeholder="exemplo: minhaempresa"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              autoFocus
            />
            {error && (
              <p className="text-red-600 text-sm mt-2">{error}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Será redirecionado para: <span className="font-semibold">{customTenant || 'seu-dominio'}.seudominio.com</span>
            </p>
          </div>

          <button
            onClick={handleRedirect}
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
          >
            Ir para o domínio correto
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Não sabe o domínio da sua empresa?{' '}
              <a href="mailto:suporte@seudominio.com" className="text-purple-600 hover:text-purple-700 font-semibold">
                Entre em contato
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Tenant válido - renderiza a aplicação
  return <>{children}</>
}
