# Docker - Solis Admin

## 🚀 Quick Start

### Produção

```bash
# Build e iniciar
docker-compose up -d

# Acessar
http://localhost:3000
```

### Desenvolvimento

```bash
# Iniciar em modo desenvolvimento
docker-compose --profile dev up admin-dev

# Acessar
http://localhost:5173
```

## 📋 Comandos Úteis

### Build

```bash
# Build da imagem de produção
docker-compose build

# Build sem cache
docker-compose build --no-cache

# Build apenas do serviço específico
docker-compose build admin-frontend
```

### Execução

```bash
# Iniciar serviços
docker-compose up -d

# Iniciar e ver logs
docker-compose up

# Parar serviços
docker-compose down

# Parar e remover volumes
docker-compose down -v
```

### Logs e Monitoramento

```bash
# Ver logs
docker-compose logs -f

# Ver logs de serviço específico
docker-compose logs -f admin-frontend

# Ver status dos containers
docker-compose ps

# Inspecionar container
docker-compose exec admin-frontend sh
```

### Limpeza

```bash
# Remover containers parados
docker-compose down

# Remover tudo (containers, networks, images)
docker-compose down --rmi all

# Limpar cache do Docker
docker system prune -a
```

## 🏗️ Estrutura

### Multi-stage Build

O Dockerfile usa multi-stage build para otimização:

1. **Stage Build**: Compila a aplicação React com Vite
2. **Stage Production**: Serve os arquivos estáticos com Nginx

### Serviços

- **admin-frontend**: Aplicação em produção (porta 3000)
- **admin-dev**: Servidor de desenvolvimento com hot-reload (porta 5173)

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# API Backend
VITE_API_URL=http://localhost:4000

# Outras configurações
NODE_ENV=production
```

### Customizar Portas

Edite o `docker-compose.yml`:

```yaml
ports:
  - "8080:80"  # Mudar porta 3000 para 8080
```

## 📦 Tamanho da Imagem

A imagem final é otimizada:

- **Build stage**: ~1.2GB (Node.js + dependências)
- **Production stage**: ~25MB (Nginx Alpine + arquivos estáticos)

## 🔒 Segurança

- Container roda como usuário não-root
- Apenas porta 80 exposta
- Healthcheck configurado
- Nginx otimizado e hardened

## 🌐 Nginx

A configuração do Nginx inclui:

- Suporte para SPA (Single Page Application)
- Gzip compression
- Cache de assets estáticos
- Healthcheck endpoint (`/health`)
- Security headers

## 🚨 Troubleshooting

### Container não inicia

```bash
# Ver logs detalhados
docker-compose logs admin-frontend

# Verificar se a porta está em uso
netstat -ano | findstr :3000
```

### Rebuild após mudanças

```bash
# Rebuild e reiniciar
docker-compose up -d --build
```

### Permissões no desenvolvimento

```bash
# Se houver problemas com permissões em volumes
docker-compose down -v
docker-compose up -d
```

## 🔄 CI/CD

### Build para registry

```bash
# Tag da imagem
docker tag solis-admin-frontend:latest registry.example.com/solis-admin:latest

# Push para registry
docker push registry.example.com/solis-admin:latest
```

## 📊 Healthcheck

O healthcheck verifica se a aplicação está respondendo:

- Intervalo: 30s
- Timeout: 10s
- Retries: 3
- Start period: 40s

Testar manualmente:

```bash
curl http://localhost:3000/health
```

## 🎯 Próximos Passos

1. Configurar variáveis de ambiente para diferentes ambientes
2. Adicionar serviços de backend no docker-compose
3. Configurar reverse proxy (Traefik/Nginx)
4. Setup de SSL/TLS para produção
