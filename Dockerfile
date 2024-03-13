# Backend
FROM golang:1.21-alpine AS backend
ENV IS_DOCKER=true

ARG dev

RUN apk --no-cache add build-base ca-certificates

# Will copy .env if it exists (for dev), but will not fail the build if it does not (for prod)
COPY .env* /

WORKDIR /backend

COPY backend .
RUN go mod download
RUN if [[ -z "$dev" ]] ; \
    then echo "prod" && go build -ldflags "-linkmode external -extldflags -static" -o /lynx-backend ; \
    else echo "dev" && go build -o /lynx-backend ; fi  # A bit faster

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

FROM base AS production
ENV NODE_ENV=production

# WORKDIR in docker container
WORKDIR /frontend

COPY --from=base /frontend/node_modules ./node_modules
COPY frontend .

EXPOSE 3000
CMD npm run start

# Frontend Static Build
#FROM base AS builder
#ARG NEXT_PUBLIC_API_BASE_URL=BAKED_API_BASE_URL
#
#COPY --from=base /frontend/node_modules ./node_modules
#COPY frontend .
#RUN npm run build
#
## Production
#FROM scratch as prod
#ENV NODE_ENV=production
#
## Import static frontend
#COPY --from=builder /frontend/out /static
## Import compiled binary
#COPY --from=backend /lynx-backend /lynx-backend
## Import email template
#COPY --from=backend /backend/html/emailTemplate.html /html/emailTemplate.html
## Import the root ca-certificates (required for Let's Encrypt)
#COPY --from=backend /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
#
#EXPOSE 443
#EXPOSE 80
#
## Mount the certificate cache directory as a volume to avoid Let's Encrypt rate limits
#VOLUME ["/cert-cache"]
#
## Run the compiled binary
#CMD ["/lynx-backend"]
