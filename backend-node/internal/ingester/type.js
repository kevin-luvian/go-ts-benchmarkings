class XlsxReaderOptions {
  requestID = "";
  tableName = "";
  sheetName = "";
  startRow = 0;
  /**
   * @type {ColumnOption[]}
   */
  columns = [];

  constructor({ requestID, tableName, sheetName, startRow, columns }) {
    this.requestID = requestID;
    this.tableName = tableName;
    this.sheetName = sheetName;
    this.startRow = startRow;
    this.columns = columns;
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
