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
		requestID := getRequestID(c, "ingest-57-")
		h.IngestIt(c, filepath.Join(h.testDir, "test_57_mb.xlsx"), requestID)
	})
}

func (h *Handler) IngestIt(c *gin.Context, filePath string, requestID string) {
	start := time.Now()

	fmt.Println("Ingesting file", filePath)
	err := h.uc.IngestFaspayFile(filePath, requestID)
	if err != nil {
		app.Error(c, collectTS(start), 400, err)
		return
	}

	app.Success(c, collectTS(start), map[string]interface{}{
		"ok": true,
	})
}

func getRequestID(c *gin.Context, prefix string) string {
	requestID := c.Query("id")
	if requestID == "" {
		requestID = "0"
	}
	return prefix + requestID
}
