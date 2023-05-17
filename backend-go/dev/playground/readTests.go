package main

import (
	iDB "benchgo/internal/db"
	"benchgo/internal/ingester"
	"benchgo/internal/settings"
	"encoding/json"
	"fmt"
	"path/filepath"
)

func main() {
	// setup database
	db, err := iDB.New(iDB.Config{
		SourceURL:             settings.Database.URL,
		Retries:               settings.Database.Retries,
		MaxOpenConnections:    settings.Database.MaxActive,
		MaxIdleConnections:    settings.Database.MaxIdle,
		ConnectionMaxLifetime: settings.Database.MaxLifetime,
	})
	if err != nil {
		panic(err)
	}

	err = db.Instance.DB.Ping()
	if err != nil {
		panic(err)
	}

	fmt.Println("Database connected")

	mBytes, err := settings.ReadConfigBytes()
	if err != nil {
		panic(err)
	}

	faspayConfig := ingester.ReportConfig{}
	err = json.Unmarshal(mBytes, &faspayConfig)
	if err != nil {
		panic(err)
	}

	targetFile := filepath.Join(settings.GetTestDir(), "test_57_mb.xlsx")
	fmt.Println("Target file:", targetFile)

	err = ingester.ReadXlsx(targetFile, ingester.ReadXlsxOpts{
		DB:             db,
		TableName:      faspayConfig.TableName,
		SheetName:      faspayConfig.Sheet,
		StartRow:       faspayConfig.StartRow,
		ColumnMappings: faspayConfig.Columns,
	})
	if err != nil {
		fmt.Println("ReadXLSX Error:", err)
	}
}