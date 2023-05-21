package ingester

import (
	"github.com/thedatashed/xlsxreader"
)

func streamSheetReader(filePath string, opts ReadOpts) (<-chan []string, []string, error) {
	headerChan := make(chan []string, 1)
	out := make(chan []string, 100)

	// Create an instance of the reader by opening a target file
	xl, err := xlsxreader.OpenFile(filePath)
	if err != nil {
		return out, []string{}, err
	}

	go func() {
		defer func() {
			close(out)
			xl.Close()
		}()

		for row := range xl.ReadRows(opts.SheetName) {
			if row.Index >= opts.StartRow {
				values := cellsToArr(row.Cells)
				select {
				case out <- values:
					continue
				case <-opts.Sigterm:
					return
				default:
					continue
				}
			}

			if row.Index == opts.StartRow-1 {
				headerChan <- cellsToArr(row.Cells)
			}
		}
	}()

	return out, <-headerChan, nil
}
