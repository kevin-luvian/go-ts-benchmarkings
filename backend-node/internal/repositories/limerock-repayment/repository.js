const { DataTypes, QueryTypes } = require("sequelize");

const makeLRModel = require("../../model/limerockRepayment");

/**
 * @typedef {import('sequelize').Sequelize} Sequelize
 * @typedef {import('./types').CRUDOpts} CRUDOpts
 * @typedef {import('./types').LimerockRepayment} LimerockRepayment
 */

class LimerockRepaymentRepository {
  /**
   * @param {Sequelize} conn
   */
  constructor(conn) {
    this.lrModel = makeLRModel(conn, DataTypes);
  }

  /**
   * @param {LimerockRepayment[]} data
   * @param {CRUDOpts} opts
   */
  async bulkCreate(data, opts = {}) {
    await this.lrModel.bulkCreate(data, { transaction: opts.transaction });
  }

  /**
   * @param {LimerockRepayment[]} data
   * @param {CRUDOpts} opts
   */
  async bulkCreateRaw(data, opts = {}) {
    let tableName = this.lrModel.getTableName();
    if (typeof tableName !== "string") {
      tableName = tableName.tableName;
    }

    const columns = Object.keys(data[0]);
    const values = new Array(data.length);
    for (let i = 0; i < data.length; i++) {
      values[i] = Object.values(data[i]);
    }

    await this.lrModel.sequelize.query(`INSERT INTO ${tableName} (${columns.join(",")}) VALUES ?`, {
      replacements: [values],
      transaction: opts.transaction,
      type: QueryTypes.INSERT,
    });
  }

  async cleanTable() {
    let tableName = this.lrModel.getTableName();
    if (typeof tableName !== "string") {
      tableName = tableName.tableName;
    }
    const tempOld = `old_foo_${tableName}`;
    const tempNew = `new_foo_${tableName}`;

    try {
      await this.lrModel.sequelize.query(`CREATE TABLE ${tempNew} LIKE ${tableName};`, {
        type: QueryTypes.RAW,
      });
      await this.lrModel.sequelize.query(`RENAME TABLE ${tableName} TO ${tempOld}, ${tempNew} TO ${tableName};`, {
        type: QueryTypes.RAW,
      });
      await this.lrModel.sequelize.query(`DROP TABLE IF EXISTS ${tempOld};`, {
        type: QueryTypes.RAW,
      });
    } catch (error) {
      await this.lrModel.sequelize.query(`DROP TABLE IF EXISTS ${tempNew};`, {
        type: QueryTypes.RAW,
      });
    }
  }
}

module.exports = { LimerockRepaymentRepository };
