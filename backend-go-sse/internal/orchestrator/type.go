package orchestrator

import "sync"

type Orchestrator struct {
	appendLock sync.Mutex
	workers    []*Worker
	iDState    int
}

type Worker struct {
	source    chan []string
	stop      chan struct{}
	finish    chan struct{}
	ID        int
	OnReceive func([]string)
}
