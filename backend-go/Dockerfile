# Please keep up to date with the new-version of Golang docker for builder
FROM golang:1.20

RUN mkdir -p /app

WORKDIR /app

# Copy the custom Nginx configuration
COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o /binary ./server

# Expose the desired port (e.g., 80)
EXPOSE 8000

CMD ["/binary"]
