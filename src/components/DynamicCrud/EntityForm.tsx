import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useEntityMetadata } from '../../hooks/useEntityMetadata'
import { useEntityRecord } from '../../hooks/useEntityData'
import { api } from '../../lib/api'
import DynamicField from './DynamicField'

export default function EntityForm() {
  const { entity, id } = useParams<{ entity: string; id?: string }>()
  const navigate = useNavigate()
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isEdit) {
        await api.put(`/api/dynamic/${entity}/${id}`, formData)
        alert('Registro atualizado com sucesso!')
      } else {
        const response = await api.post(`/api/dynamic/${entity}`, formData)
        alert('Registro criado com sucesso!')
        navigate(`/admin/${entity}/${response.data.id}`)
        return
      }
      navigate(`/admin/${entity}/${id}`)
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Erro ao salvar registro'
      setError(errorMessage)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }))
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

  const formFields = metadata.fields
    .filter((f) => f.showInForm)
    .sort((a, b) => a.formOrder - b.formOrder)

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="mb-4 text-sm text-gray-600">
        <Link to="/admin" className="hover:text-purple-600">
          Dashboard
        </Link>
        <span className="mx-2">/</span>
        <Link to={`/admin/${entity}`} className="hover:text-purple-600">
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
              to={`/admin/${entity}`}
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
