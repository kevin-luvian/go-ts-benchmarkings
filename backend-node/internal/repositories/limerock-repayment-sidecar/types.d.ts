import { Transaction } from "sequelize";

export interface CRUDOpts {
  transaction?: Transaction;
}

export type LimerockRepaymentSidecar = {
  kredivo_transaction_id: string;
  name: string;
  muuid: string;
  mcount: string;
  created_at: Date;
  updated_at: Date;
};
