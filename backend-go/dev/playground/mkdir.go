package main

import (
	"benchgo/internal/fs"
	"benchgo/internal/settings"
	"fmt"
	"path/filepath"
	"time"
)

func main3() {
	testDir := settings.GetTestDir()
	fileName := "test_57_mb.xlsx"
	sourcePath := filepath.Join(testDir, fileName)

	go fs.SafeRunDeez(sourcePath, "playground", func(targetPath string) {
		fmt.Println(sourcePath)
		time.Sleep(3 * time.Second)
		fmt.Println(targetPath)
	})

	for {
		time.Sleep(1 * time.Second)
	}
}

/**
 * @param {string} sourcePath
 * @param {string} requestID
 * @param {function(string):Promise<void>} runDeez
 */
//  const safeRunDeez = async (sourcePath, requestID, runDeez) => {
// 	const fileName = path.basename(sourcePath);
// 	const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `temp-${requestID}-`));
// 	const targetPath = path.join(tempDir, fileName);
// 	fs.cpSync(sourcePath, targetPath);
// 	try {
// 	  await runDeez(targetPath);
// 	} finally {
// 	  fs.rmSync(tempDir, { recursive: true, force: true });
// 	}
//   };
