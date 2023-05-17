package usecase

import (
	"benchgo/internal/ingester"
	"benchgo/internal/redis"
	"benchgo/server/entity"
)

func (uc *UseCase) IngestFaspayFile(filePath string, requestID string) error {
	result := entity.IngestResult{
		RequestID: requestID,
		Total:     0,
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
		Callback: func(total int64) {
			result.Total = total
			redis.RPush(result)
		},
	})

	result.Total = total
	if err != nil {
		result.Error = err.Error()
	}

	redis.RPush(result)
	return err
}
