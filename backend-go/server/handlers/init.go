package handler

import (
	"benchgo/internal/app"
	"time"

	"github.com/gin-gonic/gin"
)

type Handler struct {
}

type Dependencies struct {
}

func New(dep Dependencies) *Handler {
	return &Handler{}
}

func (h *Handler) HandlerPing(r gin.IRoutes) gin.IRoutes {
	return r.GET("/ping", func(c *gin.Context) {
		ts := time.Now().UnixMilli()
		app.Success(c, ts, map[string]interface{}{
			"ok": true,
		})
	})
}
