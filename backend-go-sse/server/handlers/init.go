package handler

import (
	"ssego/internal/app"
	"ssego/server/usecase"
	"time"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	uc *usecase.UseCase
}

type Dependencies struct {
	UC *usecase.UseCase
}

func New(dep Dependencies) *Handler {
	return &Handler{
		uc: dep.UC,
	}
}

func collectTS(start time.Time) int64 {
	return time.Now().Sub(start).Milliseconds()
}

func (h *Handler) HandlerPing(r gin.IRoutes) gin.IRoutes {
	return r.GET("/ping", func(c *gin.Context) {
		ts := time.Now().UnixMilli()
		app.Success(c, ts, map[string]interface{}{
			"ok": true,
		})
	})
}
