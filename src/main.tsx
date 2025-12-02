import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// StrictMode desabilitado temporariamente para evitar dupla montagem
// que causa loop entre Login e Dashboard
ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
)
