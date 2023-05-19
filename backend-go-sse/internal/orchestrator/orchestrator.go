package orchestrator

import (
	"time"
)

func (o *Orchestrator) StartTicker(pull func() string) {
	ticker := time.NewTicker(100 * time.Millisecond)
	go func() {
		batchSize := 20
		batch := make([]string, 0)
		for {
			select {
			case <-ticker.C:
				if len(batch) > 0 {
					o.SendWorkerMessages(batch)
					batch = make([]string, 0)
				}
			default:
				msg := pull()
				if msg != "" {
					batch = append(batch, msg)
					if len(batch) >= batchSize {
						o.SendWorkerMessages(batch)
						batch = make([]string, 0)
					}
				} else {
					time.Sleep(20 * time.Millisecond)
				}
			}
		}
	}()
}

func (o *Orchestrator) CreateWorker(cb func([]string)) (id int) {
	workersLock.Lock()
	defer workersLock.Unlock()

	o.iDState++
	w := newWorker(o.iDState, cb)
	o.workers = append(o.workers, w)
	return o.iDState
}

func (o *Orchestrator) SendWorkerMessages(msg []string) {
	workersLock.Lock()
	defer workersLock.Unlock()

	for _, w := range o.workers {
		w.source <- msg
	}
}

func (o *Orchestrator) StopWorker(id int) {
	workersLock.Lock()
	defer workersLock.Unlock()

	workerIndex := -1
	for idx, w := range o.workers {
		if w.ID == id {
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
