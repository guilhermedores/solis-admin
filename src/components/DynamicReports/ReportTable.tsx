import { ReportColumn } from '../../types/reports'
import { Check, X } from 'lucide-react'

interface ReportTableProps {
  columns: ReportColumn[]
  data: any[]
  onSort?: (columnName: string) => void
  sortBy?: string
  sortDirection?: 'ASC' | 'DESC'
}

export default function ReportTable({ columns, data, onSort, sortBy, sortDirection }: ReportTableProps) {
  // Validação de dados
  if (!columns || columns.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        Nenhuma coluna definida para este relatório
      </div>
    )
  }

  const formatValue = (value: any, column: ReportColumn) => {
    if (value === null || value === undefined) return '-'

    // Backend envia fieldType, mas também aceitar type por compatibilidade
    const type = (column.fieldType || column.type || 'string').toLowerCase()

    switch (type) {
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
      
      case 'boolean':
        return value ? 'Sim' : 'Não'
      
      default:
        return String(value)
    }
  }

  const getTextAlign = (column: ReportColumn) => {
    // Verificar se tem align definido explicitamente
    if (column.align) {
      switch (column.align) {
        case 'center':
          return 'text-center'
        case 'right':
          return 'text-right'
        default:
          return 'text-left'
      }
    }
    
    // Se não tem align, usar tipo para determinar
    const type = (column.fieldType || column.type || 'string').toLowerCase()
    const numericTypes = ['number', 'decimal', 'currency']
    return numericTypes.includes(type) ? 'text-right' : 'text-left'
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.name}
                className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${getTextAlign(column)}`}
                style={{ width: column.width ? `${column.width}px` : undefined }}
              >
                {column.sortable && onSort ? (
                  <button
                    onClick={() => onSort(column.name)}
                    className={`flex items-center gap-1 hover:text-gray-700 ${getTextAlign(column) === 'text-right' ? 'justify-end w-full' : ''}`}
                  >
                    {column.displayName}
                    {sortBy === column.name && (
                      <span className="text-purple-600">
                        {sortDirection === 'ASC' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                ) : (
                  column.displayName
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {!data || data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                Nenhum registro encontrado
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {columns.map((column) => {
                  const value = row[column.name]
                  const type = (column.fieldType || column.type || 'string').toLowerCase()
                  
                  // Renderizar ícone para boolean
                  if (type === 'boolean') {
                    return (
                      <td
                        key={column.name}
                        className={`px-6 py-4 whitespace-nowrap text-sm ${getTextAlign(column)}`}
                      >
                        {value ? (
                          <Check className="text-green-600" size={18} />
                        ) : (
                          <X className="text-red-600" size={18} />
                        )}
                      </td>
                    )
                  }
                  
                  return (
                    <td
                      key={column.name}
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${getTextAlign(column)}`}
                    >
                      {formatValue(value, column)}
                    </td>
                  )
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
