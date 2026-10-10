# ============================================================
# DOCKERFILE FRONTEND (Multi-Stage Build React + Nginx Alpine)
# ============================================================

# Étape 1 : Compilation du bundle React avec Vite
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . ./
RUN npm run build

# Étape 2 : Serveur de production ultra-léger Nginx Alpine
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
