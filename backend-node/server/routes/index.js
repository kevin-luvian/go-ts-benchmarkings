const express = require("express");
const { success } = require("../../internal/app/response");

/**
 *
 * @param {import("../usecase").UseCase} useCase
 */
const makeRouter = (useCase) => {
  const router = express.Router();

  router.get("/", function (req, res, next) {
    res.send("index");
  });

  router.get("/ping", function (req, res, next) {
    success(res, Date.now(), "noice");
  });

  return router;
};

module.exports = { makeRouter };
