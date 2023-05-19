package handler

import (
	"benchgo/internal/app"
	"benchgo/internal/settings"
	"benchgo/server/usecase"
	"fmt"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	uc      *usecase.UseCase
	testDir string
}

type Dependencies struct {
	UC *usecase.UseCase
}

func New(dep Dependencies) *Handler {
	return &Handler{
		uc:      dep.UC,
		testDir: settings.GetTestDir(),
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

func (h *Handler) HandlerIngestFile57(r gin.IRoutes) gin.IRoutes {
	return r.GET("/ingest-57", func(c *gin.Context) {
		requestID := c.Query("id")
		if requestID == "" {
			app.Error(c, 0, 400, fmt.Errorf("request id is required"))
		}
		go h.uc.IngestFaspayFile(filepath.Join(h.testDir, "test_57_mb.xlsx"), requestID)
		app.Success(c, 0, map[string]interface{}{})
	})
}
