import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

// Dynamic CRUD Components
import EntityForm from './components/DynamicCrud/EntityForm'
import EntityDetail from './components/DynamicCrud/EntityDetail'
import EntityPage from './components/DynamicCrud/EntityPage'

// Components
import PrivateRoute from './components/PrivateRoute'
import Layout from './components/Layout'
import TenantValidator from './components/TenantValidator'

// Hooks
import { useAuthInit } from './hooks/useAuthInit'

// Criar cliente do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 30, // 30 minutos
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function AppRoutes() {
  return (
    <Routes>
      {/* Rota de login */}
      <Route path="/login" element={<Login />} />
      
      {/* Rotas protegidas com Layout */}
      <Route 
        path="/dashboard" 
        element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        } 
      />
      
      {/* Dynamic CRUD - Rotas genéricas para todas as entidades */}
      
      {/* Novo registro - DEVE VIR ANTES da rota de detalhes */}
      <Route 
        path="/crud/:entity/new" 
        element={
          <PrivateRoute>
            <Layout>
              <EntityForm />
            </Layout>
          </PrivateRoute>
        } 
      />
      
      {/* Editar registro - DEVE VIR ANTES da rota de detalhes */}
      <Route 
        path="/crud/:entity/:id/edit" 
        element={
          <PrivateRoute>
            <Layout>
              <EntityForm />
            </Layout>
          </PrivateRoute>
        } 
      />
      
      {/* Ver detalhes - Rota genérica que pega qualquer ID */}
      <Route 
        path="/crud/:entity/:id" 
        element={
          <PrivateRoute>
            <Layout>
              <EntityDetail />
            </Layout>
          </PrivateRoute>
        } 
      />
      
      {/* Lista */}
      <Route 
        path="/crud/:entity" 
        element={
          <PrivateRoute>
            <Layout>
              <EntityPage />
            </Layout>
          </PrivateRoute>
        } 
      />
      
      {/* Rota raiz redireciona para dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

function App() {
  // Inicializa dados do usuário se houver token (apenas uma vez)
  useAuthInit()

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TenantValidator>
          <AppRoutes />
        </TenantValidator>
      </BrowserRouter>
      
      {/* Dev tools - só aparece em desenvolvimento */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
