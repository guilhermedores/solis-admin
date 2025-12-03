import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Eye, Pencil, Trash2, Check, X } from 'lucide-react'
import { useEntityMetadata } from '../../hooks/useEntityMetadata'
import { useEntityData } from '../../hooks/useEntityData'
import { useEntityPermissions } from '../../hooks/useEntityPermissions'
import { api } from '../../lib/api'

export default function EntityTable() {
  const { entity } = useParams<{ entity: string }>()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize] = useState(50)
  const [search, setSearch] = useState('')
  const [orderBy, setOrderBy] = useState('')
  const [ascending, setAscending] = useState(true)

  const { data: metadata, isLoading: metadataLoading } = useEntityMetadata(entity!)
  const { data: listData, isLoading: dataLoading, refetch } = useEntityData(entity!, {
    page,
    pageSize,
    search,
    orderBy,
    ascending,
  })

  const permissions = useEntityPermissions(metadata)

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este registro?')) return

    try {
      await api.delete(`/api/dynamic/${entity}/${id}`)
      refetch()
      alert('Registro deletado com sucesso!')
    } catch (error) {
      alert('Erro ao deletar registro')
      console.error(error)
    }
  }

  const handleSort = (fieldName: string) => {
    if (orderBy === fieldName) {
      setAscending(!ascending)
    } else {
      setOrderBy(fieldName)
      setAscending(true)
    }
  }

  if (metadataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando metadados...</div>
      </div>
    )
  }

  if (!metadata) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg m-6">
        Entidade não encontrada
      </div>
    )
  }

  const listFields = metadata.fields
    .filter((f) => f.showInList)
    .sort((a, b) => a.listOrder - b.formOrder)

  const records = listData?.data || []
  const pagination = listData?.pagination

  // Função para obter o valor de exibição de um campo
  const getDisplayValue = (record: any, field: any) => {
    const fieldValue = record.data[field.name]
    
    // Se o campo tem relacionamento, procura pelo campo com sufixo _display
    if (field.relationship || field.hasRelationship) {
      const displayFieldName = `${field.name}_display`
      const displayValue = record.data[displayFieldName]
      if (displayValue !== undefined && displayValue !== null) {
        return displayValue
      }
    }
    
    // Usar fieldType se disponível, senão usar dataType
    const type = field.fieldType || field.dataType
    
    // Se for booleano ou checkbox, mostrar ícone
    if (type === 'boolean' || type === 'checkbox' || field.dataType === 'boolean') {
      return fieldValue ? (
        <Check className="text-green-600" size={18} />
      ) : (
        <X className="text-red-600" size={18} />
      )
    }
    
    return formatFieldValue(fieldValue, type)
  }

  // Função para determinar alinhamento baseado no tipo
  const getColumnAlignment = (field: any) => {
    const type = field.fieldType || field.dataType
    const numericTypes = ['number', 'decimal', 'currency']
    return numericTypes.includes(type) ? 'text-right' : 'text-left'
  }

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="mb-4 text-sm text-gray-600">
        <Link to="/dashboard" className="hover:text-purple-600">
          Dashboard
        </Link>
        <span className="mx-2">/</span>
        <span className="font-semibold text-gray-800">{metadata.displayName}</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{metadata.displayName}</h1>
          <p className="text-gray-600 mt-1">{metadata.description}</p>
        </div>
        {permissions.canCreate && (
          <Link
            to={`/crud/${entity}/new`}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            + Novo
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {listFields.map((field) => (
                  <th
                    key={field.id}
                    className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${getColumnAlignment(field)}`}
                    onClick={() => handleSort(field.name)}
                  >
                    <div className={`flex items-center ${getColumnAlignment(field) === 'text-right' ? 'justify-end' : ''}`}>
                      {field.displayName}
                      {orderBy === field.name && (
                        <span className="ml-2">{ascending ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dataLoading ? (
                <tr>
                  <td colSpan={listFields.length + 1} className="px-6 py-4 text-center text-gray-500">
                    Carregando...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={listFields.length + 1} className="px-6 py-4 text-center text-gray-500">
                    Nenhum registro encontrado
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.data.id} className="hover:bg-gray-50">
                    {listFields.map((field) => (
                      <td key={field.id} className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${getColumnAlignment(field)}`}>
                        {getDisplayValue(record, field)}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {permissions.canRead && (
                          <button
                            onClick={() => navigate(`/crud/${entity}/${record.data.id}`)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Ver detalhes"
                          >
                            <Eye size={18} />
                          </button>
                        )}
                        {permissions.canUpdate && (
                          <button
                            onClick={() => navigate(`/crud/${entity}/${record.data.id}/edit`)}
                            className="text-yellow-600 hover:text-yellow-900 p-1"
                            title="Editar"
                          >
                            <Pencil size={18} />
                          </button>
                        )}
                        {permissions.canDelete && (
                          <button
                            onClick={() => handleDelete(record.data.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Deletar"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                disabled={page === pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Próximo
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{(page - 1) * pageSize + 1}</span> a{' '}
                  <span className="font-medium">
                    {Math.min(page * pageSize, pagination.totalCount)}
                  </span>{' '}
                  de <span className="font-medium">{pagination.totalCount}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1
                    } else if (page <= 3) {
                      pageNum = i + 1
                    } else if (page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i
                    } else {
                      pageNum = page - 2 + i
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === pageNum
                            ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                    disabled={page === pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Próximo
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function formatFieldValue(value: any, dataType: string): string {
  if (value === null || value === undefined) return '-'

  switch (dataType) {
    case 'boolean':
      return value ? 'Sim' : 'Não'
    
    case 'date':
      try {
        return new Date(value).toLocaleDateString('pt-BR')
      } catch {
        return String(value)
      }
    
    case 'datetime':
      try {
        return new Date(value).toLocaleString('pt-BR')
      } catch {
        return String(value)
      }
    
    case 'currency':
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(Number(value))
    
    case 'decimal':
      return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Number(value))
    
    case 'number':
      return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(Number(value))
    
    default:
      return String(value)
  }
}
