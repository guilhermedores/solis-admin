import { Link } from 'react-router-dom'
import { useEntities } from '../hooks/useEntities'
import { Database, Terminal, Loader2, AlertCircle } from 'lucide-react'

export default function CadastrosList() {
  const { data: entitiesResponse, isLoading, error } = useEntities()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <p>Erro ao carregar cadastros: {(error as Error).message}</p>
        </div>
      </div>
    )
  }

  // Agrupar entidades por categoria
  const groupedEntities = entitiesResponse?.entities?.reduce((acc, entity) => {
    const category = entity.category || 'Outros'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(entity)
    return acc
  }, {} as Record<string, typeof entitiesResponse.entities>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cadastros</h1>
        <p className="text-gray-600 text-sm mt-1">
          Gerencie os cadastros do sistema
        </p>
      </div>

      {/* Cadastros por categoria */}
      {Object.entries(groupedEntities || {})
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([category, entities]) => (
          <div key={category} className="space-y-4">
            <h2 className="text-xl font-bold text-gray-700 flex items-center gap-2">
              <div className="w-1 h-6 bg-purple-600 rounded"></div>
              {category}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {entities.map((entity) => (
                <Link
                  key={entity.name}
                  to={`/crud/${entity.name}`}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-purple-300 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-200 transition-colors">
                      <Database className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                        {entity.displayName}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {entity.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
              
              {/* Card fixo: Tokens de Agente (aparece em Configurações) */}
              {category === 'Configurações' && (
                <Link
                  to="/agent-tokens"
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-blue-300 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <Terminal className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        Tokens de Agente
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Gerar tokens PDV
                      </p>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          </div>
        ))}
    </div>
  )
}
