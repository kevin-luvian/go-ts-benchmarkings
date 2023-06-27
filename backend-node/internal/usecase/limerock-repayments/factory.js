const { getConn, connectSequelize } = require("../../db");
const { ReportConfig } = require("../../ingester/type");
const { LimerockRepaymentSidecarRepository } = require("../../repositories/limerock-repayment-sidecar/repository");
const { LimerockRepaymentRepository } = require("../../repositories/limerock-repayment/repository");
const { readRepaymentConfigJson } = require("../../settings");
const { LimerockRepaymentUseCase } = require("./usecase");

class LimerockRepaymentUsecaseFactory {
  static get() {
    const db = getConn();
    const lrRepo = new LimerockRepaymentRepository(db);
    const lrscRepo = new LimerockRepaymentSidecarRepository(db);

    const configObj = readRepaymentConfigJson();
    const config = new ReportConfig();
    config.read(configObj);

    const uc = new LimerockRepaymentUseCase({ limerockRepaymentRepo: lrRepo, limerockRepaymentSidecarRepo: lrscRepo, reportConfig: config });
    return uc;
  }
}

module.exports = { LimerockRepaymentUsecaseFactory };
