# Node 24: required for the built-in node:sqlite module (server/utils/db.ts).
# Platform is intentionally not pinned in FROM so `docker buildx --platform` controls
# the target arch (deploy.sh builds linux/arm64 for the Raspberry Pi).
FROM node:24-slim AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Build the Nuxt app
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM node:24-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NITRO_PORT=3000

COPY --from=builder /app/.output ./.output

# Persistent data dirs (mounted as volumes by docker-compose):
#  - ./.data            SQLite database (created on boot by the app)
#  - ./public/photos    uploaded photos
RUN mkdir -p /app/.data /app/public/photos

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
