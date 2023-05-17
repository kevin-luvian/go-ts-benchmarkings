package handler

import (
	"benchgo/internal/app"
	"benchgo/internal/db"
	"benchgo/server/usecase"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	db *db.DB
	uc *usecase.UseCase
}

type Dependencies struct {
	DB *db.DB
	UC *usecase.UseCase
}

func New(dep Dependencies) *Handler {
	return &Handler{
		db: dep.DB,
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

func (h *Handler) HandlerIngestFile(r gin.IRoutes) gin.IRoutes {
	return r.GET("/ingest", func(c *gin.Context) {
		start := time.Now()

		qFilename := c.Query("file")
		if qFilename == "" {
			app.Error(c, collectTS(start), 400, fmt.Errorf("File name is required"))
			return
		}

		err := h.uc.IngestFaspayFile(qFilename, h.db)
		if err != nil {
			app.Error(c, collectTS(start), 400, fmt.Errorf("File name is required"))
			return
		}

		app.Success(c, collectTS(start), map[string]interface{}{
			"ok": true,
		})
	})
}
