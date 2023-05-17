# Please keep up to date with the new-version of Golang docker for builder
FROM golang:1.20

RUN go install github.com/cosmtrek/air@latest

RUN mkdir -p /app

WORKDIR /app

COPY .env .env