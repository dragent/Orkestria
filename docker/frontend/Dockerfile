FROM node:20-alpine AS base
WORKDIR /app

# --- Dependencies ---
FROM base AS deps
COPY frontend/package*.json ./
RUN npm ci

# --- Development ---
FROM base AS development
COPY --from=deps /app/node_modules ./node_modules
COPY docker/frontend/docker-entrypoint-dev.sh /usr/local/bin/docker-entrypoint-dev.sh
# Strip CRLF (Windows clones) — otherwise Kernel reports ENOENT on shebang (/bin/sh\r)
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint-dev.sh && chmod +x /usr/local/bin/docker-entrypoint-dev.sh
COPY frontend/ .
EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/docker-entrypoint-dev.sh"]
CMD ["npm", "run", "dev"]

# --- Builder ---
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY frontend/ .
RUN npm run build

# --- Production ---
FROM base AS production
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
