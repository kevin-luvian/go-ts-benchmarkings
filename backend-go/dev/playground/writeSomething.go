package main

import (
	"benchgo/dev/playground/utils"
	"fmt"
	"log"
	"math/rand"
	"os"
	"path/filepath"

	"github.com/xuri/excelize/v2"
)

const (
	OUTPUT_PATH = "./output/Book1.xlsx"
	SHEET_NAME  = "Sheet1"
	TARGET_SIZE = 2

	LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
)

func getCurrDir() string {
	cwd, err := os.Getwd()
	if err != nil {
		panic(err)
	}
	fmt.Println("Expath", cwd)
	fp := filepath.Join(cwd, OUTPUT_PATH)
	return fp
}

func main2() {
	targetFilePath := getCurrDir()
	os.Mkdir(filepath.Dir(targetFilePath), 0755)

	_, err := os.Create(targetFilePath)
	if err != nil {
		panic(err)
	}

	generateDeez(TARGET_SIZE, targetFilePath)
}

func generateDeez(fileSizeMB int64, targetFilePath string) {
	const (
		columns     int32 = 25 // Number of columns (A to Z)
		rowHeight         = 15 // Row height in points
		columnWidth       = 12 // Column width in characters
	)

	rand.Seed(69420)

	file := excelize.NewFile()
	defer func() {
		if err := file.Close(); err != nil {
			panic(err)
		}
	}()

	fmt.Println(string([]rune{65}), string([]rune{65 + columns}))
	// panic(fmt.Errorf("Test"))

	// Set the default row height and column width
	file.SetRowHeight(SHEET_NAME, 1, rowHeight)
	file.SetColWidth(SHEET_NAME, string([]rune{65}), string([]rune{65 + columns}), columnWidth)

	{
		streamWriter, err := file.NewStreamWriter(SHEET_NAME)
		if err != nil {
			panic(err)
		}

		row := make([]interface{}, columns)
		for i := 0; i < len(row); i++ {
			row[i] = string(LETTERS[i])
		}
		cell := fmt.Sprintf("%b%d", LETTERS[0], 1)
		streamWriter.SetRow(cell, []interface{}{row})
		streamWriter.Flush()

		fmt.Println("Row:", row)
	}

	step := 0
	currFileSizeMB := int64(0)
	prevCurrFileSizeMB := int64(0)
	perStep := 5000

	values := []string{
		utils.RandStringBytesMaskImprSrcSB(50),
		utils.RandStringBytesMaskImprSrcSB(50),
		utils.RandStringBytesMaskImprSrcSB(50),
		utils.RandStringBytesMaskImprSrcSB(50),
		utils.RandStringBytesMaskImprSrcSB(50),
	}

	// for currFileSizeMB < fileSizeMB {
	mRow := step * perStep
	step += 1

	streamWriter, err := file.NewStreamWriter(SHEET_NAME)
	if err != nil {
		panic(err)
	}

	// Populate the cells with random values
	row := make([]interface{}, columns)
	for i := 0; i < len(row); i++ {
		row[i] = values[step%len(values)]
	}
	// fmt.Println("Row:", row)

	for i := mRow + 1; i <= mRow+perStep; i++ {
		cell := fmt.Sprintf("%c%d", LETTERS[0], i)
		if err := streamWriter.SetRow(cell, row); err != nil {
			panic(err)
		}

		// fmt.Println("Cell:", cell, "I", i)
	}

	if err := streamWriter.Flush(); err != nil {
		panic(err)
	}

	// Save the changes and calculate the file size
	err = file.SaveAs(targetFilePath)
	if err != nil {
		log.Fatal(err)
	}

	fi, err := os.Stat(targetFilePath)
	if err != nil {
		panic(err)
	}

	currFileSizeMB = fi.Size() / (1024 * 1024) // Approximate file size in MB
	if currFileSizeMB > prevCurrFileSizeMB {
		prevCurrFileSizeMB = currFileSizeMB
		log.Println("File size:", fi.Size()/(1024*1024), "MB", " fileSizeMB:", fileSizeMB)
	}
	// }
}
