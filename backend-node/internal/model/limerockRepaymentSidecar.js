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
      kredivo_transaction_id: {
        type: DataTypes.STRING(255),
        unique: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      muuid: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      mcount: {
        type: DataTypes.STRING(255),
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
      tableName: "limerock_repayments_sidecar",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return model;
};
