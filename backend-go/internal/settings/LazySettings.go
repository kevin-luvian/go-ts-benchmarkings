package settings

import (
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
)

type ServerSetting struct {
	ENV          string
	RunMode      string
	HttpPort     int
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
	CORS         string
}

type DatabaseSetting struct {
	URL         string
	DOCKERURL   string
	Retries     int
	MaxActive   int
	MaxIdle     int
	MaxLifetime time.Duration
}

var (
	Server = &ServerSetting{
		ENV:          "local",
		RunMode:      "debug",
		HttpPort:     8000,
		ReadTimeout:  60 * time.Second,
		WriteTimeout: 60 * time.Second,
		CORS:         "*",
	}

	// mysql://USER:PASSWORD@HOST:PORT/DATABASE
	Database = &DatabaseSetting{
		URL: "mysql://user:password@localhost:9100/database",
		// URL:         "mysql://user:password@host.docker.internal:3306/database",
		DOCKERURL:   "mysql://user:password@host.docker.internal:3306/database",
		Retries:     3,
		MaxActive:   10,
		MaxIdle:     5,
		MaxLifetime: 5 * time.Minute,
	}
)

func setOrDefault(value string, def string) string {
	if value == "" {
		return def
	}
	return value
}

func Init() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file", err)
	}

	Server.ENV = setOrDefault(os.Getenv("ENV"), Server.ENV)
	Server.RunMode = setOrDefault(os.Getenv("RUN_MODE"), Server.RunMode)

	Database.URL = setOrDefault(os.Getenv("DATABASE_URL"), Database.URL)
}
