FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 syncsellr
USER syncsellr
COPY --from=builder --chown=syncsellr:nodejs /app/dist ./dist
COPY --from=builder --chown=syncsellr:nodejs /app/package.json ./package.json
COPY --from=builder --chown=syncsellr:nodejs /app/package-lock.json ./package-lock.json
RUN npm ci --omit=dev

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

EXPOSE 4000
CMD ["node", "dist/index.js"]
