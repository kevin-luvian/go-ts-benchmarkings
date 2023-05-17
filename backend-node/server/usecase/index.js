const { XlsxReaderOptions } = require("../../internal/ingester/type");
const { ingestXlsxFile } = require("../../internal/ingester/xlsx");
const { getTestDir } = require("../../internal/settings/lazy_config");

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
   * @param {string} id
   */
  async ingestFile57(id) {
    const filePath = `${this.testDir}/test_57_mb.xlsx`;
    await this.ingestFile(filePath, id);
  }

  /**
   *
   * @param {string} filePath
   * @returns
   */
  async ingestFile(filePath, id) {
    await ingestXlsxFile(
      filePath,
      new XlsxReaderOptions({
        requestID: id,
        tableName: this.config.tableName,
        columns: this.config.columns,
        sheetName: this.config.sheet,
        startRow: this.config.startRow,
      })
    );
  }
}

module.exports = { UseCase };
