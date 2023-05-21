package orchestrator

import (
	"fmt"
	"time"
)

func (w *Worker) Start() {
	go func() {
		defer close(w.finish)
		for {
			select {
			case <-w.stop:
				return
			case msg := <-w.source:
				w.OnReceive(msg)
			case msg2 := <-w.metricSource:
				w.OnReceiveMetric(msg2)
			default:
				time.Sleep(10 * time.Millisecond)
			}
		}
	}()
}

func (w *Worker) Stop() {
	close(w.stop)
	<-w.finish
	fmt.Println(fmt.Sprintf("Worker %d stopped", w.ID))
}
