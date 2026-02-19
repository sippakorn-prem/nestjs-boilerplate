# ============================================
# Stage 1: Build
# ============================================
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# ============================================
# Stage 2: Production
# ============================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
RUN npx prisma generate

EXPOSE 3000

CMD ["node", "dist/main.js"]
