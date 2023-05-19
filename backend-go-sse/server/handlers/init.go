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

func (h *Handler) HandlerSSEPooling2(r gin.IRoutes) gin.IRoutes {
	return r.GET("/sse", func(c *gin.Context) {
		statsTicker := time.NewTicker(1 * time.Second)
		defer statsTicker.Stop()

		c.Stream(func(w io.Writer) bool {
			select {
			case <-statsTicker.C:
				c.SSEvent("stats", "1234")
			}
			return true
		})
	})
}

func (h *Handler) HandlerSSEPooling(r gin.IRoutes) gin.IRoutes {
	return r.GET("/sse", func(c *gin.Context) {
		// c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		// c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		c.Writer.Header().Set("Content-Type", "text/event-stream")
		c.Writer.Header().Set("Cache-Control", "no-cache")
		c.Writer.Header().Set("Connection", "keep-alive")
		c.Writer.Header().Set("Transfer-Encoding", "chunked")

		clientChan := make(chan string, 5)
		orch := orchestrator.Get()
		workerID := orch.CreateWorker(func(msgs []string) {
			for _, msg := range msgs {
				clientChan <- msg
			}
		})
		fmt.Println("Client connected, worker ID:", workerID)

		c.Stream(func(w io.Writer) bool {
			// Stream message to client from message channel
			if msg, ok := <-clientChan; ok {
				fmt.Println("Sending message to client", msg)
				c.SSEvent("data", msg)
				return true
			}
			return false
		})

		orch.StopWorker(workerID)
		fmt.Println("Client disconnected, worker ID:", workerID)

		// Listen to connection close and un-register worker
		// for {
		// 	select {
		// 	case <-c.Done():
		// 		orch.StopWorker(workerID)
		// 		return
		// 	default:
		// 		time.Sleep(50 * time.Millisecond)
		// 	}
		// }
	})
}
