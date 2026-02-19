# ============================================
# Stage 1: Build
# ============================================
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# Prisma config requires DATABASE_URL at load time; passed from docker-compose build args (.env) or default
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL:-sqlserver://localhost:1433;database=build;user=sa;password=build;encrypt=true;trustServerCertificate=true;}
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

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
