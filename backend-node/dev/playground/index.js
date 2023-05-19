const path = require("path");
const { ingestXlsxFile } = require("../../internal/ingester/xlsx");
const {
  getTestDir,
  readConfigJson,
} = require("../../internal/settings/lazy_config");
const {
  XlsxReaderOptions,
  ReportConfig,
} = require("../../internal/ingester/type");
const { init, Server } = require("../../internal/settings");
const { connectSequelize } = require("../../internal/db");

const main = async () => {
  init();

  const targetFile = path.join(getTestDir(), "test_57_mb.xlsx");
  console.info("Server ID:", Server.id, "Target file:", targetFile);

  const db = await connectSequelize();

  const configObj = readConfigJson();
  const config = new ReportConfig();
  config.read(configObj);

  try {
    await ingestXlsxFile(
      targetFile,
      new XlsxReaderOptions({
        requestID: "plaground-test",
        tableName: config.tableName,
        sheetName: config.sheet,
        startRow: config.startRow,
        columns: config.columns,
        db: db,
        callback: (total) => {},
      })
    );
  } catch (error) {
    console.error(error);
  }

  console.log(" === Done === ");

  while (true) {}
};

(async () => {
  try {
    await main();
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
