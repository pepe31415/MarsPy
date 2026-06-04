# ── Etapa 1: BUILD ──────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci                  # Instala TODO (dev + prod)

COPY . .
RUN npm run build           # Compila TypeScript → dist/

# ── Etapa 2: PRODUCCIÓN ─────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production   # Ahora sí, solo prod

# Solo el JS compilado
COPY --from=builder /app/dist ./dist   
COPY --from=builder /app/assets ./assets

EXPOSE 3001

CMD ["node", "dist/index.js"]
