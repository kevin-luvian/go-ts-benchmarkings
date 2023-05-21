package handler

import (
	"benchgo/internal/app"
	"benchgo/internal/fs"
	"benchgo/internal/redis"
	"benchgo/internal/settings"
	"benchgo/server/usecase"
	"fmt"
	"path/filepath"
	"runtime"
	"strconv"
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
			"ok":         true,
			"gomaxprocs": runtime.GOMAXPROCS(0),
		})
	})
}

func (h *Handler) HandlerIngestFile57(r gin.IRoutes) gin.IRoutes {
	return r.GET("/ingest-57", func(c *gin.Context) {
		requestID := c.Query("id")
		if requestID == "" {
			app.Error(c, 0, 400, fmt.Errorf("request id is required"))
			return
		}

		limitStr := c.Query("limit")
		limit, err := strconv.Atoi(limitStr)
		if err != nil {
			app.Error(c, 0, 400, fmt.Errorf("missing limit"))
			return
		}

		filePath := filepath.Join(h.testDir, "test_57_mb.xlsx")
		go fs.SafeRunDeez(filePath, requestID, func(targetPath string) {
			h.uc.IngestFaspayFile(targetPath, requestID, limit)
		})

		app.Success(c, 0, map[string]interface{}{})
	})
}

func (h *Handler) HandlerPanic(r gin.IRoutes) gin.IRoutes {
	return r.POST("/panic", func(c *gin.Context) {
		body := struct {
			PanicCode string `json:"panic-code"`
		}{}

		err := c.ShouldBindJSON(&body)
		if err != nil {
			app.Error(c, 0, 400, err)
			return
		} else if body.PanicCode != "owo-benchmarker-panic" {
			app.Error(c, 0, 400, fmt.Errorf("invalid panic code"))
			return
		}

		redis.Set("owo-go-panic", "true", 10000*time.Millisecond)
		app.Success(c, 0, map[string]interface{}{
			"msg": "panic triggered!!, file reads will fail for 10 seconds",
		})
	})
}
