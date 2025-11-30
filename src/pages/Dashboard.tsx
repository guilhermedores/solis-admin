import { LayoutDashboard, Users, Building, FileText, Shield, Database } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/auth.store'
import { useQuery } from '@tanstack/react-query'
import { useEntities } from '../hooks/useEntities'
import { api } from '../lib/api'

interface EntityStats {
  [entityName: string]: number
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const { data: entitiesResponse, isLoading: entitiesLoading } = useEntities()

  // Busca contadores de cada entidade
  const { data: stats, isLoading: statsLoading } = useQuery<EntityStats>({
    queryKey: ['dashboard-entity-stats'],
    queryFn: async () => {
      if (!entitiesResponse?.entities) return {}

      const statsPromises = entitiesResponse.entities.map(async (entity) => {
        try {
          // Buscar apenas registros ativos (active=true)
          const response = await api.get(`/api/dynamic/${entity.name}?page=1&pageSize=1&active=true`)
          return {
            name: entity.name,
            count: response.data?.pagination?.totalCount || 0,
          }
        } catch (error) {
          console.error(`Error fetching stats for ${entity.name}:`, error)
          return { name: entity.name, count: 0 }
        }
      })

      const results = await Promise.all(statsPromises)
      return results.reduce((acc, { name, count }) => {
        acc[name] = count
        return acc
      }, {} as EntityStats)
    },
    enabled: !!entitiesResponse?.entities && entitiesResponse.entities.length > 0,
    refetchInterval: 60000, // Atualiza a cada 60 segundos
  })

  // Mapa de ícones por entidade
  const entityIcons: Record<string, any> = {
    users: Users,
    usuarios: Users,
    companies: Building,
    empresas: Building,
    tax_regimes: FileText,
    regimes_tributarios: FileText,
    roles: Shield,
    funcoes: Shield,
  }

  // Mapa de cores por entidade
  const entityColors: Record<string, string> = {
    users: 'from-blue-500 to-indigo-600',
    usuarios: 'from-blue-500 to-indigo-600',
    companies: 'from-green-500 to-emerald-600',
    empresas: 'from-green-500 to-emerald-600',
    tax_regimes: 'from-purple-500 to-violet-600',
    regimes_tributarios: 'from-purple-500 to-violet-600',
    roles: 'from-orange-500 to-amber-600',
    funcoes: 'from-orange-500 to-amber-600',
  }

  const isLoading = entitiesLoading || statsLoading

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
        {isLoading ? (
          <div className="col-span-full text-center text-gray-500 py-8">
            Carregando estatísticas...
          </div>
        ) : (
          entitiesResponse?.entities.map((entity) => {
            const Icon = entityIcons[entity.name] || Database
            const color = entityColors[entity.name] || 'from-gray-500 to-slate-600'
            const count = stats?.[entity.name] || 0

            return (
              <Link
                key={entity.name}
                to={`/crud/${entity.name}`}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all hover:scale-105"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{entity.displayName}</p>
                    <p className="text-2xl font-bold text-gray-800">{count}</p>
                  </div>
                  <div className={`bg-gradient-to-br ${color} p-3 rounded-xl`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
