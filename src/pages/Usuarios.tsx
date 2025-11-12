import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, X, Search, UserCog } from 'lucide-react'
import { api } from '../lib/api'
import { UserRole } from '../stores/auth.store'

interface Usuario {
  id: string
  nome: string
  email: string
  role: UserRole
  tenantId: string
  ativo: boolean
  createdAt: string
  updatedAt: string
}

interface UsuarioForm {
  nome: string
  email: string
  password?: string
  role: UserRole
  ativo: boolean
}

export default function Usuarios() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<Usuario | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  
  const queryClient = useQueryClient()

  // Estado do formulário
  const [formData, setFormData] = useState<UsuarioForm>({
    nome: '',
    email: '',
    password: '',
    role: 'user',
    ativo: true,
  })

  // Query para listar usuários
  const { data: usuarios = [], isLoading } = useQuery<Usuario[]>({
    queryKey: ['usuarios'],
    queryFn: async () => {
      const response = await api.get('/api/usuarios')
      return response.data
    },
  })

  // Mutation para criar usuário
  const createMutation = useMutation({
    mutationFn: async (data: UsuarioForm) => {
      const response = await api.post('/api/usuarios', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      closeModal()
    },
  })

  // Mutation para atualizar usuário
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<UsuarioForm> }) => {
      const response = await api.patch(`/api/usuarios/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      closeModal()
    },
  })

  // Mutation para deletar usuário
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/usuarios/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      setDeleteConfirm(null)
    },
  })

  const openModal = (user?: Usuario) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        nome: user.nome,
        email: user.email,
        password: '',
        role: user.role,
        ativo: user.ativo,
      })
    } else {
      setEditingUser(null)
      setFormData({
        nome: '',
        email: '',
        password: '',
        role: 'user',
        ativo: true,
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
    setFormData({
      nome: '',
      email: '',
      password: '',
      role: 'user',
      ativo: true,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingUser) {
      // Atualizar - remove password se estiver vazio
      const updateData = { ...formData }
      if (!updateData.password) {
        delete updateData.password
      }
      updateMutation.mutate({ id: editingUser.id, data: updateData })
    } else {
      // Criar
      createMutation.mutate(formData)
    }
  }

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id)
  }

  // Filtrar usuários pela pesquisa
  const filteredUsuarios = usuarios.filter(user => 
    user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'manager':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Administrador'
      case 'manager':
        return 'Gerente'
      default:
        return 'Usuário'
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
              <UserCog className="w-8 h-8 text-purple-600" />
              Gestão de Usuários
            </h1>
            <p className="text-gray-600 mt-1">
              Cadastre e gerencie os usuários do sistema
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Novo Usuário
          </button>
        </div>
      </div>

      {/* Barra de pesquisa */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Pesquisar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Lista de usuários */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando usuários...</p>
          </div>
        ) : filteredUsuarios.length === 0 ? (
          <div className="p-8 text-center">
            <UserCog className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Função
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
                {filteredUsuarios.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.nome}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(user)}
                          className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {deleteConfirm === user.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDelete(user.id)}
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
                            onClick={() => setDeleteConfirm(user.id)}
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
        )}
      </div>

      {/* Modal de cadastro/edição */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header do modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="João da Silva"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="joao@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha {editingUser ? '(deixe em branco para não alterar)' : '*'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Função *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="user">Usuário</option>
                  <option value="manager">Gerente</option>
                  <option value="admin">Administrador</option>
                </select>
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
                  Usuário ativo
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
                    : editingUser
                    ? 'Atualizar'
                    : 'Cadastrar'}
                </button>
              </div>

              {/* Mensagens de erro */}
              {(createMutation.isError || updateMutation.isError) && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {(createMutation.error as any)?.response?.data?.error || 
                   (updateMutation.error as any)?.response?.data?.error || 
                   'Erro ao salvar usuário'}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
