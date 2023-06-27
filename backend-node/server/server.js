const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const { init: initSettings, Server, Redis } = require("../internal/settings/settings");
const bodyParser = require("body-parser");

const { makeRouter } = require("./routes/index");
const { UseCase } = require("./usecase");
const { connectSequelize } = require("../internal/db");
const { readConfigJson } = require("../internal/settings/lazy_config");
const { ReportConfig } = require("../internal/ingester/type");
const redis = require("../internal/redis");
const { LimerockRepaymentUsecaseFactory } = require("../internal/usecase/limerock-repayments/factory");

const init = async () => {
  initSettings();
  await connectSequelize();

  await redis.setup({
    host: Redis.host,
    port: Redis.port,
    password: Redis.password,
    username: Redis.username,
  });
};

const makeApp = async () => {
  await init();

  const app = express();
  {
    app.use(cors({ origin: Server.cors }));
    app.use(logger("dev"));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
  }

  const configJSON = readConfigJson();
  const config = new ReportConfig();
  config.read(configJSON);

  const useCase = new UseCase({ config });
  const lrUC = LimerockRepaymentUsecaseFactory.get();
  const router = makeRouter({ useCase, lrUC });
  app.use("/", router);
  return app;
};

module.exports = { makeApp };
