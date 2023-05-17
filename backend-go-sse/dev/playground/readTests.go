package main

import (
	"fmt"
	"ssego/internal/redis"
	"ssego/internal/settings"
	"time"
)

func main() {
	settings.Init()
	fmt.Println("Playing SSE")

	err := redis.Setup(redis.RedisOpts{
		QueueName:   settings.Redis.QueueName,
		Host:        settings.Redis.Host,
		Password:    settings.Redis.Password,
		MaxIdle:     settings.Redis.MaxIdle,
		MaxActive:   settings.Redis.MaxActive,
		IdleTimeout: settings.Redis.IdleTimeout,
	})
	if err != nil {
		panic(err)
	}

	goPushQueue()
	goReadQueue()

	for {
	}
}

type MStruct struct {
	Name  string `json:"name"`
	Error string `json:"error"`
}

func goPushQueue() {
	go func() {
		i := 0
		for {
			i++
			// err := error(nil)
			// if i%11 == 0 {
			// 	err = fmt.Errorf("Error %d", i)
			// }

			redis.RPushStruct(MStruct{
				Name:  fmt.Sprintf("Name %d", i),
				Error: fmt.Sprintf("Error %d", i),
			})
			time.Sleep(30 * time.Millisecond)
		}
	}()
}

func goReadQueue() {
	batchChan := make(chan []MStruct)
	tickChan := make(chan bool)

	go func() {
		for {
			time.Sleep(200 * time.Millisecond)
			tickChan <- true
		}
	}()

	go func() {
		batchSize := 10
		batch := []MStruct{}
		for {
			select {
			case <-tickChan:
				if len(batch) > 0 {
					batchChan <- batch
					batch = make([]MStruct, 0)
				}
			default:
				mStruct := MStruct{}
				err := redis.LPopStruct(&mStruct)
				if err == nil {
					batch = append(batch, mStruct)
					if len(batch) >= batchSize {
						batchChan <- batch
						batch = make([]MStruct, 0)
					}
				}
			}
		}
	}()

	go func() {
		for batch := range batchChan {
			fmt.Println("Batch:", batch, redis.QueueName)
		}
	}()
}
