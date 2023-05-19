const { XlsxReaderOptions } = require("../../internal/ingester/type");
const { ingestXlsxFile } = require("../../internal/ingester/xlsx");
const { Redis } = require("../../internal/settings/settings");
const redis = require("../../internal/redis");
const { getTestDir } = require("../../internal/settings/lazy_config");
const { IngestResult } = require("../entity/ingest");

/**
 * @typedef {import("../../internal/ingester/type").ReportConfig} ReportConfig
 */

class UseCase {
  testDir = "";
  /**
   * @type {ReportConfig}
   */
  config = {};

  constructor({ config }) {
    this.config = config;
    this.testDir = getTestDir();
  }

  /**
   *
   * @param {string} filePath
   * @returns
   */
  async ingestFile(filePath, id) {
    console.log(`ingesting file ${filePath} with requestid ${id}`);
    const result = new IngestResult({
      id: id,
      ts: Date.now(),
      total: 0,
      done: false,
      error: "",
    });

    try {
      await ingestXlsxFile(
        filePath,
        new XlsxReaderOptions({
          requestID: id,
          tableName: this.config.tableName,
          columns: this.config.columns,
          sheetName: this.config.sheet,
          startRow: this.config.startRow,
          callback: async (total) => {
            // if (total % 2000 == 0) {
            //   console.log("RequestID:", id, "Processing:", total);
            // }

            result.total = total;
            result.ts = Date.now();
            await redis.rpushStruct(Redis.queueName, result);
          },
        })
      );
    } catch (error) {
      result.error = error.message;
    } finally {
      result.done = true;
      result.ts = Date.now();
      await redis.rpushStruct(Redis.queueName, result);
      console.log("ingesting with requestid", id, "done, total:", result.total);
    }
  }
}

module.exports = { UseCase };
