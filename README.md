# Solis Admin - Frontend

Frontend React do sistema de administração Solis com suporte multitenant.

## Características

- **Multitenant**: Identifica o tenant através do subdomínio da URL
- **Autenticação**: Sistema de login com JWT
- **Header x-tenant**: Todas as requisições ao backend incluem automaticamente o header x-tenant
- **Rotas protegidas**: Dashboard acessível apenas para usuários autenticados

## Estrutura do Projeto

```
src/
├── components/        # Componentes reutilizáveis
│   └── PrivateRoute.jsx
├── pages/            # Páginas da aplicação
│   ├── Login.jsx
│   ├── Login.css
│   ├── Dashboard.jsx
│   └── Dashboard.css
├── services/         # Serviços e APIs
│   └── api.js
├── utils/           # Utilitários
│   └── tenant.js
├── App.jsx
├── main.jsx
└── index.css
```

## Como usar

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
npm run dev
```

O frontend será iniciado em `http://localhost:5173`

### Build para produção

```bash
npm run build
```

## Tenant em Desenvolvimento

Para desenvolvimento local (localhost), o sistema usa um tenant padrão armazenado no localStorage. 

Para definir um tenant específico durante o desenvolvimento, abra o console do navegador e execute:

```javascript
localStorage.setItem('dev-tenant', 'seu-tenant');
```

Em produção, o tenant é extraído automaticamente do subdomínio da URL (ex: `tenant1.solis.com` → `tenant1`).

## API Backend

O frontend está configurado para se conectar ao backend em `http://localhost:3000`.

Todas as requisições incluem automaticamente:
- Header `x-tenant`: Identifica o tenant
- Header `Authorization`: Token JWT (quando autenticado)

## Rotas

- `/login` - Página de login
- `/dashboard` - Página principal (protegida)
- `/` - Redireciona para o dashboard

## Documentação da API

A documentação da API está disponível em `http://localhost:3000/docs`
