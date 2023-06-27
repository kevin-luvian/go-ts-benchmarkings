const path = require("path");
const { getTestDir, readRepaymentConfigJson } = require("../../internal/settings/lazy_config");
const { ReportConfig, CSVReaderOptions } = require("../../internal/ingester/type");
const { init } = require("../../internal/settings");
const { connectSequelize } = require("../../internal/db");
const { CSVIngester } = require("../../internal/ingester/csv");
const { LimerockRepaymentSidecarRepository } = require("../../internal/repositories/limerock-repayment-sidecar/repository");
const { v4 } = require("uuid");

/**
 * @typedef {import('../../internal/repositories/limerock-repayment-sidecar/types').LimerockRepaymentSidecar} LimerockRepaymentSidecar
 */

const M_NAMES = ["panjoel", "joko", "thor", "mimin", "opet"];

/**
 * @param {number} min
 * @param {number} max
 */
const randBetween = (min, max) => Math.floor(Math.random() * (max - min)) + min;

/**
 * @param {Object<string, *>} obj
 * @param {number} count
 * @return {LimerockRepaymentSidecar}
 */
const parseToLRSC = (obj, count) => ({
  kredivo_transaction_id: obj.kredivo_transaction_id,
  name: M_NAMES[randBetween(0, M_NAMES.length)],
  muuid: v4(),
  mcount: count,
});

const main = async () => {
  init();

  const targetFile = path.join(getTestDir(), "test_900_mb.csv");

  const db = await connectSequelize();
  const lrscRepo = new LimerockRepaymentSidecarRepository(db);

  const configObj = readRepaymentConfigJson();
  const config = new ReportConfig();
  config.read(configObj);

  try {
    let count = 0;
    await CSVIngester.ingest(
      targetFile,
      new CSVReaderOptions({
        startRow: config.startRow,
        columns: config.columns,
        batchSize: 2000,
        write: async (arr) => {
          const data = arr.map((o) => parseToLRSC(o, count++));
          await lrscRepo.bulkCreate(data);
          if (count % 2000 == 0) {
            console.log(`inserted ${count} rows`);
          }
        },
      })
    );
  } catch (error) {
    console.error(error);
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
