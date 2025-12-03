import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FileText, Download, Search, RotateCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { useReportMetadata } from '../../hooks/useReportMetadata'
import { useReportExecution, useReportExport } from '../../hooks/useReportExecution'
import ReportFilter from './ReportFilter'
import ReportTable from './ReportTable'
import { ReportExecutionRequest } from '../../types/reports'

export default function ReportPage() {
  const { reportName } = useParams<{ reportName: string }>()
  const navigate = useNavigate()

  const [filters, setFilters] = useState<Record<string, any>>({})
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [sortBy, setSortBy] = useState<string>()
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC')
  const [reportData, setReportData] = useState<any>(null)

  // Buscar metadados do relatório
  const { data: metadata, isLoading: loadingMetadata, error: metadataError } = useReportMetadata(reportName!)

  console.log('[ReportPage] Metadata recebido:', metadata)

  // Normalizar metadata - backend usa 'fields' mas precisamos de 'columns'
  // Usar useMemo para evitar recriação a cada render (causa loop)
  const normalizedMetadata = useMemo(() => {
    if (!metadata) return null
    
    return {
      ...metadata,
      columns: metadata.fields || metadata.columns || [],
      filters: metadata.filters || [],
      supportsExport: metadata.supportsExport !== false, // Default true se não especificado
      supportsPagination: metadata.supportsPagination !== false, // Default true se não especificado
    }
  }, [metadata])

  console.log('[ReportPage] normalizedMetadata:', normalizedMetadata)
  console.log('[ReportPage] normalizedMetadata.filters:', normalizedMetadata?.filters)
  console.log('[ReportPage] normalizedMetadata.filters.length:', normalizedMetadata?.filters?.length)

  // Mutations para execução e exportação
  const executeMutation = useReportExecution(reportName!)
  const exportMutation = useReportExport(reportName!)

  // Inicializar filtros com valores padrão
  useEffect(() => {
    if (normalizedMetadata?.filters) {
      const defaultFilters: Record<string, any> = {}
      normalizedMetadata.filters.forEach((filter) => {
        if (filter.defaultValue !== undefined) {
          defaultFilters[filter.name] = filter.defaultValue
        }
      })
      setFilters(defaultFilters)
    }

    if (normalizedMetadata?.defaultPageSize) {
      setPageSize(normalizedMetadata.defaultPageSize)
    }
  }, [normalizedMetadata])

  const handleFilterChange = (filterName: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }))
  }

  const handleExecuteReport = async () => {
    // Validar filtros obrigatórios
    const missingFilters = normalizedMetadata?.filters.filter(
      (f) => f.required && !filters[f.name]
    )

    if (missingFilters && missingFilters.length > 0) {
      alert(`Preencha os filtros obrigatórios: ${missingFilters.map((f) => f.displayName).join(', ')}`)
      return
    }

    // Remover filtros vazios antes de enviar
    const cleanedFilters: Record<string, any> = {}
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        cleanedFilters[key] = value
      }
    })

    const request: ReportExecutionRequest = {
      filters: Object.keys(cleanedFilters).length > 0 ? cleanedFilters : undefined,
      page: page,
      pageSize: pageSize,
      sortBy,
      sortDirection,
    }

    console.log('[ReportPage] Request sendo enviado:', JSON.stringify(request, null, 2))

    try {
      const result = await executeMutation.mutateAsync(request)
      console.log('[ReportPage] Resultado da execução:', result)
      console.log('[ReportPage] Metadata columns:', normalizedMetadata?.columns)
      setReportData(result)
    } catch (error) {
      console.error('Erro ao executar relatório:', error)
      alert('Erro ao executar relatório')
    }
  }

  const handleExportReport = async () => {
    if (!normalizedMetadata?.supportsExport) return

    const request: ReportExecutionRequest = {
      filters,
      sortBy,
      sortDirection,
    }

    try {
      const blob = await exportMutation.mutateAsync(request)
      
      // Download do arquivo
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${reportName}_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Erro ao exportar relatório:', error)
      alert('Erro ao exportar relatório')
    }
  }

  const handleSort = (columnName: string) => {
    if (sortBy === columnName) {
      setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC')
    } else {
      setSortBy(columnName)
      setSortDirection('ASC')
    }
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  if (loadingMetadata) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando relatório...</p>
        </div>
      </div>
    )
  }

  if (metadataError || !normalizedMetadata) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Erro ao carregar relatório</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/reports')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FileText className="w-6 h-6 text-purple-600" />
              {normalizedMetadata.displayName}
            </h1>
            {normalizedMetadata.description && (
              <p className="text-gray-600 text-sm mt-1">{normalizedMetadata.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Filtros */}
      {normalizedMetadata.filters.length > 0 && (
        <>
          {console.log('[ReportPage] Renderizando filtros - length:', normalizedMetadata.filters.length)}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Filtros</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {normalizedMetadata.filters.map((filter) => (
                <ReportFilter
                  key={filter.name}
                  filter={filter}
                  value={filters[filter.name]}
                  onChange={(value) => handleFilterChange(filter.name, value)}
                />
              ))}
            </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleExecuteReport}
              disabled={executeMutation.isPending}
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {executeMutation.isPending ? (
                <RotateCw className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              {executeMutation.isPending ? 'Executando...' : 'Executar Relatório'}
            </button>

            {normalizedMetadata.supportsExport && reportData && (
              <button
                onClick={handleExportReport}
                disabled={exportMutation.isPending}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exportMutation.isPending ? (
                  <RotateCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {exportMutation.isPending ? 'Exportando...' : 'Exportar CSV'}
              </button>
            )}
          </div>
        </div>
        </>
      )}

      {/* Tabela de Resultados */}
      {reportData && reportData.data && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Mostrando {reportData.data.length} de {reportData.pagination.totalRecords} registro(s)
            </p>
            
            {normalizedMetadata.supportsPagination && reportData.pagination.totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <span className="text-sm text-gray-600">
                  Página {page} de {reportData.pagination.totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === reportData.pagination.totalPages}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <ReportTable
            columns={normalizedMetadata.columns}
            data={reportData.data || []}
            onSort={handleSort}
            sortBy={sortBy}
            sortDirection={sortDirection}
          />
        </div>
      )}
    </div>
  )
}
