"use strict";

/**
 * @typedef {import('sequelize').Sequelize} Sequelize
 * @typedef {import('sequelize').DataTypes} DataTypes
 */

/**
 * @param {Sequelize} sequelize
 * @param {DataTypes} DataTypes
 */
module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define(
    "limerockRepayment",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      kredivo_transaction_id: {
        type: DataTypes.STRING(255),
      },

      kredivo_loan_id: {
        type: DataTypes.INTEGER,
      },
      kredivo_user_id: {
        type: DataTypes.INTEGER,
      },
      distributor_id: {
        type: DataTypes.INTEGER,
      },
      lender_id: {
        type: DataTypes.INTEGER,
      },
      repayment_id: {
        type: DataTypes.INTEGER,
      },
      repaid_amount: {
        type: DataTypes.INTEGER,
      },
      repaid_principal_amount: {
        type: DataTypes.INTEGER,
      },
      repaid_interest_amount: {
        type: DataTypes.INTEGER,
      },
      loan_dpd: {
        type: DataTypes.INTEGER,
      },
      loan_id: {
        type: DataTypes.INTEGER,
      },
      late_interest: {
        type: DataTypes.INTEGER,
      },
      late_fee: {
        type: DataTypes.INTEGER,
      },

      external_ref: {
        type: DataTypes.STRING(255),
      },
      lender_name: {
        type: DataTypes.STRING(255),
      },
      lender_contact_email_primary: {
        type: DataTypes.STRING(255),
      },
      internal_repayment_id: {
        type: DataTypes.STRING(255),
      },
      external_repayment_id: {
        type: DataTypes.STRING(255),
      },
      posting_date: {
        type: DataTypes.STRING(255),
      },
      value_date: {
        type: DataTypes.STRING(255),
      },
      is_refund_payment: {
        type: DataTypes.STRING(255),
      },
      repaid_at: {
        type: DataTypes.STRING(255),
      },
      payment_type: {
        type: DataTypes.STRING(255),
      },
      legacy_loan_id: {
        type: DataTypes.STRING(255),
      },
      jfs_type: {
        type: DataTypes.STRING(255),
      },
      start_date: {
        type: DataTypes.STRING(255),
      },
      tenure: {
        type: DataTypes.STRING(255),
      },
      term: {
        type: DataTypes.STRING(255),
      },
      loan_closed_at: {
        type: DataTypes.STRING(255),
      },
      repayment_status: {
        type: DataTypes.STRING(255),
      },
      sidecar_name: {
        type: DataTypes.STRING(255),
      },
      sidecar_muuid: {
        type: DataTypes.STRING(255),
      },
      sidecar_mcount: {
        type: DataTypes.STRING(255),
      },

      sidecar_created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      sidecar_updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      underscored: true,
      tableName: "limerock_repayments",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return model;
};
