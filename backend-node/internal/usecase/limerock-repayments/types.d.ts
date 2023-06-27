import { Transaction } from "sequelize";
import { LimerockRepaymentSidecarRepository } from "../../repositories/limerock-repayment-sidecar/repository";
import { LimerockRepaymentRepository } from "../../repositories/limerock-repayment/repository";
import { ReportConfig } from "../../ingester/type";

export interface Dependencies {
  limerockRepaymentRepo: LimerockRepaymentRepository;
  limerockRepaymentSidecarRepo: LimerockRepaymentSidecarRepository;
  reportConfig: ReportConfig;
}

export interface CRUDOpts {
  transaction: Transaction;
}
