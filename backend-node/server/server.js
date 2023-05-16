const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const { Server } = require("../internal/settings/lazy_settings");
const bodyParser = require("body-parser");

const indexRouter = require("./routes/index");

const app = express();

app.use(cors({ origin: Server.cors }));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/", indexRouter);

module.exports = app;
