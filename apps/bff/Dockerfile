FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/bff/package.json ./apps/bff/
COPY packages/shared/package.json ./packages/shared/

RUN npm ci --workspace=apps/bff --workspace=packages/shared

COPY packages/shared/ ./packages/shared/
COPY apps/bff/ ./apps/bff/
COPY tsconfig.json ./

RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=apps/bff

FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/apps/bff/package.json ./apps/bff/
COPY --from=builder /app/packages/shared/package.json ./packages/shared/

RUN npm ci --workspace=apps/bff --workspace=packages/shared --omit=dev

COPY --from=builder /app/apps/bff/dist ./apps/bff/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "apps/bff/dist/main.js"]
