import { useState, useEffect } from 'react'
import { useStores } from '../hooks/useStores'
import { useGenerateAgentToken } from '../hooks/useGenerateAgentToken'
import { 
  Copy, 
  Check, 
  AlertCircle, 
  Loader2,
  Terminal,
  X
} from 'lucide-react'

export default function AgentTokens() {
  const { data: stores, isLoading, error } = useStores()
  const generateToken = useGenerateAgentToken()
  
  const [selectedStore, setSelectedStore] = useState<string>('')
  const [agentName, setAgentName] = useState<string>('')
  const [generatedToken, setGeneratedToken] = useState<string>('')
  const [tokenInfo, setTokenInfo] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [showModal, setShowModal] = useState(false)

  // Auto-selecionar loja se houver apenas uma
  useEffect(() => {
    if (stores && stores.length === 1 && !selectedStore) {
      setSelectedStore(stores[0].id)
    }
  }, [stores, selectedStore])

  const handleGenerateToken = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedStore || !agentName) {
      alert('Selecione uma loja e informe o nome do agente')
      return
    }

    try {
      const result = await generateToken.mutateAsync({
        storeId: selectedStore,
        agentName: agentName,
      })
      
      setGeneratedToken(result.token)
      setTokenInfo(result)
    } catch (err: any) {
      console.error('Erro ao gerar token:', err)
      alert(err?.response?.data?.error || 'Erro ao gerar token')
    }
  }

  const handleCopyToken = async () => {
    try {
      await navigator.clipboard.writeText(generatedToken)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar token:', err)
    }
  }

  const handleReset = () => {
    setSelectedStore('')
    setAgentName('')
    setGeneratedToken('')
    setTokenInfo(null)
    setCopied(false)
  }

  const handleClose = () => {
    handleReset()
    setShowModal(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <p>Erro ao carregar lojas: {(error as Error).message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tokens de Agente PDV</h1>
            <p className="text-gray-600 text-sm mt-1">
              Gere tokens de autenticação para vincular agentes PDV às lojas
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Terminal className="h-4 w-4" />
          Gerar Token
        </button>
      </div>

      {/* Informações */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          ℹ️ Sobre os Tokens de Agente
        </h3>
        <div className="text-sm text-gray-700 space-y-1">
          <p>• Cada token vincula um agente PDV a uma loja específica</p>
          <p>• O token permite que o agente realize operações em nome da loja</p>
          <p>• Todas as vendas ficam vinculadas à loja do agente</p>
          <p>• Tokens têm validade de 10 anos</p>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Terminal className="h-6 w-6 text-blue-600" />
                Gerar Token de Agente
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6">
              {!generatedToken ? (
                <form onSubmit={handleGenerateToken} className="space-y-4">
                  {/* Seleção de Loja */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loja *
                    </label>
                    <select
                      value={selectedStore}
                      onChange={(e) => setSelectedStore(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      {stores?.map((store) => (
                        <option key={store.id} value={store.id}>
                          {store.name} {store.code ? `(${store.code})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Nome do Agente */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Agente PDV *
                    </label>
                    <input
                      type="text"
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                      placeholder="Ex: PDV Loja Centro - Caixa 1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Nome para identificar o terminal/caixa
                    </p>
                  </div>

                  {/* Botões */}
                  <div className="flex gap-2 pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={generateToken.isPending}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {generateToken.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Gerando...
                        </>
                      ) : (
                        'Gerar Token'
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  {/* Sucesso */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <Check className="h-12 w-12 text-green-600 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold text-green-900">Token Gerado!</h3>
                    <p className="text-sm text-green-700 mt-1">
                      {stores?.find(s => s.id === tokenInfo?.storeId)?.name} - {tokenInfo?.agentName}
                    </p>
                  </div>

                  {/* Token */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Token JWT
                    </label>
                    <div className="relative">
                      <textarea
                        value={generatedToken}
                        readOnly
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-xs resize-none"
                      />
                      <button
                        type="button"
                        onClick={handleCopyToken}
                        className="absolute top-2 right-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4 text-green-600" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copiar
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Instruções */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-yellow-900 mb-2">
                      ⚠️ Importante
                    </h4>
                    <ul className="text-xs text-yellow-800 space-y-1 list-disc list-inside">
                      <li>Copie este token e configure no agente PDV</li>
                      <li>O token tem validade de 10 anos</li>
                      <li>Guarde o token em local seguro</li>
                      <li>Validade até: {new Date(tokenInfo?.expiresAt).toLocaleDateString('pt-BR')}</li>
                    </ul>
                  </div>

                  {/* Botões */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleClose}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium"
                    >
                      Fechar
                    </button>
                    <button
                      onClick={handleReset}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                    >
                      Gerar Outro Token
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
