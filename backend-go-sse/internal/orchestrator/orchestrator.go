package orchestrator

import (
	"encoding/json"
	"fmt"
	"ssego/internal/redis"
	"time"

	"github.com/mackerelio/go-osstat/cpu"
	"github.com/mackerelio/go-osstat/memory"
)

func (o *Orchestrator) StartTicker() {
	ticker := time.NewTicker(50 * time.Millisecond)
	go func() {
		defer ticker.Stop()
		batchSize := 5
		batch := make([]string, 0)
		for {
			select {
			case <-ticker.C:
				if len(batch) > 0 {
					o.SendWorkerMessages(batch)
					batch = make([]string, 0)
				}
			default:
				msg, _ := redis.LPop()
				if msg != "" {
					// o.SendWorkerMessages(msgs)
					batch = append(batch, msg)
					if len(batch) >= batchSize {
						o.SendWorkerMessages(batch)
						batch = make([]string, 0)
					}
				} else {
					time.Sleep(10 * time.Millisecond)
				}
			}
		}
	}()
}

func (o *Orchestrator) StartTickerMetrics() {
	ticker := time.NewTicker(500 * time.Millisecond)
	go func() {
		defer ticker.Stop()
		for t := range ticker.C {
			if !o.DoesWorkersExist() {
				continue
			}

			metrics := make(map[string]interface{})
			memory, err := memory.Get()
			if err == nil {
				metrics["memory_usage"] = 100 * memory.Used / memory.Total
			}

			cpu, err := cpu.Get()
			if err == nil {
				metrics["cpu_usage"] = 100 * (cpu.Total - cpu.Idle) / cpu.Total
			}

			metrics["ts"] = time.Now().UnixMilli()
			metricJson, _ := json.Marshal(metrics)
			fmt.Println("Sending metrics to client", string(metricJson))
			o.SendWorkerMetricMessage(string(metricJson))
			sink(t)
		}
	}()
}

func sink[T any](T) {}

func (o *Orchestrator) CreateWorker(msgsChan chan<- []string, mtrChan chan<- string) int {
	workersLock.Lock()
	defer workersLock.Unlock()

	o.iDState++
	w := &Worker{
		ID: o.iDState,
		OnReceive: func(s []string) {
			msgsChan <- s
		},
		OnReceiveMetric: func(s string) {
			mtrChan <- s
		},
		source:       make(chan []string, 100),
		metricSource: make(chan string, 100),
		stop:         make(chan struct{}),
		finish:       make(chan struct{}),
	}
	w.Start()
	o.workers = append(o.workers, w)
	return o.iDState
}

func (o *Orchestrator) SendWorkerMessages(msgs []string) {
	workersLock.Lock()
	defer workersLock.Unlock()

	for _, w := range o.workers {
		w.source <- msgs
	}
}

func (o *Orchestrator) SendWorkerMetricMessage(msg string) {
	workersLock.Lock()
	defer workersLock.Unlock()

	for _, w := range o.workers {
		w.metricSource <- msg
	}
}

func (o *Orchestrator) DoesWorkersExist() bool {
	workersLock.Lock()
	defer workersLock.Unlock()
	return len(o.workers) > 0
}

func (o *Orchestrator) StopWorker(id int) {
	workersLock.Lock()
	defer workersLock.Unlock()

	workerIndex := -1
	for idx, w := range o.workers {
		fmt.Println("Worker", w.ID, "is running")
		if w.ID == id {
			fmt.Println("Stopping worker", id)
			w.Stop()
			workerIndex = idx
			break
		}
	}

	// remove worker from slice, by shifting the last element
	if workerIndex != -1 {
		o.workers[workerIndex] = o.workers[len(o.workers)-1]
		o.workers = o.workers[:len(o.workers)-1]
	}
}
