/**
 * @typedef {import('./types').Dependencies} Dependencies
 * @typedef {import('./types').CRUDOpts} CRUDOpts
 * @typedef {import('./ingest-strategy').Strategy} Strategy
 * @typedef {import('../../repositories/limerock-repayment-sidecar/types').LimerockRepaymentSidecar} LimerockRepaymentSidecar
 * @typedef {import('../../repositories/limerock-repayment/types').LimerockRepayment} LimerockRepayment
 * @typedef {import("../../../internal/ingester/type").ReportConfig} ReportConfig
 */

const { CSVReaderOptions } = require("../../../internal/ingester/type");
const redis = require("../../../internal/redis");
const { Redis } = require("../../../internal/settings/settings");
const { IngestResult } = require("../../../server/entity/ingest");
const { CSVIngester } = require("../../ingester/csv");
const { getTestDir } = require("../../settings");

class LimerockRepaymentUseCase {
  /**
   * @param {Dependencies} deps
   */
  constructor(deps) {
    this.limerockRepaymentRepo = deps.limerockRepaymentRepo;
    this.limerockRepaymentSidecarRepo = deps.limerockRepaymentSidecarRepo;
    this.config = deps.reportConfig;
    this.testDir = getTestDir();
  }

  /**
   * @param {LimerockRepayment[]} data
   * @param {CRUDOpts} opts
   */
  async bulkCreate(data, opts) {
    const lookup = await this._getSidecarLookup(data.map((d) => d.kredivo_transaction_id));

    for (let i = 0; i < data.length; i++) {
      const trid = data[i].kredivo_transaction_id;
      const sidecar = lookup.get(trid);
      if (!sidecar) continue;

      data[i].sidecar_name = sidecar.name;
      data[i].sidecar_mcount = sidecar.mcount;
      data[i].sidecar_muuid = sidecar.muuid;
      data[i].sidecar_created_at = sidecar.created_at;
      data[i].sidecar_updated_at = sidecar.updated_at;
    }

    await this.limerockRepaymentRepo.bulkCreate(data, {
      transaction: opts.transaction,
    });
  }

  /**
   * @param {LimerockRepayment[]} data
   * @param {CRUDOpts} opts
   */
  async bulkCreateRaw(data, opts) {
    const lookup = await this._getSidecarLookup(data.map((d) => d.kredivo_transaction_id));

    for (let i = 0; i < data.length; i++) {
      const sidecar = lookup.get(data[i].kredivo_transaction_id);
      if (!sidecar) continue;

      data[i].sidecar_name = sidecar.name;
      data[i].sidecar_mcount = sidecar.mcount;
      data[i].sidecar_muuid = sidecar.muuid;
      data[i].sidecar_created_at = sidecar.created_at;
      data[i].sidecar_updated_at = sidecar.updated_at;
    }

    await this.limerockRepaymentRepo.bulkCreateRaw(data, {
      transaction: opts.transaction,
    });
  }

  /**
   * @param {Object<string, *>} obj
   * @return {LimerockRepayment}
   */
  parseFromCSV(obj) {
    return { ...obj };
  }

  /**
   * @param {number[]} kredivoTransactionIDs
   * @return {Promise<Map<number, LimerockRepaymentSidecar>>}
   */
  async _getSidecarLookup(kredivoTransactionIDs) {
    const lookup = new Map();
    const sidecars = await this.limerockRepaymentSidecarRepo.findAllByKredivoTransactionID(kredivoTransactionIDs);
    for (const sc of sidecars) {
      lookup.set(Math.round(sc.kredivo_transaction_id).toString(), sc);
    }
    return lookup;
  }

  /**
   * @param {Object} param0
   * @param {string} param0.filePath
   * @param {string} param0.requestID
   * @param {number} param0.limit
   * @param {Strategy} param0.strategy
   */
  async ingestCSV({ filePath, requestID, limit = -1, strategy }) {
    console.log(`ingesting file ${filePath} with requestid ${requestID}`);
    const result = new IngestResult({
      id: requestID,
      ts: Date.now(),
      total: 0,
      done: false,
      error: "",
    });

    try {
      await CSVIngester.ingest(
        filePath,
        new CSVReaderOptions({
          columns: this.config.columns,
          write: async (arr) => {
            if (limit > 0 && result.total >= limit) {
              console.log("limit reached, ending ingestion for request", requestID);
              return true;
            }

            // panic triggered!!
            const panicStr = await redis.get("owo-node-panic");
            if (panicStr) {
              console.log("panic triggered, ending ingestion for request", requestID);
              return true;
            }

            await strategy.write(arr.map(this.parseFromCSV));
            result.total += arr.length;
            result.ts = Date.now();
            await redis.rpushStruct(Redis.queueName, result);

            return false;
          },
        })
      );
    } catch (error) {
      result.error = error.message;
    } finally {
      result.done = true;
      result.ts = Date.now();
      await redis.rpushStruct(Redis.queueName, result);
      console.log("ingesting with requestid", requestID, "done, total:", result.total);
    }
  }
}

module.exports = { LimerockRepaymentUseCase };
