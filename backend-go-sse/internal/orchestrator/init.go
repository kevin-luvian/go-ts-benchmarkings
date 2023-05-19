package orchestrator

import (
	"sync"
)

var singleLock = &sync.Mutex{}
var workersLock = &sync.Mutex{}

var singleInstance *Orchestrator

func new() *Orchestrator {
	return &Orchestrator{
		appendLock: sync.Mutex{},
		workers:    []*Worker{},
	}
}

func Get() *Orchestrator {
	if singleInstance == nil {
		// possible its already created by another goroutine after acquiring lock
		singleLock.Lock()
		defer singleLock.Unlock()

		if singleInstance == nil {
			singleInstance = new()
		}
	}

	return singleInstance
}
