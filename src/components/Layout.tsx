import { useState, useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  Menu, 
  X, 
  LogOut,
  ChevronLeft,
  Package
} from 'lucide-react'
import { useAuthStore } from '../stores/auth.store'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  
  // Usar destructuring separado para forçar re-render quando user mudar
  const user = useAuthStore((state) => state.user)
  const clearAuth = useAuthStore((state) => state.clearAuth)

  // Debug: mostrar dados do usuário
  console.log('Layout render - User:', user)
  console.log('Layout render - User Role:', user?.role)

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  // Usa useMemo para recalcular menuItems quando user mudar
  const menuItems = useMemo(() => [
    { 
      name: 'Dashboard', 
      icon: LayoutDashboard, 
      path: '/dashboard',
      show: true 
    },
    { 
      name: 'Produtos', 
      icon: Package, 
      path: '/produtos',
      show: true 
    },
    { 
      name: 'Usuários', 
      icon: Users, 
      path: '/usuarios',
      show: user?.role === 'admin' // Apenas admin vê o menu
    },
  ], [user?.role]) // Recalcula quando user.role mudar

  const visibleMenuItems = menuItems.filter(item => item.show)

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
        <nav className="flex-1 p-4 space-y-2">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-white text-purple-700 font-semibold shadow-lg'
                    : 'hover:bg-white/10'
                }`}
                title={sidebarCollapsed ? item.name : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </Link>
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
          <nav className="flex-1 p-4 space-y-2">
            {visibleMenuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-white text-purple-700 font-semibold shadow-lg'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
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
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
