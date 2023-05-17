const fs = require("fs");
const {
  pipeline: asyncPipeline,
  promises: { pipeline },
  Transform,
  Writable,
} = require("stream");
const through2Batch = require("through2-batch");
const XlsxStreamReader = require("xlsx-stream-reader");
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
  const transaction = await opts.db.transaction();
  try {
    let processed = 0;
    await pipeline(
      makeXLSXReader({
        filePath,
        sheetName: opts.sheetName,
        startRow: opts.startRow,
        columns: opts.columns,
      }),
      makeXLSXTransformer({
        columns: opts.columns,
      }),
      through2Batch.obj({ batchSize: STREAM_BATCH_SIZE }),
      new Transform({
        objectMode: true,
        async transform(chunk, _ec, cb) {
          processed += chunk.length;
          if (processed % 10000 == 0) {
            console.log("Processed:", processed);
          }
        },
      }),
      makeDBWriter({
        tableName: opts.tableName,
        db: opts.db,
        transaction: transaction,
      })
    );
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * @param {Object} param0
 * @param {string} param0.tableName
 * @param {Sequelize} param0.db
 * @param {Transaction} param0.transaction
 * @return {Writable}
 */
const makeDBWriter = ({ tableName, db, transaction }) => {
  return new Writable({
    objectMode: true,
    async write(chunk, _ec, cb) {
      try {
        const columns = Object.keys(chunk[0]);
        const values = new Array(chunk.length);
        for (let i = 0; i < chunk.length; i++) {
          values[i] = Object.values(chunk[i]);
        }
        await db.query(
          `INSERT INTO ${tableName} (${columns.join(",")}) VALUES ?`,
          {
            replacements: [values],
            transaction: transaction,
            type: QueryTypes.INSERT,
          }
        );
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
 * @param {Object} config
 * @return {Transform}
 */
const makeXLSXReader = ({
  filePath = "",
  sheetName = "",
  startRow = 1,
  fileBufferSize = 512 * 1024,
  columns = [],
}) => {
  const workBookReaderStream = new XlsxStreamReader();

  workBookReaderStream.on("worksheet", (workSheetReader) => {
    let colLookup = [];
    const headerRowPos = startRow - 1;

    if (workSheetReader.name != sheetName) {
      workSheetReader.skip();
      return;
    }

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

  return asyncPipeline(
    fs.createReadStream(filePath, { highWaterMark: fileBufferSize }),
    workBookReaderStream,
    (err) => {
      if (err) {
        console.error("XlsxStreamReader failed", err);
      }
    }
  );
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
