import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ShoppingCart,
  Package,
  CreditCard,
  Receipt,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react'
import { useSale } from '../hooks/useSales'
import { SaleStatus, PaymentStatus, PaymentProcessStatus } from '../types/sales'

export default function SaleDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: sale, isLoading, error } = useSale(id)

  // Mapas de status para exibição
  const statusLabels: Record<SaleStatus, string> = {
    pending: 'Pendente',
    processing: 'Processando',
    completed: 'Concluída',
    canceled: 'Cancelada',
  }

  const statusColors: Record<SaleStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    processing: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    canceled: 'bg-red-100 text-red-800 border-red-200',
  }

  const statusIcons: Record<SaleStatus, JSX.Element> = {
    pending: <Clock className="w-5 h-5" />,
    processing: <AlertCircle className="w-5 h-5" />,
    completed: <CheckCircle className="w-5 h-5" />,
    canceled: <XCircle className="w-5 h-5" />,
  }

  const paymentStatusLabels: Record<PaymentStatus, string> = {
    unpaid: 'Não Pago',
    partial: 'Parcial',
    paid: 'Pago',
    refunded: 'Reembolsado',
  }

  const paymentStatusColors: Record<PaymentStatus, string> = {
    unpaid: 'bg-gray-100 text-gray-800 border-gray-200',
    partial: 'bg-orange-100 text-orange-800 border-orange-200',
    paid: 'bg-green-100 text-green-800 border-green-200',
    refunded: 'bg-purple-100 text-purple-800 border-purple-200',
  }

  const paymentProcessStatusLabels: Record<PaymentProcessStatus, string> = {
    pending: 'Pendente',
    processing: 'Processando',
    processed: 'Processado',
    failed: 'Falhou',
    refunded: 'Reembolsado',
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(dateString))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Carregando detalhes da venda...</div>
      </div>
    )
  }

  if (error || !sale) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/sales')}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
        >
          <ArrowLeft size={20} />
          Voltar para Vendas
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
          Erro ao carregar detalhes da venda. Venda não encontrada.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/sales')}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium transition-colors"
        >
          <ArrowLeft size={20} />
          Voltar para Vendas
        </button>
      </div>

      {/* Cabeçalho da Venda */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-xl">
              <ShoppingCart className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Detalhes da Venda</h1>
              <p className="text-sm text-gray-600 mt-1">
                {formatDateTime(sale.saleDateTime)}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${
                statusColors[sale.status]
              }`}
            >
              {statusIcons[sale.status]}
              <span className="font-semibold">{statusLabels[sale.status]}</span>
            </div>
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${
                paymentStatusColors[sale.paymentStatus]
              }`}
            >
              <DollarSign className="w-5 h-5" />
              <span className="font-semibold">{paymentStatusLabels[sale.paymentStatus]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-purple-600" />
          Resumo Financeiro
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Subtotal</p>
            <p className="text-xl font-bold text-gray-800">{formatCurrency(sale.subtotal)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Descontos</p>
            <p className="text-xl font-bold text-orange-600">
              -{formatCurrency(sale.discountTotal)}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Impostos</p>
            <p className="text-xl font-bold text-blue-600">+{formatCurrency(sale.taxTotal)}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
            <p className="text-sm text-purple-600 mb-1 font-semibold">Total</p>
            <p className="text-2xl font-bold text-purple-600">{formatCurrency(sale.total)}</p>
          </div>
        </div>
      </div>

      {/* Itens da Venda */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-600" />
            Itens da Venda ({sale.items.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produto
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preço Unit.
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Desconto
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Impostos
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sale.items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.description}</p>
                      <p className="text-xs text-gray-500 font-mono">SKU: {item.sku}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-semibold text-gray-900">{item.quantity}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-900">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-orange-600 font-semibold">
                    {item.discountAmount > 0 ? `-${formatCurrency(item.discountAmount)}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm font-semibold text-blue-600">
                      +{formatCurrency(item.taxAmount)}
                    </div>
                    {item.taxes.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {item.taxes.map((tax, idx) => (
                          <div key={tax.id}>
                            {tax.taxTypeCode}: {tax.rate}% = {formatCurrency(tax.amount)}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={5} className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                  Total dos Itens:
                </td>
                <td className="px-6 py-4 text-right text-lg font-bold text-purple-600">
                  {formatCurrency(sale.items.reduce((sum, item) => sum + item.total, 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Pagamentos */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-600" />
            Pagamentos ({sale.payments.length})
          </h2>
        </div>

        {sale.payments.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Nenhum pagamento registrado</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método de Pagamento
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Troco
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Processado em
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sale.payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">Dinheiro</p>
                      {payment.acquirerTxnId && (
                        <p className="text-xs text-gray-500 mt-1">
                          TXN: {payment.acquirerTxnId}
                        </p>
                      )}
                      {payment.authorizationCode && (
                        <p className="text-xs text-gray-500">
                          Auth: {payment.authorizationCode}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-green-600">
                        {formatCurrency(payment.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">
                      {payment.changeAmount ? formatCurrency(payment.changeAmount) : '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          payment.status === 'processed'
                            ? 'bg-green-100 text-green-800'
                            : payment.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {paymentProcessStatusLabels[payment.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatDateTime(payment.processedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                    Total Pago:
                  </td>
                  <td className="px-6 py-4 text-right text-lg font-bold text-green-600">
                    {formatCurrency(sale.payments.reduce((sum, p) => sum + p.amount, 0))}
                  </td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Cancelamento (se houver) */}
      {sale.cancellation && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <h2 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            Informações de Cancelamento
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-red-700 mb-1">Motivo</p>
              <p className="font-semibold text-red-900">{sale.cancellation.reason}</p>
            </div>
            <div>
              <p className="text-sm text-red-700 mb-1">Data do Cancelamento</p>
              <p className="font-semibold text-red-900">
                {formatDateTime(sale.cancellation.canceledAt)}
              </p>
            </div>
            <div>
              <p className="text-sm text-red-700 mb-1">Tipo de Cancelamento</p>
              <p className="font-semibold text-red-900">
                {sale.cancellation.cancellationType === 'total' ? 'Total' : 'Parcial'}
              </p>
            </div>
            <div>
              <p className="text-sm text-red-700 mb-1">Origem</p>
              <p className="font-semibold text-red-900 uppercase">
                {sale.cancellation.source}
              </p>
            </div>
            {sale.cancellation.refundAmount > 0 && (
              <div>
                <p className="text-sm text-red-700 mb-1">Valor Reembolsado</p>
                <p className="text-xl font-bold text-red-900">
                  {formatCurrency(sale.cancellation.refundAmount)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
