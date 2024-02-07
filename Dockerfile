# Backend
FROM golang:1.21-bookworm AS backend

WORKDIR /backend

COPY backend .
RUN go mod download
RUN go build -o /lynx-backend

EXPOSE 5001

CMD ["/lynx-backend"]

# Frontend Development
FROM node:21-alpine AS base

RUN apk add --no-cache g++ make py3-pip libc6-compat

# WORKDIR in docker container
WORKDIR /frontend

# Docker uses caching so install all the dependencies first
COPY frontend/package*.json ./

EXPOSE 3000

FROM base AS dev
ENV NODE_ENV=dev
RUN npm install
COPY frontend .
CMD npm run dev

#Frontend Production
FROM base AS builder

COPY frontend .
RUN npm run build

FROM base as prod

ENV NODE_ENV=production
RUN npm ci

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

COPY --from=builder --chown=nextjs:nodejs /frontend/.next ./.next
COPY --from=builder /frontend/node_modules ./node_modules
COPY --from=builder /frontend/package.json ./package.json
COPY --from=builder /frontend/public ./public

CMD npm start