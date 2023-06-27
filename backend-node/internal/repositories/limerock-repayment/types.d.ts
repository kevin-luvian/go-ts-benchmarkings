import { Transaction } from "sequelize";

export interface CRUDOpts {
  transaction?: Transaction;
}

export type LimerockRepayment = {
  id: number;
  kredivo_transaction_id: string;

  kredivo_loan_id: number;
  kredivo_user_id: number;
  distributor_id: number;
  lender_id: number;
  repayment_id: number;
  repaid_amount: number;
  repaid_principal_amount: number;
  repaid_interest_amount: number;
  loan_dpd: number;
  loan_id: number;
  late_interest: number;
  late_fee: number;

  external_ref: string;
  lender_name: string;
  lender_contact_email_primary: string;
  internal_repayment_id: string;
  external_repayment_id: string;
  posting_date: string;
  value_date: string;
  is_refund_payment: string;
  repaid_at: string;
  payment_type: string;
  legacy_loan_id: string;
  jfs_type: string;
  start_date: string;
  tenure: string;
  term: string;
  loan_closed_at: string;
  repayment_status: string;

  sidecar_name: string;
  sidecar_muuid: string;
  sidecar_mcount: string;
  sidecar_created_at: Date;
  sidecar_updated_at: Date;

  created_at: Date;
  updated_at: Date;
};
