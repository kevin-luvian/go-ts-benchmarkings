class IngestResult {
  id = "";
  ts = 0;
  total = 0;
  done = false;
  error = "";

  /**
   * @param {IngestResult} param0
   */
  constructor({ id, ts, total, done, error }) {
    this.id = id;
    this.ts = ts;
    this.total = total;
    this.done = done;
    this.error = error;
  }
}

module.exports = { IngestResult };
