package handler

import (
	"fmt"
	"io"
	"ssego/internal/app"
	"ssego/internal/orchestrator"
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

func (h *Handler) HandlerSSEPooling(r gin.IRoutes) gin.IRoutes {
	return r.GET("/sse", func(c *gin.Context) {
		c.Writer.Header().Set("Content-Type", "text/event-stream")
		c.Writer.Header().Set("Cache-Control", "no-cache")
		c.Writer.Header().Set("Connection", "keep-alive")
		c.Writer.Header().Set("Transfer-Encoding", "chunked")

		clientChan := make(chan []string, 5)
		metricsChan := make(chan string, 5)

		orch := orchestrator.Get()
		workerID := orch.CreateWorker(clientChan, metricsChan)
		fmt.Println("Client connected, worker ID:", workerID)
		// Stream message to client from message channel
		c.Stream(func(w io.Writer) bool {
			for {
				select {
				case msgs := <-clientChan:
					for _, msg := range msgs {
						c.SSEvent("data", msg)
					}
					return true
				case msg := <-metricsChan:
					c.SSEvent("metrics", msg)
					return true
				case <-c.Writer.CloseNotify():
					return false
				default:
					time.Sleep(10 * time.Millisecond)
				}
			}
		})

		orch.StopWorker(workerID)
		fmt.Println("Client disconnected, worker ID:", workerID)
	})
}
