import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Usuarios from './pages/Usuarios'
import Produtos from './pages/Produtos'

// Components
import PrivateRoute from './components/PrivateRoute'
import RoleGuard from './components/RoleGuard'
import Layout from './components/Layout'

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
  // Inicializa dados do usuário se houver token
  useAuthInit()

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
      
      {/* Rota de produtos */}
      <Route 
        path="/produtos" 
        element={
          <PrivateRoute>
            <Layout>
              <Produtos />
            </Layout>
          </PrivateRoute>
        } 
      />
      
      {/* Rota de usuários - apenas admin */}
      <Route 
        path="/usuarios" 
        element={
          <PrivateRoute>
            <RoleGuard allowedRoles={['admin']}>
              <Layout>
                <Usuarios />
              </Layout>
            </RoleGuard>
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
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      
      {/* Dev tools - só aparece em desenvolvimento */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
