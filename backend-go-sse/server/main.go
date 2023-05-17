package main

import (
	"fmt"
	"net"
	"net/http"

	"ssego/internal/settings"
	handler "ssego/server/handlers"
	"ssego/server/routers"
	"ssego/server/usecase"

	"github.com/gin-gonic/gin"
)

func init() {
	settings.Init()
	fmt.Println("settings initialized", settings.Server.ENV)
}

func main() {
	gin.SetMode(settings.Server.RunMode)

	uc := usecase.New(usecase.Dependencies{})

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
