package ingester

import (
	"benchgo/internal/db"
	"sync"

	"github.com/jmoiron/sqlx"
)

type TransformOpts struct {
	Wg             *sync.WaitGroup
	Header         []string
	ColumnMappings []ColumnMapping
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

type WriterOpts struct {
	ID          int
	Wg          *sync.WaitGroup
	TableName   string
	Transaction *sqlx.Tx
}

type WriterResponse struct {
	ID           int
	RowsAffected int64
	LastRowId    int64
	Error        error
}

type ReadXlsxOpts struct {
	TableName      string
	DB             *db.DB
	SheetName      string
	StartRow       int
	ColumnMappings []ColumnMapping
}
