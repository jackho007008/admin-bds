# Stage 1: Install dependencies
FROM node:20-alpine AS deps
RUN apk add --no-network --virtual .build-deps libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  elif [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Stage 2: Build the application
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js 15 tự động hiểu next.config.ts khi build
RUN npm run build

# Stage 3: Runner (Production image)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
# Tắt telemetry của Next.js nếu muốn
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy các file cần thiết từ builder
COPY --from=builder /app/public ./public
# Standalone folder chứa toàn bộ node_modules cần thiết và server.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 4000
ENV PORT 4000
# Host 0.0.0.0 để container có thể truy cập được từ bên ngoài
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]