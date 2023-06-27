const path = require("path");
const { ingestXlsxFile } = require("../../internal/ingester/xlsx");
const { getTestDir, readConfigJson, readRepaymentConfigJson } = require("../../internal/settings/lazy_config");
const { XlsxReaderOptions, ReportConfig, CSVReaderOptions } = require("../../internal/ingester/type");
const { init, Server } = require("../../internal/settings");
const { connectSequelize } = require("../../internal/db");
const { CSVIngester } = require("../../internal/ingester/csv");
const { LimerockRepaymentRepository } = require("../../internal/repositories/limerock-repayment/repository");
const { LimerockRepaymentSidecarRepository } = require("../../internal/repositories/limerock-repayment-sidecar/repository");
const { LimerockRepaymentUseCase } = require("../../internal/usecase/limerock-repayments");

const main = async () => {
  init();

  const targetFile = path.join(getTestDir(), "test_900_mb.csv");
  console.info("Server ID:", Server.id, "Target file:", targetFile);

  const db = await connectSequelize();
  const lrRepo = new LimerockRepaymentRepository(db);
  const lrscRepo = new LimerockRepaymentSidecarRepository(db);

  const lrUC = new LimerockRepaymentUseCase({ limerockRepaymentRepo: lrRepo, limerockRepaymentSidecarRepo: lrscRepo });

  const configObj = readRepaymentConfigJson();
  const config = new ReportConfig();
  config.read(configObj);

  const transaction = await db.transaction();
  try {
    let total = 0;
    await CSVIngester.ingest(
      targetFile,
      new CSVReaderOptions({
        startRow: config.startRow,
        columns: config.columns,
        write: async (arr) => {
          await lrUC.bulkCreate(arr.map(lrUC.parseFromCSV), {});
          total += arr.length;
          if (total > 3 * 2000) {
            throw new Error("max limit reached");
          }
        },
      })
    );
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }

  console.log(" === Done === ");
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
