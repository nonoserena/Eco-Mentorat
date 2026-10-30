# ============================================================
# DOCKERFILE BACKEND (Node.js 22 Alpine - Sécurisé Non-Root)
# ============================================================

FROM node:22-alpine AS runner

WORKDIR /app

# Installation de curl pour le healthcheck Docker
RUN apk add --no-cache curl

# Copie des manifestes de dépendances
COPY package*.json ./

# Installation propre des dépendances de production avec résilience réseau
RUN npm config set fetch-retries 5 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm ci --omit=dev

# Copie du code source
COPY src ./src

# Attribution des permissions à l'utilisateur non-privilégié "node"
RUN chown -R node:node /app

USER node

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/ || exit 1

CMD ["node", "src/server.js"]
