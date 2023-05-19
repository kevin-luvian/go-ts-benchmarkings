const mysql = require("mysql");
const Sequelize = require("sequelize");
const { Database } = require("../settings/settings");

/**
 * @type {Sequelize.Sequelize}
 */
let conn = null;

const connect = () =>
  mysql.createPool({
    host: Database.host,
    user: Database.user,
    password: Database.password,
    database: Database.database,
    connectionLimit: Database.connectionLimit,
    multipleStatements: true,
  });

const connectSequelize = async () => {
  const sq = new Sequelize(
    Database.database,
    Database.user,
    Database.password,
    {
      host: Database.host,
      port: Database.port,
      dialect: "mysql",
      logging: false,
    }
  );
  console.log("DBHost:Port", Database.host, Database.port);
  await sq.authenticate();
  console.log("DB Connected!!");
  conn = sq;
  return sq;
};

const getConn = () => conn;

module.exports = { connect, connectSequelize, getConn };
