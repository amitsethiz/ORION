# ── Stage 1: Install dependencies ────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app
COPY package.json ./
RUN npm install --frozen-lockfile

# ── Stage 2: Build Next.js standalone output ──────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ── Stage 3: Minimal runtime image ───────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copy standalone build output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget -qO- http://localhost:3000 || exit 1

CMD ["node", "server.js"]
