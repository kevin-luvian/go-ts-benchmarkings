package settings

import (
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
)

func getFEPublicDir() string {
	cwd, err := os.Getwd()
	if err != nil {
		panic(err)
	}
	fp := filepath.Join(cwd, "../frontend/public")
	fmt.Println("Public File Path", fp)
	return fp
}

func GetTestDir() string {
	cwd, err := os.Getwd()
	if err != nil {
		panic(err)
	}
	fp := filepath.Join(cwd, "../tests")
	return fp
}

func ReadConfigBytes() ([]byte, error) {
	fePubDir := getFEPublicDir()
	fePubConfigPath := filepath.Join(fePubDir, "DBConfig.json")

	fePubConfigFile, err := ioutil.ReadFile(fePubConfigPath)
	if err != nil {
		return nil, err
	}
	return fePubConfigFile, nil
}
