import { Link } from 'react-router-dom'
import { useEntities } from '../../hooks/useEntities'

export default function EntityList() {
  const { data, isLoading, error } = useEntities()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando entidades...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Erro ao carregar entidades: {error instanceof Error ? error.message : 'Erro desconhecido'}
      </div>
    )
  }

  const entities = data?.entities || []

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dynamic CRUD</h1>
        <p className="text-gray-600 mt-2">Selecione uma entidade para gerenciar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {entities.map((entity) => (
          <Link
            key={entity.name}
            to={`/admin/${entity.name}`}
            className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-200"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                  {entity.icon || entity.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-800">
                  {entity.displayName}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{entity.description}</p>
                <div className="flex gap-2 mt-3 text-xs">
                  {entity.allowCreate && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                      Criar
                    </span>
                  )}
                  {entity.allowRead && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      Ler
                    </span>
                  )}
                  {entity.allowUpdate && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                      Editar
                    </span>
                  )}
                  {entity.allowDelete && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded">
                      Deletar
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {entities.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          Nenhuma entidade disponível
        </div>
      )}
    </div>
  )
}
