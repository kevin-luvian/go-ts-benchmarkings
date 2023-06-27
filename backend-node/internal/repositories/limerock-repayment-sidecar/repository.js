const { DataTypes, QueryTypes } = require("sequelize");

const makeLRSCModel = require("../../model/limerockRepaymentSidecar");

/**
 * @typedef {import('sequelize').Sequelize} Sequelize
 * @typedef {import('./types').CRUDOpts} CRUDOpts
 * @typedef {import('./types').LimerockRepaymentSidecar} LimerockRepaymentSidecar
 */

class LimerockRepaymentSidecarRepository {
  /**
   * @param {Sequelize} conn
   */
  constructor(conn) {
    this.lrscModel = makeLRSCModel(conn, DataTypes);
  }

  /**
   * @param {LimerockRepaymentSidecar[]} data
   * @param {CRUDOpts} opts
   */
  async bulkCreate(data, opts = {}) {
    await this.lrscModel.bulkCreate(data, {
      transaction: opts.transaction,
      ignoreDuplicates: true,
    });
  }

  /**
   * @param {LimerockRepaymentSidecar[]} data
   * @param {CRUDOpts} opts
   */
  async bulkCreateRaw(data, opts = {}) {
    let tableName = this.lrscModel.getTableName();
    if (typeof tableName !== "string") {
      tableName = tableName.tableName;
    }

    const columns = Object.keys(data[0]);
    const values = new Array(data.length);
    for (let i = 0; i < data.length; i++) {
      values[i] = Object.values(data[i]);
    }

    await this.lrscModel.sequelize.query(`INSERT INTO ${tableName} (${columns.join(",")}) VALUES ?`, {
      replacements: [values],
      transaction: opts.transaction,
      type: QueryTypes.INSERT,
    });
  }

  /**
   * @param {number[]} kredivoTransactionIDs
   * @return {Promise<LimerockRepaymentSidecar[]>}
   */
  async findAllByKredivoTransactionID(kredivoTransactionIDs) {
    return await this.lrscModel.findAll({
      where: {
        kredivo_transaction_id: kredivoTransactionIDs,
      },
      raw: true,
    });
  }
}

module.exports = { LimerockRepaymentSidecarRepository };
