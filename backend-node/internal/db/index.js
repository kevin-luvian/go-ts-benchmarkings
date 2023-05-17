const mysql = require("mysql");
const Sequelize = require("sequelize");
const { Database } = require("../settings/lazy_settings");

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
      port: Database.port,
      dialect: "mysql",
      "logging": false
    }
  );
  await sq.authenticate();
  console.log("Connected!!");
  return sq;
};

module.exports = { connect, connectSequelize };
