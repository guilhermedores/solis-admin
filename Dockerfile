# Multi-stage build para solis-admin (Frontend Vite + React)
FROM node:24-alpine AS build

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação Vite
RUN npm run build

# Stage de produção com Nginx
FROM nginx:alpine

# Copiar configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar build do Vite para o Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expor porta 3000
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]