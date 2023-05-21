package ingester

import (
	"benchgo/internal/db"
	"fmt"
	"strings"
	"sync"

	"github.com/thedatashed/xlsxreader"
)

func ReadXlsx(filePath string, opts ReadXlsxOpts) (int64, error) {
	var (
		CONCURRENT_TRANSFORMERS = 4
		CONCURRENT_WRITERS      = 8
		CONCURRENT_BATCHERS     = 2
		CONCURRENT_BATCH_SIZE   = 1000
	)
	fmt.Println("starting to ingest file with request id", opts.RequestID)

	// signal termination in case of error detected
	sigterm := make(chan struct{})
	rowsChan, header, err := streamSheetReader(filePath, ReadOpts{
		SheetName: opts.SheetName,
		StartRow:  opts.StartRow,
		Sigterm:   sigterm,
	})
	if err != nil {
		return 0, err
	}

	transformChan := concurrentTransform(rowsChan, TransformOpts{
		Concurrency:    CONCURRENT_TRANSFORMERS,
		ColumnMappings: transformHeader(header, opts.ColumnMappings),
	})

	batchedChan := concurrentBatch(transformChan, BatchingOpts{
		Concurrency: CONCURRENT_BATCHERS,
		BatchSize:   CONCURRENT_BATCH_SIZE,
	})

	tx := opts.DB.Instance.MustBegin()
	writerChan := concurrentWriter(batchedChan, WriterOpts{
		Concurrency: CONCURRENT_WRITERS,
		TableName:   opts.TableName,
		Transaction: tx,
	})

	total := int64(0)
	abort := func() {
		close(sigterm)
		// sink the last channel
		for w := range writerChan {
			total += w.RowsAffected
			opts.Callback(total)
		}
	}

	for res := range writerChan {
		total += res.RowsAffected
		if res.Error != nil {
			abort()
			tx.Rollback()
			return total, err
		}

		isDone := opts.Callback(total)
		if isDone {
			abort()
			break
		}

		if total%5000 == 0 {
			fmt.Println("Processed", total, "rows")
		}
	}

	err = tx.Commit()
	if err != nil {
		return total, err
	}
	return total, nil
}

func sink[T any](T) {}

func cellsToArr(cells []xlsxreader.Cell) []string {
	arr := make([]string, len(cells))
	for i, cell := range cells {
		arr[i] = cell.Value
	}
	return arr
}

func transformHeader(headers []string, columnMappings []ColumnMapping) []ColumnMapping {
	// setting positions
	for i, header := range headers {
		for idx := range columnMappings {
			if columnMappings[idx].Position != 0 {
				continue
			}

			if header == columnMappings[idx].Original {
				columnMappings[idx].Position = i - 1
				break
			}
		}
	}

	// setting transformers
	for idx := range columnMappings {
		switch columnMappings[idx].GoTransform {
		case "dotToComma":
			columnMappings[idx].Transformer = func(a string) any {
				return strings.ReplaceAll(a, ",", "")
			}
		default:
			columnMappings[idx].Transformer = func(a string) any {
				return a
			}
		}
	}

	return columnMappings
}

func concurrentTransform(in <-chan []string, opts TransformOpts) <-chan map[string]any {
	out := make(chan map[string]any, 200)
	wg := sync.WaitGroup{}

	for i := 0; i < opts.Concurrency; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()

		ChanLoop:
			for row := range in {
				objMap := make(map[string]any)

				for _, mapping := range opts.ColumnMappings {
					if len(row) <= mapping.Position {
						continue ChanLoop
					}
					objMap[mapping.Name] = mapping.Transformer(row[mapping.Position])
				}
				out <- objMap
			}
		}()
	}

	go func() {
		wg.Wait()
		close(out)
	}()

	return out
}

func concurrentBatch[T any](input <-chan T, opts BatchingOpts) <-chan []T {
	out := make(chan []T, 10)
	wg := sync.WaitGroup{}

	for i := 0; i < opts.Concurrency; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()

			batch := make([]T, 0, opts.BatchSize)
			for item := range input {
				batch = append(batch, item)

				if len(batch) == opts.BatchSize {
					out <- batch
					batch = make([]T, 0, opts.BatchSize)
				}
			}

			if len(batch) > 0 {
				out <- batch
			}
		}()
	}

	go func() {
		wg.Wait()
		close(out)
	}()

	return out
}

func concurrentWriter(in <-chan []map[string]any, opts WriterOpts) <-chan WriterResponse {
	out := make(chan WriterResponse, 20)
	wg := sync.WaitGroup{}

	for i := 0; i < opts.Concurrency; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()

			for batch := range in {
				lastRowId, err := db.BulkInsertMap(opts.TableName, batch, opts.Transaction)
				response := WriterResponse{
					RowsAffected: int64(len(batch)),
					LastRowId:    lastRowId,
					Error:        err,
				}
				out <- response
			}
		}()
	}

	go func() {
		wg.Wait()
		close(out)
		// sink the input channel, waiting for all to finish
		for v := range in {
			sink(v)
		}
		fmt.Println("Writes completed, channel closed")
	}()

	return out
}
