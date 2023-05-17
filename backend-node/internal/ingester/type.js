class XlsxReaderOptions {
  tableName = "";
  sheetName = "";
  startRow = 0;
  /**
   * @type {ColumnOption[]}
   */
  columns = [];
  /**
   * @type {import("sequelize").Sequelize}
   */
  db = null;

  constructor({ tableName, sheetName, startRow, columns, db }) {
    this.tableName = tableName;
    this.sheetName = sheetName;
    this.startRow = startRow;
    this.columns = columns;
    this.db = db;
  }
}

class ReportConfig {
  tableName = "";
  sheet = "";
  startRow = 0;
  columns = [];

  /**
   * @param {Object} jsonObj
   */
  read(jsonObj) {
    this.tableName = jsonObj["table_node"];
    this.sheet = jsonObj["sheet"];
    this.startRow = jsonObj["start_row"];
    this.columns = jsonObj["columns"].map((col) => new ColumnOption(col));
  }
}

class ColumnOption {
  name = "";
  original = "";
  pos = 0;
  required = false;
  type = "";
  /**
   * @type {Function | string}
   */
  transform = "(val)=>val";

  constructor({ name, original, pos, required, transform, type }) {
    this.name = name;
    this.original = original;
    this.pos = pos;
    this.required = required;
    this.transform = transform;
    this.type = type;
  }
}

module.exports = {
  XlsxReaderOptions,
  ReportConfig,
};
