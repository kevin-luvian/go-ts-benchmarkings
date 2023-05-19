package orchestrator

import (
	"fmt"
	"time"
)

func newWorker(id int, cb func([]string)) *Worker {
	w := &Worker{
		ID:        id,
		OnReceive: cb,
		source:    make(chan []string, 10),
		stop:      make(chan struct{}),
		finish:    make(chan struct{}),
	}
	w.Start()
	return w
}

func (w *Worker) Start() {
	go func() {
		defer close(w.finish)
		for {
			select {
			case msg := <-w.source:
				w.OnReceive(msg)
			case <-w.stop:
				return
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
