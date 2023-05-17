package usecase

import (
	"benchgo/internal/db"
	"benchgo/internal/ingester"
	"benchgo/internal/settings"
	"encoding/json"
)

func (uc *UseCase) IngestFaspayFile(filePath string, db *db.DB) error {
	mBytes, err := settings.ReadConfigBytes()
	if err != nil {
		return err
	}

	faspayConfig := ingester.ReportConfig{}
	err = json.Unmarshal(mBytes, &faspayConfig)
	if err != nil {
		return err
	}

	err = ingester.ReadXlsx(filePath, ingester.ReadXlsxOpts{
		DB:             db,
		TableName:      faspayConfig.TableName,
		SheetName:      faspayConfig.Sheet,
		StartRow:       faspayConfig.StartRow,
		ColumnMappings: faspayConfig.Columns,
	})
	if err != nil {
		return err
	}

	return nil
}
