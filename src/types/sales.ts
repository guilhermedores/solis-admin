// Sales Types - Frontend

export type SaleStatus = 'pending' | 'processing' | 'completed' | 'canceled'
export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'refunded'
export type PaymentProcessStatus = 'pending' | 'processing' | 'processed' | 'failed' | 'refunded'
export type CancellationType = 'total' | 'partial'
export type CancellationSource = 'pos' | 'api' | 'backoffice'

export interface SaleTax {
  id: string
  taxTypeId: string
  taxTypeCode: string
  taxRuleId: string | null
  baseAmount: number
  rate: number
  amount: number
}

export interface SaleItem {
  id: string
  productId: string
  sku: string
  description: string
  unitOfMeasure: string | null
  quantity: number
  unitPrice: number
  discountAmount: number
  taxAmount: number
  total: number
  taxes: SaleTax[]
}

export interface SalePayment {
  id: string
  paymentMethodId: string
  amount: number
  acquirerTxnId: string | null
  authorizationCode: string | null
  changeAmount: number | null
  status: PaymentProcessStatus
  processedAt: string | null
  createdAt: string
}

export interface SaleCancellation {
  id: string
  operatorId: string | null
  reason: string
  canceledAt: string
  source: CancellationSource
  cancellationType: CancellationType
  refundAmount: number
}

export interface Sale {
  id: string
  orderNumber: number
  clientSaleId: string | null
  storeId: string
  posId: string | null
  operatorId: string | null
  saleDateTime: string
  status: SaleStatus
  subtotal: number
  discountTotal: number
  taxTotal: number
  total: number
  paymentStatus: PaymentStatus
  createdAt: string
  updatedAt: string
  items: SaleItem[]
  payments: SalePayment[]
  cancellation: SaleCancellation | null
}

export interface SaleFilters {
  page?: number
  pageSize?: number
  status?: SaleStatus
  paymentStatus?: PaymentStatus
  startDate?: string
  endDate?: string
  storeId?: string
  posId?: string
  operatorId?: string
  search?: string
}

export interface SalesListResponse {
  data: Sale[]
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
}
