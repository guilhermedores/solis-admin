# Multi-stage build para solis-admin (Frontend Vite + React)
FROM node:24-alpine AS build

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências (usar install pois package-lock.json pode não existir)
RUN npm install --production=false

# Copiar código fonte
COPY . .

# Build arguments para variáveis Vite (passadas do Digital Ocean)
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Build da aplicação Vite (variáveis são embutidas no build)
RUN npm run build -- --mode production || npm run build:vite || npx vite build

# Stage de produção com Nginx
FROM nginx:alpine

# Copiar configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar build do Vite para o Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expor porta 3000
EXPOSE 3000

# Health check (verificar se nginx está respondendo)
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]