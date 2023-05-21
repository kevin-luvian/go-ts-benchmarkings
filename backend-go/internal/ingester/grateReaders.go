package ingester

import (
	"github.com/pbnjay/grate"
	_ "github.com/pbnjay/grate/xlsx"
)

func grateSheetReader(filePath string, opts ReadOpts) (<-chan []string, []string, error) {
	headerChan := make(chan []string, 1)
	out := make(chan []string, 100)

	wb, err := grate.Open(filePath)
	if err != nil {
		return out, []string{}, err
	}

	sheet, err := wb.Get(opts.SheetName)
	if err != nil {
		return out, []string{}, err
	}

	go func() {
		defer func() {
			close(out)
			wb.Close()
		}()

		i := 0
		for sheet.Next() {
			if i == opts.StartRow-1 {
				headerChan <- sheet.Strings()
			}

			if i >= opts.StartRow {
				select {
				case out <- sheet.Strings():
					continue
				case <-opts.Sigterm:
					return
				default:
					continue
				}
			} else {
				i++
			}
		}
	}()

	return out, <-headerChan, nil
}
