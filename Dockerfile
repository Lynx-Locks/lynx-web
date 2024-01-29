FROM golang:1.21-bookworm

WORKDIR /backend

COPY backend .
RUN go mod download
RUN go build -o /lynx-backend

EXPOSE 5001

CMD ["/lynx-backend"]

