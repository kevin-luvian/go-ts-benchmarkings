package ingester

import (
	"benchgo/internal/db"

	"github.com/jmoiron/sqlx"
)

type ReadOpts struct {
	SheetName string
	StartRow  int
	Sigterm   chan struct{}
}

type TransformOpts struct {
	Concurrency    int
	ColumnMappings []ColumnMapping
}

type BatchingOpts struct {
	Concurrency int
	BatchSize   int
}

type WriterOpts struct {
	Concurrency int
	TableName   string
	Transaction *sqlx.Tx
	Sigterm     chan struct{}
}

type ReportConfig struct {
	TableName string          `json:"table_go"`
	Sheet     string          `json:"sheet"`
	StartRow  int             `json:"start_row"`
	Columns   []ColumnMapping `json:"columns"`
}

type ColumnMapping struct {
	Name        string `json:"name"`
	Original    string `json:"original"`
	Position    int    `json:"position"`
	Required    bool   `json:"required"`
	GoTransform string `json:"go-transform"`
	Transformer func(string) any
}

type WriterResponse struct {
	ID           int
	RowsAffected int64
	LastRowId    int64
	Error        error
}

type ReadXlsxOpts struct {
	RequestID      string
	TableName      string
	DB             *db.DB
	SheetName      string
	StartRow       int
	ColumnMappings []ColumnMapping
	Callback       func(total int64)
}
