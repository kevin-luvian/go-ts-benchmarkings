package main

import (
	"fmt"
	"net"
	"net/http"

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
	// db, err := db.New(db.Config{
	// 	SourceURL:             setting.Database.DockerURL,
	// 	Retries:               setting.Database.Retries,
	// 	MaxOpenConnections:    setting.Database.MaxActive,
	// 	MaxIdleConnections:    setting.Database.MaxIdle,
	// 	ConnectionMaxLifetime: setting.Database.MaxLifetime,
	// })
	// if err != nil {
	// 	logging.Fatalln("error initializing database", err)
	// }

	h := handler.New(handler.Dependencies{})
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
