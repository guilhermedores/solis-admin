import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useEntityMetadata } from '../../hooks/useEntityMetadata'
import { useEntityRecord } from '../../hooks/useEntityData'
import { api } from '../../lib/api'
import DynamicField from './DynamicField'

export default function EntityForm() {
  const { entity, id } = useParams<{ entity: string; id?: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEdit = !!id

  const { data: metadata, isLoading: metadataLoading } = useEntityMetadata(entity!)
  const { data: record, isLoading: recordLoading } = useEntityRecord(entity!, id)

  const [formData, setFormData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (metadata && !isEdit) {
      // Inicializar com valores padrão para novo registro
      const defaults: Record<string, any> = {}
      metadata.fields.forEach((field) => {
        if (field.defaultValue !== undefined) {
          defaults[field.name] = field.defaultValue
        }
      })
      setFormData(defaults)
    }
  }, [metadata, isEdit])

  useEffect(() => {
    if (record && isEdit) {
      setFormData(record)
    }
  }, [record, isEdit])

  const handleFieldChange = (fieldName: string, value: any) => {
    console.log('[EntityForm] Field change:', fieldName, '=', value)
    setFormData((prev) => {
      const newData = {
        ...prev,
        [fieldName]: value,
      }
      console.log('[EntityForm] New formData:', newData)
      return newData
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Limpar campos _display e outros campos não editáveis do payload
    const cleanedData: Record<string, any> = {}
    metadata?.fields.forEach((field) => {
      const fieldName = field.name
      // Incluir apenas campos que existem no formData e não são _display
      if (fieldName in formData && !fieldName.endsWith('_display')) {
        let value = formData[fieldName]
        
        // Para campos UUID vazios, enviar null ao invés de string vazia
        if (field.dataType === 'uuid' && value === '') {
          value = null
        }
        
        // Não enviar campos undefined
        if (value !== undefined) {
          cleanedData[fieldName] = value
        }
      }
    })

    console.log('[EntityForm] Submitting formData:', cleanedData)

    try {
      if (isEdit) {
        await api.put(`/api/dynamic/${entity}/${id}`, cleanedData)
        // Invalidar cache para recarregar dados
        queryClient.invalidateQueries({ queryKey: ['entityRecord', entity, id] })
        queryClient.invalidateQueries({ queryKey: ['entityData', entity] })
        alert('Registro atualizado com sucesso!')
        navigate(`/crud/${entity}/${id}`)
      } else {
        const response = await api.post(`/api/dynamic/${entity}`, cleanedData)
        // Invalidar cache da lista
        queryClient.invalidateQueries({ queryKey: ['entityData', entity] })
        alert('Registro criado com sucesso!')
        // A resposta pode vir como { id: ... } ou { data: { id: ... } }
        const recordId = response.data?.id || response.data?.data?.id
        navigate(`/crud/${entity}/${recordId}`)
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.response?.data?.title ||
        'Erro ao salvar registro'
      setError(errorMessage)
      console.error('Error saving record:', err)
      console.error('Error response:', err.response?.data)
    } finally {
      setLoading(false)
    }
  }

  if (metadataLoading || (isEdit && recordLoading)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando...</div>
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

  // Usar showInCreate para novos registros e showInUpdate para edição
  const formFields = metadata.fields
    .filter((f) => isEdit ? f.showInUpdate : f.showInCreate)
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
        <span className="font-semibold text-gray-800">
          {isEdit ? 'Editar' : 'Novo'}
        </span>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {isEdit ? 'Editar' : 'Novo'} {metadata.displayName}
        </h1>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6 max-w-4xl">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start justify-between">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => setError('')}
                className="ml-3 text-red-500 hover:text-red-700 font-bold text-lg"
              >
                ×
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formFields.map((field) => (
              <div
                key={field.id}
                className={field.dataType === 'text' ? 'md:col-span-2' : ''}
              >
                <DynamicField
                  field={field}
                  value={formData[field.name]}
                  onChange={(value) => handleFieldChange(field.name, value)}
                  entityName={entity!}
                  recordId={id}
                  disabled={loading}
                />
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
            <Link
              to={`/crud/${entity}`}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-all"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
