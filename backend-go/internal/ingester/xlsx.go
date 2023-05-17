package ingester

import (
	"benchgo/internal/db"
	"fmt"
	"runtime"
	"strings"
	"sync"
	"time"

	"github.com/thedatashed/xlsxreader"
)

func ReadXlsx(filePath string, opts ReadXlsxOpts) (int64, error) {
	var (
		CONCURRENT_TRANSFORMERS = runtime.GOMAXPROCS(0)
		CONCURRENT_WRITERS      = 2 * runtime.GOMAXPROCS(0)
		CONCURRENT_BATCHERS     = 2
		CONCURRENT_BATCH_SIZE   = 1000
	)

	fmt.Println(CONCURRENT_WRITERS, CONCURRENT_TRANSFORMERS, CONCURRENT_BATCHERS, CONCURRENT_BATCH_SIZE)

	start := time.Now()
	defer func() {
		end := time.Now().Sub(start).Seconds()
		fmt.Println("Time taken: ", end, "s")
	}()

	// Create an instance of the reader by opening a target file
	xl, err := xlsxreader.OpenFile(filePath)
	if err != nil {
		return 0, err
	}
	defer xl.Close()

	// signal termination in case of error detected
	sigterm := make(chan struct{})
	rowsChan, header := sheetReader(xl, ReadOpts{
		SheetName: opts.SheetName,
		StartRow:  opts.StartRow,
		Sigterm:   sigterm,
	})

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
		Sigterm:     sigterm,
	})

	abort := func() {
		close(sigterm)
		// sink the last channel
		for w := range writerChan {
			sink(w)
		}
		tx.Rollback()
	}

	total := int64(0)
	for res := range writerChan {
		total += res.RowsAffected
		if res.Error != nil {
			abort()
			return total, res.Error
		}

		opts.Callback(total)
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

func sheetReader(xl *xlsxreader.XlsxFileCloser, opts ReadOpts) (<-chan xlsxreader.Row, []string) {
	headerChan := make(chan []string, 1)
	out := make(chan xlsxreader.Row, 100)

	go func() {
		defer func() {
			close(out)
			fmt.Println("Reads completed, channel closed")
		}()

		for row := range xl.ReadRows(opts.SheetName) {
			if row.Index >= opts.StartRow {
				select {
				case out <- row:
				case <-opts.Sigterm:
					return
				}
			}

			if row.Index == opts.StartRow-1 {
				headerChan <- cellsToArr(row.Cells)
			}
		}
	}()

	return out, <-headerChan
}

func concurrentTransform(in <-chan xlsxreader.Row, opts TransformOpts) <-chan map[string]any {
	out := make(chan map[string]any, 500)
	wg := sync.WaitGroup{}

	for i := 0; i < opts.Concurrency; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()

		ChanLoop:
			for row := range in {
				cells := cellsToArr(row.Cells)
				objMap := make(map[string]any)

				for _, mapping := range opts.ColumnMappings {
					if len(cells) <= mapping.Position {
						continue ChanLoop
					}
					objMap[mapping.Name] = mapping.Transformer(cells[mapping.Position])
				}
				out <- objMap
			}
		}()
	}

	go func() {
		wg.Wait()
		close(out)
		fmt.Println("Transform completed, channel closed")
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
				// if len(out) > 0 {
				// 	fmt.Println("Batching", len(out), "buffered")
				// }

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
		fmt.Println("Batching completed, channel closed")
	}()

	return out
}

func concurrentWriter(in <-chan []map[string]any, opts WriterOpts) <-chan WriterResponse {
	out := make(chan WriterResponse, 10)
	wg := sync.WaitGroup{}

	for i := 0; i < opts.Concurrency; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()

			for batch := range in {
				if len(out) > 0 {
					fmt.Println("Writes", len(out), "buffered")
				}

				lastRowId, err := db.BulkInsertMap(opts.TableName, batch, opts.Transaction)
				response := WriterResponse{
					RowsAffected: int64(len(batch)),
					LastRowId:    lastRowId,
					Error:        err,
				}

				select {
				case out <- response:
				case <-opts.Sigterm:
					return
				}
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
