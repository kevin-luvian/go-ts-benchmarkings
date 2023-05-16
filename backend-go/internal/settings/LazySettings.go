package settings

import "time"

type ServerSetting struct {
	RunMode      string
	HttpPort     int
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
	CORS         string
}

var (
	Server = &ServerSetting{
		RunMode:      "debug",
		HttpPort:     8000,
		ReadTimeout:  60 * time.Second,
		WriteTimeout: 60 * time.Second,
		CORS:         "*",
	}
)
