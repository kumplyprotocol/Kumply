FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm@10

COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

RUN pnpm install --frozen-lockfile

# Build SDK first — API depends on @kumply/sdk workspace package
WORKDIR /app/packages/sdk
RUN pnpm build

WORKDIR /app/apps/api
RUN pnpm build

# ── Production image ──
FROM node:20-alpine AS runner

WORKDIR /app

RUN npm install -g pnpm@10

COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/packages/ ./packages/
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/dist/ ./apps/api/dist/

RUN pnpm install --frozen-lockfile --prod

ENV NODE_ENV=production
ENV API_PORT=3001

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "apps/api/dist/index.js"]
