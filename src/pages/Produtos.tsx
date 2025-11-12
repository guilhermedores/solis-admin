import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, X, Search, Package, Barcode } from 'lucide-react'
import { api } from '../lib/api'

interface Produto {
  id: string
  codigo_barras: string | null
  codigo_interno: string | null
  nome: string
  descricao: string | null
  unidade_medida: string
  ncm: string | null
  cest: string | null
  ativo: boolean
  created_at: string
  updated_at: string
  preco_venda: number | null
  preco_custo: number | null
}

interface ProdutoForm {
  codigo_barras: string
  codigo_interno: string
  nome: string
  descricao: string
  unidade_medida: string
  ncm: string
  cest: string
  preco_venda: string
  preco_custo: string
  ativo: boolean
}

export default function Produtos() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Produto | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  
  const queryClient = useQueryClient()

  // Estado do formulário
  const [formData, setFormData] = useState<ProdutoForm>({
    codigo_barras: '',
    codigo_interno: '',
    nome: '',
    descricao: '',
    unidade_medida: 'UN',
    ncm: '',
    cest: '',
    preco_venda: '',
    preco_custo: '',
    ativo: true,
  })

  // Query para listar produtos
  const { data: produtosData, isLoading } = useQuery({
    queryKey: ['produtos', searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      
      const response = await api.get(`/api/produtos?${params.toString()}`)
      return response.data
    },
  })

  const produtos = produtosData?.produtos || []

  // Mutation para criar produto
  const createMutation = useMutation({
    mutationFn: async (data: ProdutoForm) => {
      const payload = {
        ...data,
        preco_venda: parseFloat(data.preco_venda) || 0,
        preco_custo: data.preco_custo ? parseFloat(data.preco_custo) : null,
      }
      const response = await api.post('/api/produtos', payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      closeModal()
    },
  })

  // Mutation para atualizar produto
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProdutoForm> }) => {
      const payload: any = { ...data }
      if (data.preco_venda) {
        payload.preco_venda = parseFloat(data.preco_venda)
      }
      if (data.preco_custo) {
        payload.preco_custo = parseFloat(data.preco_custo)
      }
      const response = await api.put(`/api/produtos/${id}`, payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      closeModal()
    },
  })

  // Mutation para deletar produto
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/produtos/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      setDeleteConfirm(null)
    },
  })

  const openModal = (product?: Produto) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        codigo_barras: product.codigo_barras || '',
        codigo_interno: product.codigo_interno || '',
        nome: product.nome,
        descricao: product.descricao || '',
        unidade_medida: product.unidade_medida,
        ncm: product.ncm || '',
        cest: product.cest || '',
        preco_venda: product.preco_venda?.toString() || '',
        preco_custo: product.preco_custo?.toString() || '',
        ativo: product.ativo,
      })
    } else {
      setEditingProduct(null)
      setFormData({
        codigo_barras: '',
        codigo_interno: '',
        nome: '',
        descricao: '',
        unidade_medida: 'UN',
        ncm: '',
        cest: '',
        preco_venda: '',
        preco_custo: '',
        ativo: true,
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
    setFormData({
      codigo_barras: '',
      codigo_interno: '',
      nome: '',
      descricao: '',
      unidade_medida: 'UN',
      ncm: '',
      cest: '',
      preco_venda: '',
      preco_custo: '',
      ativo: true,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id)
  }

  const formatCurrency = (value: number | null) => {
    if (value === null) return '-'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Package className="w-8 h-8 text-purple-600" />
              Gestão de Produtos
            </h1>
            <p className="text-gray-600 mt-1">
              Cadastre e gerencie os produtos da sua loja
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Novo Produto
          </button>
        </div>
      </div>

      {/* Barra de pesquisa */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Pesquisar por nome, código de barras ou código interno..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Lista de produtos */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando produtos...</p>
          </div>
        ) : produtos.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
            </p>
          </div>
        ) : (
          <>
            {/* Tabela desktop */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Códigos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço Venda
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {produtos.map((product: Produto) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{product.nome}</div>
                      {product.descricao && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {product.descricao}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {product.codigo_barras && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Barcode className="w-3 h-3" />
                          {product.codigo_barras}
                        </div>
                      )}
                      {product.codigo_interno && (
                        <div className="text-xs text-gray-500">
                          Cód: {product.codigo_interno}
                        </div>
                      )}
                      {!product.codigo_barras && !product.codigo_interno && (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{product.unidade_medida}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(product.preco_venda)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.ativo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {product.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(product)}
                          className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {deleteConfirm === product.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="text-red-600 hover:text-red-900 px-3 py-1 text-xs font-semibold hover:bg-red-50 rounded transition-colors"
                            >
                              Confirmar
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="text-gray-600 hover:text-gray-900 px-3 py-1 text-xs font-semibold hover:bg-gray-50 rounded transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(product.id)}
                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards mobile */}
          <div className="lg:hidden divide-y divide-gray-200">
            {produtos.map((product: Produto) => (
              <div key={product.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{product.nome}</h3>
                    {product.descricao && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.descricao}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <button
                      onClick={() => openModal(product)}
                      className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    {deleteConfirm === product.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900 px-2 py-1 text-xs font-semibold hover:bg-red-50 rounded transition-colors"
                        >
                          OK
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="text-gray-600 hover:text-gray-900 px-2 py-1 text-xs font-semibold hover:bg-gray-50 rounded transition-colors"
                        >
                          X
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(product.id)}
                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  {(product.codigo_barras || product.codigo_interno) && (
                    <div className="flex items-center gap-2 text-gray-600">
                      {product.codigo_barras && (
                        <div className="flex items-center gap-1">
                          <Barcode className="w-3 h-3" />
                          {product.codigo_barras}
                        </div>
                      )}
                      {product.codigo_interno && (
                        <span className="text-xs">Cód: {product.codigo_interno}</span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Unidade: {product.unidade_medida}</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(product.preco_venda)}
                    </span>
                  </div>
                  <div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        product.ativo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {product.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </>
        )}
      </div>

      {/* Modal de cadastro/edição */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header do modal */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ex: Coca-Cola 2L"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unidade de Medida *
                  </label>
                  <select
                    value={formData.unidade_medida}
                    onChange={(e) =>
                      setFormData({ ...formData, unidade_medida: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="UN">Unidade (UN)</option>
                    <option value="KG">Quilograma (KG)</option>
                    <option value="LT">Litro (LT)</option>
                    <option value="MT">Metro (MT)</option>
                    <option value="CX">Caixa (CX)</option>
                    <option value="PC">Peça (PC)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Descrição detalhada do produto"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código de Barras
                  </label>
                  <input
                    type="text"
                    value={formData.codigo_barras}
                    onChange={(e) =>
                      setFormData({ ...formData, codigo_barras: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="7891000100103"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código Interno
                  </label>
                  <input
                    type="text"
                    value={formData.codigo_interno}
                    onChange={(e) =>
                      setFormData({ ...formData, codigo_interno: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="PROD001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preço de Venda * (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.preco_venda}
                    onChange={(e) =>
                      setFormData({ ...formData, preco_venda: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preço de Custo (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.preco_custo}
                    onChange={(e) =>
                      setFormData({ ...formData, preco_custo: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NCM
                  </label>
                  <input
                    type="text"
                    value={formData.ncm}
                    onChange={(e) => setFormData({ ...formData, ncm: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="00000000"
                    maxLength={8}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CEST
                  </label>
                  <input
                    type="text"
                    value={formData.cest}
                    onChange={(e) => setFormData({ ...formData, cest: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0000000"
                    maxLength={7}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="ativo" className="text-sm font-medium text-gray-700">
                  Produto ativo
                </label>
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Salvando...'
                    : editingProduct
                    ? 'Atualizar'
                    : 'Cadastrar'}
                </button>
              </div>

              {/* Mensagens de erro */}
              {(createMutation.isError || updateMutation.isError) && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {(createMutation.error as any)?.response?.data?.error ||
                    (updateMutation.error as any)?.response?.data?.error ||
                    'Erro ao salvar produto'}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
