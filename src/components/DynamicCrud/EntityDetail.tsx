import { Link, useParams, useNavigate } from 'react-router-dom'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import { useEntityMetadata } from '../../hooks/useEntityMetadata'
import { useEntityRecord } from '../../hooks/useEntityData'
import { api } from '../../lib/api'

export default function EntityDetail() {
  const { entity, id } = useParams<{ entity: string; id: string }>()
  const navigate = useNavigate()

  const { data: metadata, isLoading: metadataLoading } = useEntityMetadata(entity!)
  const { data: record, isLoading: recordLoading } = useEntityRecord(entity!, id)

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja deletar este registro?')) return

    try {
      await api.delete(`/api/dynamic/${entity}/${id}`)
      alert('Registro deletado com sucesso!')
      navigate(`/crud/${entity}`)
    } catch (error) {
      alert('Erro ao deletar registro')
      console.error(error)
    }
  }

  if (metadataLoading || recordLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando...</div>
      </div>
    )
  }

  if (!metadata || !record) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg m-6">
        Registro não encontrado
      </div>
    )
  }

  const detailFields = metadata.fields
    .filter((f) => f.showInDetail)
    .sort((a, b) => a.formOrder - b.formOrder)

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="mb-4 text-sm text-gray-600">
        <Link to="/dashboard" className="hover:text-purple-600">
          Dashboard
        </Link>
        <span className="mx-2">/</span>
        <Link to={`/crud/${entity}`} className="hover:text-purple-600">
          {metadata.displayName}
        </Link>
        <span className="mx-2">/</span>
        <span className="font-semibold text-gray-800">Detalhes</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Detalhes - {metadata.displayName}
          </h1>
        </div>
        <div className="flex gap-2">
          {metadata.allowUpdate && (
            <Link
              to={`/crud/${entity}/${id}/edit`}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-all flex items-center gap-2"
            >
              <Pencil size={18} />
              Editar
            </Link>
          )}
          {metadata.allowDelete && (
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-all flex items-center gap-2"
            >
              <Trash2 size={18} />
              Deletar
            </button>
          )}
        </div>
      </div>

      {/* Detail View */}
      <div className="bg-white rounded-lg shadow p-6 max-w-4xl">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {detailFields.map((field) => {
            // Verificar se é um campo de relacionamento e se existe o campo _display
            const isRelationship = field.relationship || field.hasRelationship
            const displayField = `${field.name}_display`
            const displayValue = isRelationship && record[displayField] 
              ? record[displayField] 
              : record[field.name]

            // Se for booleano, mostrar ícone
            let renderedValue
            if (field.dataType === 'boolean') {
              renderedValue = displayValue ? (
                <div className="flex items-center gap-2">
                  <Check className="text-green-600" size={20} />
                  <span>Sim</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <X className="text-red-600" size={20} />
                  <span>Não</span>
                </div>
              )
            } else {
              renderedValue = formatFieldValue(displayValue, field.dataType)
            }

            return (
              <div
                key={field.id}
                className={field.dataType === 'text' ? 'md:col-span-2' : ''}
              >
                <dt className="text-sm font-medium text-gray-500 mb-1">
                  {field.displayName}
                </dt>
                <dd className="text-base text-gray-900">
                  {renderedValue}
                </dd>
              </div>
            )
          })}
        </dl>

        <div className="mt-8">
          <Link
            to={`/crud/${entity}`}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-all inline-block"
          >
            Voltar para lista
          </Link>
        </div>
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
      return new Date(value).toLocaleDateString('pt-BR')
    case 'datetime':
      return new Date(value).toLocaleString('pt-BR')
    case 'decimal':
      return typeof value === 'number' ? value.toFixed(2) : value
    default:
      // Não exibir password
      if (String(value).includes('password') || String(value).length > 100) {
        return '••••••••'
      }
      return String(value)
  }
}
