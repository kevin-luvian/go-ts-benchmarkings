const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const { Server } = require("../internal/settings/settings");
const bodyParser = require("body-parser");

const { makeRouter } = require("./routes/index");
const { UseCase } = require("./usecase");
const { connectSequelize } = require("../internal/db");
const { readConfigJson } = require("../internal/settings/lazy_config");
const { ReportConfig } = require("../internal/ingester/type");

const makeApp = async () => {
  const app = express();

  app.use(cors({ origin: Server.cors }));
  app.use(logger("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  await connectSequelize();
  const configJSON = readConfigJson();
  const config = new ReportConfig();
  config.read(configJSON);

  const useCase = new UseCase({ config });
  const router = makeRouter(useCase);
  app.use("/", router);
  return app;
};

module.exports = { makeApp };
