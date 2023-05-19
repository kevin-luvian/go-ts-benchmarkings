package routers

import (
	handler "ssego/server/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// InitRouter initialize routing information
func InitRouter(h *handler.Handler) *gin.Engine {
	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(cors.New(cors.Config{
		AllowOriginFunc: func(origin string) bool {
			return true
		},
		AllowHeaders: []string{"Content-Type", "Content-Length", "Accept-Encoding", "X-CSRF-Token", "Authorization", "accept", "origin"},
		AllowMethods: []string{"POST", "OPTIONS", "GET", "PUT", "DELETE"},
	}))

	root := r.Group("/")
	{
		h.HandlerPing(root)
		h.HandlerSSEPooling(root)
	}

	return r
}
