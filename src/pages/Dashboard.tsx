import { LayoutDashboard, Users, TrendingUp, Activity, Package } from 'lucide-react'
import { useAuthStore } from '../stores/auth.store'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

interface DashboardStats {
  usuarios: {
    total: number
    ativos: number
  }
  produtos: {
    total: number
  }
  empresas: {
    total: number
  }
}

export default function Dashboard() {
  const { user } = useAuthStore()

  // Busca estatísticas da API
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const result: DashboardStats = {
        usuarios: { total: 0, ativos: 0 },
        produtos: { total: 0 },
        empresas: { total: 0 },
      }

      // TODO: Implementar quando os endpoints estiverem disponíveis
      // Por enquanto retorna valores padrão

      return result
    },
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  })

  const cards = [
    {
      label: 'Usuários Ativos',
      value: isLoading ? '...' : String(stats?.usuarios.ativos || 0),
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      show: user?.role === 'admin', // Apenas admin vê este card
      loading: isLoading,
    }
  ]

  const visibleCards = cards.filter(card => card.show)

  return (
    <div>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="w-8 h-8 text-purple-600" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Bem-vindo, {user?.nome || 'Usuário'}!
            </p>
          </div>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {visibleCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {card.loading ? (
                      <span className="inline-block animate-pulse">...</span>
                    ) : (
                      card.value
                    )}
                  </p>
                </div>
                <div className={`bg-gradient-to-br ${card.color} p-3 rounded-xl`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
