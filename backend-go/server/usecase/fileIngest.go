package usecase

import (
	"benchgo/internal/ingester"
)

func (uc *UseCase) IngestFaspayFile(filePath string, requestID string) error {
	err := ingester.ReadXlsx(filePath, ingester.ReadXlsxOpts{
		RequestID:      requestID,
		DB:             uc.db,
		TableName:      uc.config.TableName,
		SheetName:      uc.config.Sheet,
		StartRow:       uc.config.StartRow,
		ColumnMappings: uc.config.Columns,
	})
	return err
}
