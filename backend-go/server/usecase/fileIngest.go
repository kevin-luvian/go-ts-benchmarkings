package usecase

import (
	"benchgo/internal/ingester"
	"benchgo/internal/redis"
	"benchgo/server/entity"
	"fmt"
	"time"
)

func (uc *UseCase) IngestFaspayFile(filePath string, requestID string, limit int) error {
	result := entity.IngestResult{
		RequestID: requestID,
		Total:     0,
		Ts:        time.Now().UnixMilli(),
		Done:      false,
		Error:     "",
	}

	total, err := ingester.ReadXlsx(filePath, ingester.ReadXlsxOpts{
		RequestID:      requestID,
		DB:             uc.db,
		TableName:      uc.config.TableName,
		SheetName:      uc.config.Sheet,
		StartRow:       uc.config.StartRow,
		ColumnMappings: uc.config.Columns,
		Callback: func(total int64) bool {
			result.Total = total
			result.Ts = time.Now().UnixMilli()
			redis.RPushStruct(result)

			panicStr, err := redis.Get("owo-go-panic")
			if panicStr != "" && err == nil {
				// panic triggered!!
				fmt.Println("Panic triggered, ending ingestion for request", requestID)
				return true
			}

			if limit > 0 && total >= int64(limit) {
				fmt.Println("Limit reached, ending ingestion for request", requestID)
				return true
			}

			return false
		},
	})

	result.Done = true
	result.Ts = time.Now().UnixMilli()
	result.Total = total
	if err != nil {
		result.Error = err.Error()
	}

	redis.RPushStruct(result)
	return err
}
