# Solis Admin - Frontend

Frontend React + TypeScript do sistema de administração Solis com suporte multitenant.

## Tecnologias

- **React 19** - Framework UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utilitário
- **React Router** - Roteamento
- **React Query** - Gerenciamento de estado e cache de requisições
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones

## Características

- **Multitenant**: Identifica o tenant através do subdomínio da URL
- **Autenticação**: Sistema de login com JWT
- **Header x-tenant**: Todas as requisições ao backend incluem automaticamente o header x-tenant
- **Rotas protegidas**: Dashboard acessível apenas para usuários autenticados
- **TypeScript**: Tipagem completa em todo o projeto
- **Tailwind CSS**: Estilização moderna e responsiva

## Estrutura do Projeto

```
src/
├── components/       # Componentes reutilizáveis
│   └── PrivateRoute.tsx
├── pages/           # Páginas da aplicação
│   ├── Login.tsx
│   └── Dashboard.tsx
├── lib/             # Utilitários e configurações
│   └── api.ts
├── App.tsx
├── main.tsx
└── index.css
```

## Como usar

### Configuração

1. Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

2. Configure as variáveis de ambiente no arquivo `.env`:

```bash
# URL da API Backend
VITE_API_URL=http://localhost:3000

# Tenant padrão para desenvolvimento local
VITE_DEV_TENANT=demo
```

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

### Preview da build

```bash
npm run preview
```

## Tenant em Desenvolvimento

Para desenvolvimento local (localhost), o sistema usa o tenant configurado na variável de ambiente `VITE_DEV_TENANT` no arquivo `.env`.

Para alterar o tenant de desenvolvimento, edite o arquivo `.env`:

```bash
VITE_DEV_TENANT=seu-tenant
```

Em produção, o tenant é extraído automaticamente do subdomínio da URL (ex: `tenant1.solis.com` → `tenant1`).

## API Backend

O frontend está configurado para se conectar ao backend através da variável de ambiente `VITE_API_URL`.

Configure a URL da API no arquivo `.env`:

```bash
VITE_API_URL=http://localhost:3000
# ou em produção
VITE_API_URL=https://api.seudominio.com
```

Todas as requisições incluem automaticamente:
- Header `x-tenant`: Identifica o tenant
- Header `Authorization`: Token JWT (quando autenticado)

## Rotas

- `/login` - Página de login
- `/dashboard` - Página principal (protegida)
- `/` - Redireciona para o dashboard

## Documentação da API

A documentação da API está disponível em `http://localhost:3000/docs`
