import { useState, useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  Menu, 
  X, 
  LogOut,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Database,
  Building,
  FileText,
  Shield
} from 'lucide-react'
import { useAuthStore } from '../stores/auth.store'
import { useEntities } from '../hooks/useEntities'
import { Entity } from '../types/entities'

interface LayoutProps {
  children: React.ReactNode
}

// Mapear ícones das entidades (fora do componente para evitar recriação)
const entityIcons: Record<string, any> = {
  user: Users,
  company: Building,
  tax_regime: FileText,
  special_tax_regime: Shield,
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  const location = useLocation()
  const navigate = useNavigate()
  
  // Usar destructuring separado para forçar re-render quando user mudar
  const user = useAuthStore((state) => state.user)
  const clearAuth = useAuthStore((state) => state.clearAuth)

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  // Buscar entidades disponíveis
  const { data: entitiesResponse, isLoading: loadingEntities, error: entitiesError } = useEntities()

  // Agrupar entidades por categoria
  const groupedEntities = useMemo(() => {
    if (!entitiesResponse?.entities || !Array.isArray(entitiesResponse.entities)) {
      return {}
    }

    const grouped: Record<string, Entity[]> = {}
    
    entitiesResponse.entities.forEach((entity) => {
      const category = entity.category || 'Outros'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(entity)
    })

    // Ordenar categorias alfabeticamente
    const sortedGrouped: Record<string, Entity[]> = {}
    Object.keys(grouped)
      .sort()
      .forEach((key) => {
        sortedGrouped[key] = grouped[key]
      })

    return sortedGrouped
  }, [entitiesResponse])

  // Toggle categoria
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar para desktop */}
      <aside
        className={`hidden lg:flex lg:flex-col fixed inset-y-0 left-0 z-50 bg-gradient-to-b from-purple-700 to-indigo-800 text-white shadow-2xl transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Header da sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          {!sidebarCollapsed && (
            <h1 className="text-xl font-bold">Solis Admin</h1>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors ml-auto"
          >
            <ChevronLeft
              className={`w-5 h-5 transition-transform ${
                sidebarCollapsed ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {/* Menu de navegação */}
        <nav className="flex-1 h-0 min-h-0 p-4 space-y-2 overflow-y-auto">
          {/* Dashboard */}
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              location.pathname === '/dashboard'
                ? 'bg-white text-purple-700 font-semibold shadow-lg'
                : 'hover:bg-white/10'
            }`}
            title={sidebarCollapsed ? 'Dashboard' : undefined}
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span>Dashboard</span>}
          </Link>

          {/* Loading state */}
          {loadingEntities && Object.keys(groupedEntities).length === 0 && (
            <div className="px-4 py-3 text-sm text-white/60">
              Carregando menu...
            </div>
          )}

          {/* Error state */}
          {entitiesError && Object.keys(groupedEntities).length === 0 && (
            <div className="px-4 py-3 text-xs text-red-300">
              ⚠️ API não disponível
            </div>
          )}

          {/* Entidades agrupadas por categoria */}
          {Object.entries(groupedEntities).map(([category, entities]) => {
            const isExpanded = expandedCategories[category] !== false // Expandido por padrão

            return (
              <div key={category} className="space-y-1">
                {/* Cabeçalho da categoria */}
                {!sidebarCollapsed ? (
                  <button
                    onClick={() => toggleCategory(category)}
                    className="flex items-center justify-between w-full px-4 py-2 text-sm font-semibold text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <span>{category}</span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                ) : (
                  <div className="h-px bg-white/20 my-2" />
                )}

                {/* Itens da categoria */}
                {(isExpanded || sidebarCollapsed) && (
                  <div className="space-y-1">
                    {entities.map((entity) => {
                      const Icon = entityIcons[entity.name] || Database
                      const isActive = location.pathname === `/crud/${entity.name}`

                      return (
                        <Link
                          key={entity.name}
                          to={`/crud/${entity.name}`}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                            sidebarCollapsed ? '' : 'ml-2'
                          } ${
                            isActive
                              ? 'bg-white text-purple-700 font-semibold shadow-lg'
                              : 'hover:bg-white/10'
                          }`}
                          title={sidebarCollapsed ? entity.displayName : undefined}
                        >
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          {!sidebarCollapsed && <span className="text-sm">{entity.displayName}</span>}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* User info e logout */}
        <div className="p-4 border-t border-white/20">
          {!sidebarCollapsed && user && (
            <div className="mb-3 px-2">
              <p className="text-sm font-semibold truncate">{user.nome}</p>
              <p className="text-xs text-white/70 truncate">{user.email}</p>
              <p className="text-xs text-white/60 mt-1 capitalize">
                {user.role}
              </p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-white/10 transition-colors"
            title={sidebarCollapsed ? 'Sair' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Sidebar mobile */}
      <div
        className={`lg:hidden fixed inset-0 z-50 bg-black/50 transition-opacity ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      >
        <aside
          className={`absolute inset-y-0 left-0 w-64 bg-gradient-to-b from-purple-700 to-indigo-800 text-white shadow-2xl transition-transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header da sidebar mobile */}
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <h1 className="text-xl font-bold">Solis Admin</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu de navegação mobile */}
          <nav className="p-4 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
            {/* Dashboard */}
            <Link
              to="/dashboard"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                location.pathname === '/dashboard'
                  ? 'bg-white text-purple-700 font-semibold shadow-lg'
                  : 'hover:bg-white/10'
              }`}
            >
              <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
              <span>Dashboard</span>
            </Link>

            {/* Entidades agrupadas por categoria */}
            {Object.entries(groupedEntities).map(([category, entities]) => {
              const isExpanded = expandedCategories[category] !== false

              return (
                <div key={category} className="space-y-1">
                  {/* Cabeçalho da categoria */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="flex items-center justify-between w-full px-4 py-2 text-sm font-semibold text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <span>{category}</span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>

                  {/* Itens da categoria */}
                  {isExpanded && (
                    <div className="space-y-1">
                      {entities.map((entity) => {
                        const Icon = entityIcons[entity.name] || Database
                        const isActive = location.pathname === `/crud/${entity.name}`

                        return (
                          <Link
                            key={entity.name}
                            to={`/crud/${entity.name}`}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-3 px-4 py-2.5 ml-2 rounded-lg transition-all ${
                              isActive
                                ? 'bg-white text-purple-700 font-semibold shadow-lg'
                                : 'hover:bg-white/10'
                            }`}
                          >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm">{entity.displayName}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* User info e logout mobile */}
          <div className="p-4 border-t border-white/20">
            {user && (
              <div className="mb-3 px-2">
                <p className="text-sm font-semibold truncate">{user.nome}</p>
                <p className="text-xs text-white/70 truncate">{user.email}</p>
                <p className="text-xs text-white/60 mt-1 capitalize">
                  {user.role}
                </p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span>Sair</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Conteúdo principal */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Header mobile */}
        <header className="lg:hidden bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg">
          <div className="flex items-center justify-between px-4 h-16">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold">Solis Admin</h1>
            <div className="w-10" /> {/* Spacer para centralizar */}
          </div>
        </header>

        {/* Área de conteúdo */}
        <main className="p-3 sm:p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
