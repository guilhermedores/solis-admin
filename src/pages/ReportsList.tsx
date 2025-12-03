import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FileText, ChevronRight } from 'lucide-react'
import { useReports } from '../hooks/useReports'

export default function ReportsList() {
  const { data: reportsResponse, isLoading, error } = useReports()

  // Agrupar relatórios por categoria
  const groupedReports = useMemo(() => {
    if (!reportsResponse?.reports || !Array.isArray(reportsResponse.reports)) {
      return {}
    }

    const grouped: Record<string, typeof reportsResponse.reports> = {}
    
    reportsResponse.reports.forEach((report) => {
      const category = report.category || 'Outros'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(report)
    })

    // Ordenar categorias alfabeticamente
    const sortedGrouped: Record<string, typeof reportsResponse.reports> = {}
    Object.keys(grouped)
      .sort()
      .forEach((key) => {
        sortedGrouped[key] = grouped[key]
      })

    return sortedGrouped
  }, [reportsResponse])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando relatórios...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Erro ao carregar relatórios</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="w-6 h-6 text-purple-600" />
          Relatórios
        </h1>
        <p className="text-gray-600 mt-1">Visualize e exporte relatórios do sistema</p>
      </div>

      {/* Lista de relatórios agrupados por categoria */}
      {Object.keys(groupedReports).length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Nenhum relatório disponível</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedReports).map(([category, reports]) => (
            <div key={category} className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">
                {category}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reports.map((report) => (
                  <Link
                    key={report.name}
                    to={`/reports/${report.name}`}
                    className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                          {report.displayName}
                        </h3>
                        {report.description && (
                          <p className="text-sm text-gray-600 mt-2">
                            {report.description}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors flex-shrink-0 ml-2" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
