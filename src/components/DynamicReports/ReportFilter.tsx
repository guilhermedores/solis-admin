import { ReportFilter as ReportFilterType } from '../../types/reports'

interface ReportFilterProps {
  filter: ReportFilterType
  value: any
  onChange: (value: any) => void
}

export default function ReportFilter({ filter, value, onChange }: ReportFilterProps) {
  console.log('[ReportFilter] Renderizando filtro:', filter.name, 'fieldType:', filter.fieldType)
  
  const renderInput = () => {
    // Backend usa 'fieldType', não 'type'
    const filterType = (filter.fieldType || filter.type)?.toLowerCase()
    
    switch (filterType) {
      case 'text':
      case 'string':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={filter.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required={filter.required}
          />
        )

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
            placeholder={filter.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required={filter.required}
          />
        )

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required={filter.required}
          />
        )

      case 'datetime':
        return (
          <input
            type="datetime-local"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required={filter.required}
          />
        )

      case 'boolean':
        return (
          <select
            value={value === null || value === undefined ? '' : String(value)}
            onChange={(e) => onChange(e.target.value === '' ? null : e.target.value === 'true')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required={filter.required}
          >
            <option value="">Selecione...</option>
            <option value="true">Sim</option>
            <option value="false">Não</option>
          </select>
        )

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required={filter.required}
          >
            <option value="">Selecione...</option>
            {filter.options?.map((option) => (
              <option key={String(option.value)} value={String(option.value)}>
                {option.label}
              </option>
            ))}
          </select>
        )

      case 'multiselect':
        return (
          <select
            multiple
            value={Array.isArray(value) ? value : []}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, (opt) => opt.value)
              onChange(selected.length > 0 ? selected : null)
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[100px]"
            required={filter.required}
          >
            {filter.options?.map((option) => (
              <option key={String(option.value)} value={String(option.value)}>
                {option.label}
              </option>
            ))}
          </select>
        )

      default:
        console.warn('[ReportFilter] Tipo de filtro não reconhecido:', filterType, 'para filtro:', filter.name)
        // Fallback para texto simples
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={filter.placeholder || `Digite ${filter.displayName}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required={filter.required}
          />
        )
    }
  }

  const inputElement = renderInput()
  
  if (!inputElement) {
    console.error('[ReportFilter] Nenhum input renderizado para filtro:', filter)
    return null
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {filter.displayName}
        {filter.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {inputElement}
      {filter.description && (
        <p className="text-xs text-gray-500">{filter.description}</p>
      )}
    </div>
  )
}
