package ingester

import (
	"benchgo/internal/db"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/thedatashed/xlsxreader"
)

const CONCURRENT_TRANSFORMERS_TOTAL = 7
const CONCURRENT_BATCH_SIZE = 1000
const CONCURRENT_WRITERS_TOTAL = 5

func ReadXlsx(filePath string, opts ReadXlsxOpts) error {
	start := time.Now()
	defer func() {
		end := time.Now().Sub(start).Seconds()
		fmt.Println("Time taken: ", end, "s")
	}()

	// Create an instance of the reader by opening a target file
	xl, err := xlsxreader.OpenFile(filePath)
	if err != nil {
		return err
	}

	// Ensure the file reader is closed once utilised
	defer xl.Close()

	transformOpts := TransformOpts{
		Wg:             &sync.WaitGroup{},
		ColumnMappings: opts.ColumnMappings,
	}

	tx := opts.DB.Instance.MustBegin()
	writerOpts := WriterOpts{
		ID:          0,
		Wg:          &sync.WaitGroup{},
		TableName:   opts.TableName,
		Transaction: tx,
	}

	done := make(chan struct{})

	transformChan := make(chan map[string]interface{})
	batchedChan := ChannelBatching(transformChan, CONCURRENT_BATCH_SIZE, 3)
	rowsChan, header := sheetReader("Detail", 5, xl)
	fmt.Println("Header", header)

	transformHeader(header, transformOpts.ColumnMappings)

	for i := 0; i < CONCURRENT_TRANSFORMERS_TOTAL; i++ {
		concurrentTransform(i, rowsChan, transformChan, done, transformOpts)
	}

	writerChan := make(chan WriterResponse)
	for i := 0; i < CONCURRENT_WRITERS_TOTAL; i++ {
		writerOpts.ID = i
		concurrentWriter(writerOpts, batchedChan, writerChan, done)
	}

	waitChan := make(chan bool, 1)
	go func() {
		transformOpts.Wg.Wait()
		close(transformChan)
		fmt.Println("Transform Completed")

		writerOpts.Wg.Wait()
		close(writerChan)
		fmt.Println("Writer Completed")

		waitChan <- true
	}()

	stopRoutines := func() {
		close(done)
		<-waitChan
	}

	// i := 0
	for res := range writerChan {
		// i++
		if res.Error != nil {
			stopRoutines()
			tx.Rollback()
			return res.Error
		}

		// if i%5 == 0 {
		// 	fmt.Println(fmt.Sprintf("Worker %d Has Written %d rows", res.ID, res.RowsAffected))
		// }
	}
	stopRoutines()

	fmt.Println("Commiting Transaction")
	err = tx.Commit()
	if err != nil {
		return err
	}

	fmt.Println("Write Completed")

	return nil
}

func transformHeader(headers []string, columnMappings []ColumnMapping) {
	// mapping positions
	for i, header := range headers {
		fmt.Println("Header", header, "Position", i)
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
}

func sheetReader(sheetName string, startRow int, xl *xlsxreader.XlsxFileCloser) (<-chan xlsxreader.Row, []string) {
	headerChan := make(chan []string, 1)
	outChan := make(chan xlsxreader.Row)

	go func() {
		defer close(outChan)

		for row := range xl.ReadRows(sheetName) {
			if row.Index > startRow {
				outChan <- row
				continue
			}

			if row.Index == startRow {
				headerChan <- CellsToArr(row.Cells)
				close(headerChan)
			}
		}
	}()

	return outChan, <-headerChan
}

func concurrentTransform(id int, in <-chan xlsxreader.Row, out chan<- map[string]interface{}, done <-chan struct{}, opts TransformOpts) {
	opts.Wg.Add(1)
	go func() {
		defer opts.Wg.Done()
		// i := 0

	ChanLoop:
		for row := range in {
			// i++
			cells := CellsToArr(row.Cells)
			objMap := make(map[string]any)

			for _, mapping := range opts.ColumnMappings {
				if len(cells) <= mapping.Position {
					continue ChanLoop
				}
				objMap[mapping.Name] = mapping.Transformer(cells[mapping.Position])
			}
			// if i%10000 == 0 {
			// 	fmt.Println(fmt.Sprintf("GR: %d Has Transformed %d rows", id, i))
			// }

			select {
			case out <- objMap:
			case <-done:
				return
			}
		}
	}()
}

func concurrentWriter(opts WriterOpts, in <-chan []map[string]any, out chan<- WriterResponse, done <-chan struct{}) {
	opts.Wg.Add(1)
	go func() {
		defer opts.Wg.Done()

		for batch := range in {
			lastRowId, err := db.BulkInsertMap(opts.TableName, batch, opts.Transaction)
			response := WriterResponse{
				ID:           opts.ID,
				RowsAffected: int64(len(batch)),
				LastRowId:    lastRowId,
				Error:        err,
			}

			select {
			case out <- response:
			case <-done:
				return
			}
		}
	}()
}

func CellsToArr(cells []xlsxreader.Cell) []string {
	arr := make([]string, len(cells))
	for i, cell := range cells {
		arr[i] = cell.Value
	}
	return arr
}

func ChannelBatching[T any](input <-chan T, batchSize int, concurrency int) <-chan []T {
	batchedChan := make(chan []T)
	wg := sync.WaitGroup{}

	for i := 0; i < concurrency; i++ {
		go func() {
			wg.Add(1)
			defer wg.Done()

			batch := make([]T, 0, batchSize)
			for item := range input {
				batch = append(batch, item)

				if len(batch) == batchSize {
					batchedChan <- batch
					batch = make([]T, 0, batchSize)
				}
			}

			if len(batch) > 0 {
				batchedChan <- batch
			}
		}()
	}

	go func() {
		wg.Wait()
		close(batchedChan)
		fmt.Println("Batching Completed, channel closed")
	}()

	return batchedChan
}
