package main

import (
	"encoding/json"
	"fmt"
	"net"
	"net/http"

	iDB "benchgo/internal/db"
	"benchgo/internal/ingester"
	"benchgo/internal/settings"
	handler "benchgo/server/handlers"
	"benchgo/server/routers"
	"benchgo/server/usecase"

	"github.com/gin-gonic/gin"
)

func init() {
	settings.Init()
	fmt.Println("settings initialized", settings.Server.ENV)
}

func main() {
	gin.SetMode(settings.Server.RunMode)

	mBytes, err := settings.ReadConfigBytes()
	if err != nil {
		panic(err)
	}

	faspayConfig := ingester.ReportConfig{}
	err = json.Unmarshal(mBytes, &faspayConfig)
	if err != nil {
		panic(err)
	}

	// setup database
	db, err := iDB.New(iDB.Config{
		SourceURL:             settings.Database.URL,
		Retries:               settings.Database.Retries,
		MaxOpenConnections:    settings.Database.MaxActive,
		MaxIdleConnections:    settings.Database.MaxIdle,
		ConnectionMaxLifetime: settings.Database.MaxLifetime,
	})
	if err != nil {
		panic(err)
	}

	uc := usecase.New(usecase.Dependencies{
		DB:     db,
		Config: faspayConfig,
	})

	h := handler.New(handler.Dependencies{
		UC: uc,
	})

	routersInit := routers.InitRouter(h)

	server := &http.Server{
		Addr:           fmt.Sprintf(":%d", settings.Server.HttpPort),
		Handler:        routersInit,
		ReadTimeout:    settings.Server.ReadTimeout,
		WriteTimeout:   settings.Server.WriteTimeout,
		MaxHeaderBytes: 1 << 20,
	}

	l, err := net.Listen("tcp", server.Addr)
	if nil != err {
		panic(err)
	}

	fmt.Println("listening on", server.Addr)
	server.Serve(l)
}
