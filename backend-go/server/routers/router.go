package routers

import (
	"benchgo/internal/settings"
	handler "benchgo/server/handlers"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// InitRouter initialize routing information
func InitRouter(h *handler.Handler) *gin.Engine {
	r := gin.New()
	r.Use(gin.Recovery())

	corsRules := CreateCORSRule(strings.Split(settings.Server.CORS, ";"))
	r.Use(cors.New(cors.Config{
		AllowOriginFunc: CheckOrigin(corsRules),
		AllowHeaders:    []string{"Content-Type", "Content-Length", "Accept-Encoding", "X-CSRF-Token", "Authorization", "accept", "origin"},
		AllowMethods:    []string{"POST", "OPTIONS", "GET", "PUT", "DELETE"},
	}))

	root := r.Group("/")
	{
		h.HandlerPing(root)
		h.HandlerIngestFile57(root)
	}

	return r
}
