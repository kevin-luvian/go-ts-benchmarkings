const fs = require("fs");
const {
  pipeline: asyncPipeline,
  promises: { pipeline },
  Transform,
  Writable,
} = require("stream");
const through2Batch = require("through2-batch");
const XlsxStreamReader = require("./lib/mod-xlsx-stream-reader");
const { getConn } = require("../db");
const EventEmitter = require("events");
const QueryTypes = require("sequelize").QueryTypes;

const STREAM_BATCH_SIZE = 1000;

/**
 * @typedef {import("./type").XlsxReaderOptions} XlsxReaderOptions
 * @typedef {import("sequelize").Sequelize} Sequelize
 * @typedef {import("sequelize").Transaction} Transaction
 */

/**
 * @param {string} filePath
 * @param {XlsxReaderOptions} opts
 */
const ingestXlsxFile = async (filePath, opts) => {
  const sigtermEmitter = new EventEmitter();
  const transaction = await getConn().transaction();
  try {
    let total = 0;
    await pipeline(
      makeXLSXReader({
        filePath,
        sheetName: opts.sheetName,
        startRow: opts.startRow,
        columns: opts.columns,
        sigtermEmitter: sigtermEmitter,
      }),
      makeXLSXTransformer({
        columns: opts.columns,
      }),
      through2Batch.obj({ batchSize: STREAM_BATCH_SIZE }),
      makeDBWriter({
        tableName: opts.tableName,
        transaction: transaction,
        resultCallback: async (processed) => {
          total += processed;
          const isDone = await opts.callback(total);
          if (isDone) {
            sigtermEmitter.emit("sigterm");
          }
        },
      })
    );
    await transaction.commit();
  } catch (error) {
    sigtermEmitter.emit("sigterm");
    await transaction.rollback();
    throw error;
  } finally {
    sigtermEmitter.removeAllListeners("sigterm");
  }
};

/**
 * @param {Object} param0
 * @param {string} param0.tableName
 * @param {Transaction} param0.transaction
 * @param {function(number):void} param0.resultCallback
 * @return {Writable}
 */
const makeDBWriter = ({ tableName, transaction, resultCallback }) => {
  return new Writable({
    objectMode: true,
    async write(chunk, _ec, cb) {
      try {
        const columns = Object.keys(chunk[0]);
        const values = new Array(chunk.length);
        for (let i = 0; i < chunk.length; i++) {
          values[i] = Object.values(chunk[i]);
        }
        await getConn().query(
          `INSERT INTO ${tableName} (${columns.join(",")}) VALUES ?`,
          {
            replacements: [values],
            transaction: transaction,
            type: QueryTypes.INSERT,
          }
        );
        resultCallback(chunk.length);
        // if (total >= 100_000) {
        //   return cb(new Error("test"));
        // }
        cb();
      } catch (error) {
        cb(error);
      }
    },
  });
};

/**
 * Read from xlsx file and return a stream of json object.
 * Should transform it with makeXLSXTransformer to get the desired data types.
 * @param {Object} param0
 * @param {EventEmitter} param0.sigtermEmitter
 * @return {Transform}
 */
const makeXLSXReader = ({
  filePath = "",
  sheetName = "",
  startRow = 1,
  fileBufferSize = 512 * 1024,
  columns = [],
  sigtermEmitter = null,
}) => {
  if (!sigtermEmitter) {
    throw new Error(
      "signal termination emitter not setup properly!! will cause running processes!!"
    );
  }

  const readable = fs.createReadStream(filePath, {
    highWaterMark: fileBufferSize,
  });
  // abort the file readable stream
  sigtermEmitter.addListener("sigterm", () => {
    readable.destroy();
  });

  const workBookReaderStream = new XlsxStreamReader();
  workBookReaderStream.setMaxListeners(11);

  let workSheetsRefs = [];

  // abort the sheet reader stream
  sigtermEmitter.addListener("sigterm", () => {
    for (let i = 0; i < workSheetsRefs.length; i++) {
      workSheetsRefs[i].abort();
    }
  });

  workBookReaderStream.on("worksheet", (workSheetReader) => {
    let colLookup = [];
    const headerRowPos = startRow - 1;

    if (workSheetReader.name != sheetName) {
      workSheetReader.skip();
      return;
    }

    workSheetsRefs.push(workSheetReader);

    let total = 0;
    workSheetReader.on("row", (row) => {
      if (row.attributes.r < headerRowPos) {
        return;
      }

      if (row.attributes.r == headerRowPos) {
        colLookup = row.values
          .map((colName, i) => {
            const col = columns.find((c) => c.original == colName);
            return col ? { ...col, pos: i } : null;
          })
          .filter((col) => !!col);
        return;
      }

      const jsonObject = colLookup.reduce(
        (prev, col) => ({
          ...prev,
          [col.name]: row.values[col.pos],
        }),
        {}
      );

      workBookReaderStream.emit("data", jsonObject);
    });

    // call process after registering handlers
    workSheetReader.process();
  });

  return asyncPipeline(readable, workBookReaderStream, (err) => {
    if (err) {
      console.error("XlsxStreamReader failed", err);
    }
  });
};

/**
 * Transform the json data from makeXLSXReader stream.
 * @param {Object} config
 * @return {Transform}
 */
const makeXLSXTransformer = ({ columns = [], bufferSize = 100 }) => {
  columns = columns.map((col) => {
    col.transform = getDefaultTransform(col);
    return col;
  });

  return new Transform({
    objectMode: true,
    highWaterMark: bufferSize,
    async transform(chunk, ec, cb) {
      try {
        const obj = {};
        for (const col of columns) {
          obj[col.name] = col.transform(chunk[col.name]);
        }
        cb(null, obj);
      } catch (err) {
        cb(err);
      }
    },
  });
};

/**
 * @param {ColumnOption} col type of the column
 * @return {TransformCallback}
 */
function getDefaultTransform(col) {
  const { type, transform } = col;
  switch (type) {
    case "function":
      return new Function(`return ${transform}`)();
    default:
      return (value) => {
        return value;
      };
  }
}

module.exports = {
  ingestXlsxFile,
};
