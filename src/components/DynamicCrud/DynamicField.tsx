import { Field } from '../../types/entities'
import { useFieldOptions } from '../../hooks/useFieldOptions'

interface DynamicFieldProps {
  field: Field
  value: any
  onChange: (value: any) => void
  entityName: string
  recordId?: string
  disabled?: boolean
}

export default function DynamicField({
  field,
  value,
  onChange,
  entityName,
  recordId,
  disabled = false,
}: DynamicFieldProps) {
  const { data: options, isLoading: optionsLoading } = useFieldOptions(
    entityName,
    recordId,
    field.hasOptions || field.hasRelationship ? field.name : ''
  )

  const inputClassName = `w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
    field.validation?.required ? 'required' : ''
  }`

  // Campos com opções (select/dropdown)
  if (field.hasOptions || field.hasRelationship) {
    if (optionsLoading) {
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {field.displayName}
            {field.isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div className="text-gray-500 text-sm">Carregando opções...</div>
        </div>
      )
    }

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {field.displayName}
          {field.isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={field.isRequired}
          disabled={disabled || field.isReadOnly}
          className={inputClassName}
        >
          <option value="">Selecione...</option>
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    )
  }

  // Renderização por tipo de dado
  switch (field.dataType) {
    case 'boolean':
      return (
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              disabled={disabled || field.isReadOnly}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">
              {field.displayName}
              {field.isRequired && <span className="text-red-500 ml-1">*</span>}
            </span>
          </label>
        </div>
      )

    case 'text':
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {field.displayName}
            {field.isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.isRequired}
            disabled={disabled || field.isReadOnly}
            rows={4}
            maxLength={field.maxLength}
            className={inputClassName}
          />
          {field.maxLength && (
            <div className="text-xs text-gray-500 mt-1">
              {(value || '').length} / {field.maxLength} caracteres
            </div>
          )}
        </div>
      )

    case 'date':
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {field.displayName}
            {field.isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="date"
            value={value ? new Date(value).toISOString().split('T')[0] : ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.isRequired}
            disabled={disabled || field.isReadOnly}
            className={inputClassName}
          />
        </div>
      )

    case 'datetime':
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {field.displayName}
            {field.isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="datetime-local"
            value={value ? new Date(value).toISOString().slice(0, 16) : ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.isRequired}
            disabled={disabled || field.isReadOnly}
            className={inputClassName}
          />
        </div>
      )

    case 'integer':
    case 'decimal':
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {field.displayName}
            {field.isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="number"
            value={value ?? ''}
            onChange={(e) => {
              const val = e.target.value
              onChange(field.dataType === 'integer' ? parseInt(val, 10) : parseFloat(val))
            }}
            required={field.isRequired}
            disabled={disabled || field.isReadOnly}
            step={field.dataType === 'decimal' ? '0.01' : '1'}
            min={field.validation?.min}
            max={field.validation?.max}
            className={inputClassName}
          />
        </div>
      )

    case 'uuid':
      // UUID é geralmente readonly (IDs)
      if (field.isReadOnly) {
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.displayName}
            </label>
            <input
              type="text"
              value={value || ''}
              readOnly
              disabled
              className={inputClassName}
            />
          </div>
        )
      }
      // Se não for readonly, trata como string
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {field.displayName}
            {field.isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.isRequired}
            disabled={disabled || field.isReadOnly}
            maxLength={field.maxLength}
            className={inputClassName}
          />
        </div>
      )

    default:
      // string
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {field.displayName}
            {field.isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type={field.name.includes('password') ? 'password' : field.name.includes('email') ? 'email' : 'text'}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.isRequired}
            disabled={disabled || field.isReadOnly}
            maxLength={field.maxLength}
            minLength={field.validation?.minLength}
            pattern={field.validation?.pattern}
            className={inputClassName}
          />
          {field.maxLength && (
            <div className="text-xs text-gray-500 mt-1">
              {(value || '').length} / {field.maxLength} caracteres
            </div>
          )}
        </div>
      )
  }
}
