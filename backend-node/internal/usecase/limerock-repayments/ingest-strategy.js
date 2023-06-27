/**
 * @typedef {import('sequelize').Transaction} Transaction
 * @typedef {import('./usecase').LimerockRepaymentUseCase} LimerockRepaymentUseCase
 */

class Strategy {
  /**
   * @param {LimerockRepayment[]} data
   * @return {Promise<void>}
   */
  async write(data) {
    throw new Error("unimplemented");
  }
}

class BulkCreateStrategy extends Strategy {
  /**
   * @param {LimerockRepaymentUseCase} uc
   * @param {Transaction} transaction
   */
  constructor(uc, transaction) {
    super();
    this.uc = uc;
    this.transaction = transaction;
  }

  async write(data) {
    await this.uc.bulkCreate(data, {
      transaction: this.transaction,
    });
  }
}

class BulkCreateRawStrategy extends Strategy {
  /**
   * @param {LimerockRepaymentUseCase} uc
   * @param {Transaction} transaction
   */
  constructor(uc, transaction) {
    super();
    this.uc = uc;
    this.transaction = transaction;
  }

  async write(data) {
    await this.uc.bulkCreateRaw(data, {
      transaction: this.transaction,
    });
  }
}

class BulkCreateNoTransactionStrategy extends Strategy {
  /**
   * @param {LimerockRepaymentUseCase} uc
   */
  constructor(uc) {
    super();
    this.uc = uc;
  }

  async write(data) {
    await this.uc.bulkCreate(data);
  }
}

class BulkCreateRawNoTransactionStrategy extends Strategy {
  /**
   * @param {LimerockRepaymentUseCase} uc
   */
  constructor(uc) {
    super();
    this.uc = uc;
  }

  async write(data) {
    await this.uc.bulkCreateRaw(data);
  }
}

module.exports = {
  Strategy,
  BulkCreateStrategy,
  BulkCreateRawStrategy,
  BulkCreateNoTransactionStrategy,
  BulkCreateRawNoTransactionStrategy,
};
