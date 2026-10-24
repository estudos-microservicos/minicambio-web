# ---------- build ----------
FROM node:24-alpine AS build
WORKDIR /app

# Dependências numa camada própria: só é refeita quando package.json ou package-lock.json mudam.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- runtime ----------
FROM nginxinc/nginx-unprivileged:1.30.6-alpine AS runtime

# Endereço do Orders, injetado no template pelo envsubst da imagem. Pode ser sobrescrito por ambiente,
# então a mesma imagem serve qualquer ambiente sem rebuild.
ENV ORDERS_API_URL=http://orders-api:8080

COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

# A imagem base já roda como usuário não-root (uid 101) e escuta em 8080.
EXPOSE 8080
