const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const { Server } = require("../internal/settings/lazy_settings");
const bodyParser = require("body-parser");

const { makeRouter } = require("./routes/index");
const { UseCase } = require("./usecase");
const { connectSequelize } = require("../internal/db");

const makeApp = async () => {
  const app = express();

  app.use(cors({ origin: Server.cors }));
  app.use(logger("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  const db = await connectSequelize();
  const useCase = new UseCase({ db });
  const router = makeRouter(useCase);
  app.use("/", router);
  return app;
};

module.exports = { makeApp };
