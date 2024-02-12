# Backend
FROM golang:1.21-alpine AS backend

RUN apk --no-cache add build-base

WORKDIR /backend

COPY backend .
RUN go mod download
RUN go build -ldflags "-linkmode external -extldflags -static" -o /lynx-backend

EXPOSE 5001

CMD ["/lynx-backend"]

# Frontend Dependencies
FROM node:21-alpine AS base

# WORKDIR in docker container
WORKDIR /frontend

# Docker uses caching so install all the dependencies first
COPY frontend/package*.json ./

RUN npm install

# Frontend Development
FROM base AS dev
ENV NODE_ENV=development
ENV WATCHPACK_POLLING=true

# WORKDIR in docker container
WORKDIR /frontend

COPY --from=base /frontend/node_modules ./node_modules
COPY frontend .

EXPOSE 3000
CMD npm run dev

# Frontend Static Build
FROM base AS builder

COPY --from=base /frontend/node_modules ./node_modules
COPY frontend .
RUN npm run build

# Production
FROM scratch as prod
ENV NODE_ENV=production

COPY --from=builder /frontend/out /static
COPY --from=backend /lynx-backend /lynx-backend

EXPOSE 5001
CMD ["/lynx-backend"]
