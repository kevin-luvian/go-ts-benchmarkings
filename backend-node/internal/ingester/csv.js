const { CSVReaderOptions } = require("./type");
const {
  promises: { pipeline },
  Transform,
  Writable,
} = require("stream");
const fs = require("fs");
const csv = require("csv");
const through2Batch = require("through2-batch");

class CSVIngester {
  /**
   * @param {string} filePath
   * @param {CSVReaderOptions} opts
   */
  static async ingest(filePath, opts) {
    let isDone = false;
    const readStream = fs.createReadStream(filePath, { highWaterMark: 1024 * 1024 });
    await pipeline(
      readStream,
      csv.parse({ columns: true, from: opts.startRow }),
      makeCSVTransformer({ columns: opts.columns }),
      through2Batch.obj({ batchSize: opts.batchSize }),
      new Writable({
        objectMode: true,
        write: async (chunks, _ec, cb) => {
          try {
            if (isDone) {
              readStream.destroy();
              return cb();
            }

            isDone = await opts.write(chunks);
            cb();
          } catch (error) {
            cb(error);
          }
        },
      })
    );
  }
}

/**
 * Transform the json data from csv.parse columns=true stream.
 * @param {Object} config
 * @return {Transform}
 */
const makeCSVTransformer = ({ columns = [], bufferSize = 100 }) => {
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
          obj[col.name] = col.transform(chunk[col.original]);
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
    case "number":
      return (value) => Number(value);
    default:
      return (value) => {
        return value;
      };
  }
}

module.exports = { CSVIngester };
