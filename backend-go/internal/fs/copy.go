package fs

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
)

func CopyFile(src, dst string) (int64, error) {
	sourceFileStat, err := os.Stat(src)
	if err != nil {
		return 0, err
	}

	if !sourceFileStat.Mode().IsRegular() {
		return 0, fmt.Errorf("%s is not a regular file", src)
	}

	source, err := os.Open(src)
	if err != nil {
		return 0, err
	}
	defer source.Close()

	destination, err := os.Create(dst)
	if err != nil {
		return 0, err
	}
	defer destination.Close()
	nBytes, err := io.Copy(destination, source)
	return nBytes, err
}

func SafeRunDeez(sourcePath string, requestID string, runDeez func(string)) error {
	fileName := filepath.Base(sourcePath)
	tempDir, err := os.MkdirTemp(os.TempDir(), fmt.Sprintf("temp-%s-", requestID))
	if err != nil {
		return err
	}
	defer os.RemoveAll(tempDir)

	targetPath := filepath.Join(tempDir, fileName)
	_, err = CopyFile(sourcePath, targetPath)
	if err != nil {
		return err
	}

	runDeez(targetPath)
	return nil
}
