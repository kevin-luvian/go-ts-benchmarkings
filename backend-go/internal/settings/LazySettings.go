package settings

import "time"

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
