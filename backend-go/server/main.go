package main

import (
	"fmt"
	"net"
	"net/http"

	iDB "benchgo/internal/db"
	"benchgo/internal/settings"
	handler "benchgo/server/handlers"
	"benchgo/server/routers"

	"github.com/gin-gonic/gin"
)

func init() {
}

func main() {
	gin.SetMode(settings.Server.RunMode)

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

	h := handler.New(handler.Dependencies{
		DB: db,
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
