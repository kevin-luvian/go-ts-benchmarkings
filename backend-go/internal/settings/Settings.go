package settings

import (
	"fmt"
	"log"
	"os"
	"strconv"
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
	Retries     int
	MaxActive   int
	MaxIdle     int
	MaxLifetime time.Duration
}

type RedisSetting struct {
	Host        string
	Password    string
	QueueName   string
	MaxIdle     int
	MaxActive   int
	IdleTimeout time.Duration
	MaxAge      time.Duration
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
		Retries:     3,
		MaxActive:   15,
		MaxIdle:     7,
		MaxLifetime: 5 * time.Minute,
	}

	Redis = &RedisSetting{
		Host:        "localhost:9101",
		Password:    "redispassword",
		QueueName:   "progress-queue",
		MaxIdle:     10,
		MaxActive:   10,
		IdleTimeout: 5 * time.Minute,
		MaxAge:      1 * time.Hour,
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
	Server.HttpPort, _ = strconv.Atoi(setOrDefault(os.Getenv("PORT"), fmt.Sprint(Server.HttpPort)))

	Database.URL = setOrDefault(os.Getenv("DATABASE_URL"), Database.URL)

	Redis.Host = setOrDefault(os.Getenv("REDIS_HOST"), Redis.Host)
	Redis.QueueName = setOrDefault(os.Getenv("REDIS_QUEUE_NAME"), Redis.QueueName)
}
