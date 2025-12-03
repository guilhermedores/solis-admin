export interface Report {
  name: string
  displayName: string
  description?: string
  category?: string
  icon?: string
  permissions?: string[]
}

export interface ReportMetadata {
  name: string
  displayName: string
  description?: string
  category?: string
  filters: ReportFilter[]
  fields: ReportColumn[]  // Backend retorna 'fields', não 'columns'
  columns?: ReportColumn[]  // Manter compatibilidade
  supportsPagination: boolean
  supportsExport: boolean
  defaultPageSize?: number
}

export interface ReportFilter {
  name: string
  displayName: string
  fieldType: 'text' | 'number' | 'date' | 'datetime' | 'boolean' | 'select' | 'multiselect'
  filterType?: string  // 'equals', 'contains', etc.
  type?: 'text' | 'number' | 'date' | 'datetime' | 'boolean' | 'select' | 'multiselect'  // Manter compatibilidade
  required: boolean
  defaultValue?: any
  options?: FilterOption[]
  placeholder?: string
  description?: string
}

export interface FilterOption {
  value: string | number | boolean
  label: string
}

export interface ReportColumn {
  name: string
  displayName: string
  type?: string  // Compatibilidade
  fieldType?: string  // Backend envia fieldType
  format?: string
  width?: number
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
}

export interface ReportExecutionRequest {
  filters?: Record<string, any>
  page?: number
  pageSize?: number
  sortBy?: string
  sortDirection?: 'ASC' | 'DESC'
}

export interface ReportExecutionResponse {
  data: any[]
  pagination: {
    page: number
    pageSize: number
    totalRecords: number
    totalPages: number
  }
}

export interface ReportsListResponse {
  reports: Report[]
}
