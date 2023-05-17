package db

import (
	"fmt"
	"strings"

	"github.com/jmoiron/sqlx"
)

func BulkInsertMap(tableName string, data []map[string]any, transaction *sqlx.Tx) (int64, error) {
	if transaction == nil {
		return 0, fmt.Errorf("transaction is nil")
	}

	if len(data) == 0 {
		return 0, fmt.Errorf("data is empty")
	}

	var columns []string
	var columnsStatements []string

	for column := range data[0] {
		columns = append(columns, column)
		columnsStatements = append(columnsStatements, ":"+column)
	}

	query := "INSERT INTO " + tableName + " (" + strings.Join(columns, ",") + ") VALUES (" + strings.Join(columnsStatements, ", ") + ")"
	result, err := transaction.NamedExec(query, data)
	if err != nil {
		return 0, err
	}

	return result.LastInsertId()
}
